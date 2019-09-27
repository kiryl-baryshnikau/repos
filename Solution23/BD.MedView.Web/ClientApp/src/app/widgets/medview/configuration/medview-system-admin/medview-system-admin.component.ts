import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GatewayService, ResourceService, EventBusService } from 'container-framework';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { ModalOptions } from 'ngx-bootstrap/modal';
import { SelectItem } from 'primeng/primeng';
import { forkJoin, Observable, of, Subscription, throwError } from 'rxjs';
import { catchError, concatMap, map, switchMap, take, tap } from 'rxjs/operators';
import * as _ from 'lodash';

import { MvdCfwConfigurationService } from '../../../services/mvd-cfw-configuration.service';
import { FacilityManagementService } from '../../../services/mvd-facility-management.service';
import { SortingService } from '../../../services/mvd-sorting-service';
import { MvdConstants } from '../../../shared/mvd-constants';
import { SystemAdminSettings } from '../../../shared/mvd-models';
import { IvPrepConfigurationDialogComponent } from '../iv-prep-configuration-dialog/iv-prep-configuration-dialog.component';
import { IvPrepConfigurationComponent } from '../iv-prep-configuration/mvd-iv-prep-configuration.component';
import { SystemAdminConfigurationService } from './system-admin-configuration.service';
import { MessageService } from 'primeng/api';
import { MvdMedMinedDataService } from '../../../services/mvd-medmined-data.service';
import { MedminedTransformationService } from '../../../services/medmined-transformation.service';
import { MedMinedModels } from '../../../shared/medmined-models';
import { AuthorizationService } from '../../../../services/authorization.service';

import { UserConfigurationService } from '../../../../services/user-configuration.service';
import { InfusionGlobalPreference, InfusionGlobalSetting } from '../../../../services/bd-medview-configuration-entities';

@Component({
    selector: 'medview-system-admin',
    templateUrl: './medview-system-admin.component.html',
    styleUrls: ['./medview-system-admin.component.scss']
})
export class MedViewSystemAdminConfigComponent implements OnInit, OnDestroy {
    private minRefreshRate = 60;
    private maxRefreshRate = 900;
    private minPreserveRecords = 24;
    private maxPreserveRecords = 72;
    public resources: any;
    public hasDataLoadError = false;
    public hasRefreshRateSaveError = false;
    public hasOrderServiceSaveError = false;
    public isLoading = true;

    private filters: any = window['infusionStatusFilters'];
    private infusionDataObservable$: Observable<any>;
    private systemSettingsObservable$: Observable<InfusionGlobalPreference>;
    private systemSettingsSubscription$: Subscription;
    private setSystemSettingsSubscription$: Subscription;
    private systemPreferencesDefaultsSubscription$: Subscription;
    private getSystemProvidersSubscription$: Subscription;
    private mmAlertsSubscriptionObservable$: Observable<any>;
    private authorizationData: any[];

    @Input() appCode: string;
    @Input() widgetId: string;
    @Input() isInfusionProviderEnabled = true;
    @Input() isCatoProviderEnabled = true;
    @Input() isMedminedProviderEnabled = true;
    @ViewChild('ivPrepConfiguration') ivPrepConfigurationComponent: IvPrepConfigurationComponent;

    model: SystemAdminSettings = new SystemAdminSettings();
    adminSettingsForm: FormGroup;

    infusionsToShow: SelectItem[];
    infusionsToHide: SelectItem[];
    selectedInfusionsToShow: string[];
    selectedInfusionsToHide: any[];

    unlistedInfusion = '';

    containerToleranceOptions: SelectItem[] = [];
    selectedToleranceValue: string;

    thresholdsSettings: any;

    systemAdminAlarisConfiguration: InfusionGlobalPreference;

    subscribedAlerts: SelectItem[];
    unsubscribedAlerts: SelectItem[];

    errorMedminedDataEmpty: boolean;
    errorMedminedDataRetrieval: boolean;
    errorMedminedDataSave: boolean;

    private infusionsAvailables: any;
    private isSettingUpdate = true;
    private warningModalOptions: ModalOptions = {
        class: 'modal-md',
        keyboard: false,
        ignoreBackdropClick: true,
        animated: true,
        focus: true,
    };
    modalRef: BsModalRef;
    ivPrepSettingsTouched = false;
    newStatesNotificationDismissed = false;

    private medminedFacilitiesKeys = [];
    private medminedAlertsSubscriptionType = 'Admin'

    orderServiceOptions: { label: string, value: number }[];

    constructor(private resourcesService: ResourceService,
        private mvdCfwConfigurationService: MvdCfwConfigurationService,
        private dataService: GatewayService,
        private formBuilder: FormBuilder,
        private systemAdminConfigurationService: SystemAdminConfigurationService,
        private sortingService: SortingService,
        private facilityManagementService: FacilityManagementService,
        private medminedDataService: MvdMedMinedDataService,
        private userConfigurationService: UserConfigurationService,
        private medminedTransformationService: MedminedTransformationService,
        private authorizationService: AuthorizationService,
        private modalService: BsModalService,
        private eventBusService: EventBusService,
        private messageService: MessageService) {

        this.setThresholdsSettings();
        this.containerToleranceOptions = this.getContainerToleranceOptions();
        this.initForm();
        this.infusionsToShow = [
        ];
        this.infusionsToHide = [
        ];
    }

    ngOnInit(): void {
        this.resources = this.getResources();
        this.orderServiceOptions = this.getOrderServiceOptions();
        this.loadData();
    }

    onSave() {
        this.adminSettingsForm.markAsUntouched();
        this.adminSettingsForm.markAsPristine();
        this.saveSystemSettings();
    }

    onCancel() {
        this.adminSettingsForm.reset();
        this.ivPrepSettingsTouched = false;
        // this.newStatesNotificationDismissed = false;
        this.getSystemAdminData();
    }

    private initForm() {
        const initialFormGroup: any = {
            otherSettingsForm: this.formBuilder.group({
                preserveRecordsHours: new FormControl('', [
                    Validators.required,
                    Validators.min(this.minPreserveRecords),
                    Validators.max(this.maxPreserveRecords)
                ]),
                containerToleranceValue: new FormControl('')
            }),
            refreshRate: ['', [Validators.required, Validators.min(this.minRefreshRate), Validators.max(this.maxRefreshRate)]],
            infusionsToDisplayForm: this.formBuilder.group({
                infusionsToShow: new FormControl(''),
                infusionsToHide: new FormControl('')
            }),
            infusionThresholdForm: this.formBuilder.group({
                warningThreshold: new FormControl('', [
                    Validators.required,
                    Validators.min(this.thresholdsSettings.warning.min),
                    Validators.max(this.thresholdsSettings.warning.max)
                ]),
                priorityThreshold: new FormControl('', [
                    Validators.required,
                    Validators.min(this.thresholdsSettings.priority.min),
                    Validators.max(this.thresholdsSettings.priority.max)
                ]),
                escalateThreshold: new FormControl('', [
                    Validators.required,
                    Validators.min(this.thresholdsSettings.escalate.min),
                    Validators.max(this.thresholdsSettings.escalate.max)
                ])
            }),
            orderServiceFormGroup: this.formBuilder.group({
                selectedVariance: new FormControl('', [Validators.required])
            })
        };
        // We don't know at this point if provider is enabled when updated
        //if (this.isMedminedProviderEnabled) {
            initialFormGroup.alertSubscriptionGroup = this.formBuilder.group({
                alertsSubscription: new FormControl('')
            });
        //}
        this.adminSettingsForm = this.formBuilder.group(initialFormGroup);
        }

    private loadData() {
        this.getSystemAdminData();
    }

    private getResources() {
        return {
            apply: this.resourcesService.resource('apply'),
            cancel: this.resourcesService.resource('cancel'),
            systemSettingsTitle: this.resourcesService.resource('systemSettingsTitle'),
            alarisDataSettingsTitle: this.resourcesService.resource('alarisDataSettingsTitle'),
            refreshRateTitle: this.resourcesService.resource('refreshRateTitle'),
            refreshUnits: this.resourcesService.resource('refreshUnits'),
            refreshRateFooter: this.resourcesService.resource('refreshRateFooter'),
            refreshRateOutOfRangeError: this.resourcesService.resource('refreshRateOutOfRangeError'),
            refreshRateNoDataAvailable: this.resourcesService.resource('refreshRateNoDataAvailable'),
            unableToSaveRefreshRate: this.resourcesService.resource('unableToSaveRefreshRate'),
            refreshRateIsRequired: this.resourcesService.resource('refreshRateIsRequired'),

            addUnlistedInfusionText: this.resourcesService.resource('addUnlistedInfusionText'),
            infusionShowHideList: this.resourcesService.resource('infusionShowHideList'),
            instructionsShowHideList: this.resourcesService.resource('instructionsShowHideList'),
            infusionUpperThresholds: this.resourcesService.resource('infusionUpperThresholds'),

            warning: this.resourcesService.resource('warning'),
            priority: this.resourcesService.resource('priority'),
            escalate: this.resourcesService.resource('escalate'),
            warningThresholdFooter: this.resourcesService.resource('warningThresholdFooter'),
            thresholdUnits: this.resourcesService.resource('thresholdUnits'),
            priorityThresholdFooter: this.resourcesService.resource('priorityThresholdFooter'),
            escalateThresholdFooter: this.resourcesService.resource('escalateThresholdFooter'),
            thresholdWarningErrorRangeMessage: this.getThresholdErrorRangeMessage('warning', this.resourcesService.resource('thresholdErrorRangeMessage')),
            thresholdEscalateErrorRangeMessage: this.getThresholdErrorRangeMessage('escalate', this.resourcesService.resource('thresholdErrorRangeMessage')),
            thresholdPriorityErrorRangeMessage: this.getThresholdErrorRangeMessage('priority', this.resourcesService.resource('thresholdErrorRangeMessage')),
            warningThresholdIsRequired: this.resourcesService.resource('warningThresholdIsRequired'),
            escalateThresholdIsRequired: this.resourcesService.resource('escalateThresholdIsRequired'),
            priorityThresholdIsRequired: this.resourcesService.resource('priorityThresholdIsRequired'),

            otherSettingsTitle: this.resourcesService.resource('otherSettingsTitle'),
            preserveRecordsTitle: this.resourcesService.resource('preserveRecordsTitle'),
            preserveRecordsUnits: this.resourcesService.resource('preserveRecordsUnits'),
            preserveRecordsFooter: this.resourcesService.resource('preserveRecordsFooter'),
            preserveRecordsIsRequired: this.resourcesService.resource('preserveRecordsIsRequired'),
            preverveRecordsRangeError: this.getThresholdErrorRangeMessage('preserverecords', this.resourcesService.resource('preverveRecordsRangeError')),

            containerToleranceTitle: this.resourcesService.resource('containerToleranceTitle'),
            show: this.resourcesService.resource('show'),
            hide: this.resourcesService.resource('hide'),
            add: this.resourcesService.resource('add'),
            pixysIvPrepSettingsTittle: this.resourcesService.resource('pixysIvPrepSettingsTittle'),
            unMappedStatesNotificationText: this.resourcesService.resource('unMappedStatesNotificationText'),
            medminedSettingsTittle: this.resourcesService.resource('medminedSettingsTittle'),

            orderServiceSearchParameters: this.resourcesService.resource('orderServiceSearchParameters'),
            variance: this.resourcesService.resource('variance'),
            resetToDefault: this.resourcesService.resource('resetToDefault'),
            varianceDescriptionTextLine1: this.resourcesService.resource('varianceDescriptionTextLine1'),
            varianceDescriptionTextLine2: this.resourcesService.resource('varianceDescriptionTextLine2'),
            varianceDescriptionTextLine3: this.resourcesService.resource('varianceDescriptionTextLine3'),
            exactMatch: this.resourcesService.resource('exactMatch'),
            unableToSaveOrderServiceSearchParameters: this.resourcesService.resource('unableToSaveOrderServiceSearchParameters'),

            medminedDataRetrievalError: this.resourcesService.resource('medminedDataRetrievalError'),
            medminedDataEmpty: this.resourcesService.resource('medminedDataEmpty'),
            medminedDataSaveError: this.resourcesService.resource('medminedDataSaveError'),
        };
    }

    private createRequest(params: any) {
        return {
            appCode: this.appCode,
            widgetId: this.widgetId,
            api: 'infusiondrugs',
            rawData: params
        };
    }

    getSystemAdminData() {
        console.log('MedViewSystemAdminConfigComponent: Loading system settings...');
        this.isLoading = true;
        this.errorMedminedDataRetrieval = false;
        this.errorMedminedDataEmpty = false;
        this.errorMedminedDataSave = false;
        this.infusionDataObservable$ = this.dataService.loadData([this.createRequest([])]);
        this.systemSettingsObservable$ = this.systemAdminConfigurationService.getSystemAdminPreferences();
        this.mmAlertsSubscriptionObservable$ =
            this.userConfigurationService.getCurrentConfig()
                .pipe(
            concatMap((preferences) => {
                    this.medminedFacilitiesKeys = this.medminedTransformationService.processFacilities(preferences).facilities || [];
                    let facilityKeys = this.medminedFacilitiesKeys.join(',');

                    return this.medminedDataService.getAlertsSubscriptions$(this.appCode, this.widgetId, facilityKeys.toString(), this.medminedAlertsSubscriptionType);
                    }),
                    map(data => this.medminedTransformationService.getAlertsSubscriptions(data)),
                    concatMap(initialMMAlertsSubs => this.authorizationService.getUpdatedAuthorizationModel().pipe(
                        map((authData) => ({ initialMMAlertsSubs, authData }))
                    ))
                );


        this.getSystemProvidersSubscription$ = this.facilityManagementService
            .getEnabledDataSources()
            .pipe(
                tap((response: any) => {
                    if (response && response.length) {
                        this.isInfusionProviderEnabled = response.some((item) =>
                            ('' || item.name).toLowerCase() === ('' || MvdConstants.INFUSION_PROVIDER_NAME).toLowerCase());
                        this.isCatoProviderEnabled = response.some((item) =>
                            ('' || item.name).toLowerCase() === ('' || MvdConstants.CATO_PROVIDER_NAME).toLowerCase());
                        this.isMedminedProviderEnabled = response.some((item) =>
                            ('' || item.name).toLowerCase() === ('' || MvdConstants.MEDMINED_PROVIDER_NAME).toLowerCase());
                    } else {
                        throw "Error when retrieve the providers enabled";
                    }
                }),
                concatMap(() =>
                    (this.isInfusionProviderEnabled ? this.infusionDataObservable$ : of([])).pipe(catchError(error => {
                        return of([]);
                    }))
                ),
                concatMap((infusionsResponse: any[]) =>
                    this.systemSettingsObservable$.pipe(map((systemSettingsResponse) => ({
                        infusionsResponse,
                        systemSettingsResponse
                    })))
                ),
                concatMap(({ infusionsResponse, systemSettingsResponse }) => {
                    return this.checkResponseFromPreferences(systemSettingsResponse)
                        .pipe(map((systemSettingsResponse) => ({
                            infusionsResponse,
                            systemSettingsResponse
                        })));
                }),
                concatMap(({ infusionsResponse, systemSettingsResponse }) =>
                    this.mvdCfwConfigurationService.getRefreshRate().pipe(map((refreshRate) => ({
                        infusionsResponse,
                        systemSettingsResponse,
                        refreshRate
                    })))
                ),
                switchMap(({infusionsResponse, systemSettingsResponse, refreshRate}) => {
                    return (this.isCatoProviderEnabled ? this.ivPrepConfigurationComponent.getInitialiData$()
                            .pipe(
                                map((initialIvPrepData) => (
                                    {
                                        infusionsResponse,
                                        systemSettingsResponse,
                                        refreshRate,
                                        initialIvPrepData}))) :
                        of({
                            infusionsResponse,
                            systemSettingsResponse,
                            refreshRate,
                            initialIvPrepData: undefined
                        })
                    );
                }),
            concatMap(({ infusionsResponse, systemSettingsResponse, refreshRate, initialIvPrepData }) => {
                if (this.isMedminedProviderEnabled) {
                    return this.mmAlertsSubscriptionObservable$.pipe(
                        catchError((error) => {
                            this.errorMedminedDataRetrieval = true;
                            return throwError(error);
                        }),
                        map(({ initialMMAlertsSubs, authData }) => ({
                            infusionsResponse,
                            systemSettingsResponse,
                            refreshRate,
                            initialIvPrepData,
                            initialMMAlertsSubs,
                            authData
                        }))
                    );
                }
                else {
                    return of(
                        {
                            infusionsResponse,
                            systemSettingsResponse,
                            refreshRate,
                            initialIvPrepData,
                            initialMMAlertsSubs: undefined,
                            authData: undefined
                        }
                    );
                }
                    })
        )
            .subscribe(({ infusionsResponse, systemSettingsResponse, refreshRate, initialIvPrepData, initialMMAlertsSubs, authData }) => {
                this.hasDataLoadError = false;

                this.systemAdminAlarisConfiguration = systemSettingsResponse;
                this.infusionsAvailables = infusionsResponse[0];
                this.infusionsToHide = this.systemAdminConfigurationService
                                            .transformInfusionsToNeverShow(this.systemAdminAlarisConfiguration.excludedInfusions);
                this.infusionsToShow = this.systemAdminConfigurationService
                    .transformInfusionData(infusionsResponse[0], this.infusionsToHide);
                this.authorizationData = authData;
                const initialValueForm: any = {
                    refreshRate: refreshRate,
                    orderServiceFormGroup: { selectedVariance: this.getSavedOrderServiceVariance() },
                    infusionsToDisplayForm: { infusionsToShow: [], infusionsToHide: [] },
                    infusionThresholdForm: {
                        warningThreshold: this.systemAdminAlarisConfiguration.warningThreshold,
                        priorityThreshold: this.systemAdminAlarisConfiguration.priorityThreshold,
                        escalateThreshold: this.systemAdminAlarisConfiguration.urgentThreshold
                    },
                    otherSettingsForm: {
                        preserveRecordsHours: this.systemAdminAlarisConfiguration.preserveRecords,
                        containerToleranceValue: this.systemAdminAlarisConfiguration.containerTolerance
                    }
                };

                this.subscribedAlerts = initialMMAlertsSubs ? initialMMAlertsSubs.subscribedAlerts : [];
                this.unsubscribedAlerts = initialMMAlertsSubs ? initialMMAlertsSubs.unsubscribedAlerts : [];

                if (initialMMAlertsSubs
                    && initialMMAlertsSubs.subscribedAlerts.length === 0
                    && initialMMAlertsSubs.unsubscribedAlerts.length === 0) {
                    this.errorMedminedDataEmpty = true;
                }

                this.subscribedAlerts = this.sortingService.sortData('label', 1, 'localeSensitive', this.subscribedAlerts);
                this.unsubscribedAlerts = this.sortingService.sortData('label', 1, 'localeSensitive', this.unsubscribedAlerts);

                initialValueForm.alertSubscriptionGroup = {
                    alertsSubscription: this.getListAlertsSubscriptions()
                };


                this.adminSettingsForm.setValue(initialValueForm);

                if (this.isCatoProviderEnabled && initialIvPrepData && initialIvPrepData.length) {
                    this.initializeIvPrepSettings(initialIvPrepData);
                    this.handleIvPrepSettingsNotification();
                }
                this.isLoading = false;
                console.log('MedViewSystemAdminConfigComponent: System settings loaded');


            }, error => {
                console.error(`MedViewSystemAdminConfigComponent: ${error}`);
                this.eventBusService.emitLoadDataFail(this.appCode, this.widgetId);
                this.isLoading = false;
                this.hasDataLoadError = true;
            });
    }

    private  openModal() {
        this.modalRef = this.modalService.show(IvPrepConfigurationDialogComponent, this.warningModalOptions);
        this.modalRef.content.modalRef = this.modalRef;
        return this.modalRef.content.dlgClosed.pipe(take(1));
    }

    private checkResponseFromPreferences(response): Observable<any> {
        if (!response) {
            return this.systemAdminConfigurationService.getDefaultSystemAlarisSetting();
        } else {
            return of(response);
        }
    }

    private saveSystemSettings() {
        if (!this.adminSettingsForm.get('refreshRate').valid) {
            console.log('Unable to save refresh rate: Invalid value');
            return;
        }
        if (!this.adminSettingsForm.get('otherSettingsForm').valid) {
            return;
        }
        if (!this.adminSettingsForm.get('infusionThresholdForm').valid) {
            return;
        }
        if (this.isMedminedProviderEnabled && !this.adminSettingsForm.get('alertSubscriptionGroup').valid) {
            return;
        }
        if (!this.adminSettingsForm.get('orderServiceFormGroup').valid) {
            console.error('Unable to save Order service variance. Invalid value');
            return;
        }

        if (this.isCatoProviderEnabled &&
            this.ivPrepSettingsTouched &&
            !this.ivPrepConfigurationComponent.isModelStateValid()) {
            this.openModal().subscribe((reason) => {
                this.preserveSystemAdminSettings();
                this.ivPrepConfigurationComponent.reset();
                this.showUnMappedStatesToast();
            });
        } else {
            this.preserveSystemAdminSettings();
        }
    }

    private preserveSystemAdminSettings() {
        this.errorMedminedDataSave = false;
        const isIvPrepStateValid = this.isCatoProviderEnabled && this.ivPrepConfigurationComponent.isModelStateValid();
        const $updateStateMappings =  isIvPrepStateValid ?
            this.ivPrepConfigurationComponent.updateStateMappings$()
                .pipe(switchMap(() => this.ivPrepConfigurationComponent.getInitialiData$())) :
            of([]);

        let newSubscribedAlertsData: MedMinedModels.AlertSubscriptionItem[] = [];
        if (this.isMedminedProviderEnabled) {
            newSubscribedAlertsData = this.adminSettingsForm.get('alertSubscriptionGroup').get('alertsSubscription').value;
        }

        const updateSubscribedAlerts$ = !this.isMedminedProviderEnabled ? of([])
            : this.medminedDataService.updateSubscriptionAlerts$(newSubscribedAlertsData, this.authorizationData, this.appCode, this.widgetId, (this.medminedFacilitiesKeys || []),
                this.medminedAlertsSubscriptionType);

        this.isLoading = true;
        this.setSystemSettingsSubscription$ = forkJoin([
            this.mvdCfwConfigurationService.saveRefreshRate(this.adminSettingsForm.get('refreshRate').value).pipe(
                tap(() => this.hasRefreshRateSaveError = false ),
                catchError(error => {
                    this.hasRefreshRateSaveError = true;
                    throw(error);
                })
            ),
            this.systemAdminConfigurationService.saveSystemSettings(this.buildSystemSettingObject(), this.isSettingUpdate).pipe(
                tap(() => this.handleOrderServiceSaveSuccess()),
                catchError(error => {
                    this.handleOrderServiceSaveFailure();
                    throw(error);
                })
            ),
            $updateStateMappings,
            updateSubscribedAlerts$.pipe(
                catchError((error) => {
                    this.errorMedminedDataSave = true;
                    this.adminSettingsForm.get('alertSubscriptionGroup').markAsDirty();
                    return throwError(error);
                })
            )
        ]).subscribe((response: any[]) => {
            this.isLoading = false;
            this.adminSettingsForm.get('refreshRate').markAsPristine();
            this.adminSettingsForm.get('otherSettingsForm').markAsPristine();
            this.adminSettingsForm.get('infusionThresholdForm').markAsPristine();
            this.ivPrepSettingsTouched = false;
            // this.newStatesNotificationDismissed = false;
            this.adminSettingsForm.get('alertSubscriptionGroup').markAsPristine();

            const initialIvPrepData = response && response.length > 0 ? response[2] : undefined;
            if (this.isCatoProviderEnabled && initialIvPrepData && initialIvPrepData.length) {
                this.initializeIvPrepSettings(initialIvPrepData);
            }
            this.handleIvPrepSettingsNotification();
            this.eventBusService.emitLoadDataSuccess(this.appCode, this.widgetId);
        }, (error) => {
            console.error('Unable to save System Settings', error);
            this.eventBusService.emitLoadDataFail(this.appCode, this.widgetId);
            this.isLoading = false;
        });
    }

    private handleOrderServiceSaveSuccess() {
        const orderServiceFormGroup = this.adminSettingsForm.get('orderServiceFormGroup');
        orderServiceFormGroup.markAsPristine();
        this.systemAdminAlarisConfiguration.orderServiceVariance = orderServiceFormGroup.get('selectedVariance').value;

        this.hasOrderServiceSaveError = false;
    }

    private handleOrderServiceSaveFailure() {
        const orderServiceFormGroup = this.adminSettingsForm.get('orderServiceFormGroup');

        const savedVariance = this.getSavedOrderServiceVariance();
        const currentVariance = orderServiceFormGroup.get('selectedVariance').value;

        if (currentVariance !== savedVariance) {
            orderServiceFormGroup.markAsDirty();
        }

        this.hasOrderServiceSaveError = true;
    }

    private handleIvPrepSettingsNotification() {
        if (this.ivPrepConfigurationComponent && !this.ivPrepConfigurationComponent.isModelStateValid()) {
            this.showUnMappedStatesToast();
        } else {
            this.messageService.clear();
        }
    }

    private initializeIvPrepSettings(ivPrepData: any[]) {
        this.ivPrepConfigurationComponent.initializeComponent(ivPrepData);
    }

    private showUnMappedStatesToast() {
        if (!this.newStatesNotificationDismissed) {
            this.messageService.clear();
            this.messageService.add(
                {
                    key: 'configuration'
                    , detail: this.resources.unMappedStatesNotificationText
                    , sticky: true});
            this.newStatesNotificationDismissed = true;
        }
    }

    private buildSystemSettingObject(): InfusionGlobalPreference {
        let value: InfusionGlobalPreference = {
            id: 0,
            name: 'Infusion',
            type: 'System',
            version: '1-0-0',
            containerTolerance: this.adminSettingsForm.get('otherSettingsForm').get('containerToleranceValue').value,
            excludedInfusions: this.infusionsToHide.map(a => ({ name: a.value.name, addedByUser: a.value.addedByUser } as InfusionGlobalSetting)),
            preserveRecords: this.adminSettingsForm.get('otherSettingsForm').get('preserveRecordsHours').value,
            priorityThreshold: this.adminSettingsForm.get('infusionThresholdForm').get('priorityThreshold').value,
            warningThreshold: this.adminSettingsForm.get('infusionThresholdForm').get('warningThreshold').value,
            urgentThreshold: this.adminSettingsForm.get('infusionThresholdForm').get('escalateThreshold').value,
            refreshRate: this.adminSettingsForm.get('refreshRate').value,
            orderServiceVariance: this.adminSettingsForm.get('orderServiceFormGroup').get('selectedVariance').value
        };
        return value;
    }

    onSelectionToRight() {
        this.adminSettingsForm.markAsDirty();
        this.selectedInfusionsToShow.forEach(infusion => {
            this.infusionsToHide.push({
                label: infusion,
                value: { name: infusion, addedByUser: false }
            });
            this.infusionsToHide = this.sortingService.sortArrayObjectByField('label', this.infusionsToHide);
            const index = this.infusionsToShow.findIndex(a => a.value === infusion);
            this.infusionsToShow.splice(index, 1);
        });
        this.selectedInfusionsToShow = [];
    }

    onAllToRight() {
        this.adminSettingsForm.markAsDirty();
        this.infusionsToShow.forEach(infusion => {
            this.infusionsToHide.push({
                label: infusion.label,
                value: { name: infusion.value, addedByUser: false }
            });
            this.infusionsToHide = this.sortingService.sortArrayObjectByField('label', this.infusionsToHide);
        });
        this.infusionsToShow = [];
    }

    onSelectionToLeft() {
        this.adminSettingsForm.markAsDirty();
        this.selectedInfusionsToHide.forEach(infusion => {
            const index = this.infusionsToHide.findIndex(a => a.value.name === infusion.name);
            this.infusionsToHide.splice(index, 1);
        });
        this.infusionsToShow = this.systemAdminConfigurationService.transformInfusionData(this.infusionsAvailables, this.infusionsToHide);
        this.selectedInfusionsToHide = [];
    }

    onAllToLeft() {
        this.adminSettingsForm.markAsDirty();
        this.infusionsToHide = [];
        this.infusionsToShow = this.systemAdminConfigurationService.transformInfusionData(this.infusionsAvailables, this.infusionsToHide);

    }

    onAddUnlistedInfusionClick() {
        this.adminSettingsForm.markAsDirty();
        if (this.unlistedInfusion) {
            this.adminSettingsForm.get('infusionsToDisplayForm').markAsDirty();

            const infusionExists = this.infusionsAvailables
                                        .find(a => (a.name || '').toUpperCase() === (this.unlistedInfusion || '').toUpperCase());
            const addedByUser = infusionExists ? false : true;
            if (!this.infusionsToHide.some(a => (a.value.name || '').toUpperCase() === (this.unlistedInfusion || '').toUpperCase())) {
                this.infusionsToHide.push({
                    label: infusionExists ? infusionExists.name : this.unlistedInfusion,
                    value: { name: infusionExists ? infusionExists.name : this.unlistedInfusion, addedByUser: addedByUser }
                });
                this.infusionsToHide = this.sortingService.sortArrayObjectByField('label', this.infusionsToHide);
            }
            this.unlistedInfusion = '';
            this.infusionsToShow = this.systemAdminConfigurationService
                                        .transformInfusionData(this.infusionsAvailables, this.infusionsToHide);
        }
    }

    getContainerToleranceOptions(): any[] {
        const options = [];
        for (let i = 0; i < 11; i++) {
            options.push({
                label: `${i}%`,
                value: i
            });
        }
        return options;
    }

    setThresholdsSettings() {
        this.thresholdsSettings = {
            escalate: {
                min: 1,
                max: 30
            },
            priority: {
                min: 31,
                max: 60
            },
            warning: {
                min: 61,
                max: 180
            }
        };
    }

    getThresholdErrorRangeMessage(setting: string, resourceValue: string) {
        let message = resourceValue || '';
        if (setting !== 'preserverecords') {
            message = message.replace('{{thresholdMinValue}}', this.thresholdsSettings[setting].min);
            message = message.replace('{{thresholdMaxValue}}', this.thresholdsSettings[setting].max);
        } else {
            message = message.replace('{{thresholdMinValue}}', `${this.minPreserveRecords}`);
            message = message.replace('{{thresholdMaxValue}}', `${this.maxPreserveRecords}`);
        }
        return message;
    }

    ngOnDestroy() {
        this.getSystemProvidersSubscription$.unsubscribe();
        if (this.setSystemSettingsSubscription$) {
            this.setSystemSettingsSubscription$.unsubscribe();
        }
        if (this.systemPreferencesDefaultsSubscription$) {
            this.systemPreferencesDefaultsSubscription$.unsubscribe();
        }
    }

    onElementChange() {
        this.adminSettingsForm.markAsDirty();
        this.ivPrepSettingsTouched = true;
    }

    private getListAlertsSubscriptions() {
        let parseSubscribed = this.subscribedAlerts.map(item => ({ category: item.value.category, title: item.value.title, status: "Enabled" }));
        let parseUnsubscribed = this.unsubscribedAlerts.map(item => ({ category: item.value.category, title: item.value.title, status: "Disabled" }));
        return [...parseSubscribed, ...parseUnsubscribed];
    }

    private getOrderServiceOptions(): { label: string, value: number }[] {
        return [
            {label: '10%', value: 10},
            {label: '20%', value: 20},
            {label: '30%', value: 30},
            {label: '40%', value: 40},
            {label: '50%', value: 50},
            {label: `${this.resources.exactMatch} (0%)`, value: 0}
        ];
    }

    private getSavedOrderServiceVariance(): number {
        const variance = _.get(this, 'systemAdminAlarisConfiguration.orderServiceVariance',  MvdConstants.ORDER_SERVICE_DEFAULT_VARIANCE);
        if (variance == null || variance === undefined) { return MvdConstants.ORDER_SERVICE_DEFAULT_VARIANCE; }
        return variance;
    }

    onClickResetOrderServiceVariance() {
        const formControl = this.adminSettingsForm.get('orderServiceFormGroup').get('selectedVariance');
        formControl.setValue(MvdConstants.ORDER_SERVICE_DEFAULT_VARIANCE);
        if (MvdConstants.ORDER_SERVICE_DEFAULT_VARIANCE === _.get(this,
            'systemAdminAlarisConfiguration.orderServiceVariance', MvdConstants.ORDER_SERVICE_DEFAULT_VARIANCE)) {
            formControl.markAsPristine();
        } else {
            formControl.markAsDirty();
        }
    }
}

import { Component, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DashboardService, EventBusService, ResourceService } from 'container-framework';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { MessageService } from 'primeng/api';
import { interval, of, ReplaySubject, Subscription, timer } from 'rxjs';
import { catchError, concatMap, filter, first, map, switchMap, take } from 'rxjs/operators';

import { AuthorizationService } from '../../../services/authorization.service';
import { UserConfigurationService } from '../../../services/user-configuration.service';
import { DataFormatPipe } from '../../pipes/mvd-data-format.pipe';
import { DashboardHeaderService } from '../../services/mvd-dashboard-header.service';
import { InfusionDataFiltersService } from '../../services/mvd-infusion-data-filters.service';
import { SortingService } from '../../services/mvd-sorting-service';
import { StateMappingConfigurationService } from '../../services/mvd-state-mapping-configuration.service';
import { MvdConstants } from '../../shared/mvd-constants';
import { IvPrepModels, IvPrepTimeFrameFilter, ContinuousInfusionItem } from '../../shared/mvd-models';
import { WidgetToolbarComponent } from '../../shared/widget-toolbar/widget-toolbar.component';
import {
    ContinuousInfusionsConfigurationComponent,
} from '../configuration/continuos-infusions-configuration/mvd-continuous-infusions-configuration.component';
import { InfusionsLineChart } from './infusions-line-chart/mvd-infusions-line-chart.component';
import { ContinuousInfusionsConfigurationService } from './mvd-continuous-infusions-configuration.service';
import { ContinuousInfusionsDataService } from './mvd-continuous-infusions-data.service';
import { ContinuousInfusionsTransformationService } from './mvd-continuous-infusions-transformation.service';
import { ContinuousInfusionsTresholdIndicators } from './mvd-continuous-infusions.types';

import * as _ from 'lodash';
import { MvdMedMinedSecondaryDataService } from '../../services/mvd-medmined-secondary-data.service';
import { MedMinedModels } from '../../shared/medmined-models';
import { MvdMedMinedSecondaryDataMapperService } from '../../services/mvd-medmined-secondary-data-mapper.service';
import { FacilityLookUpService } from '../../../services/facility-look-up.service';
import { PatientAlertComponent } from '../../shared/patient-alert-modal/patient-alert-modal.component';

@Component({
    moduleId: module.id,
    selector: 'mvd-continuous-infusions',
    templateUrl: './mvd-continuous-infusions.component.html',
    styleUrls: ['./mvd-continuous-infusions.component.scss'],
    providers: [ContinuousInfusionsTransformationService, DashboardService, SortingService, InfusionDataFiltersService]
})
export class ContinuousInfusions implements OnInit, OnDestroy {
    @ViewChild('canvasWidth') canvasWidth: any;
    @ViewChild(InfusionsLineChart) lineChartComponent: InfusionsLineChart;
    @ViewChild('widgetToolbar') widgetToolbar: WidgetToolbarComponent;

    private widgetKey = 'ContinuousInfusions';

    @Input() appCode: string;
    @Input() widgetId: string;
    @Input() user: string;

    setIvPrepTimeFrameDisabled = true;
    filters: any;
    errorMessage: string;
    infusionsTemplateData: any;
    ivPrepFilterValue: IvPrepTimeFrameFilter;


    infusionsOriginalData: any;
    globalPreferencesData: any;
    authorizationConfig: any;
    modalRef: BsModalRef;
    intervalSubscription: Subscription;
    previousWidth = 0;

    data;
    width: number;
    height: number;
    maskData = false;
    initialLoading = true;
    config = {
        animated: true,
        keyboard: true,
        backdrop: true,
        ignoreBackdropClick: false,
        class: 'gray modal-lg'
    };

    ivPrepStateMapping$: ReplaySubject<IvPrepModels.StateMapping[]> = new ReplaySubject(1);

    private eventBusStateChanged: Subscription;
    private eventBusResizeStateChanged: Subscription;

    private autoRefresh: string;
    private manualRefresh: string;
    private startResizing: string;
    private endResizing: string;
    private doingResize = false;
    private filtersUserPreferences;
    private defaultStartHours = 12;
    private defaultEndHours = 12;

    private isMedminedProviderEnabled = false;

    private patientAlertModalOptions: ModalOptions = {
        class: 'modal-md-alerts',
        keyboard: false,
        ignoreBackdropClick: true,
        animated: true,
        focus: true,
    };

    orderServiceEnabled = false;

    constructor(
        private dataFormatPipe: DataFormatPipe,
        private eventBus: EventBusService,
        private dataService: ContinuousInfusionsDataService,
        private resourcesService: ResourceService,
        private dataTransformer: ContinuousInfusionsTransformationService,
        private infusionDataFiltersService: InfusionDataFiltersService,
        private authorizationService: AuthorizationService,
        private headerService: DashboardHeaderService,
        private configurationService: ContinuousInfusionsConfigurationService,
        private modalService: BsModalService,
        private userConfigurationService: UserConfigurationService,
        private ivPrepStateMappingService: StateMappingConfigurationService,
        private messageService: MessageService,
        private secondaryDataService: MvdMedMinedSecondaryDataService,
        private secondaryDataMapperService: MvdMedMinedSecondaryDataMapperService,
        private facilityLookUpService: FacilityLookUpService
    ) {
        this.orderServiceEnabled = window['orderServiceEnabled'] || false;
    }
    ngOnInit(): void {
        console.log(`ContinuousInfusionsComponent: appCode  = ${this.appCode} widgetId = ${this.widgetId} user = ${this.user}`);
        this.headerService.cleanHeader(this.appCode);
        this.dataService.clearIvPrepCache();
        this.autoRefresh = this.eventBus.subcribeRequestAutoRefresh(this.appCode, this.widgetId);
        this.manualRefresh = this.eventBus.subcribeRequestManualRefresh(this.appCode, this.widgetId);

        this.startResizing = this.eventBus.subscribePortletStartResize(this.appCode, this.widgetId);
        this.endResizing = this.eventBus.subscribePortletEndResize(this.appCode, this.widgetId);

        this.eventBusResizeStateChanged = this.eventBus.eventBusState$.pipe(
            filter(state => state.target === this.startResizing || state.target === this.endResizing)
        ).subscribe(state => {
            if (state.target === this.startResizing) {
                this.doingResize = true;
            } else if (state.target === this.endResizing) {
                timer(0).subscribe(() => {
                    this.setGraphHeight();
                    this.width = this.canvasWidth.nativeElement.offsetWidth;
                    this.lineChartComponent.renderChart(this.infusionsTemplateData, this.width, this.globalPreferencesData);
                    if (this.doingResize) {
                        this.eventBus.emitPortletEndResize(this.appCode, this.widgetId);
                    }

                    this.doingResize = false;

                });
            }
        });

        this.eventBusStateChanged = this.eventBus.eventBusState$.pipe(
            filter(state => state.target === this.autoRefresh || state.target === this.manualRefresh),
            switchMap(() => this.ivPrepStateMappingService.getConfiguration().pipe(
                catchError(() => of(undefined)),
            )),
            switchMap(ivPrepMappings => this.infusionDataFiltersService.getFilters(this.user).pipe(
                map(userPreferencesResponse => ({
                    ivPrepMappings: ivPrepMappings,
                    userPreferencesResponse: userPreferencesResponse
                }))
            ))
        ).subscribe(response => {
            this.ivPrepStateMapping$.next(response.ivPrepMappings);
            this.initialzieTimeFrameFilter();
            const userPreferencesResponse = response.userPreferencesResponse;
            this.authorizationConfig = userPreferencesResponse.authorizationConfig;
            this.setIvPrepTimeFrameDisabled = !this.facilityLookUpService.hasProvider(this.authorizationConfig,
                MvdConstants.CATO_PROVIDER_NAME);
            this.globalPreferencesData = userPreferencesResponse.globalSettings;
            this.headerService.updateHeader(this.appCode, {
                userPreferences: userPreferencesResponse.userPreferences,
                authorizationConfig: userPreferencesResponse.authorizationConfig
            });
            this.initialLoading = true;
            this.filters = userPreferencesResponse.api;
            this.filtersUserPreferences = userPreferencesResponse.userPreferences;

            this.updateDateRangeFilters();
            this.maskData = userPreferencesResponse && userPreferencesResponse.userPreferences ?
                userPreferencesResponse.userPreferences.maskData : false;
            timer(0).subscribe(() => {
                this.width = this.canvasWidth.nativeElement.offsetWidth;
                this.setGraphHeight();

                this.getData(this.filters);
                // this.getOrders();
            });
        });
    }

    onWidgetSettingsClicked() {
        this.userConfigurationService
            .getCurrentConfig()
            .pipe(first())
            .subscribe((response) => {
                const { userPreferences } = response;
                this.modalRef = this.modalService.show(ContinuousInfusionsConfigurationComponent, this.config);
                this.modalRef.content.appCode = this.appCode;
                this.modalRef.content.widgetId = this.widgetId;
                this.modalRef.content.user = this.user;
                this.modalRef.content.loadData(userPreferences);
                this.modalRef.content.onCloseDialog.pipe(take(1)).subscribe(this.closeContinuousInfusionsSettingDialog.bind(this));
            });

    }

    private closeContinuousInfusionsSettingDialog(event: any) {
        if (event.name === 'APPLY') {
            console.log(event);
            this.userConfigurationService
                .getCurrentConfig()
                .pipe(
                    first(),
                    switchMap((preferencesResponse) => this.updatePreferences$(event.data, preferencesResponse))
                )
                .subscribe(() => {
                    this.eventBus.emitRequestManualRefresh(this.appCode, this.widgetId);
                    this.modalRef.hide();
                },
                    (error) => console.log('ContinuousInfusionsComponent: closeContinuousInfusionsSettingDialog Error: ', error));
        } else {
            this.modalRef.hide();
        }
    }

    private initialzieTimeFrameFilter(): void {
        this.ivPrepFilterValue = this.getTimeFrameFilter();
    }

    private updatePreferences$(data, preferences) {
        const { userPreferences } = preferences;
        if (userPreferences) {
            const widgets = userPreferences.generalSettings || [];
            const continuousInfusionsWidget =
                widgets.find((widget) => widget.id === MvdConstants.CONTINUOUSINFUSIONS_WIDGET_KEY);
            if (continuousInfusionsWidget) {
                continuousInfusionsWidget.configuration = data;
            } else {
                userPreferences.generalSettings.push({
                    id: MvdConstants.CONTINUOUSINFUSIONS_WIDGET_KEY,
                    configuration: data
                });
            }
        }
        return this.userConfigurationService.setUserPreferences(userPreferences);
    }

    private setGraphHeight() {
        try {
            this.height = this.canvasWidth.nativeElement.parentElement.parentElement
                .offsetHeight - 30;
        } catch (ex) {
            this.height = this.canvasWidth.nativeElement.offsetHeight - 30;
        }
    }

    private handleOrders(ordersEnvelope, infusionContainer: any) {
        console.log('********** Order Response *************', ordersEnvelope);

        // Unwrap order hyper media envelope to get orders info
        ordersEnvelope = ordersEnvelope || {};
        const orderResources = ordersEnvelope.entry || [];
        const orders = this.dataTransformer.transformOrderServices([...orderResources], infusionContainer.patientId);

        // Add patient name
        if (orders) {
            orders.forEach((item) => {
                item.patientName = infusionContainer.patientName;
            });
        }

        // needs to send back the object and the results
        const data = {
            infusionContainer: infusionContainer,
            orderServices: orders,
            error: false
        };
        this.lineChartComponent.orderServicesResponse(data, this.ivPrepStateMapping$, this.authorizationConfig);
    }

    private handleOrdersError(error: any, infusionContainer: any) {
        console.log(`ContinuousInfusionsComponent: Failed to load orders:`);
        console.log(error);
        if (error.status === 404) {
            const data = { infusionContainer: infusionContainer, orderServices: [], error: false };
            this.lineChartComponent.orderServicesResponse(data, this.ivPrepStateMapping$, this.authorizationConfig);
        } else {
            const data = { infusionContainer: infusionContainer, error: true };
            this.lineChartComponent.orderServicesResponse(data, this.ivPrepStateMapping$, this.authorizationConfig);
        }
    }

    private infusionDataSubscription: Subscription;
    private authConfigSubscription: Subscription;

    getData(params: any) {

        if (!params || params.length < 1) {
            this.eventBus.emitNoDataAvailable(this.appCode, this.widgetId);
            return;
        }

        this.infusionDataSubscription = this.dataService.getInfusionData$(this.appCode, this.widgetId, params)
            .subscribe((responses: any[]) => {
                let response = responses[0] || [];
                this.authConfigSubscription = this.authorizationService.authorize().subscribe((authConfig: any) => {
                    this.dataTransformer.authorizationConfiguration = [...authConfig];

                    const widgets = this.filtersUserPreferences.generalSettings || [];
                    const continuousInfusionsWidget =
                        widgets.find((widget) => widget.id === MvdConstants.CONTINUOUSINFUSIONS_WIDGET_KEY);
                    response = this.infusionDataFiltersService
                        .applyInfusionsFilters(response, continuousInfusionsWidget, this.globalPreferencesData);

                    response = this.infusionDataFiltersService
                        .applyFacilityFilters(response, this.filtersUserPreferences);

                    const shapedInfusionData = this.dataTransformer
                        .transformContinuousInfusionsData(response, this.maskData, this.globalPreferencesData);
                    this.infusionsOriginalData = JSON.parse(JSON.stringify(shapedInfusionData));
                    this.data = shapedInfusionData.data;
                    this.initializeFilters(shapedInfusionData.data);
                    const filteredData = this.getFilteredData(shapedInfusionData);
                    this.setInfusionTemplateData(filteredData);

                    console.log(`ContinuousInfusionsComponent: after service response data :`, this.infusionsTemplateData);

                    this.isMedminedProviderEnabled = this.facilityLookUpService
                        .hasProvider(authConfig, MvdConstants.MEDMINED_PROVIDER_NAME);

                    if (this.isMedminedProviderEnabled) {
                        this.secondaryDataService.addUuid(this.infusionsTemplateData.data);
                        this.secondaryDataService.clearCache(this.widgetKey);
                        this.getContinuousInfusionsAlerts(this.infusionsTemplateData.data);
                    }
                    this.lineChartComponent.renderChart(this.infusionsTemplateData, null, this.globalPreferencesData);


                    this.initialLoading = false;
                    this.eventBus.emitPortletEndResize(this.appCode, this.widgetId);
                    if (response && response.length > 0) {
                        this.eventBus.emitLoadDataSuccess(this.appCode, this.widgetId);
                    } else {
                        this.eventBus.emitNoDataAvailable(this.appCode, this.widgetId);
                    }
                });
            },
                (error: any) => this.handleError(error));
    }

    private getMedMinedAlertsRequestData(data: ContinuousInfusionItem[]): MedMinedModels.MedMinedAlertsRequestData<ContinuousInfusionItem> {

        const requestData = {
            widgetKey: this.widgetKey,
            dataset: data,
            recordsPerPage: 10000,
            startPage: 0
        } as MedMinedModels.MedMinedAlertsRequestData<ContinuousInfusionItem>;

        return requestData;
    }

    private getContinuousInfusionsAlerts(data: any[]) {
        const requestData = this.getMedMinedAlertsRequestData(data);
        this.secondaryDataService.getAlerts(requestData, this.secondaryDataMapperService.mapContinuousInfusions)
            .pipe(take(1))
            .subscribe(
                response => {
                    console.log('Medmined secondary data received: ', response);

                    const filteredAlerts = this.secondaryDataService.filterAlerts(response, MvdConstants.MEDMINED_ALERT_STATE_NEW);
                    console.log('Medmined secondary data filtered by New state: ', filteredAlerts);

                    this.secondaryDataService.addSecondaryData(data, filteredAlerts);
                    //this.lineChartComponent.notifySecondaryDataLoaded();
                    this.lineChartComponent.renderChart(this.infusionsTemplateData, null, this.globalPreferencesData);
                },
                error => { console.log('Error getting Medmined secondary data', error); }
            );
    }

    private setInfusionTemplateData(infusions: any) {
        if (infusions) {
            infusions.data = infusions.data =
                infusions.data.filter((d: any) => d.thresholdIndicator !==
                    ContinuousInfusionsTresholdIndicators.Normal);
            this.infusionsTemplateData = infusions;
        }
    }

    handleError(error: any) {
        this.errorMessage = error;
        console.log(`ContinuousInfusionsComponent: Data Load Failed: ${error}`);
        this.infusionsTemplateData = this.dataTransformer.transformContinuousInfusionsData([], false, this.globalPreferencesData);
        this.eventBus.emitPortletEndResize(this.appCode, this.widgetId);
        this.eventBus.emitLoadDataFail(this.appCode, this.widgetId);
    }

    updateDateRangeFilters() {
        this.filters.startDate = null;
        this.filters.stopDate = null;
    }

    ngOnDestroy(): void {
        this.eventBusStateChanged.unsubscribe();
        this.eventBusResizeStateChanged.unsubscribe();
        if (this.infusionDataSubscription) {
            this.infusionDataSubscription.unsubscribe();
        }
        if (this.authConfigSubscription) {
            this.authConfigSubscription.unsubscribe();
        }
    }

    // ATTEMPT TO SOLVE PERFORMANCE ISSUE ON WINDOW.RESIZE GRAPH RENDERING
    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.intervalSubscription = interval(20).subscribe(() => {
            const newWidth = this.canvasWidth.nativeElement.offsetWidth;
            this.doingResize = true;
            if (newWidth === this.previousWidth) {
                this.eventBus.emitPortletEndResize(this.appCode, this.widgetId);
                this.intervalSubscription.unsubscribe();
                this.previousWidth = 0;
            } else {
                this.previousWidth = newWidth;
            }
        });
    }

    onAcknowledgementRecord(event: any) {
        console.log(`call event - containerKey: ${event.infusionContainerKey} userId: ${this.user}`);
        this.submitAcknowledgement(event.infusionContainerKey, this.user);
    }

    onChangePriority(event: { infusionContainerKey: string, ivPrepDose: IvPrepModels.Dose }) {
        this.submitChangePriorityAndAcknowledge(event.ivPrepDose, !event.ivPrepDose.Urgent, event.infusionContainerKey, this.user);
    }

    onRequestRefreshGraph() {
        this.eventBus.emitRequestManualRefresh(this.appCode, this.widgetId);
    }

    onRequestOrderService(event: any) {
        if (this.orderServiceEnabled) {
            console.log('Request order service', event);
            let orderServiceVariance = _.get(this, 'globalPreferencesData.orderServiceVariance',
                MvdConstants.ORDER_SERVICE_DEFAULT_VARIANCE);
            if (orderServiceVariance == null) { orderServiceVariance = MvdConstants.ORDER_SERVICE_DEFAULT_VARIANCE; }

            this.dataService.getOrders$(this.appCode, this.widgetId, event.infusionContainer, `${orderServiceVariance}%v`).subscribe(
                (response) => {
                    this.handleOrders(response, event.infusionContainer);
                },
                (error) => this.handleOrdersError(error, event.infusionContainer)
            );
        } else {
            if (event.infusionContainer.isAcknowledged) {

                this.lineChartComponent.orderServicesResponse(
                    {
                        infusionContainer: event.infusionContainer
                        , orderServices: []
                        , error: false
                    }
                    , this.ivPrepStateMapping$, this.authorizationConfig);
            }
        }
    }

    applyFilters(event) {
        const initialData = JSON.parse(JSON.stringify(this.infusionsOriginalData));
        const filteredData = this.filterInfusionData(event, initialData);
        this.setInfusionTemplateData(filteredData);

        if (this.isMedminedProviderEnabled) {
            this.secondaryDataService.addUuid(this.infusionsTemplateData.data);
            this.secondaryDataService.clearCache(this.widgetKey);
            this.getContinuousInfusionsAlerts(this.infusionsTemplateData.data);
        }

        this.configurationService.setFilterColumnConfiguration(event, this.configurationService.getConfiguration());
        this.eventBus.emitPortletEndResize(this.appCode, this.widgetId);
    }

    applyIvPrepFilter(event) {
        const configuration = this.configurationService.getConfiguration();
        if (configuration) {
            configuration.timeFrameFilter = event;
            this.configurationService.setUserConfiguration(configuration);
        }
    }

    initializeFilters(data) {
        const sessionPreferences = this.configurationService.getConfiguration();
        if (sessionPreferences) {
            this.widgetToolbar.multiValueFilter.initializeFilters(data, sessionPreferences.columns);
        }
    }

    resetFilters(event) {
        this.setInfusionTemplateData(JSON.parse(JSON.stringify(this.infusionsOriginalData)));
        this.configurationService.setFilterColumnConfiguration(event, this.configurationService.getConfiguration());
        if (this.isMedminedProviderEnabled) {
            this.secondaryDataService.addUuid(this.infusionsTemplateData.data);
            this.secondaryDataService.clearCache(this.widgetKey);
            this.getContinuousInfusionsAlerts(this.infusionsTemplateData.data);
        }
        this.lineChartComponent.renderChart(this.infusionsTemplateData, null, this.globalPreferencesData);
    }

    initializeMultivalueFiltersControl() {
        const userSettings = this.configurationService.getConfiguration();
        if (userSettings && this.data && this.data.length) {
            this.widgetToolbar.multiValueFilter.initializeFilters(this.data, userSettings.columns);
        }
    }

    initializeIvPrepDateFilter() {
        this.initialzieTimeFrameFilter();
    }

    onDisplayAlertsDetails(alerts: MedMinedModels.MedMinedAlertHeader[]) {
        this.modalRef = this.modalService.show(PatientAlertComponent, this.patientAlertModalOptions);
        this.modalRef.content.modalRef = this.modalRef;
        this.modalRef.content.setAlertsDetailsIds(alerts);
        this.modalRef.content.appCode = this.appCode;
        this.modalRef.content.widgetId = this.widgetId;
        this.modalRef.content.onClose.pipe(take(1)).subscribe(this.closeDialog.bind(this));
    }

    closeDialog() {
        this.modalRef.hide();
    }

    private filterInfusionData(event: any, infusionData: any) {
        let filtered: any[] = infusionData.data;

        for (let i = 0; i < event.length; i++) {
            const criteria = event[i].filterOptions.criteria
                .filter((itemCriteria: any) => !itemCriteria.state)
                .map((itemCriteria: any) => itemCriteria.value);

            if (criteria.length > 0) {
                filtered = filtered
                    .filter((data: any) => {
                        const value = data[event[i].field];
                        return criteria.indexOf(value) < 0 || data.highPriority;
                    });
            }
        }
        infusionData.summary = this.dataTransformer
            .mapSummary(
                filtered.filter((item) => !item.isAcknowledged)
            );
        infusionData.data = filtered;
        return infusionData;
    }

    private getFilteredData(shapedData: any) {
        const configuration = this.configurationService.getConfiguration();
        if (!configuration) {
            return shapedData;
        }
        shapedData = this.filterInfusionData(configuration.columns, shapedData);
        return shapedData;
    }

    private submitAcknowledgement(infusionContainerKey: any, userId: string) {
        console.log('Submit request');
        const params = { userId: userId, containerKey: infusionContainerKey, acknowledgementstatus: 1 };
        this.dataService.acknowledge$(this.appCode, this.widgetId, params)
            .subscribe(
                (responses: any) => {
                    this.handleAcknowledgeSuccess(responses);
                },
                (error: any) => {
                    console.log('Error acknowledging', infusionContainerKey, error);
                    this.lineChartComponent.closeModalWindow();
                    const errorMessage = this.resourcesService.resource('acknowledgeErrorMessage');
                    this.showToastNotification(errorMessage);
                });
    }

    private handleAcknowledgeSuccess(responses) {
        if (responses[0].result === 'Acknowledged') {
            this.lineChartComponent.notifyResponseAcknowledged({ success: true });
            this.eventBus.emitRequestManualRefresh(this.appCode, this.widgetId);
        } else {
            this.lineChartComponent.notifyResponseAcknowledged({
                success: false,
                message: this.formatAlreadyAcknowledgedMessage(responses[0])
            });
        }
    }

    private formatAlreadyAcknowledgedMessage(data: any) {
        const alreadyAcknoledged = this.resourcesService.resource('alreadyAcknowledged');
        const localDate = this.dataFormatPipe.transform(data.acknowledgedUTCDateTime, 'localtime');

        return alreadyAcknoledged
            .replace('{{AcknowledgedBy}}', data.acknowledgedBy)
            .replace('{{AcknowledgetAt}}', localDate);
    }

    private submitChangePriorityAndAcknowledge(ivPrepDose: IvPrepModels.Dose
        , priorityValue: boolean
        , infusionContainerKey: any
        , userId: string) {

        if (ivPrepDose && ivPrepDose.DoseId) {
            this.dataService.changePriorityAndAcknowledge$(this.appCode
                , this.widgetId
                , ivPrepDose
                , priorityValue, infusionContainerKey, userId).subscribe(
                (response: any) => this.handleChangePriorityAndAcknowledgeSuccess(response),
                (error) => this.handleChangePriorityAndAcknowledgeError(infusionContainerKey, ivPrepDose, priorityValue, error)
            );
        } else {
            console.error('Unable to change priority: DoseId not set');
        }
    }

    private handleChangePriorityAndAcknowledgeSuccess(responses) {
        this.handleAcknowledgeSuccess(responses);
    }

    private handleChangePriorityAndAcknowledgeError(infusionContainerKey: string
        , ivPrepDose: IvPrepModels.Dose
        , priorityValue: boolean
        , error: { prioritySuccess: boolean, acknowledgeSuccess: boolean, originalError: any }) {
        const statString = this.resourcesService.resource('stat');
        const normalString = this.resourcesService.resource('ivPrepNormal');

        if (!error.prioritySuccess) {
            console.log(`Error changing priority for InfusionContainerKey='${infusionContainerKey}', DoseId='${ivPrepDose.DoseId}'`, error.originalError);

            this.lineChartComponent.closeModalWindow();
            const errorMessage = this.resourcesService
                                        .resource('changePriorityErrorMessage')
                                        .replace('{{state}}', priorityValue ? statString : normalString);
            this.showToastNotification(errorMessage);
        } else if (!error.acknowledgeSuccess) {
            console.log(`Error acknowledging InfusionContainerKey='${infusionContainerKey}', DoseId='${ivPrepDose.DoseId}'`, error.originalError);

            this.lineChartComponent.closeModalWindow();
            const errorMessage = this.resourcesService
                                        .resource('prioritySuccesAcknowledgeErrorMessage')
                                        .replace('{{state}}', priorityValue ? statString : normalString);;
            this.showToastNotification(errorMessage);
        } else {
            this.lineChartComponent.notifyResponseAcknowledged({ success: false, message: 'Error' });
        }
    }

    onOrderSelected(event: { infusionData: any, order: any, isMultipleOrdersWorkflow: boolean }) {
        const timeFrameFilter = this.getTimeFrameFilter();
        this.dataService.getIvPrepConfig$(this.appCode, this.widgetId).pipe(
            concatMap(ivPrepConfig =>
                this.dataService.getIvPrepDoses$(this.appCode, this.widgetId, event.order.orderNumber, timeFrameFilter).pipe(
                    map(doses => ({ ivPrepConfig: ivPrepConfig, doses: doses }))
                )
            )
        ).subscribe(
            response => {
                console.log('Iv Prep doses received', response.doses);
                const sortedDoses = _.sortBy(response.doses, (dose: IvPrepModels.Dose) => dose.AdminDateTime);
                const data = {
                    infusionData: event.infusionData,
                    order: event.order,
                    ivPrepConfig: response.ivPrepConfig,
                    doses: sortedDoses,
                    isMultipleOrdersWorkflow: event.isMultipleOrdersWorkflow
                };
                this.lineChartComponent.onOrderSelectedResponse(data, this.ivPrepStateMapping$, this.authorizationConfig);
            },
            (error) => {
                console.log('Iv Prep doses error', error);
                this.lineChartComponent.onOrderSelectedError(event);
            }
        );
    }

    private getTimeFrameFilter(): IvPrepTimeFrameFilter {
        const configuration = this.configurationService.getConfiguration();
        if (configuration && configuration.timeFrameFilter) {
            return configuration.timeFrameFilter;
        }
        return {
            pastOptionValue: this.defaultStartHours,
            futureOptionValue: this.defaultEndHours
        } as IvPrepTimeFrameFilter;
    }

    private showToastNotification(message: string) {
        this.messageService.clear();
        this.messageService.add({
            key: 'custom',
            detail: message,
            sticky: true
        });
    }
}

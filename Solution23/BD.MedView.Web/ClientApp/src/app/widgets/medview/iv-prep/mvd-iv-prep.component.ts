import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ApiCall, ApiCallParam, EventBusService, GatewayService, ResourceService } from 'container-framework';
import * as _ from 'lodash';
import * as moment from 'moment';

import { Observable, Subscription, forkJoin, of, throwError } from 'rxjs';
import { refCount, catchError, concatMap, filter, map, publishReplay, retry, switchMap, take, tap } from 'rxjs/operators';

import { DashboardHeaderService } from '../../services/mvd-dashboard-header.service';
import { StateMappingConfigurationService } from '../../services/mvd-state-mapping-configuration.service';
import { MvdTimeTransformService } from '../../services/mvd-time-transform.service';
import { MvdConstants } from '../../shared/mvd-constants';
import { ColumnOption, ColumnOptionSetting, IvPrepModels, FilterCriteria } from '../../shared/mvd-models';
import { WidgetToolbarComponent } from '../../shared/widget-toolbar/widget-toolbar.component';
import { IvPrepBtnfiltersComponent } from './iv-prep-btnfilters/iv-prep-btnfilters.component';
import { IvPrepDlgService } from './iv-prep-confirm-dlg/iv-prep-dlg.service';
import { IvPrepTableComponent } from './iv-prep-table/mvd-iv-prep-table.component';
import { CatoDataFiltersService } from './mvd-cato-data-filters.service';
import { IvPrepConfigurationService } from './mvd-iv-prep-configuration.service';
import { IvPrepTransformationService } from './mvd-iv-prep-transformation.service';
import { MessageService } from 'primeng/api';
import { BsModalService, BsModalRef, ModalOptions } from 'ngx-bootstrap';
import { IvPrepSettingsComponent } from './iv-prep-settings/iv-prep-settings.component';
import { FacilityLookUpService } from '../../../services/facility-look-up.service';
import { MedMinedModels } from '../../shared/medmined-models';
import { PatientAlertComponent } from '../../shared/patient-alert-modal/patient-alert-modal.component';
import { MvdMedMinedSecondaryDataService } from '../../services/mvd-medmined-secondary-data.service';
import { MvdMedMinedSecondaryDataMapperService } from '../../services/mvd-medmined-secondary-data-mapper.service';

@Component({
    templateUrl: './mvd-iv-prep.component.html',
    styleUrls: ['./mvd-iv-prep.component.scss']
})
export class IVPrepComponent implements OnInit, OnDestroy {

    @Input() appCode: string;
    @Input() widgetId: string;
    @Input() user: string;

    @ViewChild('IvPrepTableComponent') ivPrepTableComponent: IvPrepTableComponent;
    @ViewChild('widgetToolbar') widgetToolbar: WidgetToolbarComponent;
    @ViewChild(IvPrepBtnfiltersComponent) btnfiltersComponent: IvPrepBtnfiltersComponent;

    deliveryMode = false;
    data: IvPrepModels.IvPrepViewModel[];
    doseSummary: IvPrepModels.DoseSummary;
    stateMappings: IvPrepModels.StateMapping[];
    totalRecords: number;
    loading = true;
    globalSearchCriteria: string;
    hourValue: number;
    isMedminedEnabled = false;

    tableColumns = [];
    resources: any;
    newStatesNotificationDismissed = false;
    modalRef: BsModalRef;
    config = {
        animated: true,
        keyboard: true,
        backdrop: true,
        ignoreBackdropClick: false,
        class: 'gray modal-lg'
    };

    private patientAlertModalOptions: ModalOptions = {
        class: 'modal-md-alerts',
        keyboard: false,
        ignoreBackdropClick: true,
        animated: true,
        focus: true,
    };
    private ComponentName = 'medViewIVPrep';
    private nativeStatusFilter: string[] = [];
    private authorizedNativeFacilities: string[] = [];

    private eventBusStateChanged: Subscription;
    private autoRefresh: string;
    private manualRefresh: string;

    private ivPrepServerTimeFormat = 'YYYY-MM-DDTHH:mm:ss';
    private ivPrepQueryParamsFormat = 'YYYYMMDDTHHmm';

    private hourFrameFilter: number;

    private authorizationConfig: any;
    private multiValueFilterDataItems: IvPrepModels.IvPrepViewModel[] = [];

    private widgetKey = 'IVPrep';

    private isMedminedProviderEnabled = false;

    selectedStatus: IvPrepModels.IvPrepStatuses = 'ALL';
    constructor(
        private eventBus: EventBusService,
        private dataService: GatewayService,
        private resourceService: ResourceService,
        private stateMappingService: StateMappingConfigurationService,
        private transformationService: IvPrepTransformationService,
        private configurationService: IvPrepConfigurationService,
        private headerService: DashboardHeaderService,
        private catoFiltersService: CatoDataFiltersService,
        private timeTransformService: MvdTimeTransformService,
        private confirmDlgService: IvPrepDlgService,
        private messageService: MessageService,
        private modalService: BsModalService,
        private facilitLookUpService: FacilityLookUpService,
        private secondaryDataService: MvdMedMinedSecondaryDataService,
        private secondaryDataMapperService: MvdMedMinedSecondaryDataMapperService
    ) {
    }

    private _initialData;
    private getInitialData$(): Observable<{
        apiConfigResponse: IvPrepModels.ApiConfig,
        facilitiesResponse: IvPrepModels.FacilitiesResponse,
        unitsResponse: IvPrepModels.UnitsResponse,
        prepSitesResponse: IvPrepModels.PrepSitesResponse,
        prioritiesResponse: IvPrepModels.PrioritiesResponse,
        containerTypesResponse: IvPrepModels.ContainerTypesResponse,
        dosesStatesResponse: IvPrepModels.DoseStatesResponse
    }> {
        if (!this._initialData) {
            this._initialData = this.dataService.loadData([
                this.getApiConfigRequest(),
                this.getFacilitiesRequest(),
                this.getUnitsRequest(),
                this.getPrepSitesRequest(),
                this.getDoseStatesRequestParams()
            ]).pipe(
                catchError((error) => {
                    this._initialData = undefined;
                    return throwError(error);
                }),
                map(response => {
                    return {
                        apiConfigResponse: this.mapApiConfig(response[0]),
                        facilitiesResponse: response[1] as IvPrepModels.FacilitiesResponse,
                        unitsResponse: response[2] as IvPrepModels.UnitsResponse,
                        prepSitesResponse: response[3] as IvPrepModels.PrepSitesResponse,
                        prioritiesResponse: this.getPrioritiesOptions(),
                        containerTypesResponse: this.getContainerTypes(),
                        dosesStatesResponse: response[4] as IvPrepModels.DoseStatesResponse
                    };
                }),
                publishReplay(1),
                refCount()
            );
        }

        return this._initialData;
    }

    ngOnInit() {
        console.log(`IVPrepComponent: appCode  = ${this.appCode} widgetId = ${this.widgetId} user = ${this.user}`);
        this.headerService.cleanHeader(this.appCode);
        this.resources = this.getResources();
        this.newStatesNotificationDismissed = false;

        this.autoRefresh = this.eventBus.subcribeRequestAutoRefresh(this.appCode, this.widgetId);
        this.manualRefresh = this.eventBus.subcribeRequestManualRefresh(this.appCode, this.widgetId);
        this.intializeHourFrameFilter();
        this.intializeGlobalSearch();
        this.initializeSorting();

        this.eventBusStateChanged = this.eventBus.eventBusState$
            .pipe(
                filter(({ target }) => target === this.autoRefresh || target === this.manualRefresh),
                tap(() => this.preLoadData()),
                switchMap(() => this.data$().pipe(
                    catchError(error => {
                        this.emitDataFail(error);
                        return throwError(error);
                    })
                )),
                retry()
            )
            .subscribe(
                response => { this.initializeComponent(response); }
            );
    }

    initializeSorting(): any {
        const sortConfig = this.getSortConfig();
        this.ivPrepTableComponent.setSort(sortConfig.order, sortConfig.field);
    }

    ngOnDestroy(): void {
        this.eventBusStateChanged.unsubscribe();
        this.secondaryDataService.clearCache(this.widgetKey);
    }

    emitDataFail(error: string) {
        console.log(`IVPrepComponent: Load Data Fail ${error}`);
        this.loading = false;
        this.eventBus.emitLoadDataFail(this.appCode, this.widgetId);
    }

    emitDataSuccess() {
        console.log(`IVPrepComponent: Load Data success`);
        this.loading = false;
        this.eventBus.emitLoadDataSuccess(this.appCode, this.widgetId);
    }

    emitNoDataAvailable() {
        console.log(`IVPrepComponent: No Data Available`);
        this.loading = false;
        this.eventBus.emitNoDataAvailable(this.appCode, this.widgetId);
    }

    initializeComponent(response: {
        data: IvPrepModels.DosesResponse;
        userPreferencesResponse: any;
        dispensingFacilities: any;
        apiConfigResponse: IvPrepModels.ApiConfig,
        facilitiesResponse: IvPrepModels.FacilitiesResponse,
        unitsResponse: IvPrepModels.UnitsResponse,
        prepSitesResponse: IvPrepModels.PrepSitesResponse,
        prioritiesResponse: IvPrepModels.PrioritiesResponse,
        containerTypesResponse: IvPrepModels.ContainerTypesResponse,
        dosesStatesResponse: IvPrepModels.DoseStatesResponse
    }) {
        if (response) {
            const authorizationConfig = response.userPreferencesResponse.authorizationConfig;
            const userPreferences = response.userPreferencesResponse.userPreferences;
            this.isMedminedProviderEnabled = this.facilitLookUpService
                .hasProvider(authorizationConfig, MvdConstants.MEDMINED_PROVIDER_NAME);

            // TURN OFF DELIVERYMODE UNTIL INTERGATION COMES ...
            // this.deliveryMode = this.isDeliveryTrackingEnabled(response.dispensingFacilities);
            this.data = this.transformationService.transform(response
                , this.stateMappings
                , authorizationConfig
                , response.facilitiesResponse
                , response.apiConfigResponse
                , userPreferences.maskData);

            this.isMedminedEnabled = this.facilitLookUpService.hasProvider(authorizationConfig, MvdConstants.MEDMINED_PROVIDER_NAME);
            this.doseSummary = response.data.DoseSummary;
            this.totalRecords = this.calculateTotalRecords(response.data.DoseSummary);
            this.restoreTablePage();
            this.tableColumns = this.configurationService.getShowHideOptions(this.deliveryMode);
            this.handleNewStatesNotification(response.dosesStatesResponse, this.stateMappings);
            this.initializeDataFilters(authorizationConfig,
                userPreferences
                , response.facilitiesResponse
                , response.unitsResponse
                , response.prepSitesResponse
                , response.prioritiesResponse
                , response.containerTypesResponse
                , response.data);

            this.headerService.updateHeader(this.appCode, {
                userPreferences: response.userPreferencesResponse.userPreferences,
                authorizationConfig: response.userPreferencesResponse.authorizationConfig
            });
            const config = this.configurationService.getConfiguration(this.deliveryMode);
            this.ivPrepTableComponent.setConfig(config);
            if (response.data.Doses && response.data.Doses.length > 0) {
                this.emitDataSuccess();
            } else {
                this.emitNoDataAvailable();
            }
            if (this.isMedminedEnabled) { this.getMedminedAlerts(this.data); }
        }
    }

    private getMedMinedAlertsRequestData(data: IvPrepModels.IvPrepViewModel[])
        : MedMinedModels.MedMinedAlertsRequestData<IvPrepModels.IvPrepViewModel> {
        const requestData = {
            widgetKey: this.widgetKey,
            dataset: data,
            startPage: 0,
            recordsPerPage: 10000
        } as MedMinedModels.MedMinedAlertsRequestData<IvPrepModels.IvPrepViewModel>;

        return requestData;
    }

    private getMedminedAlerts(data: IvPrepModels.IvPrepViewModel[]) {
        this.secondaryDataService.clearCache(this.widgetKey);

        setTimeout(() => {
            const requestData = this.getMedMinedAlertsRequestData(data);
            this.secondaryDataService.getAlerts(requestData, this.secondaryDataMapperService.mapIvPrep)
                .pipe(take(1))
                .subscribe(
                    response => {
                        console.log('Medmined secondary data received: ', response);

                        const filteredAlerts = this.secondaryDataService.filterAlerts(response, MvdConstants.MEDMINED_ALERT_STATE_NEW);
                        console.log('Medmined secondary data filtered by New state: ', filteredAlerts);

                        this.secondaryDataService.addSecondaryData(data, filteredAlerts);
                    },
                    error => { console.log('Error getting Medmined secondary data', error); }
                );
        }, 0);
    }


    private synchWidgetSettings(userPreferences: any): void {
        const settings = this.getIvPrepSettings(userPreferences);
        this.synchGeneralSettings(settings);
    }

    private getIvPrepSettings(userPreferences: any): IvPrepModels.IvPrepGeneralSettings {
        if (!userPreferences ||
            !userPreferences.generalSettings ||
            !userPreferences.generalSettings.length) {
            return undefined;
        }

        const ivPrepSetting = userPreferences
            .generalSettings.find((s) => s.id === MvdConstants.IVPREP_WIDGET_KEY);
        if (!ivPrepSetting) {
            return undefined;
        }

        return ivPrepSetting.configuration as IvPrepModels.IvPrepGeneralSettings;
    }

    private handleNewStatesNotification(dosesStatesResponse: IvPrepModels.DoseStatesResponse
        , stateMappings: IvPrepModels.StateMapping[]): void {
        const unMappedStates = this.stateMappingService
            .getUnMappedStates(stateMappings, dosesStatesResponse);
        if (unMappedStates && unMappedStates.length || !stateMappings.length) {
            this.showUnMappedStatesToast();
        }
    }

    private preLoadData(): void {
        if (this.confirmDlgService.isConfirmModalOpen) {
            this.confirmDlgService.closeConfirmModal();
        }
    }

    private calculateTotalRecords(doseSummary: IvPrepModels.DoseSummary): number {
        const nativeStatuses = this.getDosesRequestStatuses();
        if (nativeStatuses && nativeStatuses.length) {
            const doseStates = doseSummary.DoseStates.filter(doseState => _.includes(nativeStatuses, doseState.StateId));

            return _.sumBy(doseStates, doseState => doseState.TotalDoseCount);
        } else {
            return doseSummary.TotalDoses;
        }
    }

    resetTablePage() {
        const pagination = this.getPaginationInfo();
        pagination.first = 0;
        this.configurationService.savePagination(pagination, this.deliveryMode);
    }

    restoreTablePage() {
        const config = this.configurationService.getConfiguration(this.deliveryMode);
        if (config && config.options.pagination) {
            this.ivPrepTableComponent.paginateTable(config.options.pagination);
        }
    }

    private mapApiConfig(apiConfig): IvPrepModels.ApiConfig {
        const duration = moment.duration((apiConfig && apiConfig.TimeZoneOffset) || '00:00:00');
        // convert returned offset to the standard format browsers use. For instance for GMT-05, offset should be '05:00:00'
        const normalizedTimeZoneOffset = moment.utc(-duration).format('HH:mm:ss');
        apiConfig.TimeZoneOffset = normalizedTimeZoneOffset;

        return apiConfig;
    }

    private data$() {
        return this.stateMappingService.getConfiguration().pipe(
            tap(response => {
                this.stateMappings = _.cloneDeep(response);
            }),
            switchMap(() => this.catoFiltersService.getFilters$()),
            tap(response => this.authorizationConfig = response.authorizationConfig),
            tap(response => {
                this.synchColumnOptions(response);
                this.synchWidgetSettings(response.userPreferences);
            }),
            switchMap((response) => this.widgetData$(this.getLazyLoadMetaData(), response, !!this.globalSearchCriteria)),
            map((response) => this.mapWidgetData(response))
        );
    }

    private synchColumnOptions(response: any): void {
        if (response
            && response.userPreferences
            && response.userPreferences.columnOptions
        ) {
            this.configurationService
                .synchColumnOptions(response
                    .userPreferences
                    .columnOptions as ColumnOptionSetting[], this.deliveryMode);
        }

    }

    widgetData$(params: any, userPreferences: any, globalSearchEnabled: boolean): Observable<any> {

        return this.getInitialData$().pipe(
            concatMap(res => {
                console.log(res);
                this.authorizedNativeFacilities = userPreferences && userPreferences.nativeFacilities;
                const dosesRequest = this.getDosesRequest(params, res.apiConfigResponse, res.facilitiesResponse,
                    res.unitsResponse, res.prepSitesResponse);

                const requestDataset = dosesRequest
                    && dosesRequest.queryParams
                    && dosesRequest.queryParams.some(x => x.name === 'facilityIds' && x.value !== '')
                    && (globalSearchEnabled ||
                        (
                            dosesRequest.queryParams.some(x => x.name === 'unitIds' && x.value !== '')
                            && dosesRequest.queryParams.some(x => x.name === 'prepSiteIds' && x.value !== '')
                            && dosesRequest.queryParams.some(x => x.name === 'finalContainerType' && x.value !== undefined)
                            && dosesRequest.queryParams.some(x => x.name === 'urgent' && x.value !== undefined)
                            && dosesRequest.queryParams.some(x => x.name === 'stateIds' && x.value !== undefined)
                        )
                    );

                if (requestDataset) {
                    return forkJoin(
                        // TURN OFF DELIVERYMODE UNTIL INTERGATION COMES ...
                        // this.dataService.loadData([dosesRequest, this.getDispensingFacilitiesRequest()]),
                        this.dataService.loadData([dosesRequest]).pipe(
                            map(response => [...response, []])
                        ),
                        of(userPreferences),
                        of(res.apiConfigResponse),
                        of(res.facilitiesResponse),
                        of(res.unitsResponse),
                        of(res.prepSitesResponse),
                        of(res.prioritiesResponse),
                        of(res.containerTypesResponse),
                        of(res.dosesStatesResponse)
                    );
                }

                const doseSummary = this.doseSummary || { TotalDoses: 0, DoseStates: [] };
                // If no facilities or no statuses or no prepsites are in the query, return an empty data array
                return forkJoin(
                    // TURN OFF DELIVERYMODE UNTIL INTERGATION COMES ...
                    // this.dataService.loadData([this.getDispensingFacilitiesRequest()]).pipe(
                    of([
                        {
                            Doses: [],
                            DoseSummary: doseSummary as IvPrepModels.DoseSummary
                        } as IvPrepModels.DosesResponse,
                        []
                    ]),
                    of(userPreferences),
                    of(res.apiConfigResponse),
                    of(res.facilitiesResponse),
                    of(res.unitsResponse),
                    of(res.prepSitesResponse),
                    of(res.prioritiesResponse),
                    of(res.containerTypesResponse),
                    of(res.dosesStatesResponse)
                );
            })
        );
    }

    mapWidgetData(data: any) {
        const [ivPrepData
            , userPreferences
            , apiConfigResponse
            , facilitiesResponse
            , unitsResponse
            , prepSitesResponse
            , prioritiesResponse
            , containerTypesResponse
            , dosesStatesResponse] = data;
        const [doses, dispensingData] = ivPrepData;
        const dispensingFacilities = [];
        // TURN OFF DELIVERYMODE UNTIL INTERGATION COMES ...
        // const { body: dispensingFacilities = [] } = dispensingData;

        return {
            data: doses as IvPrepModels.DosesResponse,
            userPreferencesResponse: userPreferences,
            dispensingFacilities,
            apiConfigResponse,
            facilitiesResponse,
            unitsResponse,
            prepSitesResponse,
            prioritiesResponse,
            containerTypesResponse,
            dosesStatesResponse
        };
    }

    private getAllNativeStatuses() {
        const providerStates = _.flatMap(this.stateMappings, (states) => states.providerStates);
        return providerStates.map(item => item.stateId);
    }

    onSelectedStatusChange(event) {
        this.selectedStatus = event.value;
        if ((event && event.value) === 'ALL') {
            this.nativeStatusFilter = this.getAllNativeStatuses();
        } else {
            this.nativeStatusFilter = this.transformationService.mapStatusToNative(event.value, this.stateMappings);
        }
        this.cleanGlobalSearchCriteria();
        this.resetTablePage();
        this.requestLazyLoad();
    }

    onPriorityChange(event) {
        if (event && event.doseId) {
            const dose = this.ivPrepTableComponent.templateData.find((item) => item.doseId === event.doseId);
            if (dose) {
                this.dataService.loadData([this.getDoseUrgencyRequest(event.doseId, event.value)]).subscribe(
                    () => this.requestLazyLoad(),
                    () => {
                        this.showPriorityChangeErrorModal(dose).subscribe(() => {
                            this.requestLazyLoad();
                        });
                    }
                );
            }
        }
    }

    private showPriorityChangeErrorModal(dose): Observable<any> {
        const header = this.resources.cannotChangePriority;
        const message = this.resources.priorityChangeErrorMessage
            .replace('{{#PatientName}}', dose.patientName || '')
            .replace('{{#InfusionName}}', dose.medication || '');
        this.confirmDlgService.openErrorModal(header, message, this.resources.ok);
        return this.confirmDlgService.dlgClosed.pipe(take(1));
    }

    onHoldChange(event) {
        if (event && event.doseId) {
            const dose = this.ivPrepTableComponent.templateData.find((item) => item.doseId === event.doseId);
            if (dose) {
                this.dataService.loadData([this.getBlockDoseRequest(event.doseId, event.state)]).subscribe(
                    () => this.requestLazyLoad(),
                    () => {
                        this.showHoldChangeErrorModal(dose).subscribe(() => {
                            this.requestLazyLoad();
                        });
                    }
                );
            }
        }
    }

    private showHoldChangeErrorModal(dose): Observable<any> {
        const header = dose.isOnHold ? this.resources.cannotPlaceOnHold : this.resources.cannotRemoveHold;
        const message = (dose.isOnHold ? this.resources.cannotPlaceOnHoldErrorMsg : this.resources.cannotRemoveHoldErrorMsg)
            .replace('{{#PatientName}}', dose.patientName || '')
            .replace('{{#InfusionName}}', dose.medication || '');
        this.confirmDlgService.openErrorModal(header, message, this.resources.ok);
        return this.confirmDlgService.dlgClosed.pipe(take(1));
    }

    requestLazyLoad() {
        const metadata = this.getLazyLoadMetaData();
        this.onLazyLoad(metadata);
    }

    onLazyLoad(event) {
        if (this.loading) {
            return;
        }

        this.loading = true;

        this.catoFiltersService.getFilters$().pipe(
            switchMap((response) => this.widgetData$(event, response, !!this.globalSearchCriteria)),
            map((response) => this.mapWidgetData(response)))
            .subscribe((response) => {
                this.totalRecords = this.calculateTotalRecords(response.data.DoseSummary);
                const authorizationConfig = response.userPreferencesResponse.authorizationConfig;
                const userPreferences = response.userPreferencesResponse.userPreferences;

                this.isMedminedProviderEnabled = this.facilitLookUpService
                    .hasProvider(authorizationConfig, MvdConstants.MEDMINED_PROVIDER_NAME);

                this.data = this.transformationService.transform(response
                    , this.stateMappings
                    , authorizationConfig
                    , response.facilitiesResponse
                    , response.apiConfigResponse
                    , userPreferences.maskData);
                this.doseSummary = response.data.DoseSummary;
                this.restoreTablePage();

                this.initializeDataFilters(authorizationConfig
                    , userPreferences
                    , response.facilitiesResponse
                    , response.unitsResponse
                    , response.prepSitesResponse
                    , response.prioritiesResponse
                    , response.containerTypesResponse
                    , response.data);

                this.intializeHourFrameFilter();
                if (response.data.Doses && response.data.Doses.length > 0) {
                    this.emitDataSuccess();
                } else {
                    this.emitNoDataAvailable();
                }
                this.loading = false;

                if (this.isMedminedEnabled) { this.getMedminedAlerts(this.data); }
            },
                (error) => {
                    this.loading = false;
                    this.emitDataFail(error);
                }
            );
    }

    onGlobalSearch(event) {
        this.globalSearchCriteria = event.value;
        this.configurationService.setGlobalSearchCriteria(this.globalSearchCriteria, this.deliveryMode);
        this.btnfiltersComponent.setCurrentStatus('ALL');
        this.resetTablePage();
        this.requestLazyLoad();
    }

    onClearSearchBox(event) {
        this.cleanGlobalSearchCriteria();
        this.resetTablePage();
        this.requestLazyLoad();
    }

    intializeHourFrameFilter() {
        const hourFrameFilter = this.configurationService.getConfiguration(this.deliveryMode).hourFrameFilter;
        if (hourFrameFilter) {
            this.hourFrameFilter = hourFrameFilter;
            this.hourValue = hourFrameFilter;
            setTimeout(() => this.widgetToolbar.hourFrameFilter.setOptions(this.hourFrameFilter), 0);
        }
    }

    intializeGlobalSearch() {
        const configuration = this.configurationService.getConfiguration(this.deliveryMode);
        if (configuration) {
            this.globalSearchCriteria = configuration.options.globalSearchCriteria || '';
        }
    }

    initializeDataFilters(authorizationConfig: any
        , userPreferences: any
        , facilitiesResponse: IvPrepModels.FacilitiesResponse
        , unitsResponse: IvPrepModels.UnitsResponse
        , prepSitesResponse: IvPrepModels.PrepSitesResponse
        , prioritiesResponse: IvPrepModels.PrioritiesResponse
        , containerTypesResponse: IvPrepModels.ContainerTypesResponse
        , doseResponse: IvPrepModels.DosesResponse) {

        this.multiValueFilterDataItems = this.catoFiltersService.getMultiValueFilterDataFilters(
            authorizationConfig
            , userPreferences
            , this.authorizedNativeFacilities
            , facilitiesResponse
            , unitsResponse
            , prepSitesResponse
            , prioritiesResponse
            , containerTypesResponse);
        this.initializeMultivalueFiltersControl();
    }

    initializeMultivalueFiltersControl() {
        const configuration = this.configurationService.getConfiguration(this.deliveryMode);
        if (configuration) {
            let columnsConfig = configuration.columns as ColumnOption[];
            columnsConfig = _.sortBy(columnsConfig, ['filterOptions.order']);
            this.widgetToolbar.multiValueFilter.initializeFilters(this.multiValueFilterDataItems, columnsConfig);
        }
    }

    onMultiValueFiltersInit(event: any[]) {
    }

    applyMultiValueFilter(event: ColumnOption[]) {
        this.doApplyMultiValueFilter(event);
    }

    resetMultiValueFilter(event: ColumnOption[]) {
        this.configurationService.setFilterColumnConfiguration(event, this.deliveryMode);
        this.doApplyMultiValueFilter(event);
    }

    private doApplyMultiValueFilter(event: ColumnOption[]) {
        this.configurationService.setFilterColumnConfiguration(event, this.deliveryMode);
        this.cleanGlobalSearchCriteria();
        this.resetTablePage();
        this.requestLazyLoad();
    }

    isDeliveryTrackingEnabled(dispensingFacilitiesData: any[]): boolean {
        if (!dispensingFacilitiesData || !dispensingFacilitiesData.length) {
            return false;
        }
        return dispensingFacilitiesData.some((item) => item.delivery);
    }

    onDateFilterPanelOpened() {
        this.widgetToolbar.hourFrameFilter.setOptions(this.hourFrameFilter);
    }

    onDateFilterChanged(event: any) {
        if (event) {
            console.log(event);
            this.hourFrameFilter = event;
            this.configurationService.saveHourFrameFilterConfig(event, this.deliveryMode);
            this.cleanGlobalSearchCriteria();
            this.resetTablePage();
            this.requestLazyLoad();
        } else {
            this.eventBus.emitLoadDataFail(this.appCode, this.widgetId);
        }
    }

    onColumnReorder(event) {
        this.configurationService.saveColumnOptionsReordering(event, this.deliveryMode);
        this.tableColumns = this.configurationService.getShowHideOptions(this.deliveryMode);
    }

    getSortConfig(): any {
        const configuration = this.configurationService.getConfiguration(this.deliveryMode);
        return configuration.options.sort;
    }

    onWidgetSettingsClicked() {
        this.getInitialData$().pipe(
            switchMap((ivPrepData) => this.catoFiltersService.getFilters$().pipe(map((settings) => ({ ivPrepData, settings }))))
        ).subscribe((response) => {
            if (response && response.ivPrepData && response.settings) {
                this.modalRef = this.modalService.show(IvPrepSettingsComponent, this.config);
                this.modalRef.content.appCode = this.appCode;
                this.modalRef.content.widgetId = this.widgetId;
                this.modalRef.content.user = this.user;
                this.modalRef.content.loadData(response.ivPrepData, response.settings);
                this.modalRef.content.cancelDialog.pipe(take(1)).subscribe(this.onCloseIvStatusSettingDialog.bind(this));
                this.modalRef.content.applyDialog.pipe(take(1)).subscribe(this.onApplyIvStatusSettingDialog.bind(this));
            }
        },
            (error) => console.log('onWidgetSettingsClicked Error: ', error));

    }

    private onCloseIvStatusSettingDialog() {
        this.modalRef.hide();
        console.log('cancel:', event);
    }

    private onApplyIvStatusSettingDialog(event: IvPrepModels.IvPrepGeneralSettings) {
        this.modalRef.hide();
        this.configurationService
            .updateWidgetSettings$(event)
            .subscribe((response) => {
                this.synchGeneralSettings(event);
                this.requestLazyLoad();
                console.log('onApplyIvStatusSettingDialog success', event);
            },
                (error) => console.log('onApplyIvStatusSettingDialog error', error));
    }

    private synchGeneralSettings(settings: IvPrepModels.IvPrepGeneralSettings): void {
        if (!settings) {
            return;
        }

        const userSettings = this.configurationService.getConfiguration(this.deliveryMode);
        const prepSitesColumn = userSettings.columns.find(c => c.field === 'prepSite');
        const unitsColumn = userSettings.columns.find(c => c.field === 'unit');
        const facilitiesColumn = userSettings.columns.find(c => c.field === 'masterFacility');

        this.synchPrepSitesOnSession(prepSitesColumn, settings);
        this.synchUnitsOnSession(unitsColumn, settings);
        this.synchFacilitiesOnSession(facilitiesColumn, settings);

        this.configurationService.setUserConfiguration(userSettings);
    }

    private synchPrepSitesOnSession(prepSitesColumn: ColumnOption
        , settings: IvPrepModels.IvPrepGeneralSettings): void {

        if (settings.prepSiteSettings !== null) {
            prepSitesColumn.filterOptions.hasWidgetSettings = true;
            if (settings.prepSiteSettings.length > 0) {
                if (prepSitesColumn.filterOptions.allChecked) {
                    prepSitesColumn
                        .filterOptions
                        .criteria = settings
                            .prepSiteSettings
                            .map(s => ({
                                state: true,
                                value: s.prepSiteAbbr
                            } as FilterCriteria));
                } else {
                    _.remove(prepSitesColumn.filterOptions.criteria, (c) => {
                        return !settings.prepSiteSettings.some(s => s.prepSiteAbbr === c.value);
                    });
                    if (prepSitesColumn.filterOptions.criteria.length === settings.prepSiteSettings.length) {
                        prepSitesColumn.filterOptions.allChecked = true;
                        prepSitesColumn.filterOptions.criteria.forEach(c => c.state = true);
                    }
                }
            } else {
                prepSitesColumn.filterOptions.criteria = [];
            }
        } else {
            prepSitesColumn.filterOptions.hasWidgetSettings = false;
        }
    }

    private synchFacilitiesOnSession(facilitiesColumn: ColumnOption
        , settings: IvPrepModels.IvPrepGeneralSettings): void {

        if (settings.unitsSettings !== null) {
            facilitiesColumn.filterOptions.hasWidgetSettings = true;
            if (settings.unitsSettings.length > 0) {
                if (facilitiesColumn.filterOptions.allChecked) {
                    facilitiesColumn
                        .filterOptions
                        .criteria = settings
                            .unitsSettings
                            .map(s => ({
                                state: true,
                                value: s.facilityName
                            } as FilterCriteria));
                } else {
                    _.remove(facilitiesColumn.filterOptions.criteria, (c) => {
                        return !settings.unitsSettings.some(s => s.facilityName === c.value);
                    });
                    if (facilitiesColumn.filterOptions.criteria.length === settings.unitsSettings.length) {
                        facilitiesColumn.filterOptions.allChecked = true;
                        facilitiesColumn.filterOptions.criteria.forEach(c => c.state = true);
                    }
                }
            } else {
                facilitiesColumn.filterOptions.criteria = [];
            }
        } else {
            facilitiesColumn.filterOptions.hasWidgetSettings = false;
        }
    }

    private synchUnitsOnSession(unitsColumn: ColumnOption
        , settings: IvPrepModels.IvPrepGeneralSettings): void {

        if (settings.unitsSettings !== null) {
            if (settings.unitsSettings.length > 0) {
                unitsColumn.filterOptions.hasWidgetSettings = true;
                if (unitsColumn.filterOptions.allChecked) {
                    unitsColumn
                        .filterOptions
                        .criteria = settings
                            .unitsSettings
                            .map(s => ({
                                state: true,
                                value: s.unitName
                            } as FilterCriteria));
                } else {
                    _.remove(unitsColumn.filterOptions.criteria, (c) => {
                        return !settings.unitsSettings.some(s => s.unitName === c.value);
                    });
                    if (unitsColumn.filterOptions.criteria.length === settings.unitsSettings.length) {
                        unitsColumn.filterOptions.allChecked = true;
                        unitsColumn.filterOptions.criteria.forEach(c => c.state = true);
                    }
                }
            } else {
                unitsColumn.filterOptions.criteria = [];
            }
        } else {
            unitsColumn.filterOptions.hasWidgetSettings = false;
        }
    }

    /**
     *  This funtion exports current iv status grid into selected (csv) file format.
     * In case of any filter applied to the current gird, it would be reflected in the export as well.
     * This event subscribed from toolbar export click event.
     *
     * @param event
     * @returns {void}
     */
    onExportButtonClicked(event: any[]) {
        const options = {};
        let tempTable = _.cloneDeep(this.ivPrepTableComponent.ivPrepTable);

        // Let us fix the columns which similar to displayed ones
        const statusColumnIndex = tempTable.columns.map((col) => {
            return col.field;
        }).indexOf('status');

        if (statusColumnIndex != -1) {
            tempTable.columns[statusColumnIndex].field = 'statusDisplayName';
        }

        const priorityColumnIndex = tempTable.columns.map((col) => {
            return col.field;
        }).indexOf('priority');

        if (priorityColumnIndex != -1) {
            tempTable.columns[priorityColumnIndex].field = 'doseViewStatus';
        }

        tempTable.exportFilename = this.resources.ivPrepExportFileName;
        tempTable.exportCSV(options);
    }

    onPatientsAlertClick(alerts: MedMinedModels.MedMinedAlertHeader[]) {

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

    private showUnMappedStatesToast() {
        if (!this.newStatesNotificationDismissed) {
            this.messageService.clear();
            this.messageService.add(
                {
                    key: 'custom'
                    , detail: this.resources.unMappedStatesNotificationText
                    , sticky: true
                });
            this.newStatesNotificationDismissed = true;
        }
    }

    private getLazyLoadMetaData() {
        const pagination = this.getPaginationInfo();

        const metadata = this.ivPrepTableComponent.ivPrepTable.createLazyLoadMetadata();
        metadata.first = pagination.first;
        metadata.rows = pagination.rows;

        return metadata;
    }

    private cleanGlobalSearchCriteria() {
        this.globalSearchCriteria = '';
        this.configurationService.setGlobalSearchCriteria(this.globalSearchCriteria, this.deliveryMode);
    }

    private getDosesRequest(params: any, apiConfigResponse: IvPrepModels.ApiConfig, facilitiesResponse: IvPrepModels.FacilitiesResponse,
        unitsResponse: IvPrepModels.UnitsResponse, prepSitesResponse: IvPrepModels.PrepSitesResponse) {
        const queryParams: ApiCallParam[] = [];
        const sortOrder = params.sortOrder > 0 ? 'asc' : 'desc';
        const sortByFieldName = this.getSortByFieldName(params.sortField);

        queryParams.push(<ApiCallParam>{ name: 'start', value: params.first });
        queryParams.push(<ApiCallParam>{ name: 'limit', value: params.rows });
        queryParams.push(<ApiCallParam>{ name: 'sortBy', value: sortByFieldName });
        queryParams.push(<ApiCallParam>{ name: 'sortOrder', value: sortOrder });

        if (this.globalSearchCriteria) {
            const fromDateTime = this.getDefaultStartDateTime(apiConfigResponse);
            const toDateTime = this.getDefaultEndDateTime(apiConfigResponse);
            const facilityIds = _.uniq(this.authorizedNativeFacilities);

            queryParams.push(<ApiCallParam>{ name: 'patientName', value: this.globalSearchCriteria });
            queryParams.push(<ApiCallParam>{ name: 'patientNumber', value: this.globalSearchCriteria });
            queryParams.push(<ApiCallParam>{ name: 'orderNumber', value: this.globalSearchCriteria });

            queryParams.push(<ApiCallParam>{ name: 'fromDateTime', value: fromDateTime });
            queryParams.push(<ApiCallParam>{ name: 'toDateTime', value: toDateTime });

            if (facilityIds.length) {
                queryParams.push(<ApiCallParam>{ name: 'facilityIds', value: facilityIds.join(',') });
            }
        } else {
            // Facilities
            const facilityIds = this.getDosesRequestFacilities(this.authorizationConfig);
            if (facilityIds && facilityIds.length) {
                queryParams.push(<ApiCallParam>{ name: 'facilityIds', value: facilityIds.join(',') });
            }

            // Units
            const unitsFilter = this.getDosesRequestUnits(facilityIds, facilitiesResponse, unitsResponse);
            if (unitsFilter && unitsFilter.length) {
                queryParams.push(<ApiCallParam>{ name: 'unitIds', value: unitsFilter.join(',') });
            }

            // PrepSites
            const prepSitesFilter = this.getDosesRequestPrepSites(prepSitesResponse);
            if (prepSitesFilter && prepSitesFilter.length) {
                queryParams.push(<ApiCallParam>{ name: 'prepSiteIds', value: prepSitesFilter.join(',') });
            }

            // Statuses
            const statusesFilter = this.getDosesRequestStatuses();
            if (statusesFilter && statusesFilter.length) {
                queryParams.push(<ApiCallParam>{ name: 'stateIds', value: statusesFilter.join(',') });
            }

            // Time range
            if (this.hourFrameFilter) {
                const fromDateTime = this.getDoseRequestStartTime(apiConfigResponse);
                const toDateTime = this.getDoseRequestEndTime(apiConfigResponse);
                queryParams.push(<ApiCallParam>{ name: 'fromDateTime', value: fromDateTime });
                queryParams.push(<ApiCallParam>{ name: 'toDateTime', value: toDateTime });
            }

            // Priority
            const priorityFilter = this.getPriorityFilter();
            queryParams.push(<ApiCallParam>{ name: 'urgent', value: priorityFilter });

            // Container Types
            const containerTypeFilter = this.getContainerTypesFilter();
            queryParams.push(<ApiCallParam>{ name: 'finalContainerType', value: containerTypeFilter });
        }

        return <ApiCall>{
            appCode: this.appCode,
            widgetId: this.widgetId,
            api: 'ivprepdoses',
            queryParams: queryParams
        };
    }

    private getApiConfigRequest() {
        return <ApiCall>{
            appCode: this.appCode,
            widgetId: this.widgetId,
            api: 'ivprepconfiguration'
        };
    }

    private getDoseStatesRequestParams(): ApiCall {
        return <ApiCall>{
            widgetId: this.widgetId,
            appCode: this.appCode,
            api: 'ivprepdosestates'
        };
    }

    private getSortByFieldName(field: string) {
        const configuration = this.configurationService.getConfiguration(this.deliveryMode);
        if (configuration && configuration.columns.length && field) {
            const columnOption = configuration.columns.find(item => item.field === field);
            if (columnOption && columnOption.sortFieldName) {
                return columnOption.sortFieldName;
            }
        }
        return field;
    }

    private getDosesRequestFacilities(authorizationConfig: any): string[] {
        if (this.authorizedNativeFacilities && this.authorizedNativeFacilities.length) {
            const fieldName = 'masterFacility';
            const config = this.configurationService.getConfiguration(this.deliveryMode);
            const columnFilterOptions = this.configurationService.getColumnFilterOptions(config, fieldName);
            const allChecked = columnFilterOptions &&
                columnFilterOptions.allChecked &&
                !columnFilterOptions.hasWidgetSettings;

            if (allChecked) { return _.uniq(this.authorizedNativeFacilities); }

            const values = this.getMultiValueFilterData(fieldName);
            if (values === undefined) { return undefined; }

            // Master -> Facility Id
            const idValues = values
                .map(value => this.transformationService.mapNativeFacilityFromMaster(value, authorizationConfig));

            // Intersect with authorized facilities
            const facilities = _.intersection(idValues, this.authorizedNativeFacilities);

            return _.uniq(facilities);
        }

        return undefined;
    }

    private getPriorityFilter(): string {
        const values = this.getMultiValueFilterCriteria('priorityDisplayName');
        if (values === undefined) { return undefined; }

        const priorityOptions = this.getPrioritiesOptions();
        const [priority] = values;

        if (priority === '') {
            return priority;
        }

        const selectedPriority = priorityOptions.Priorities.find(p => p.Id === priority);
        if (selectedPriority) { return selectedPriority.Value.toString(); }

        return undefined;
    }

    private getContainerTypesFilter(): string {
        const values = this.getMultiValueFilterCriteria('finalContainerType');
        if (values === undefined) { return undefined; }

        const containerOptions = this.getContainerTypes();
        const [containerType] = values;

        if (containerType === '') {
            return containerType;
        }

        const selectedContainer = containerOptions.ContainerTypes.find(c => c.Id === containerType);
        return selectedContainer ? selectedContainer.Value : undefined;
    }

    private getMultiValueFilterCriteria(fieldName: string) {
        const config = this.configurationService.getConfiguration(this.deliveryMode);
        const columnFilterOptions = this.configurationService.getColumnFilterOptions(config, fieldName);
        const allChecked = columnFilterOptions && columnFilterOptions.allChecked;

        if (allChecked) { return ['']; }

        return this.getMultiValueFilterData(fieldName);
    }

    private getDosesRequestUnits(facilityFilterIds: string[], facilitiesResponse: IvPrepModels.FacilitiesResponse,
        unitsResponse: IvPrepModels.UnitsResponse): string[] {
        const fieldName = 'unit';

        const facilities = this.catoFiltersService.filterFacilitiesResponse(facilitiesResponse, facilityFilterIds || []);
        const effectiveUnitIds = _.uniq(
            this.catoFiltersService.filterUnitsResponse(facilities, unitsResponse).Units.map(unit => unit.Id)
        );

        const config = this.configurationService.getConfiguration(this.deliveryMode);
        const columnFilterOptions = this.configurationService.getColumnFilterOptions(config, fieldName);
        const allChecked = columnFilterOptions &&
            columnFilterOptions.allChecked &&
            !columnFilterOptions.hasWidgetSettings;

        if (allChecked) {
            return effectiveUnitIds;
        }

        const criteria = this.configurationService.getColumnCriteria(config, fieldName);
        if (criteria === undefined) { return undefined; }
        if (criteria.length === 0) { return []; }

        const unitDesignations = criteria.filter(c => c.state).map(c => c.value);
        const unitIds = _.uniq(
            _.flatMap(
                unitDesignations.map(value => this.transformationService.mapUnitDesignationToUnitId(unitsResponse, value))
            ));

        return _.intersection(effectiveUnitIds, unitIds);
    }

    private getDosesRequestPrepSites(prepSitesResponse: IvPrepModels.PrepSitesResponse): string[] {
        const fieldName = 'prepSite';
        const config = this.configurationService.getConfiguration(this.deliveryMode);
        const columnFilterOptions = this.configurationService.getColumnFilterOptions(config, fieldName);
        const allChecked = columnFilterOptions &&
            columnFilterOptions.allChecked &&
            !columnFilterOptions.hasWidgetSettings;
        if (allChecked) {
            return _.uniq(prepSitesResponse.Prepsites.map(prepSite => prepSite.Id));
        }

        const criteria = this.configurationService.getColumnCriteria(config, fieldName);
        if (criteria === undefined) { return undefined; }
        if (criteria.length === 0) { return []; }

        const prepSiteAbbreviations = criteria.filter(c => c.state).map(c => c.value);
        const ids = _.uniq(
            _.flatMap(
                prepSiteAbbreviations.map(value => this.transformationService.mapPrepSiteAbbreviationToId(prepSitesResponse, value))
            ));
        return ids;
    }

    private getDosesRequestStatuses(): string[] {
        if (this.nativeStatusFilter && this.nativeStatusFilter.length) {
            return this.nativeStatusFilter;
        }
        if (this.selectedStatus === 'ALL') {
            this.nativeStatusFilter = this.getAllNativeStatuses();
            return this.nativeStatusFilter;
        }
        return [];
    }

    private getMultiValueFilterData(fieldName: string): any[] {
        const config = this.configurationService.getConfiguration(this.deliveryMode);
        const columnFilterOptions = this.configurationService.getColumnFilterOptions(config, fieldName);
        const criteria = this.configurationService.getColumnCriteria(config, fieldName);
        const allChecked = columnFilterOptions && columnFilterOptions.allChecked;

        if (criteria === undefined) { return undefined; }
        if (criteria.length === 0) {
            return allChecked ? [] : undefined;
        }

        return criteria
            .filter(c => c.state)
            .map(c => c.value);
    }

    private getDoseRequestStartTime(apiConfigResponse: IvPrepModels.ApiConfig): string {
        const offset = apiConfigResponse.TimeZoneOffset;

        if (this.hourFrameFilter < 0) {
            const hours = Math.abs(this.hourFrameFilter) || 12;
            const startLocal = moment(new Date()).subtract(moment.duration(hours, 'hours'));
            const startServer = this.timeTransformService.toServerTime(startLocal, offset);
            return startServer.format(this.ivPrepQueryParamsFormat);
        }
        const endServer =
            this.timeTransformService.toServerTime(new Date(), apiConfigResponse.TimeZoneOffset);
        return endServer.format(this.ivPrepQueryParamsFormat);
    }

    private getDoseRequestEndTime(apiConfigResponse: IvPrepModels.ApiConfig): string {
        const offset = apiConfigResponse.TimeZoneOffset;

        if (this.hourFrameFilter > 0) {
            const hours = Math.abs(this.hourFrameFilter) || 12;
            const startLocal = moment(new Date()).add(moment.duration(hours, 'hours'));
            const startServer = this.timeTransformService.toServerTime(startLocal, offset);
            return startServer.format(this.ivPrepQueryParamsFormat);
        }
        const endServer =
            this.timeTransformService.toServerTime(new Date(), apiConfigResponse.TimeZoneOffset);
        return endServer.format(this.ivPrepQueryParamsFormat);
    }

    private getDefaultEndDateTime(apiConfigResponse: IvPrepModels.ApiConfig) {
        const endLocal = moment(new Date()).add(moment.duration(8, 'hours'));
        const endServer = this.timeTransformService.toServerTime(endLocal, apiConfigResponse.TimeZoneOffset);
        return endServer.format(this.ivPrepQueryParamsFormat);
    }

    private getDefaultStartDateTime(apiConfigResponse: IvPrepModels.ApiConfig) {
        const startLocal = moment(new Date()).subtract(moment.duration(64, 'hours'));
        const startServer = this.timeTransformService.toServerTime(startLocal, apiConfigResponse.TimeZoneOffset);
        return startServer.format(this.ivPrepQueryParamsFormat);
    }

    private getDoseUrgencyRequest(doseId, value) {
        return <ApiCall>{
            appCode: this.appCode,
            widgetId: this.widgetId,
            api: 'ivprepseturgency',
            pathParams: [{ name: 'id', value: doseId }],
            rawData: { urgent: value }
        };
    }

    private getBlockDoseRequest(doseId, value) {
        return <ApiCall>{
            appCode: this.appCode,
            widgetId: this.widgetId,
            api: 'ivprepblockdoses',
            pathParams: [{ name: 'id', value: doseId }],
            rawData: { blocked: value }
        };
    }

    // TURN OFF DELIVERYMODE UNTIL INTERGATION COMES ...
    // private getDispensingFacilitiesRequest() {
    //     return {
    //         appCode: this.appCode,
    //         widgetId: this.widgetId,
    //         api: 'dispensingfacilities'
    //     };
    // }

    private getDeliveryTrackingRequest(params: any) {
        let facilityParameter = '';
        if (params.length === 1 && params[0] !== MvdConstants.ALL_FACILITIES_KEY) {
            facilityParameter = params[0];
        }
    }

    private getFacilitiesRequest(): ApiCall {
        return {
            appCode: this.appCode,
            widgetId: this.widgetId,
            api: 'ivprepfacilities',
        };
    }

    private getUnitsRequest(): ApiCall {
        return {
            appCode: this.appCode,
            widgetId: this.widgetId,
            api: 'ivprepunits',
        };
    }

    private getPrepSitesRequest(): ApiCall {
        return {
            appCode: this.appCode,
            widgetId: this.widgetId,
            api: 'ivprepsites',
        };
    }

    private getContainerTypes(): IvPrepModels.ContainerTypesResponse {
        return <IvPrepModels.ContainerTypesResponse>{
            ContainerTypes: [
                <IvPrepModels.ContainerType>{
                    Id: 'Syringe',
                    Value: 'syringe'
                },
                <IvPrepModels.ContainerType>{
                    Id: 'Bag',
                    Value: 'bag'
                }
            ]
        };
    }
    private getPrioritiesOptions(): IvPrepModels.PrioritiesResponse {
        return <IvPrepModels.PrioritiesResponse>{
            Priorities: [
                <IvPrepModels.Priority>{
                    Id: this.resources.stat,
                    Value: true
                },
                <IvPrepModels.Priority>{
                    Id: this.resources.normal,
                    Value: false
                }
            ]
        };
    }

    private getPaginationInfo(): any {
        const config = this.configurationService.getConfiguration(this.deliveryMode);
        const pagination = config && config.options && config.options.pagination;
        return pagination;
    }

    private getResources() {
        return {
            ok: this.resourceService.resource('ok'),
            cannotPlaceOnHold: this.resourceService.resource('cannotPlaceOnHold'),
            cannotPlaceOnHoldErrorMsg: this.resourceService.resource('cannotPlaceOnHoldErrorMsg'),
            cannotRemoveHold: this.resourceService.resource('cannotRemoveHold'),
            cannotRemoveHoldErrorMsg: this.resourceService.resource('cannotRemoveHoldErrorMsg'),
            cannotChangePriority: this.resourceService.resource('cannotChangePriority'),
            priorityChangeErrorMessage: this.resourceService.resource('priorityChangeErrorMessage'),
            searchBoxPlaceHolder: this.resourceService.resource('searchALLDosesForPatientName'),
            normal: this.resourceService.resource('normal'),
            stat: this.resourceService.resource('stat'),
            unMappedStatesNotificationText: this.resourceService.resource('unMappedStatesNotificationText'),
            ivPrepExportFileName: this.resourceService.resource('ivPrepExportFileName')
        };
    }
}

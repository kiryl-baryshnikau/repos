import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { EventBusService, GatewayService, ResourceService } from 'container-framework';
import * as _ from 'lodash';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { DataTable } from 'primeng/primeng';

import { Observable, timer, Subscription, Subject, merge, of, throwError } from 'rxjs';
import { first, switchMap, take, debounce, filter, tap, map, retry, catchError } from 'rxjs/operators';

import { AuthorizationService } from '../../../services/authorization.service';
import { UserConfigurationService } from '../../../services/user-configuration.service';
import { DashboardHeaderService } from '../../services/mvd-dashboard-header.service';
import { DataConfigurationService } from '../../services/mvd-data-configuration.service';
import { DataTransformationService } from '../../services/mvd-data-transformation-service';
import { InfusionDataFiltersService } from '../../services/mvd-infusion-data-filters.service';
import { SortingService } from '../../services/mvd-sorting-service';
import { MvdConstants } from '../../shared/mvd-constants';
import * as models from '../../shared/mvd-models';
import { WidgetToolbarComponent } from '../../shared/widget-toolbar/widget-toolbar.component';
import {
    IVStatusConfigurationComponent,
} from '../configuration/iv-status-configuration/mvd-iv-status-configuration.component';
import { MvdAdtInformationModalComponent } from './adt-information-modal/mvd-adt-information-modal.component';
import { WarningDialogComponent } from './warning-dialog/mvd-warning-dialog.component';
import { IvStatusItem } from '../../shared/mvd-models';
import { MvdMedMinedSecondaryDataService } from '../../services/mvd-medmined-secondary-data.service';
import { MvdMedMinedSecondaryDataMapperService } from '../../services/mvd-medmined-secondary-data-mapper.service';
import { MedMinedModels } from '../../shared/medmined-models';
import { PatientAlertComponent } from '../../shared/patient-alert-modal/patient-alert-modal.component';
import { FacilityLookUpService } from '../../../services/facility-look-up.service';

@Component({
    moduleId: module.id,
    selector: 'mvd-iv-status',
    templateUrl: 'mvd-iv-status.component.html',
    styleUrls: ['./mvd-iv-status.component.scss']
})
export class IVStatusComponent implements OnDestroy, OnInit {

    public static ComponentName = 'medViewIVStatus';

    @Input() appCode: string;
    @Input() widgetId: string;
    @Input() user: string;

    @ViewChild('widgetToolbar') widgetToolbar: WidgetToolbarComponent;
    @ViewChild('dt') dataTable: DataTable;

    globalSearchCriteria = '';
    modalRef: BsModalRef;
    modalConfig = {
        animated: true,
        keyboard: true,
        backdrop: false,
        ignoreBackdropClick: false,
        class: 'adt-information-modal-class'
    };

    private patientAlertModalOptions: ModalOptions = {
        class: 'modal-md-alerts',
        keyboard: false,
        ignoreBackdropClick: true,
        animated: true,
        focus: true,
    };

    config = {
        animated: true,
        keyboard: true,
        backdrop: true,
        ignoreBackdropClick: false,
        class: 'gray modal-lg'
    };

    private toggleSubscription: Subscription;
    private toggleColumn$: Subject<any> = new Subject<any>();

    private warningModalOptions: ModalOptions = {
        class: 'modal-md',
        keyboard: false,
        ignoreBackdropClick: true,
        animated: true,
        focus: true,
    };


    private highPriorityColumn = 'highPriority';
    private eventBusStateChanged: Subscription;
    private autoRefresh: string;
    private manualRefresh: string;
    private filters: any;
    private endResizing: string;
    private filtersUserPreferences;

    ivStatusData: Array<IvStatusItem>;
    templateData: IvStatusItem[];
    tableColumnOptions: any[];
    columns: any[] = [];
    errorMessage: string;
    resources: any;
    disableFilter: boolean;
    isAutomaticOnPageEvent = false;
    maskData = false;
    isPatientNameColumnVisible = true;
    infusionConfiguration: any;
    isAllowUnknownsFilterVisible = false;
    unknownFilterChecked = false;
    unknownFilterCheckedConfirmed = false;
    isMedminedEnabled = false;
    summaryCounters: any;

    private widgetKey = 'IVStatus';

    constructor(
        private dataService: GatewayService,
        private dataTransformer: DataTransformationService,
        private eventBus: EventBusService,
        private resourcesService: ResourceService,
        private configurationService: DataConfigurationService,
        private sortingService: SortingService,
        private infusionDataFiltersService: InfusionDataFiltersService,
        private authorizationService: AuthorizationService,
        private headerService: DashboardHeaderService,
        private modalService: BsModalService,
        private userConfigurationService: UserConfigurationService,
        private secondaryDataService: MvdMedMinedSecondaryDataService,
        private secondaryDataMapperService: MvdMedMinedSecondaryDataMapperService,
        private facilitLookUpService: FacilityLookUpService
    ) {
    }

    ngOnInit() {
        console.log(`IVStatusComponent: appCode  = ${this.appCode} widgetId = ${this.widgetId} user = ${this.user}`);

        this.setInitialConfiguration();

        this.autoRefresh = this.eventBus.subcribeRequestAutoRefresh(this.appCode, this.widgetId);
        this.manualRefresh = this.eventBus.subcribeRequestManualRefresh(this.appCode, this.widgetId);
        this.endResizing = this.eventBus.subscribePortletEndResize(this.appCode, this.widgetId);

        this.eventBusStateChanged = this.widgetData$()
            .subscribe((state: any) => {
                console.log('loaded');
            },
                (error) => this.emitDataLoadFail(error));

        this.checkDimensions(false);
    }

    private widgetData$() {

        const dimensionsChanged$ = this.eventBus.eventBusState$.pipe(
            filter((state) => state.target === this.endResizing),
            tap(() => this.checkDimensions())
        );

        const userPreferences$ = this.eventBus.eventBusState$.pipe(
            filter((state) => state.target === this.autoRefresh || state.target === this.manualRefresh),
            switchMap(() => this.infusionDataFiltersService.getFilters(this.user).pipe(
                catchError(error => {
                    this.emitDataLoadFail(error);
                    return throwError(error);
                })
            )),
            retry(),
            switchMap((userPreferencesResponse) => this.initializeUserPreferences$(userPreferencesResponse).pipe(
                catchError(error => {
                    this.emitDataLoadFail(error);
                    return throwError(error);
                })
            )),
            retry()
        );

        const loadData$ = userPreferences$.pipe(
            tap((apiParams) => {
                if (!apiParams || !apiParams.facilities || !apiParams.facilities.length) {
                    this.eventBus.emitNoDataAvailable(this.appCode, this.widgetId);
                }
            }),
            filter((apiParams: any) => apiParams && apiParams.facilities && apiParams.facilities.length),
            switchMap((apiParams) => this.dataService.loadData([this.createRequest(apiParams)])
                .pipe(
                    map((guardrailsResponse) => ({ guardrailsResponse, apiParams })),
                    catchError(error => {
                        this.emitDataLoadFail(error);
                        return throwError(error);
                    })
                )
            ),
            retry(),
            switchMap(({ guardrailsResponse, apiParams }) => this.authorizationService.authorize()
                .pipe(
                    map((authResponse) => ({ authResponse, guardrailsResponse, apiParams })))
            ),
            tap(({ authResponse, guardrailsResponse, apiParams }) => this.setWidgetData(guardrailsResponse, authResponse, apiParams))
        );

        return merge(
            dimensionsChanged$,
            loadData$
        );
    }

    private initializeUserPreferences$(userPreferencesResponse:
        { api: any;
            userPreferences: any;
            authorizationConfig: any;
            globalSettings: any; }): Observable<any> {
        const preferences = userPreferencesResponse.api;

        this.maskData = userPreferencesResponse && userPreferencesResponse.userPreferences ?
            userPreferencesResponse.userPreferences.maskData : false;
        this.filters.api.facilities = preferences.facilities;
        this.filters.api.units = preferences.units;
        this.filters.api.allowUnknown = this.getAllowUnknownConfig();
        this.unknownFilterChecked = this.filters.api.allowUnknown;
        this.filtersUserPreferences = userPreferencesResponse.userPreferences;
        this.verifyDateRangeFiltersConsistency();

        this.setUnitFilterSelection(this.filtersUserPreferences, this.maskData);
        this.toggleColumns(this.filtersUserPreferences);
        this.infusionConfiguration = userPreferencesResponse.globalSettings;

        this.headerService
            .updateHeader(this.appCode,
                {
                    userPreferences: userPreferencesResponse.userPreferences,
                    authorizationConfig: userPreferencesResponse.authorizationConfig
                });
        this.isAllowUnknownsFilterVisible = this.hasRole(MvdConstants.PHARMACIST_ROLE_ID,
            userPreferencesResponse.authorizationConfig,
            preferences.facilities);

        this.isMedminedEnabled = this.facilitLookUpService
            .hasProvider(
                userPreferencesResponse.authorizationConfig
                , MvdConstants.MEDMINED_PROVIDER_NAME);
        if (!this.isAllowUnknownsFilterVisible) {
            this.configurationService.setUnknownFilterConfig(false);
        }
        return of(this.filters.api);
    }

    ngOnDestroy() {
        this.eventBusStateChanged.unsubscribe();
        this.toggleSubscription.unsubscribe();
        if (this.isMedminedEnabled) { this.secondaryDataService.clearCache(this.widgetKey); }
    }

    setUnitFilterSelection(userPreferences: any, maskData: boolean) {
        const sessionPreferences = this.configurationService.getUserConfiguration();
        if (sessionPreferences
            && userPreferences
            && userPreferences.generalSettings) {

            const settings = userPreferences
                .generalSettings.find(item => item.id === MvdConstants.IVSTATUS_WIDGET_KEY);

            if (settings && settings.configuration) {
                this.isPatientNameColumnVisible = settings.configuration.showPatientNames;
            }

            const disableUnitFilter = !this.maskData && this.isPatientNameColumnVisible;
            const columnOptions = sessionPreferences.userSettings.columns;
            const unitFilterConfig = columnOptions.find(config => config.field === 'unit');

            if (unitFilterConfig && sessionPreferences.userSettings.isInitialConfiguration) {
                unitFilterConfig.filterOptions.allChecked = !disableUnitFilter;
                unitFilterConfig.filterOptions.criteria.forEach((config) => config.state = !disableUnitFilter);
                const configuration = this.configurationService.setIsInitialConfigurationSetting(false);
                this.configurationService.setFilterColumnConfiguration([unitFilterConfig], configuration);
            }
        }
    }

    private setWidgetData(responses: any[], authResponse: any, params: any) {

        let response = responses[0]; // only one result is expected
        this.dataTransformer.authorizationConfiguration = [...authResponse];

        const widgets = this.filtersUserPreferences.generalSettings || [];
        const ivStatussWidget = widgets.find((widget) => widget.id === MvdConstants.IVSTATUS_WIDGET_KEY);

        const formatForUnknownPatients = params.allowUnknown && this.isAllowUnknownsFilterVisible;
        response = this.infusionDataFiltersService.applyInfusionsFilters(response, ivStatussWidget, this.infusionConfiguration);
        response = this.infusionDataFiltersService.applyFacilityFilters(response, this.filtersUserPreferences, formatForUnknownPatients);

        this.ivStatusData = response
            .map((item: any) => this.dataTransformer
                .transformIVStatusData(item, this.maskData, formatForUnknownPatients));

        if (this.isMedminedEnabled) {
            this.secondaryDataService.clearCache(this.widgetKey);
            this.getMedminedAlerts(this.ivStatusData);
        }

        this.applyHighPriorityColumns();
        this.setOptions(this.ivStatusData);
        this.checkDimensions();
        if (response && response.length > 0) {
            this.eventBus.emitLoadDataSuccess(this.appCode, this.widgetId);
        } else {
            this.eventBus.emitNoDataAvailable(this.appCode, this.widgetId);
        }
    }

    private getTimeUntilEmptyStatus(estimatedTimeTillEmpty: any, infusionConfiguration: any, counters: any) {
        if (isNaN(estimatedTimeTillEmpty)) {
            return counters;
        }

        // Convert ms to min
        let value = Math.floor(estimatedTimeTillEmpty / 60000);
        return {
            priority: counters.priority + (value <= infusionConfiguration.priorityThreshold ? 1 : 0),
            warning: counters.warning + ((value > infusionConfiguration.priorityThreshold && value <= infusionConfiguration.warningThreshold) ? 1 : 0)
        };
    }

    private updateCounters() {
        let counters = {
            priority: 0,
            warning: 0
        };
        this.templateData.forEach(ivData => {
            counters = this.getTimeUntilEmptyStatus(ivData.estimatedTimeTillEmptyCounter, this.infusionConfiguration, counters);
        });

        return counters;
    }

    private getPaginatorConfigForMedMined(): { first: number, rows: number } {
        let paginatorConfig = { first: 0, rows: this.dataTable.rows };
        const userConfiguration = this.configurationService.getUserConfiguration();
        if (_.get(userConfiguration, 'userSettings.options.pagination')) {
            paginatorConfig = this.getPaginatorConfiguration(userConfiguration.userSettings.options.pagination);
        }

        return paginatorConfig;
    }

    private getMedMinedAlertsRequestData(data: IvStatusItem[]): MedMinedModels.MedMinedAlertsRequestData<IvStatusItem> {
        const paginatorConfig = this.getPaginatorConfigForMedMined();
        const startPage = Math.floor(paginatorConfig.first / paginatorConfig.rows);

        const requestData = {
            widgetKey: this.widgetKey,
            dataset: data,
            recordsPerPage: paginatorConfig.rows,
            startPage: startPage
        } as MedMinedModels.MedMinedAlertsRequestData<IvStatusItem>;

        return requestData;
    }

    private getMedminedAlerts(data: IvStatusItem[]) {
        setTimeout(() => {
            const requestData = this.getMedMinedAlertsRequestData(data);
            this.secondaryDataService.getAlerts(requestData, this.secondaryDataMapperService.mapIvStatus)
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

    createRequest(params: any) {
        return {
            appCode: this.appCode,
            widgetId: this.widgetId,
            api: 'containerandguardrailwarnings',
            rawData: params
        };
    }

    sortData(event: any) {
        console.log(event);
        const preferences = this.configurationService.getUserConfiguration();
        if (event && preferences) {
            const configuration = preferences
                .userSettings
                .columns
                .find(col => col.field === event.field);
            const field = configuration.sortOptions.sortingField || event.field;
            console.log('Sorting field .....> ', field);
            const sortingMethod = configuration ? configuration.sortOptions.method : 'localeSensitive';

            const indexName = 'infusionContainerKey';
            this.isAutomaticOnPageEvent = true;
            this.sortingService.sortDataWithIndexForIvStatus(field, event.order, sortingMethod, event.data, indexName);
        }

        this.checkDimensions();
        this.isAutomaticOnPageEvent = true;
    }

    toggleColumn(event: any) {
        if (event.selectedColumn.length > 0 && event.columnOptions) {
            const currentConfiguration = this.configurationService.getUserConfiguration();
            const columnsOptions = currentConfiguration.userSettings.columns;
            this.applyColumnConfiguration(event.selectedColumn[0], columnsOptions);
        }
    }

    setDateRangeFilter(event: any) {
        if (event.isValid) {
            console.log(`IVStatusComponent: Requesting data from ${event.startDate} to ${event.stopDate}`);
            this.filters.api.startDate = event.startDate;
            this.filters.api.stopDate = event.stopDate;
            this.filters.dateOptionSelected = event.dateOptionSelected || this.filters.dateOptionSelected;
            this.filters.selectedCurrentDate = event.selectedCurrentDate || this.filters.selectedCurrentDate;
            this.filters.globalSearchCriteria = event.globalSearchCriteria;
            this.configurationService.setFiltersConfiguration(this.filters);
            this.eventBus.emitRequestManualRefresh(this.appCode, this.widgetId);
        } else {
            console.log(`IVStatusComponent: Data Load Failed: ${event.error}`);
            this.eventBus.emitLoadDataFail(this.appCode, this.widgetId);
        }
    }

    getAllowUnknownConfig() {
        const userConfig = this.configurationService.getUserConfiguration();
        if (!userConfig) {
            return false;
        }
        return userConfig.userSettings.filters.api.allowUnknown;
    }

    private applyColumnConfiguration(selectedColumn: models.ColumnOption, columnConfig: models.ColumnOption[]): any {

        if (!selectedColumn.hideOptions.enabled) {
            return;
        }

        const currentColumnItem = columnConfig.find(c => c.field === selectedColumn.field);
        if (!currentColumnItem) {
            console.error('IVStatusComponent > applyColumnConfiguration: Column not found in configuration');
        }

        currentColumnItem.hideOptions.visible = selectedColumn.hideOptions.visible;

        this.columns = this.initializeVisibleColumns(columnConfig);
        this.configurationService.setHideConfiguration(columnConfig);
        this.toggleColumn$.next(columnConfig);
        this.checkDimensions(false);
    }

    private initializeVisibleColumns(initialConfiguration: any[]): any[] {
        return initialConfiguration
            .filter((col) => col.hideOptions.visible)
            .map((col) => col);
    }

    setInitialConfiguration() {

        this.headerService.cleanHeader(this.appCode);
        this.toggleSubscription = this.onToogleColumnSubs();
        this.resources = this.getResources();

        // set localstorage user
        this.configurationService.setCurrentUser(this.user);
        this.configurationService.verifyFirstTimeLoad();
        const userConfig = this.configurationService.getUserConfiguration();
        this.filters = userConfig.userSettings.filters;
        if (!this.filters.api.startDate || !this.filters.api.stopDate) {
            const initialDate = new Date();
            initialDate.setHours(initialDate.getHours() - 24);
            this.filters.api.startDate = initialDate;
            this.filters.api.stopDate = new Date();
        }
        setTimeout(() => this.widgetToolbar.dateRangeFilter.initializeFilters(this.filters, false), 0);
        this.globalSearchCriteria = this.filters.globalSearchCriteria.criteria;
        if (this.globalSearchCriteria) {
            this.disableFilter = true;
        }
        this.tableColumnOptions = this.configurationService.getShowHideOptions();
        this.columns = this.initializeVisibleColumns(userConfig.userSettings.columns);
        if (!this.filters.api.allowUnknown) {
            this.filters.api.allowUnknown = false;
            this.unknownFilterChecked = false;
        }
        this.columns = this.initializeVisibleColumns(userConfig.userSettings.columns);
    }

    setOptions(data: IvStatusItem[]) {
        const configuration = this.configurationService.getUserConfiguration();
        this.tableColumnOptions = this.configurationService.getShowHideOptions();
        this.columns = this.initializeVisibleColumns(configuration.userSettings.columns);
        if (!configuration.userSettings.options.pagination) {
            const defaultConfig = this.getPaginatorConfiguration({});
            this.configurationService.setWidgetOptions({ pagination: defaultConfig });
        }
        if (!configuration.userSettings.options.sorting) {
            const defaultSortField = configuration.userSettings.columns
                .filter((column: any) => column.sortOptions.hasOwnProperty('default') && column.sortOptions.default);
            configuration.userSettings.options.sorting = {
                field: defaultSortField[0].field,
                order: 1
            };
        }
        this.configurationService.setWidgetOptions({ sorting: configuration.userSettings.options.sorting });
        const columnConfig = configuration
            .userSettings
            .columns.find((column: any) => column.field === configuration.userSettings.options.sorting.field);
        const sortingMethod = columnConfig ? columnConfig.sortOptions.method : 'alphabetical';

        this.templateData = [...this.sortingService
            .sortDataByField(configuration.userSettings.options.sorting.field
                , configuration.userSettings.options.sorting.order, sortingMethod, data)];
        if (configuration.userSettings.filters.globalSearchCriteria) {
            this.templateData = [...this.filterByText(configuration.userSettings.filters.globalSearchCriteria)];
        }

        this.summaryCounters = this.updateCounters();

        const columnsConfig = configuration.userSettings.columns as models.ColumnOption[];
        this.widgetToolbar.multiValueFilter.initializeFilters(data, columnsConfig);
        this.isAutomaticOnPageEvent = true;
        setTimeout(() => {
            const userConfiguration = this.configurationService.getUserConfiguration();
            this.updateSortOptions({
                field: userConfiguration.userSettings.options.sorting.field,
                order: userConfiguration.userSettings.options.sorting.order
            });
            this.setPageFromConfiguration(userConfiguration.userSettings.options.pagination);
            if (this.isMedminedEnabled) { this.getMedminedAlerts(this.templateData); }
        }, 0);
    }

    applyFilters(event: any[]) {
        this.applyMultiValueFilter(event);
        setTimeout(() => {
            const userConfiguration = this.configurationService.getUserConfiguration();
            this.setPageFromConfiguration(userConfiguration.userSettings.options.pagination);
        }, 0);

    }

    onUnknownFilterChange(event) {
        if (event) {
            setTimeout(() => this.unknownFilterChecked = false, 0);
            this.openModal()
                .subscribe(reason => {
                    this.unknownFilterChecked = reason;
                    this.unknownFilterCheckedConfirmed = reason;
                    this.configurationService.setUnknownFilterConfig(this.unknownFilterChecked);
                    if (reason) {
                        this.eventBus.emitRequestManualRefresh(this.appCode, this.widgetId);
                    }
                });
        } else {
            this.unknownFilterChecked = false;
            this.unknownFilterCheckedConfirmed = false;
            this.configurationService.setUnknownFilterConfig(this.unknownFilterChecked);
            this.eventBus.emitRequestManualRefresh(this.appCode, this.widgetId);
        }
    }

    onMultiValueFiltersInit(event: any[]) {
        this.applyMultiValueFilter(event);
    }

    applyMultiValueFilter(event: any[]) {
        const configuration = this.configurationService.getUserConfiguration();
        if (!configuration.userSettings.filters.globalSearchCriteria) {
            let filtered: any[] = this.ivStatusData;
            for (let i = 0; i < event.length; i++) {

                const criteria = event[i].filterOptions.criteria
                    .filter((criteria: any) => !criteria.state)
                    .map((criteria: any) => criteria.value);

                if (criteria.length > 0) {
                    filtered = filtered
                        .filter((data: any) => {
                            const value = event[i].field !== 'guardrailStatus'
                                ? data[event[i].field]
                                : data[event[i].field].countGRViolations;
                            return criteria.indexOf(value) < 0 || data.highPriority;
                        });
                }
                this.templateData = [...filtered];
            }
            this.summaryCounters = this.updateCounters();
        }
        this.configurationService.setFilterColumnConfiguration(event, this.configurationService.getUserConfiguration().userSettings);
        if (this.isMedminedEnabled) { this.getMedminedAlerts(this.templateData); }
    }

    applyHighPriorityColumns() {
        const userConfig = this.configurationService.getUserConfiguration();

        if (userConfig && userConfig.highPriorityItems.length > 0) {
            userConfig.highPriorityItems.forEach((containerId: number) => {
                const value = this.ivStatusData.find((container: any) => container.infusionContainerKey === containerId);
                if (value) {
                    value.highPriority = true;
                }
            });
        }
    }

    resetFilters(event: any[]) {
        this.configurationService.setFilterColumnConfiguration(event, this.configurationService.getUserConfiguration().userSettings);
        this.templateData = [...this.ivStatusData];
        this.applyMultiValueFilter(event);
        const configuration = this.configurationService.getUserConfiguration();
        const columnConfig = configuration
            .userSettings
            .columns.find((column: any) => column.field === configuration.userSettings.options.sorting.field);
        const sortingMethod = columnConfig ? columnConfig.sortOptions.method : 'alphabetical';
        this.templateData = [...this.sortingService
            .sortDataByField(configuration.userSettings.options.sorting.field
                , configuration.userSettings.options.sorting.order, sortingMethod, this.templateData)];
        if (this.isMedminedEnabled) { this.getMedminedAlerts(this.templateData); }
        if (this.isAllowUnknownsFilterVisible) {
            this.unknownFilterChecked = false;
            this.configurationService.setUnknownFilterConfig(false);
            this.eventBus.emitRequestManualRefresh(this.appCode, this.widgetId);
        }
    }

    getResources() {
        return {
            searchByPatientNameOrId: this.resourcesService.resource('searchByPatientNameOrId'),
            filterRowsTooltip_line1: this.resourcesService.resource('filterRowsTooltip_line1'),
            filterRowsTooltip_line2: this.resourcesService.resource('filterRowsTooltip_line2'),
            filterRowsTooltip_line3: this.resourcesService.resource('filterRowsTooltip_line3'),
            noRecordsFound: this.resourcesService.resource('noRecordsFound'),
            includePatientsWithNoPatientId: this.resourcesService.resource('includePatientsWithNoPatientId'),
            unknownPatientsTooltipMessage: this.resourcesService.resource('unknownPatientsTooltipMessage'),
            ivstatusExportFileName: this.resourcesService.resource('ivstatusExportFileName')
        };
    }

    onPage(event: any) {
        if (!this.isAutomaticOnPageEvent) {
            this.configurationService.setWidgetOptions({ pagination: event });
        }
        this.isAutomaticOnPageEvent = false;
        this.checkDimensions();
    }

    onSort(event: any) {
        this.configurationService.setWidgetOptions({ sorting: event });
        const userConfiguration = this.configurationService.getUserConfiguration();
        if (userConfiguration.userSettings.options.pagination) {
            this.setPageFromConfiguration(userConfiguration.userSettings.options.pagination);
        }
        this.checkDimensions();
    }

    updateSortOptions(event: any) {
        if (event) {
            this.dataTable.sortField = event.field;
            this.dataTable.sortOrder = event.order;
        }
    }

    onChangeHighPriority(event: any) {
        this.configurationService.setHighPriorityItem(event.infusionContainerKey, event.highPriority);
        const configuration = this.configurationService.getUserConfiguration();
        if (configuration.userSettings.options.sorting) {
            const sortingOption = configuration.userSettings.options.sorting;
            const sortingMethod =
                configuration.userSettings.columns.find((column: any) => column.field === sortingOption.field);
            this.templateData = [...this.sortingService.sortDataByField(sortingOption.field
                , sortingOption.order
                , sortingMethod.sortOptions.method
                , this.templateData)];
            this.setPageFromConfiguration({});
            if (this.isMedminedEnabled) { this.getMedminedAlerts(this.templateData); }
        }
    }

    onClearSearchBox(event: any) {
        this.disableFilter = false;
        const configuration = this.configurationService.getUserConfiguration();
        this.configurationService.setGlobalFilterCriteria('');
        this.globalSearchCriteria = '';
        if (configuration && configuration.userSettings.filters) {
            const filterOptions = {
                isValid: true,
                startDate: configuration.userSettings.filters.api.startDate,
                stopDate: configuration.userSettings.filters.api.stopDate,
                dateOptionSelected: configuration.userSettings.filters.api.dateOptionSelected,
                selectedCurrentDate: configuration.userSettings.filters.api.selectedCurrentDate,
                globalSearchCriteria: ''
            };
            this.setDateRangeFilter(filterOptions);
        }
    }

    onGlobalSearch(event: any) {
        const globalCriteria = this.processGlobalCriteria(event);
        this.disableFilter = true;
        const dateParams = this.widgetToolbar.dateRangeFilter.getLongestDateRangeOptions();
        this.filters.api.startDate = dateParams.startDate;
        this.filters.api.stopDate = dateParams.stopDate;
        this.configurationService.setGlobalFilterCriteria(globalCriteria);
        this.setDateRangeFilter({
            isValid: true,
            startDate: dateParams.startDate,
            stopDate: dateParams.stopDate,
            globalSearchCriteria: globalCriteria
        });
    }

    processGlobalCriteria(event) {
        const filterText = event.value;
        let searchTerms: string[] = filterText.split(",");
        let first: string = null;
        let last: string = null;

        if (searchTerms.length > 1) {
            // separate by comma
            first = searchTerms[1].trim().toLowerCase();
            last = searchTerms[0].trim().toLowerCase();
        } else {
            searchTerms = filterText.split(" ");
            if (searchTerms.length > 1) {
                // separate by blank space
                first = searchTerms[0].trim().toLowerCase();
                last = searchTerms[1].trim().toLowerCase();
            } else {
                // just one term
                first = searchTerms[0].trim().toLowerCase();
            }
        }
        return { result: { firstTerm: first, lastName: last }, criteria: event.criteria };
    }

    private filterByText(criteria: any) {
        const firstTerm = criteria.result.firstTerm;
        const lastName = criteria.result.lastName;
        let filtered: any[] = this.ivStatusData;
        filtered = filtered.filter((item: any) => !lastName ?
            (
                (item.patientId ? item.patientId.toLowerCase().indexOf(firstTerm) === 0 : false) ||
                (item.patientFirstName ? item.patientFirstName.toLowerCase().indexOf(firstTerm) === 0 : false) ||
                (item.patientLastName ? item.patientLastName.toLowerCase().indexOf(firstTerm) === 0 : false)
            ) || item.highPriority :
            item.patientFirstName.toLowerCase().indexOf(firstTerm) === 0 && item.patientLastName.toLowerCase().indexOf(lastName) === 0 || item.highPriority
        );
        return filtered;
    }

    openModal(): any {
        this.modalRef = this.modalService.show(WarningDialogComponent, this.warningModalOptions);
        this.modalRef.content.modalRef = this.modalRef;
        return this.modalRef.content.dlgClosed.pipe(take(1));
    }

    getRowStyleClass(row: any) {
        return row.highPriority ? 'highPriorityRow' : '';
    }

    setPageFromConfiguration(configuration: any) {
        const config = this.getPaginatorConfiguration(configuration);
        this.isAutomaticOnPageEvent = (this.dataTable.rows !== config.rows || this.dataTable.first !== config.first);
        if (this.isAutomaticOnPageEvent) {
            this.dataTable.rows = config.rows;
            this.dataTable.first = config.first;
            this.configurationService.setWidgetOptions({ pagination: { rows: config.rows, first: config.first } });
        }
    }

    getPaginatorConfiguration(configuration: any) {
        let pagingConfig = { first: 0, rows: this.dataTable.rows };
        const pageExists = configuration.first < this.dataTable.totalRecords;
        if (pageExists) {
            pagingConfig = configuration;
        }
        return pagingConfig;
    }

    verifyDateRangeFiltersConsistency() {
        if (this.filters.dateOptionSelected === "currentDate" && this.filters.selectedCurrentDate) {
            const startDate = new Date();
            startDate.setHours(startDate.getHours() - this.filters.selectedCurrentDate);
            this.filters.api.startDate = startDate;
            this.filters.api.stopDate = new Date();
        }
    }

    openAdtInformationModal(adtInformation) {
        this.modalRef = this.modalService.show(MvdAdtInformationModalComponent, this.modalConfig);
        this.modalRef.content.initializeComponent(adtInformation, this.modalRef, this.unknownFilterChecked);
    }

    toggleColumns(userPreferences) {
        if (userPreferences
            && userPreferences.generalSettings) {

            const settings = userPreferences
                .generalSettings.find(item => item.id === MvdConstants.IVSTATUS_WIDGET_KEY);
            const sessionPreferences = this.configurationService.getUserConfiguration();
            const columnOptions = sessionPreferences.userSettings.columns;

            this.synchColumnOptions(columnOptions, userPreferences);
            if (settings && settings.configuration) {
                this.isPatientNameColumnVisible = settings.configuration.showPatientNames;
                this.handleColumnToggling('patientId', columnOptions, settings.configuration.showPatientIds);
                this.handleColumnToggling('patientName', columnOptions, settings.configuration.showPatientNames);
            }
            this.configurationService.setUserConfiguration(sessionPreferences.userSettings);
        }
    }

    private synchColumnOptions(columnOptions: models.ColumnOption[], userPreferences: any): any {
        if (userPreferences &&
            userPreferences.columnOptions &&
            columnOptions) {

            const preferences: models.ColumnOptionSetting[] =
                userPreferences.columnOptions || [];
            const ivStatusOptions = preferences
                .find(item => item.widget === MvdConstants.IVSTATUS_WIDGET_KEY) as models.ColumnOptionSetting;
            if (ivStatusOptions && ivStatusOptions.values) {
                ivStatusOptions.values.forEach((item: models.ColumnOptionValue) => {
                    const column = columnOptions.find(col => col.field === item.field);
                    if (column) {
                        column.colIndex = item.colIndex;
                        column.hideOptions.visible = item.visible;
                    }
                });
                columnOptions
                    .sort((a, b) => this.sortingService.getSortingMethod('numeric')(a.colIndex, b.colIndex));
            }
        }
    }

    onColReorder(event) {
        this.configurationService.saveColumnsOrder(event);
        this.tableColumnOptions = this.configurationService.getShowHideOptions();
    }

    initializeMultivalueFiltersControl() {
        const configuration = this.configurationService.getUserConfiguration();
        if (configuration && this.ivStatusData && this.ivStatusData.length) {
            const columnsConfig = configuration.userSettings.columns as models.ColumnOption[];
            this.widgetToolbar.multiValueFilter.initializeFilters(this.ivStatusData, columnsConfig);
        }
    }

    emitDataLoadFail(error) {
        this.errorMessage = error;
        console.log(`IVStatusComponent: Data Load Failed: ${error}`);
        this.eventBus.emitLoadDataFail(this.appCode, this.widgetId);
    }

    onPatientAlertsIcon(alerts: MedMinedModels.MedMinedAlertHeader[]) {

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

    private hasRole(roleName: string, authorizationInfo: any, selectedFacilities: string): boolean {
        if (!roleName || !authorizationInfo || !authorizationInfo.length) {
            return false;
        }
        const facilities = authorizationInfo.filter((item) => item.name !== MvdConstants.AUTHORIZATION_ROOT_ID);
        const permissions = _.flatMap(facilities, 'permissions');
        if (!permissions.length) {
            return false;
        }
        const nativeFacilities = selectedFacilities.split(';');
        if (!nativeFacilities.length) {
            return false;
        }

        if (nativeFacilities.some(nat => nat === MvdConstants.ALL_FACILITIES_KEY)) {
            return permissions.some((permission) => permission.resource === MvdConstants.PHARMACIST_ROLE_ID);
        }

        const [selectedFacility] = nativeFacilities;
        const authInfoForFacility = authorizationInfo.find((auth) => {
            return auth.synonyms.some(item => (item.source || '').toLocaleLowerCase() === MvdConstants.INFUSION_PROVIDER_NAME &&
                item.id === selectedFacility && item.name !== MvdConstants.AUTHORIZATION_ROOT_ID);
        });
        if (!authInfoForFacility) {
            return false;
        }
        return authInfoForFacility.permissions.some(
            (permission) => permission.resource === MvdConstants.PHARMACIST_ROLE_ID);
    }

    private handleColumnToggling(columnName: string, columnOptions: models.ColumnOption[], value: boolean) {
        if (!columnOptions.length || !columnName) {
            return;
        }
        const columnConfig = columnOptions.find((item) => item.field === columnName);
        if (!columnConfig) {
            return;
        }
        columnConfig.hideOptions.visible = value;
    }

    private handleDefaultSort(columnName: string, configuration: any) {
        const sortConfiguration = configuration.userSettings.options.sorting;

        if (sortConfiguration && sortConfiguration.field === columnName) {
            const defaultSortField = configuration.userSettings.columns
                .filter((column: any) => column.sortOptions.hasOwnProperty('default') && column.sortOptions.default);
            configuration.userSettings.options.sorting = {
                field: defaultSortField[0].field,
                order: 1
            };
        }
    }

    private checkDimensions(setAuto: boolean = true) {
        const element = this.dataTable as any;
        timer(0).subscribe(t => {
            try {
                const parentDiv = element.el.nativeElement.querySelector('.ui-datatable-tablewrapper');
                const widgetContainer = element.el.nativeElement.parentElement.parentElement.parentElement.parentElement;
                const table = parentDiv.children[0];

                if (setAuto) {
                    parentDiv.style.width = 'auto';
                    if (table.offsetWidth > widgetContainer.offsetWidth) {
                        parentDiv.style.width = `${table.offsetWidth + 24}px`;
                    } else {
                        parentDiv.style.paddingRight = '0px';
                    }
                } else {
                    parentDiv.style.width = `${table.offsetWidth + 24}px`;
                }
                parentDiv.style.paddingRight = '24px';
            } catch (ex) {
            }
        });
    }

    onDateFilterPanelOpened() {
        this.widgetToolbar.dateRangeFilter.initializeFilters(this.filters, false);
    }

    onWidgetSettingsClicked() {
        this.userConfigurationService
            .getCurrentConfig()
            .pipe(first())
            .subscribe((response) => {
                const { userPreferences } = response;
                if (userPreferences) {
                    this.modalRef = this.modalService.show(IVStatusConfigurationComponent, this.config);
                    this.modalRef.content.appCode = this.appCode;
                    this.modalRef.content.widgetId = this.widgetId;
                    this.modalRef.content.user = this.user;
                    this.modalRef.content.loadData(userPreferences);
                    this.modalRef.content.onCloseDialog.pipe(take(1)).subscribe(this.closeIvStatusSettingDialog.bind(this));
                }
            },
                (error) => console.log('IVStatusComponent: onWidgetSettingsClicked Error: ', error));
    }

    /**
     * This function exports current iv status grid into selected (csv) file format.
     * In case of any filter applied to the current gird, it would be reflected in the export as well.
     * This event subscribed from toolbar export click event.
     *
     * @param event
     * @returns {void}
     */
    onExportButtonClicked(event: any[]) {
        const options = {};
        const tempTable = _.cloneDeep(this.dataTable);
        const guardrailStatusColumnIndex = tempTable.columns.map((col) => {
            return col.field;
        }).indexOf('guardrailStatus');
        tempTable.columns.splice(guardrailStatusColumnIndex, 1);
        tempTable.exportFilename = this.resources.ivstatusExportFileName;
        tempTable.exportCSV(options);
    }

    private closeIvStatusSettingDialog(event: any) {
        if (event.name === 'APPLY') {
            console.log(event);
            this.userConfigurationService
                .getCurrentConfig()
                .pipe(
                    first(),
                    switchMap((preferencesResponse) => this.updatePreferences$(event.data, preferencesResponse))
                )
                .subscribe((response) => {
                    this.eventBus.emitRequestManualRefresh(this.appCode, this.widgetId);
                    this.modalRef.hide();
                },
                    (error) => console.log('IVStatusComponent: closeIvStatusSettingDialog Error: ', error));
        } else {
            this.modalRef.hide();
        }
    }
    private updatePreferences$(data: any, preferencesResponse: any): Observable<any> {
        const { userPreferences } = preferencesResponse;
        if (userPreferences) {
            const widgets = userPreferences.generalSettings || [];
            const ivStatusWidget =
                widgets.find((widget) => widget.id === MvdConstants.IVSTATUS_WIDGET_KEY);
            if (ivStatusWidget) {
                ivStatusWidget.configuration = data;
            } else {
                userPreferences.generalSettings.push({
                    id: MvdConstants.IVSTATUS_WIDGET_KEY,
                    configuration: data
                });
            }
        }
        return this.userConfigurationService.setUserPreferences(userPreferences);
    }

    private onToogleColumnSubs() {
        return this.toggleColumn$.pipe(
            debounce(() => timer(500)))
            .subscribe((event: any) => {
                const columnOptions = this.configurationService
                    .parseToColumnSetting(event, MvdConstants.IVSTATUS_WIDGET_KEY);
                this.configurationService.persistColumnOptions(columnOptions);
            });
    }
}

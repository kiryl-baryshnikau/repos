import { Component, Input, OnDestroy, OnInit, ViewChild, DoCheck } from '@angular/core';
import { Observable, timer, Subscription, ReplaySubject, throwError } from 'rxjs';
import { map, switchMap, tap, filter, take, retry, catchError } from 'rxjs/operators';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { UUID } from 'angular2-uuid';

import { DataTable } from 'primeng/primeng';

import { UserConfigurationService } from '../../../services/user-configuration.service';
import { MultipleValueFilter } from '../../shared/multi-value-filter/mvd-column-multiple-value.component';
import { DeliveryTrackingConfigurationService } from './shared/mvd-delivery-tracking-configuration.service';
import { DeliveryTrackingTransformationService } from './shared/mvd-delivery-tracking-data-transformation.service';

import { MvdConstants } from '../../shared/mvd-constants';
import { DispensingFacilityKeyTranslatorService } from '../../services/mvd-dispensing-facility-key-translator.service';
import { EventBusService, GatewayService, ResourceService } from 'container-framework';
import { SortingService } from '../../services/mvd-sorting-service';
import { DashboardHeaderService } from '../../services/mvd-dashboard-header.service';
import { WidgetToolbarComponent } from '../../shared/widget-toolbar/widget-toolbar.component';


import { MedMinedModels } from '../../shared/medmined-models';
import { DeliveryTrackingItem, SelectableItem, ColumnOption } from '../../shared/mvd-models';
import { MvdMedMinedSecondaryDataService } from '../../services/mvd-medmined-secondary-data.service';
import { MvdMedMinedSecondaryDataMapperService } from '../../services/mvd-medmined-secondary-data-mapper.service';
import { PatientAlertComponent } from '../../shared/patient-alert-modal/patient-alert-modal.component';
import { FacilityLookUpService } from '../../../services/facility-look-up.service';

import * as _ from 'lodash';

@Component({
    selector: 'mvd-delivery-tracking',
    templateUrl: './mvd-delivery-tracking.component.html',
    styleUrls: ['./mvd-delivery-tracking.component.scss']
})
export class DeliveryTrackingComponent implements OnDestroy, OnInit, DoCheck {

    public static ComponentName = 'mvdDeliveryTrackingComponent';

    @ViewChild('widgetToolbar') widgetToolbar: WidgetToolbarComponent;
    @ViewChild('dt') dataTable: DataTable;
    @Input() appCode: string;
    @Input() widgetId: string;
    @Input() user: string;

    private eventBusStateChanged$: Subscription;
    private autoRefresh: string;
    private manualRefresh: string;
    private widgetKey = 'DeliveryTracking';

    errorMessage: string;
    globalSearchCriteria: string;
    columns: ColumnOption[] = [];
    statusesOptions: SelectableItem[];
    statusFilterSelected: string;
    deliveryTemplateData: DeliveryTrackingItem[];
    data: DeliveryTrackingItem[];
    disableFilter: boolean;
    resources: any;
    isAutomaticOnPageEvent = false;
    private endResizing: string;

    isMedminedEnabled: boolean;

    resourceFiltersTooltip = this.resourcesService.resource('tooltipFilterDeliveryTracking');

    modalRef: BsModalRef;

    private patientAlertModalOptions: ModalOptions = {
        class: 'modal-md-alerts',
        keyboard: false,
        ignoreBackdropClick: true,
        animated: true,
        focus: true,
    };

    constructor(
        private dataService: GatewayService,
        private eventBus: EventBusService,
        private resourcesService: ResourceService,
        private configurationService: DeliveryTrackingConfigurationService,
        private deliveryTrackingTransformationService: DeliveryTrackingTransformationService,
        private sortingService: SortingService,
        private userConfigurationService: UserConfigurationService,
        private facilityKeyService: DispensingFacilityKeyTranslatorService,
        private modalService: BsModalService,
        private headerService: DashboardHeaderService,
        private secondaryDataService: MvdMedMinedSecondaryDataService,
        private secondaryDataMapperService: MvdMedMinedSecondaryDataMapperService,
        private facilitLookUpService: FacilityLookUpService
    ) {
        this.resources = this.getResources();
    }

    ngOnInit() {
        console.log(`DeliveryTrackingComponent: appCode  = ${this.appCode} widgetId = ${this.widgetId} user = ${this.user}`);
        this.headerService.cleanHeader(this.appCode);
        this.initializeComponent();
        this.autoRefresh = this.eventBus.subcribeRequestAutoRefresh(this.appCode, this.widgetId);
        this.manualRefresh = this.eventBus.subcribeRequestManualRefresh(this.appCode, this.widgetId);
        this.endResizing = this.eventBus.subscribePortletEndResize(this.appCode, this.widgetId);

        this.eventBusStateChanged$ = this.initialFlow$()
            .pipe(
                catchError(error => {
                    this.emitLoadDataFail(error);
                    return throwError(error);
                }),
                retry()
            )
            .subscribe((response: any) => this.handleResponse(response));

        this.checkDimensions();
    }

    initialFlow$() {
        return this.eventBus.eventBusState$
            .pipe(
                tap(({ target }) => {
                    if (target === this.endResizing) {
                        this.checkDimensions();
                    }
                }),
                filter((state: any) => state.target === this.autoRefresh || state.target === this.manualRefresh),
                switchMap(() => this.userConfigurationService.getCurrentConfig()),
                tap((userConfig) => this.syncColumnOptions(userConfig)),
                map((userConfig) => this.processFacilities(userConfig)),
                tap(({ facilities }) => {
                    if (!facilities || !facilities.length) {
                        this.eventBus.emitNoDataAvailable(this.appCode, this.widgetId);
                    }
                }),
                filter(({ facilities }: any) => facilities && facilities.length > 0),
                switchMap((config: any) => this.dataService
                    .loadData([this.createRequest(config.facilities)])
                    .pipe(
                        map(data => ({ data, config }))
                    )
                )
            );
    }

    syncColumnOptions(userConfig: any): any {
        if (userConfig) {
            this.configurationService.syncColmnOptions(userConfig);
        }
        const userSettings = this.configurationService.getConfiguration();
        if (userSettings) {
            setTimeout(() => {
                this.columns = userSettings.columns.filter(x => x.hideOptions.visible);
            }, 0);
        }
    }

    ngOnDestroy() {
        this.eventBusStateChanged$.unsubscribe();
        this.secondaryDataService.clearCache(this.widgetKey);
    }

    handleResponse(response: any) {
        console.log(`DeliveryTrackingComponent: Requesting and processing data`);
        const { data = [], config } = response;
        const [result = []] = data || [];
        if (result && result.body && result.body.length > 0) {
            const authConfig = response.config.userConfig.authorizationConfig;
            const maskData = config && config.userConfig.userPreferences ? config.userConfig.userPreferences.maskData : false;
            this.data = this.deliveryTrackingTransformationService.transform(result.body, maskData, authConfig);
            this.deliveryTemplateData = [...this.data];

            this.isMedminedEnabled = this.facilitLookUpService
                .hasProvider(authConfig, MvdConstants.MEDMINED_PROVIDER_NAME);

            if (this.isMedminedEnabled) {
                this.secondaryDataService.addUuid(this.data);
                this.secondaryDataService.clearCache(this.widgetKey);
                //setTimeout(() => { this.getMedminedAlerts(this.deliveryTemplateData); }, 0);
            }

            this.setWidgetState(this.data);

            this.eventBus.emitLoadDataSuccess(this.appCode, this.widgetId);
        } else {
            this.eventBus.emitNoDataAvailable(this.appCode, this.widgetId);
        }
        this.checkDimensions();
    }

    onPatientAlertsMouseClick(event: Event) {
        event.stopPropagation();
    }

    onPatientAlertsIcon(alerts: MedMinedModels.MedMinedAlertHeader[]) {
        console.log(alerts);

        this.modalRef = this.modalService.show(PatientAlertComponent, this.patientAlertModalOptions);
        this.modalRef.content.modalRef = this.modalRef;
        this.modalRef.content.setAlertsDetailsIds(alerts);
        this.modalRef.content.appCode = this.appCode;
        this.modalRef.content.widgetId = this.widgetId;
        this.modalRef.content.onClose.pipe(take(1)).subscribe(this.closeDialog.bind(this));
    }

    private getPaginatorConfigForMedMined(): {first: number, rows: number } {
        let paginatorConfig = { first: 0, rows: this.dataTable.rows };
        const userConfiguration = this.configurationService.getConfiguration();
        if (userConfiguration.options.pagination) {
            paginatorConfig = this.getPaginatorConfiguration(userConfiguration.options.pagination);
        }

        return paginatorConfig;
    }

    private getMedMinedAlertsRequestData(data: DeliveryTrackingItem[]): MedMinedModels.MedMinedAlertsRequestData<DeliveryTrackingItem> {
        const paginatorConfig = this.getPaginatorConfigForMedMined();
        const startPage = Math.floor(paginatorConfig.first / paginatorConfig.rows);

        const requestData = {
            widgetKey: this.widgetKey,
            dataset: data,
            recordsPerPage: paginatorConfig.rows,
            startPage: startPage
        } as MedMinedModels.MedMinedAlertsRequestData<DeliveryTrackingItem>;

        return requestData;
    }

    private getMedminedAlerts(data: DeliveryTrackingItem[]) {
        const requestData = this.getMedMinedAlertsRequestData(data);
        this.secondaryDataService.getAlerts(requestData, this.secondaryDataMapperService.mapDeliveryTracking)
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
    }

    processFacilities(userConfig) {
        this.headerService.updateHeader(this.appCode, userConfig);
        const authorizationConfig = userConfig.authorizationConfig;
        const facilitiesConfig = userConfig.userPreferences.facilities;
        const facilities = this.facilityKeyService.translateFacilityKeys(facilitiesConfig, authorizationConfig);
        return { facilities, userConfig };
    }

    emitLoadDataFail(error: any) {
        console.log(`DeliveryTrackingComponent: Data Load Failed: ${error}`);
        this.errorMessage = error;
        this.eventBus.emitLoadDataFail(this.appCode, this.widgetId);
    }

    createRequest(params: any) {
        let facilityParameter = '';
        let allFacilitiesIncluded = params.some(s => s === MvdConstants.ALL_FACILITIES_KEY);

        if (params && params.length > 0 && !allFacilitiesIncluded) {
            facilityParameter = params.join(',');
        }
        return {
            appCode: this.appCode,
            widgetId: this.widgetId,
            api: 'deliverytracking',
            queryParams: [
                {
                    name: 'facilityKeys',
                    value: facilityParameter
                }]
        };
    }

    initializeComponent() {
        this.statusesOptions = this.configurationService.getStatusesOptions([]);
        this.statusFilterSelected = 'ALL';
    }

    setWidgetState(data: DeliveryTrackingItem[]) {
        const userSettings = this.configurationService.getConfiguration();
        this.statusesOptions = this.configurationService.getStatusesOptions(data);
        if (userSettings) {
            this.statusFilterSelected = userSettings.filters.statusFilter;
            this.widgetToolbar.multiValueFilter.initializeFilters(data, userSettings.columns);
            this.applyFilters(userSettings.columns);
            this.recoverTableState(userSettings);
        }
    }

    recoverTableState(userSettings: any) {
        this.isAutomaticOnPageEvent = true;
        this.updateSortOptions({
            field: userSettings.options.sorting.field,
            order: userSettings.options.sorting.order
        });
        setTimeout(() => {
            const userConfiguration = this.configurationService.getConfiguration();
            if (userConfiguration.options.pagination) {
                this.setPageFromConfiguration(userConfiguration.options.pagination);
            }
        }, 0);
    }

    setPageFromConfiguration(configuration: any) {
        const config = this.getPaginatorConfiguration(configuration);
        this.isAutomaticOnPageEvent = (this.dataTable.rows !== config.rows || this.dataTable.first !== config.first);
        if (this.isAutomaticOnPageEvent) {
            this.dataTable.rows = config.rows;
            this.dataTable.first = config.first;
            this.configurationService.setWidgetOptions({ pagination: { rows: config.rows, first: config.first } });
        }
        this.checkDimensions();
    }

    updateSortOptions(event: any) {
        if (event) {
            this.dataTable.sortField = event.field;
            this.dataTable.sortOrder = event.order;
        }
        this.checkDimensions();
    }

    sortData(event: any) {

        const userPreferences = this.configurationService.getConfiguration();
        if (event && userPreferences) {
            const configuration = userPreferences
                .columns
                .find(col => col.field === event.field);
            const sortingMethod = configuration ? configuration.sortOptions.method : 'localeSensitive';
            const indexName = 'internalId';
            this.isAutomaticOnPageEvent = true;

            if (event.field !== 'dateAgeValue') {
                this.sortingService.sortDataWithIndex(event.field, event.order, sortingMethod, event.data, indexName);
            } else {
                this.sortingService.sortDataAgeDataWithIndex(event.field, event.order, sortingMethod, event.data, indexName);
            }
        }
        this.checkDimensions();

    }

    onColReorder(event) {
        if (event && event.columns) {
            this.configurationService.saveColumnOrder(event.columns);
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

    onPage(event) {
        if (!this.isAutomaticOnPageEvent) {
            this.configurationService.setWidgetOptions({ pagination: event });
            setTimeout(() => { this.getMedminedAlerts(this.deliveryTemplateData); }, 0);
        }
        this.isAutomaticOnPageEvent = false;
        this.checkDimensions();
    }

    onSort(event) {
        this.configurationService.setWidgetOptions({ sorting: event });
        const userConfiguration = this.configurationService.getConfiguration();
        if (userConfiguration.options.pagination) {
            this.setPageFromConfiguration(userConfiguration.options.pagination);
        }
        this.checkDimensions();
    }

    onClearSearchBox(event) {
        this.deliveryTemplateData = [...this.data];
        this.configurationService.setGlobalFilterCriteria('');
        this.globalSearchCriteria = '';
        const configuration = this.configurationService.getConfiguration();
        this.applyFilters(configuration.columns);
        setTimeout(() => { this.getMedminedAlerts(this.deliveryTemplateData); }, 0);
    }

    onGlobalSearch(event) {
        const configuration = this.configurationService.getConfiguration();
        if (event.value) {
            const filteredData = this.doGlobalSearch(event.value);
            this.deliveryTemplateData = [...filteredData];
            this.configurationService.setGlobalFilterCriteria(event.value);
            this.applyFilters(configuration.columns);
            this.recoverTableState(configuration);
            setTimeout(() => { this.getMedminedAlerts(this.deliveryTemplateData); }, 0);
        }
    }

    applyFilters(event) {
        const configuration = this.configurationService.getConfiguration();
        let data = this.data || [];
        if (configuration.filters.globalSearchCriteria) {
            data = this.doGlobalSearch(configuration.filters.globalSearchCriteria);
            this.globalSearchCriteria = configuration.filters.globalSearchCriteria;
        }
        if (configuration.filters.statusFilter && configuration.filters.statusFilter !== 'ALL') {
            data = this.doStatusSearch(configuration.filters.statusFilter, data);
        }
        this.doMultiValueSearch(event, configuration, data);
        this.recoverTableState(configuration);
        this.configurationService.setFilterColumnConfiguration(event, this.configurationService.getConfiguration());
    }

    doMultiValueSearch(event: any, configuration: any, data: DeliveryTrackingItem[]) {
        let filtered: any[] = data || [];
        for (let i = 0; i < event.length; i++) {
            const criteria = event[i].filterOptions.criteria
                .filter((criteria: any) => !criteria.state)
                .map((criteria: any) => criteria.value);

            if (criteria.length > 0) {
                filtered = filtered
                    .filter((data: any) => {
                        const value = data[event[i].field];
                        return criteria.indexOf(value) < 0 || data.highPriority;
                    });
            }
            this.deliveryTemplateData = [...filtered];
        }
        if (event.length > 0) {
            setTimeout(() => { this.getMedminedAlerts(this.deliveryTemplateData); }, 0);
        }
    }

    resetFilters(event) {
        this.deliveryTemplateData = [...this.data];
        this.configurationService.setFilterColumnConfiguration(event, this.configurationService.getConfiguration());
        this.onClearSearchBox({});
        setTimeout(() => { this.getMedminedAlerts(this.deliveryTemplateData); }, 0);
    }

    preProcessUnitOfMeasure(item: any) {
        return item.giveUnitOfMeasure ?
            item.giveUnitOfMeasure.replace('EACH', this.resourcesService.resource('eachUpperCase')) : '';
    }

    getResources() {
        return {
            search: this.resourcesService.resource('search'),
            filterRows: this.resourcesService.resource('filterRows'),
            noRecordsFound: this.resourcesService.resource('noRecordsFound'),
            filterRowsTooltip_line1: this.resourcesService.resource('filterRowsTooltip_line1'),
            filterRowsTooltip_line2: this.resourcesService.resource('filterRowsTooltip_line2'),
            filterRowsTooltip_line3: this.resourcesService.resource('filterRowsTooltip_line3'),
            deliveryTrackingExportFileName: this.resourcesService.resource('deliveryTrackingExportFileName'),

            description: this.resourcesService.resource('description'),
            doseInfo: this.resourcesService.resource('doseInfo'),
            route: this.resourcesService.resource('route'),
            routes: this.resourcesService.resource('routes')
        };
    }

    doGlobalSearch(value): DeliveryTrackingItem[] {
        const filteredData = [...this.data].filter((item: any) => {
            value = this.safeLowerCase(value);
            return this.safeLowerCase(item.patient).indexOf(value) !== -1 ||
                this.safeLowerCase(item.patientId).indexOf(value) !== -1 ||
                this.safeLowerCase(item.orderDescription).indexOf(value) !== -1 ||
                this.safeLowerCase(item.orderId).indexOf(value) !== -1 ||
                this.safeLowerCase(item.location).indexOf(value) !== -1;
        });
        return filteredData;
    }

    safeLowerCase(value: any): string {
        const val = value || '';
        return val.toLowerCase();
    }

    ngDoCheck() {
        this.isAutomaticOnPageEvent = false;
    }

    radioButtonChanged(event) {
        this.configurationService.setStatusFilterCriteria(event);
        const configuration = this.configurationService.getConfiguration();
        this.applyFilters(configuration.columns);
    }

    doStatusSearch(status: string, data: DeliveryTrackingItem[]): DeliveryTrackingItem[] {
        return data.filter((item: any) => item.status === status);
    }

    initializeMultivalueFiltersControl() {
        const userSettings = this.configurationService.getConfiguration();
        if (userSettings && this.data && this.data.length) {
            this.widgetToolbar.multiValueFilter.initializeFilters(this.data, userSettings.columns);

        }
    }

     /**
     *  This funtion exports current drivery tracking grid into selected (csv) file format.
     * In case of any filter applied to the current gird, it would be reflected in the export as well.
     * This event subscribed from toolbar export click event.
     *
     * @param event
     * @returns {void}
     */
    onExportButtonClicked(event: any[]) {
        const options = {};
        let tempTable = _.cloneDeep(this.dataTable);
        const requestDurationColumnIndex = tempTable.columns.map((col) => {
            return col.field;
        }).indexOf('dateAgeValue');
        tempTable.columns[requestDurationColumnIndex].field = 'dateAge';
        tempTable.exportFilename = this.resources.deliveryTrackingExportFileName;
        tempTable.exportCSV(options);
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


    closeDialog() {
        this.modalRef.hide();
    }
}

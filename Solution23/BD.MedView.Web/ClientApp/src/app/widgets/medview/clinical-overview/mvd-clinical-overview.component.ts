import { Component, OnInit, Input, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import { EventBusService, ResourceService } from 'container-framework';
import { Subscription, Observable, of, timer, ReplaySubject, Subject, onErrorResumeNext } from 'rxjs';
import { take, map, skipWhile, switchMap, filter, tap, debounce, catchError } from 'rxjs/operators';

import { Store, select } from '@ngrx/store';
import { AppState } from '../../store';
import {
    ClinicalDashboardClearData,
    ClinicalAlertSummaryPriorityFilter,
    ClinicalDashboardColumnConfig,
    ClinicalDashboardDetailsLoaded,
    ClinicalDashboardItemSelected,
    ClinicalDashboardInitialDataLoad
} from '../../store/clinical-dashboard/clinical-dashboard.actions';
import {
    selectPrioritySelectedAndSummary,
    selectCurrentAlertDetailsWConfig,
    selectCurrentItemSelected
} from '../../store/clinical-dashboard/clinical-dashboard.selectors';
import { MvdListElement, ColumnOption, ColumnOptionSetting } from '../../shared/mvd-models';
import { MvdMedMinedDataService } from '../../services/mvd-medmined-data.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { MedMinedModels } from '../../shared/medmined-models';
import * as _ from 'lodash';
import { MedminedTransformationService } from '../../services/medmined-transformation.service';
import { WidgetToolbarComponent } from '../../shared/widget-toolbar/widget-toolbar.component';
import { UserConfigurationService } from '../../../services/user-configuration.service';
import { AlertsDlgComponent } from './alerts-dlg/alerts-dlg.component';
import { MvdConstants } from '../../shared/mvd-constants';
import { AlertsConfigurationService } from './alerts-configuration-services/alerts-configuration.service';
import { ClinicalOverviewDatatableComponent } from './clinical-overview-datatable/clinical-overview-datatable.component';
import { DashboardHeaderService } from '../../services/mvd-dashboard-header.service';
import { ProviderFacilitiesDataService } from '../../medview/configuration/medview-facility-management/provider-facilities-data.service'
import { SortingService } from '../../services/mvd-sorting-service';
import { ClinicalOverviewConfigurationService } from './mvd-clinical-overview-configuration.service';

import { AuthenticationService } from 'bd-nav/core';
import { WindowRef } from '../../services/windowref.service';


@Component({
    selector: 'mvd-clinical-overview',
    templateUrl: './mvd-clinical-overview.component.html',
    styleUrls: [
        './mvd-clinical-overview.component.scss',
        './mvd-clinical-overview-shared.scss'
    ]
})
export class ClinicalOverviewComponent implements OnInit, OnDestroy {
    public static ComponentName = 'medViewClinicalOverview';

    @Input() appCode: string;
    @Input() widgetId: string;
    @Input() user: string;

    @ViewChild("htmlForm")
    htmlForm: ElementRef;

    private eventBusStateSubscription: Subscription;
    private userPreferencesSubscription: Subscription;
    private autoRefresh: string;
    private manualRefresh: string;
    private configurationPreferences: any;
    private facilities: any;
    private userDataFilters$: ReplaySubject<ColumnOption[]> = new ReplaySubject(1);
    private clearDataTable$: ReplaySubject<boolean> = new ReplaySubject(1);
    private dataFiltersConfiguration: ColumnOption[] = [];
    private clinicalOverviewWidgetName = MvdConstants.CLINICALOVERVIEW_WIDGET_KEY;
    private toggleSubscription: Subscription;
    private toggleColumn$: Subject<any> = new Subject<any>();

    paginationDataSubject$: ReplaySubject<any> = new ReplaySubject<any>(1);

    resources: any;

    @ViewChild('widgetToolbar') widgetToolbar: WidgetToolbarComponent;
    @ViewChild('ClinicalOverviewDatatableComponent') clinicalOverviewDatatableComponent: ClinicalOverviewDatatableComponent;

    clinicalDashboardData$: Observable<any>;

    summaryData$: Observable<MedMinedModels.SummaryCategory[]>;

    filterItems$: Observable<any[]>;
    currentStatus: any;
    alertCategoriesCofiguration: any;
    emptyFilteredData = false;
    writeAccess = true;
    medMinedFacilityKeys: string[];
    tableColumns: ColumnOption[];
    advanceSubscription = true;
    rows = 15;

    globalSearchCriteria = '';
    disableFilter = false;

    config = {
        animated: true,
        keyboard: true,
        backdrop: true,
        ignoreBackdropClick: false,
        class: 'gray doc-form modal-md'
    };

    configAlerts = {
        animated: true,
        keyboard: true,
        backdrop: true,
        ignoreBackdropClick: false,
        class: 'white doc-form modal-xlg'
    };

    modalRef: BsModalRef;
    tableTitle: any;

    constructor(private eventBus: EventBusService,
        private store: Store<AppState>,
        private dataService: MvdMedMinedDataService,
        private modalService: BsModalService,
        private transformationService: MedminedTransformationService,
        private userConfigurationService: UserConfigurationService,
        private resourcesService: ResourceService,
        private alertsConfigurationService: AlertsConfigurationService,
        private headerService: DashboardHeaderService,
        private facilitiesDataService: ProviderFacilitiesDataService,
        private sortingService: SortingService,
        private clinicalOverviewConfigurationService: ClinicalOverviewConfigurationService,
        private authenticationService: AuthenticationService,
        private winRef: WindowRef
    ) {
        // Emit empty filters
        this.userDataFilters$.next([]);
        this.clearDataTable$.next(false);
    }

    ngOnInit() {
        this.setResources();
        this.headerService.cleanHeader(this.appCode);


        this.dataFiltersConfiguration = this.clinicalOverviewConfigurationService.getFiltersConfiguration();
        this.setPaginationConfig();
        this.autoRefresh = this.eventBus.subcribeRequestAutoRefresh(this.appCode, this.widgetId);
        this.manualRefresh = this.eventBus.subcribeRequestManualRefresh(this.appCode, this.widgetId);
        this.clinicalOverviewConfigurationService.ensureDefaults();
        this.toggleSubscription = this.onToggleColumnSubs();
        this.eventBusStateSubscription = this.eventBus.eventBusState$
            .pipe(
            filter((state: any) => state.target === this.autoRefresh || state.target === this.manualRefresh),
            switchMap(() => {
                if (!this.facilities) {
                    return this.facilitiesDataService.getMedminedFacilities$(this.appCode, this.widgetId).pipe(
                        map((facilities) => (facilities))
                    );
                }
                return of([{ facilities: this.facilities }] );
            }),
            switchMap((facilities) => {
                this.facilities = facilities.length ? facilities[0].facilities : [];
                return this.userConfigurationService.getCurrentConfig()
            }),
            map((userConfig) => this.transformationService.processFacilities(userConfig)),
            map(({ facilities }) => {
                this.medMinedFacilityKeys = facilities;

                this.advanceSubscription = this.getSubscriptionAvaibleType(this.medMinedFacilityKeys, this.facilities);

                return facilities;
            }),
                switchMap((facilityKeys) => {
                    let config = this.clinicalOverviewConfigurationService.getConfiguration();
                    this.globalSearchCriteria = config.globalSearchCriteria || '';
                    this.disableFilter = !!config.globalSearchCriteria;
                    return this.dataService.getMedMinedSummaryAlerts$(this.appCode, this.widgetId, facilityKeys, this.globalSearchCriteria).pipe(
                        map(d => {
                            // Mutate priorities array to remove priority 'None' - should we preserve it?
                            d.summaries.forEach(item => {
                                let replaceItem = item.priorities.find(d => d.priority === 'None');
                                if (replaceItem) {
                                    replaceItem.priority = 'Low';
                                }
                            });
                            return d;
                        }));
                }),
            switchMap(summaryData => this.userConfigurationService.getUpdatedConfig().pipe(
                map(preferences => ({ summaryData, preferences }))
            )))
            .subscribe(({ summaryData, preferences }) => {

                const columnOptionsSettings = this.getColumnOptionsFromPreferences(preferences);
                this.clinicalOverviewConfigurationService.synchronizeColumns(columnOptionsSettings);
                const currentColumnOptions = this.clinicalOverviewConfigurationService.getColumnsConfiguration();
                const visibleColumns = this.getVisibleColumns(currentColumnOptions);
                this.tableColumns = this.clinicalOverviewConfigurationService.getShowHideOptions();

                this.configurationPreferences = preferences;
                this.writeAccess = this.userHasWriteAccess(preferences);

                this.headerService.updateHeader(this.appCode, {
                    userPreferences: preferences.userPreferences,
                    authorizationConfig: preferences.authorizationConfig
                });

                this.store.dispatch(new ClinicalDashboardInitialDataLoad({ columnOptions: visibleColumns, dataSummary: { summaries: summaryData.summaries } }));


                if (!summaryData || summaryData.summaries.length === 0) {
                    this.eventBus.emitNoDataAvailable(this.appCode, this.widgetId);
                } else {
                    this.eventBus.emitLoadDataSuccess(this.appCode, this.widgetId);
                }
            }, (error) => {
                console.log(`ClinicalOverviewComponent: Load Data Fail ${error}`);
                this.eventBus.emitLoadDataFail(this.appCode, this.widgetId);
            });

        this.summaryData$ = this.store.pipe(
            select(selectPrioritySelectedAndSummary),
            skipWhile(({ dataSummary, columnConfig }) => !columnConfig || !dataSummary || !this.configurationPreferences || !this.facilities),
            // Filter alerts according to alerts configuration
            map(({ selectedPriorityId, dataSummary, ...state }) =>
                ({ ...this.filterActiveAlerts(dataSummary, selectedPriorityId), ...state })),

            map(({ dataSummary, ...state }) =>
                ({ dataSummary: dataSummary.summaries, ...state })),

            // Get Master Facility according to Facility Mapping
            map(({ dataSummary, ...state }) => {
                dataSummary.forEach(item => item.masterFacility = this.transformationService.getMasterFacility(
                    `${item.facility_id}`, this.configurationPreferences));
                return {
                    dataSummary,
                    ...state
                };
            }),
            // Concat user data filters
            switchMap(({ dataSummary, ...state }) => this.userDataFilters$.pipe(
                map((filters) => ({ dataSummary, filters, ...state }))
            )),

            // initialize data filters
            map(({ dataSummary, filters, ...state }) => {
                if (!filters || filters.length === 0) {
                        this.userDataFilters$.next(this.dataFiltersConfiguration);
                }
                if (!this.globalSearchCriteria) {
                    let columnsConfig = (filters && filters.length > 0 ? filters : this.dataFiltersConfiguration) as ColumnOption[];
                    columnsConfig = _.cloneDeep(columnsConfig);
                    columnsConfig.sort((a, b) => a.colIndex > b.colIndex ? 1 : -1);
                    timer(0).subscribe(() => this.widgetToolbar.multiValueFilter.initializeFilters(dataSummary, columnsConfig));
                    return { dataSummary, filters, ...state };
                } else {
                    filters = this.clinicalOverviewConfigurationService.getDataFiltersConfiguration();
                    return { dataSummary, filters, ...state };
                }

            }),

            map(({ dataSummary, filters, itemSelected, selectedPriorityId, itemSelectedFromSummaryWidget }) => {
                dataSummary = this.filterData(filters, dataSummary);

                dataSummary = this.applyDataFilterPriority(dataSummary, filters);

                timer(0).subscribe(() => {
                    this.filterItems$ = this.defineFilters$({ summaries: dataSummary }, selectedPriorityId);
                });
                return { dataSummary, filters, itemSelected, selectedPriorityId, itemSelectedFromSummaryWidget };
            }),


            // filter and transform data for display
            map(({ dataSummary, itemSelected, selectedPriorityId, itemSelectedFromSummaryWidget }) => {
                this.emptyFilteredData = false;
                //dataSummary = this.filterData(filters, dataSummary);
                if (!dataSummary || dataSummary.length === 0) {
                    this.emptyFilteredData = true;
                }

                let dataTransformed: MedMinedModels.SummaryCategory[] = this.transformationService.dataSummaryTransform(dataSummary);

                // Filter summary according to status selected
                if (selectedPriorityId !== '-') {
                    dataTransformed = dataTransformed
                        .map(d => ({
                            category: d.category,
                            selected: false,
                            summary: {
                                data: d.summary.data.filter(i => i.counter[selectedPriorityId.toLowerCase()] > 0)
                            }
                        }))
                        .filter(d => d.summary.data.length > 0);
                }

                // check if current selected item still present after filtering or if no item selected, select first one
                let stillPresent: MedMinedModels.SummaryCategory;
                if (itemSelected) {
                    stillPresent = dataTransformed.find(item => {
                        return !!item.summary.data.find(el => el.key === itemSelected.key);
                    });
                }
                if (!stillPresent || !itemSelected) {
                    // Select first summary element if not previous one selected
                    if (dataTransformed.filter(d => d.summary.data && d.summary.data.length > 0).length > 0) {
                        const firstSelected = dataTransformed.find(d => d.summary.data && d.summary.data.length > 0).summary.data[0];

                        this.store.dispatch(new ClinicalDashboardItemSelected({ itemSelected: firstSelected, fromSummary: false }));
                    } else {
                        dataTransformed.forEach(t => t.selected = true);
                        this.clearDataTable$.next(true);
                        this.tableTitle = undefined;
                    }
                } else {
                    // check for facilities
                    let currentItem = stillPresent.summary.data.find(e => e.key === itemSelected.key);
                    if (!_.isEqual(itemSelected.facilityKeys, currentItem.facilityKeys)) {
                        this.store.dispatch(new ClinicalDashboardItemSelected({ itemSelected: currentItem, fromSummary: false }));
                    }
                    else {
                        if (itemSelectedFromSummaryWidget) {
                            stillPresent.selected = true;
                            this.clinicalOverviewConfigurationService.saveExpandedCategories([stillPresent.category]);
                        } else {
                            const expandedCategories = this.clinicalOverviewConfigurationService.getExpandedCategories();
                            if (expandedCategories == null || expandedCategories === undefined) {
                                dataTransformed.forEach(t => t.selected = true);
                            } else {
                                dataTransformed.forEach(t => t.selected = _.includes(expandedCategories, t.category));
                            }

                        }
                        let keyParams = this.alertSummaryKeyToJson(itemSelected.key);
                        this.tableTitle = {
                            category: keyParams.category.toUpperCase(),
                            title: itemSelected.title
                        };

                        this.clearDataTable$.next(false);
                    }
                }

                return dataTransformed;
            })
        );

        this.clinicalDashboardData$ = this.store.pipe(
            select(selectCurrentAlertDetailsWConfig),
            skipWhile(({ data, columns }) => {
                return !data || !columns;
            }),
            switchMap(({ data, columns, selectedPriorityId }) => this.clearDataTable$.pipe(
                map((clearTable) => {
                    if (clearTable) {
                        return {
                            columns: [],
                            data: {
                                alerts: [],
                                category: ''
                            },
                            selectedPriorityId
                        };
                    }
                    return {
                        data, columns, selectedPriorityId
                    };
                }))
            ),
            switchMap((data) =>
                this.userDataFilters$.pipe(
                    map(filters => ({ ...data, filters }))
                    )
            ),
            map(({ columns, data: { alerts, category }, selectedPriorityId, filters }) => {
                if (this.globalSearchCriteria) {
                    filters = this.clinicalOverviewConfigurationService.getDataFiltersConfiguration();
                }
                alerts = selectedPriorityId === '-' ? alerts : alerts.filter((d: MedMinedModels.AlertDetailsHeader) => d.status === selectedPriorityId);

                if (filters && filters.length > 0 && !this.globalSearchCriteria) {
                    let filterLocation = filters.find(d => d.subProperty === 'location');
                    if (filterLocation) {
                        const criteria = filterLocation.filterOptions.criteria
                            .filter((criteria: any) => !criteria.state)
                            .map((criteria: any) => criteria.value);
                        if (criteria.length > 0) {
                            alerts = _.cloneDeep(alerts).filter(d => {
                                let value = d.patient.location;
                                return criteria.indexOf(value) < 0;
                            });
                        }
                    }
                }

                const config = this.clinicalOverviewConfigurationService.getConfiguration();
                if (config && config.options.pagination && alerts) {
                    if (config.options.pagination.first > alerts.length) {
                        this.setPaginationConfig({ first: 0 });
                    }
                    else {
                        this.setPaginationConfig(config.options.pagination);
                    }
                }

                return {
                    columns,
                        data: this.transformationService.alertsDetailsTransform(alerts, category, this.configurationPreferences)
                }
            }),
            map(({ columns, data }) => ({
                        columns: columns.filter(item => item.hideOptions.visible),
                        data
                    })
                )
        );

        this.itemSelectedSubscription = this.store.pipe(
            select(selectCurrentItemSelected),
            skipWhile(itemSelected => !itemSelected || !this.configurationPreferences || !this.facilities),
            switchMap(itemSelected => {
                if (!this.facilities) {
                    return this.facilitiesDataService.getMedminedFacilities$(this.appCode, this.widgetId).pipe(
                        map((facilities) => ({ facilities, itemSelected }))
                    );
                }
                return of({ facilities: [{ facilities: this.facilities }], itemSelected });
            }),
            tap(({ facilities }) => {
                this.facilities = facilities.length ? facilities[0].facilities : [];
            }),
            switchMap(({ itemSelected }) => {
                this.loadingDetails = true;
                if (itemSelected) {
                    let facilityKey = itemSelected.facilityKeys.join(',');
                    let keyParams = this.alertSummaryKeyToJson(itemSelected.key);
                    return this.dataService.getMedMinedAlertDetails$(this.appCode, this.widgetId, keyParams.title, facilityKey,
                        keyParams.category, keyParams.ownership, this.globalSearchCriteria, itemSelected.counter.total).pipe(
                            map((results) => this.filterAlertResultsBySubscriptionType(results)),
                            catchError((error) => {
                                this.store.dispatch(new ClinicalDashboardDetailsLoaded({ data: { page_number: 0, page_size: 0, category: '', title: '', alerts: [] } }));
                                this.clearDataTable$.next(true);
                                //this.tableTitle = undefined;
                                this.loadingDetails = false;
                                this.eventBus.emitLoadDataFail(this.appCode, this.widgetId);
                                return onErrorResumeNext();
                            })
                    );
                }
                return of(null);
            }))
            .subscribe(alertsResult => {
                this.store.dispatch(new ClinicalDashboardDetailsLoaded({ data: alertsResult }));
                this.loadingDetails = false;
                this.eventBus.emitLoadDataSuccess(this.appCode, this.widgetId);
            }, (error) => {
                    console.log("Clinical alert headers error", error);
                    this.clearDataTable$.next(true);
                    this.tableTitle = undefined;
                    this.loadingDetails = false;
                    this.eventBus.emitLoadDataFail(this.appCode, this.widgetId);
                });

    }

    private itemSelectedSubscription: Subscription;
    loadingDetails: boolean = false;

    getSubscriptionAvaibleType(medMinedFacilityKeys: string[], facilities: any[]): boolean {
        let advanceSub = false;
        medMinedFacilityKeys.some(id => {
            let facility = facilities.find(d => `${d.facility_id}` === id);
            advanceSub = facility && facility.subscription.toLowerCase() === 'full' ? true : false;
            return advanceSub;
        });

        return advanceSub;
    }

    ngOnDestroy() {
        this.store.dispatch(new ClinicalDashboardClearData());
        this.eventBusStateSubscription.unsubscribe();
        this.toggleSubscription.unsubscribe();
        this.itemSelectedSubscription.unsubscribe();
        if (this.userPreferencesSubscription) {
            this.userPreferencesSubscription.unsubscribe();
        }
    }

    itemSelectedChanged(itemSelected: MvdListElement) {
        this.setPaginationConfig({ first: 0 });
    }

    onSummaryExpandedCollapsed(summary: MedMinedModels.SummaryCategory) {
        this.saveSummaryState(summary);
    }

    onSummaryExpandAllClick(summaries: MedMinedModels.SummaryCategory[]) {
        const categories = _.uniq(summaries.map(x => x.category));
        this.clinicalOverviewConfigurationService.saveExpandedCategories(categories);
    }

    onSummaryCollapseAllClick() {
        this.clinicalOverviewConfigurationService.saveExpandedCategories([]);
    }

    private saveSummaryState(summary: MedMinedModels.SummaryCategory): void {
        const expandedCategories = this.clinicalOverviewConfigurationService.getExpandedCategories() || [];
        if (summary.selected) {
            if (!_.includes(expandedCategories, summary.category)) {
                expandedCategories.push(summary.category);
            }
        } else {
            const index = expandedCategories.findIndex(x => x === summary.category);
            if (index >= 0) {
                expandedCategories.splice(index, 1);
            }
        }

        this.clinicalOverviewConfigurationService.saveExpandedCategories(expandedCategories);
    }

    onItemClicked(event: any) {
        const filterSelected = event.value;
        this.store.dispatch(new ClinicalAlertSummaryPriorityFilter({ selectedPriorityFilter: filterSelected.id }));
    }

    formData = {
        RelayState: '',
        SAMLResponse: '',
        redirectUrl: ''
    };

    showPatientForm(event: any) {
        let email = '';
        const alertId = event.alertId;
        const facilityKey = event.facilityKey;
        if (this.authenticationService.accessToken['email'] != null) {
            email = this.authenticationService.accessToken['email'] as string;
        }

        this.dataService.getPatientInfo$(facilityKey, alertId, email).subscribe(({ token, redirectUrl, medminedIdmRedirectUrl }) => {
            let newWindow = this.winRef.nativeWindow.open('', '_blank', 'toolbar=0,location=0,menubar=0,top=50,left=50,scrollbars=yes,resizable=yes,width=1100,height=650');
            if (newWindow) {
                newWindow.document.open();
                newWindow.document.write('<html><head><title></title>');
                newWindow.document.write('</head><body">');
                newWindow.document.write('<form ngNoForm id="targetForm" hidden action="' + medminedIdmRedirectUrl +'" method="post">');
                newWindow.document.write('<input type="hidden" name="RelayState" value="' + redirectUrl + '" />');
                newWindow.document.write('<input type="hidden" name = "SAMLResponse" value = "' + token + '" />');
                newWindow.document.write('<input name="autoSubmit" value = "true" />');
                newWindow.document.write('</form>');
                newWindow.document.write('</body></html>');
                newWindow.document.close();
                newWindow.document.getElementById('targetForm').submit();
            }
        })

    }

    showDocumentationForm(event: any) {
        let email = '';
        const alertId = event.alertId;
        const facilityKey = event.facilityKey;
        if (this.authenticationService.accessToken['email'] != null) {
           email = this.authenticationService.accessToken['email'] as string;
        }

        this.dataService.getDocumentationInfo$(facilityKey, alertId, email).subscribe(({ token, redirectUrl, medminedIdmRedirectUrl }) => {
            let newWindow = this.winRef.nativeWindow.open('', '_blank', 'toolbar=0,location=0,menubar=0,top=50,left=50,scrollbars=yes,resizable=yes,width=530,height=650');
            if (newWindow) {
                newWindow.document.open();
                newWindow.document.write('<html><head><title></title>');
                newWindow.document.write('</head><body">');
                newWindow.document.write('<form ngNoForm id="targetForm" hidden action="' + medminedIdmRedirectUrl + '" method="post">');
                newWindow.document.write('<input type="hidden" name="RelayState" value="' + redirectUrl + '" />');
                newWindow.document.write('<input type="hidden" name = "SAMLResponse" value = "' + token + '" />');
                newWindow.document.write('<input name="autoSubmit" value = "true" />');
                newWindow.document.write('</form>');
                newWindow.document.write('</body></html>');
                newWindow.document.close();
                newWindow.document.getElementById('targetForm').submit();
            }
        })
    }

    closeDocumentationForm() {
        this.modalRef.hide();
        this.eventBus.emitRequestManualRefresh(this.appCode, this.widgetId);
    }

    onMultiValueFiltersInit(event: any[]) {
    }

    initializeMultivalueFiltersControl() {
        this.userPreferencesSubscription = this.userDataFilters$.pipe(
            take(1)
        ).subscribe(filters => this.userDataFilters$.next(filters));
    }

    applyMultiValueFilter(event: ColumnOption[]) {
        const config = this.clinicalOverviewConfigurationService.getConfiguration();
        if (config && config.filters) {
            config.filters = event;
            this.clinicalOverviewConfigurationService.setUserConfiguration(config);
        }

        this.userDataFilters$.next(event);
    }

    resetMultiValueFilter(event: ColumnOption[]) {
        const config = this.clinicalOverviewConfigurationService.getConfiguration();
        if (config && config.filters) {
            config.filters = event;
            this.clinicalOverviewConfigurationService.setUserConfiguration(config);
        }
        this.userDataFilters$.next(event);
    }

    onWidgetSettingsClicked() {
        this.modalRef = this.modalService.show(AlertsDlgComponent, this.configAlerts);
        this.alertsConfigurationService.getAlertsData$(this.appCode, this.widgetId, this.medMinedFacilityKeys).subscribe(response => {
            this.modalRef.content.setAlertsData(response.alertCategories);
            this.configurationPreferences = response.configuration;
        });

        this.modalRef.content.dlgApply.pipe(take(1)).subscribe(response => {
            this.alertsConfigurationService.applyConfiguration$(this.configurationPreferences, response).subscribe(
                () => {
                    this.eventBus.emitRequestManualRefresh(this.appCode, this.widgetId);
                    console.log('MedviewConfigurationComponent: applying configuration: setUserPreferences: SUCCESS');
                },
                () => console.log('MedviewConfigurationComponent: applying configuration: setUserPreferences: FAILED'),
                () => {
                    this.modalRef.hide();
                    console.log('MedviewConfigurationComponent: applying configuration: setUserPreferences: COMPLETED');
                }
            );
        });

        this.modalRef.content.dlgCancel.pipe(take(1)).subscribe(() => {
            this.modalRef.hide();
        });
    }

    /**
     *  This funtion exports current clinical overiew grid into selected (csv) file format.
     * This event subscribed from toolbar export click event.
     *
     * @param event
     * @returns {void}
     */
    onExportButtonClicked(event: any[]) {
        const options = {};
        this.clinicalOverviewDatatableComponent.clinicalOverviewTable.exportFilename = this.resources.clinicalOverviewFileName;
        this.clinicalOverviewDatatableComponent.clinicalOverviewTable.exportCSV(options);
    }

    onColumnReorder(event: { columns: ColumnOption[]; dragIndex: number; dropIndex: number; }) {
        if (event) {
            this.clinicalOverviewConfigurationService.saveColumnOrder(event);
            this.tableColumns = this.clinicalOverviewConfigurationService.getShowHideOptions();
        }
    }

    onToggleColumn(event: { selectedColumn: ColumnOption[]; columnOptions: any; }) {
        if (event.selectedColumn.length > 0 && event.columnOptions && event.selectedColumn[0].hideOptions.enabled) {

            this.clinicalOverviewConfigurationService.synchShowHideOptions(event.selectedColumn[0]);

            const configuration = this.clinicalOverviewConfigurationService.getConfiguration();
            const visibleColumns = this.getVisibleColumns(configuration.columns);
            this.toggleColumn$.next(configuration.columns);
            this.store.dispatch(new ClinicalDashboardColumnConfig({columnOptions: visibleColumns}));
        }
    }

    onPage(event: any) {
        const config = this.clinicalOverviewConfigurationService.getConfiguration();
        config.options.pagination = event;
        this.clinicalOverviewConfigurationService.setUserConfiguration(config);
    }

    onRowExpand() {
        this.eventBus.emitRequestManualRefresh(this.appCode, this.widgetId);
    }

    onGlobalSearch(event: any) {
        const config = this.clinicalOverviewConfigurationService.getConfiguration();
        if (config) {
            config.globalSearchCriteria = event.value;
            this.clinicalOverviewConfigurationService.setUserConfiguration(config);
        }
        this.disableFilter = true;
        this.eventBus.emitRequestManualRefresh(this.appCode, this.widgetId);
    }

    onClearSearchBox(event: any) {
        this.disableFilter = false;
        const config = this.clinicalOverviewConfigurationService.getConfiguration();
        this.globalSearchCriteria = '';
        if (config) {
            config.globalSearchCriteria = undefined;
            this.clinicalOverviewConfigurationService.setUserConfiguration(config);
        }
        this.eventBus.emitRequestManualRefresh(this.appCode, this.widgetId);
    }

    private getVisibleColumns(configuration: ColumnOption[]): ColumnOption[] {
        return configuration
            .filter((col) => col.hideOptions.visible)
            .map((col) => col);
    }

    private onToggleColumnSubs() {
        return this.toggleColumn$.pipe(
                debounce(() => timer(500)))
                    .subscribe((event: any) => this.clinicalOverviewConfigurationService.persistShowHideOptions(event));
    }

    private getColumnOptionsFromPreferences(preferences: any): ColumnOptionSetting[] {
        const columnOptions = _.get(preferences, 'userPreferences.columnOptions', []);
        return columnOptions;
    }

    private setPaginationConfig(pagination?: any) {
        const config = this.clinicalOverviewConfigurationService.getConfiguration();
        if (config && config.options.pagination) {
            if (pagination) {
                config.options.pagination.first = pagination.first;
                this.clinicalOverviewConfigurationService.setUserConfiguration(config);
            }
            else {
                this.rows = config.options.pagination.rows;
            }
            this.paginationDataSubject$.next(config.options.pagination);
        }
    }

    private filterAlertResultsBySubscriptionType(alertResults: any) {
        alertResults.alerts = alertResults.alerts.map(x => {
            let facility = this.facilities.find(y => y.facility_id == x.facility_id);
            x.subscription_type = facility.subscription;
            return x;
        });
        return alertResults;
    }

    private filterData(filters: ColumnOption[], data: MedMinedModels.AlertSummaryItem[]) {
        let innerData = _.cloneDeep(data);
        for (let i = 0; i < filters.length; i++) {

            const criteria = filters[i].filterOptions.criteria
                .filter((criteria: any) => !criteria.state)
                .map((criteria: any) => criteria.value);

            if (criteria.length > 0) {
                innerData = innerData
                    .filter((data: any) => {
                        let value: any;
                        if (filters[i].subProperty) {
                            if (Array.isArray(data[filters[i].field])) {
                                for (let dat of data[filters[i].field]) {
                                    let value = dat[filters[i].subProperty];
                                    if (criteria.indexOf(value) < 0) {
                                        return true;
                                    }
                                }
                                return false;
                            } else {
                                return false;
                            }
                        }
                        else {
                            value = data[filters[i].field];
                            return criteria.indexOf(value) < 0;
                        }

                    });
            }
        }
        return innerData;
    }

    private defineFilters$({ summaries }: MedMinedModels.AlertSummariesResponse, selectedFilter?: string): Observable<any[]> {
        let filterItems = [
            {
                id: '-',
                label: this.resources.allAlerts,
                iconClass: '',
                counters: {
                    total: 0,
                    new: 0
                },
                order: 1
            },
            {
                id: 'New',
                label: this.resources.new,
                iconClass: '',
                counters: {
                    total: 0,
                    new: 0
                },
                order: 2
            },
            {
                id: 'Read',
                label: this.resources.acknowledged,
                iconClass: '',
                counters: {
                    total: 0,
                    new: 0
                },
                order: 3
            },
            {
                id: 'Pending',
                label: this.resources.pending,
                iconClass: '',
                counters: {
                    total: 0,
                    new: 0
                },
                order: 4
            },
            {
                id: 'Documented',
                label: this.resources.documented,
                iconClass: '',
                counters: {
                    total: 0,
                    new: 0
                },
                order: 5
            }
        ];
        if (summaries && summaries.length > 0) {
            filterItems.forEach(item => {
                summaries.forEach(d => {
                    if (item.id === '-') {
                        let totalCount = 0, newCount = 0;
                        d.priorities.forEach(i => {
                            newCount += i.new;
                            totalCount += this.totalAlertsCount(i);
                        });
                        item.counters.total += totalCount;
                        item.counters.new += newCount;
                    }
                    else {
                        let counterStatus = 0;
                        d.priorities.forEach(i => {
                            counterStatus += i[item.id.toLowerCase()] || 0
                        });
                        item.counters.total += counterStatus;
                        item.counters.new += counterStatus;
                    }
                });
            });

            filterItems = this.sortingService.sortData('order', 1, 'numeric', filterItems);
        }

        if (!selectedFilter || selectedFilter === '-') {
            this.currentStatus = filterItems[0];
        }
        return of(filterItems);
    }

    private totalAlertsCount(i: MedMinedModels.AlertSummaryPriorityCount) {
        return i.documented + i['new'] + i.pending + i.read;
    }

    private filterAlertsBySubscriptionType(dataSummary: MedMinedModels.AlertSummariesResponse, facilities: any) {
        dataSummary.summaries = dataSummary.summaries
            .filter(x => {
                let currentFacilitie = facilities.find(y => y.facility_id === x.facility_id);
                if (currentFacilitie) {
                    if (currentFacilitie.subscription === 'Basic' && x.ownership == 'System') {
                        x.subscriptionType = 'Basic';
                        return x;
                    }
                    else {
                        if (currentFacilitie.subscription === 'Full' && (x.ownership == 'System' || x.ownership == 'User')) {
                            x.subscriptionType = 'Advanced';
                            return x;
                        }
                    }
                }
            });
        return dataSummary;
    }

    private filterActiveAlerts(dataSummary: MedMinedModels.AlertSummariesResponse, selectedPriorityId: string) {
        dataSummary = this.filterAlertsBySubscriptionType(dataSummary, this.facilities);
        const widgets = this.configurationPreferences.userPreferences.generalSettings || [];
        const clinicalOverviewWidget = widgets.find((widget) => widget.id === this.clinicalOverviewWidgetName);
        let alertCategoriesCofiguration = null;

        if (clinicalOverviewWidget && clinicalOverviewWidget.configuration && clinicalOverviewWidget.configuration.alertCategories) {
            alertCategoriesCofiguration = [...clinicalOverviewWidget.configuration.alertCategories];
        }

        if (alertCategoriesCofiguration) {
            dataSummary.summaries = dataSummary.summaries
                .filter(x => !alertCategoriesCofiguration.find(y => y.category === x.category)
                    || !alertCategoriesCofiguration.find(y => y.category === x.category).alerts
                    .find(y => y.title == x.title && y.status === '0'));

            return { dataSummary, selectedPriorityId};
        }

        return {dataSummary, selectedPriorityId };
    }

    private userHasWriteAccess({ authorizationConfig }): boolean {

        let facilityConfig = authorizationConfig.find(item => item.synonyms
            && item.synonyms.length > 0
            && item.synonyms.findIndex(d => d.type === 'Facility' && d.source.toLowerCase() === MvdConstants.MEDMINED_PROVIDER_NAME) >= 0
            && item.permissions
            && item.permissions.length > 0
            && item.permissions.findIndex(d => d.resource === MvdConstants.CLINICALOVERVIEW_WIDGET_KEY && d.action === 'Change') >= 0);

        return !!facilityConfig;
    }

    private applyDataFilterPriority(summary: MedMinedModels.AlertSummaryItem[], filters) {
        let filterPriority = filters.find(d => d.subProperty && d.subProperty === 'priority');
        let summaryFiltered = _.cloneDeep(summary);

        if (filterPriority) {
            const criteria = filterPriority.filterOptions.criteria
                .filter((criteria: any) => !criteria.state)
                .map((criteria: any) => criteria.value);
            if (criteria.length > 0) {
                summaryFiltered.forEach(d => {
                    d.priorities = d.priorities.filter(i => criteria.indexOf(i.priority) < 0);
                });
            }
        }
        return summaryFiltered;
    }

    private alertSummaryKeyToJson(key: string): any {
        return JSON.parse('{"' + key.replace(/&/g, '","').replace(/=/g, '":"') + '"}', (key, value) => key === "" ? value : decodeURIComponent(value));
    }

    private setResources() {
        this.resources = {
            allAlerts: this.resourcesService.resource('allAlerts'),
            systemAlerts: this.resourcesService.resource('systemAlerts'),
            userAlertsHigh: this.resourcesService.resource('userAlertsHigh'),
            userAlertsMed: this.resourcesService.resource('userAlertsMed'),
            userAlertsLow: this.resourcesService.resource('userAlertsLow'),
            clinicalOverviewFileName: this.resourcesService.resource('clinicalOverviewFileName'),
            noRecordsFound: this.resourcesService.resource('noRecordsFound'),

            new: this.resourcesService.resource('new'),
            acknowledged: this.resourcesService.resource('acknowledged'),
            pending: this.resourcesService.resource('pending'),
            documented: this.resourcesService.resource('documented'),
            total: this.resourcesService.resource('total'),

            searchAllClinicalAlerts: this.resourcesService.resource('searchAllClinicalAlerts'),
        };
    }
}

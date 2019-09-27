import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { Table } from 'primeng/table';
import { Observable, Subscription, of, throwError, timer } from 'rxjs';
import { MvdMedMinedDataService } from '../../../services/mvd-medmined-data.service';
import { concatMap, catchError, map, take, switchMap } from 'rxjs/operators';
import { MedMinedModels } from '../../../shared/medmined-models';
import { ResourceService, EventBusService } from 'container-framework';
import { DataFormatPipe } from '../../../pipes/mvd-data-format.pipe';
import { MvdConstants } from '../../../shared/mvd-constants';
import { AuthenticationService } from 'bd-nav/core';
import { MedminedTransformationService } from '../../../services/medmined-transformation.service';
import { ClinicalOverviewConfigurationService } from '../mvd-clinical-overview-configuration.service';

@Component({
    selector: 'clinical-overview-datatable',
    templateUrl: './clinical-overview-datatable.component.html',
    styleUrls: ['./clinical-overview-datatable.component.scss']
})
export class ClinicalOverviewDatatableComponent implements OnInit, OnDestroy {
    @Output() onClickDocumentation = new EventEmitter();
    @Output() onClickPatient = new EventEmitter();
    @Output() onColumnReorder = new EventEmitter();
    @Output() onPageChange = new EventEmitter();
    @Output() onRowExpand = new EventEmitter();

    @Input('clinicalDashboardData')
    clinicalDashboardData$: Observable<any>;

    @Input('userHasWriteAccess')
    writeAccess: boolean;

    @Input()
    appCode: string;

    @Input()
    widgetId: string;

    @Input('defaultRows')
    rows: number = 15;

    @Input('paginationData')
    paginationData$: Observable<any>;
    private paginationSubscription: Subscription;

    @ViewChild('clinicalOverviewTable') clinicalOverviewTable: Table;

    currentAlertDetails: any = [];

    private alertUpdateSubscription: Subscription;

    clinicalDashboardData: any;

    currentUserEmail = '';

    resources: any;
    expandedRows: any = [];

    constructor(private dataService: MvdMedMinedDataService,
        private dataFormat: DataFormatPipe,
        private authenticationService: AuthenticationService,
        private transformationService: MedminedTransformationService,
        private configurationService: ClinicalOverviewConfigurationService,
        private resourcesService: ResourceService) {

    }

    ngOnInit() {
        this.setResources();
        if (this.authenticationService.accessToken["email"] != null) {
            this.currentUserEmail = this.authenticationService.accessToken["email"] as string;
        }

        if (this.alertUpdateSubscription) {
            this.alertUpdateSubscription.unsubscribe();
        }

        this.paginationSubscription = this.clinicalDashboardData$.pipe(
            switchMap((data) => this.paginationData$.pipe(
                map(pagination => ({ data, pagination }))
            ))
        ).subscribe(({ data, pagination }) => {
            this.clinicalDashboardData = data;
            const config = this.configurationService.getConfiguration();
            const { expandedAlertsIds, navigateToAlertId, options: { pagination: paginationPref } } = config;
            
            if (this.clinicalDashboardData.data.length > 0) {
                if (navigateToAlertId) {
                    // find the alert
                    let index = this.clinicalDashboardData.data.findIndex(d => d.id === navigateToAlertId);
                    if (index >= 0) {
                        const rows = paginationPref ? paginationPref.rows : 15;
                        // overwrite pagination
                        pagination = {
                            first: Math.floor(index / rows) * rows,
                            rows
                        };
                        config.options.pagination = pagination;
                        this.configurationService.setUserConfiguration(config);
                    }
                }
                if (expandedAlertsIds && expandedAlertsIds.length > 0) {
                    expandedAlertsIds.forEach(id => {
                        this.expandedRows[id] = 1;
                        let item = this.clinicalDashboardData.data.find(d => d.id === id);
                        if (item) {
                            this.onRowExpanded({ data: item }, false);
                        }
                    });

                }

                setTimeout(() => {
                    if (this.clinicalOverviewTable) {
                        this.clinicalOverviewTable.onPageChange(pagination);
                    }
                }, 0);
            }
        });

    }

    ngOnDestroy() {

        if (this.paginationSubscription) {
            this.paginationSubscription.unsubscribe();
        }
        if (this.alertUpdateSubscription) {
            this.alertUpdateSubscription.unsubscribe();
        }
    }

    showDocumentationForm(alertId: string, facilityKey: string) {
        this.onClickDocumentation.emit({ alertId, facilityKey });
    }

    showPatientForm(alertId: string, facilityKey: string) {
        this.onClickPatient.emit({ alertId, facilityKey });
    }

    onColReorder(event) {
        this.onColumnReorder.emit(event);
    }

    onRowExpanded({ data: item }, expanded: boolean = false) {

        this.currentAlertDetails[item.id] = null;
        
        if (!expanded) {
            const config = this.configurationService.getConfiguration();
            if (config && config.expandedAlertsIds) {
                config.expandedAlertsIds = [item.id];
                this.configurationService.setUserConfiguration(config);
            }

            this.dataService.getMedMinedAlertDetail$(item.id, item.mmFacilityId, this.appCode, this.widgetId).pipe(
                catchError(error => throwError({
                    error
                })),
                concatMap((result) => {
                    return of(result[0].alert);
                }),
                take(1)
            )
            .subscribe((result: MedMinedModels.AlertDetail) => {
                this.currentAlertDetails[item.id] = this.createViewDetails(result);
            }, (error) => {
                console.log("Error trying to get alert details: ", error);
            });
        }
    }

    onPage(event: any) {
        this.onPageChange.emit(event);
    }

    onRowCollapse(event) {
        let item: MedMinedModels.AlertDetailHeaderItem = event.data;
        const config = this.configurationService.getConfiguration();
        if (config && config.expandedAlertsIds) {
            let index = config.expandedAlertsIds.findIndex(s => s === item.id);
            if (index >= 0) {
                config.expandedAlertsIds.splice(index, 1);
                this.configurationService.setUserConfiguration(config);
            }
        }
        if (item.originalStatus === this.resources.new && item.status === this.resources.read) {
            this.onRowExpand.emit();
        }

    }

    private createViewDetails(alert: MedMinedModels.AlertDetail) {
        let detailsView = {
            id: alert.alert_id,
            facilityKey: alert.facility_id,
            info: []
        };

        if (alert.lab_results && alert.lab_results.length > 0) {

            let labData = [];

            alert.lab_results.forEach(d => {
                let itemsData = [
                    {
                        name: 'Test Name: ',
                        value: d.test_name
                    },
                    {
                        name: 'Resulted Date: ',
                        value: this.dataFormat.transform(d.resulted_date, MvdConstants.PIPE_TYPES_DATETIME)
                    },
                    {
                        name: 'Raw Value: ',
                        value: d.raw_value
                    },
                    {
                        name: 'Interpretation: ',
                        value: d.interpretation || ''
                    }];

                if (d.reference_range)
                {
                    itemsData.push({
                        name: 'Reference Range: ',
                        value: d.reference_range
                    });
                }
                labData.push({
                    itemsData: itemsData
                });
            });

            detailsView.info.push({
                title: this.resources.labResults,
                data: labData
            });

        }
        if (alert.organisms && alert.organisms.length > 0) {

            let labData = [];
            alert.organisms.forEach(d => {
                labData.push({
                    itemsData: [
                        {
                            name: 'Resulted Date: ',
                            value: this.dataFormat.transform(d.resulted_date, MvdConstants.PIPE_TYPES_DATETIME)
                        },
                        {
                            name: 'Organism: ',
                            value: d.organism
                        },
                        {
                            name: 'Site Test: ',
                            value: d.site_test
                        }
                    ]
                });
            });

            detailsView.info.push({
                title: this.resources.organism,
                data: labData
            });
        }
        if (alert.drugs && alert.drugs.length > 0) {

            let labData = [];
            alert.drugs.forEach(d => {
                labData.push({
                    itemsData: this.mapDrugDetailsItem(d)
                });
            });

            detailsView.info.push({
                title: this.resources.drug,
                data: labData
            });

            //if (alert.drugs[counter].ordering_physician) {
            //    detailsView.push({
            //        title: 'Ordering Physician:',
            //        data: [{
            //            name: '',
            //            value: alert.drugs[counter].ordering_physician
            //        }]
            //    });
            //}
        }

        return detailsView;
    }

    private mapDrugDetailsItem(d) {
        return [
            {
                name: 'Drug: ',
                value: d.drug
            },
            {
                name: 'Started On: ',
                value: this.dataFormat.transform(d.started_on, MvdConstants.PIPE_TYPES_DATETIME)
            },
            {
                name: 'Stopped On: ',
                value: d.stopped_on ? this.dataFormat.transform(d.stopped_on, MvdConstants.PIPE_TYPES_DATETIME) : ''
            },
            {
                name: 'Days: ',
                value: d.days
            },
            {
                name: 'Dose: ',
                value: this.transformationService.mapDrugDose(d)
            },
            {
                name: 'Interval: ',
                value: this.transformationService.mapDrugInterval(d)
            },
            {
                name: 'Route: ',
                value: d.route
            },
            {
                name: 'Components: ',
                value: this.transformationService.getDrugComponents(d.components)
            },
            {
                name: 'Ordering Physician: ',
                value: d.ordering_physician
            }
        ];
    }

    private setResources() {
        this.resources = {
            unknown: this.resourcesService.resource('unknown'),
            noRecordsFound: this.resourcesService.resource('noRecordsFound'),
            documentationButton: this.resourcesService.resource('documentationButton'),
            patientInfoButton: this.resourcesService.resource('patientInfoButton'),
            labResults: this.resourcesService.resource('labResults'),
            organism: this.resourcesService.resource('organism'),
            drug: this.resourcesService.resource('drug'),
            read: this.resourcesService.resource('acknowledged'),
            new: this.resourcesService.resource('new'),
            acknowledgeButton: this.resourcesService.resource('acknowledgeButton'),
            cancel: this.resourcesService.resource('cancel')
        };
    }

    acknowledge(item: any) {
        item.status = this.resources.read;

        this.alertUpdateSubscription = this.dataService.getMedMinedAlertDetail$(item.id, item.mmFacilityId, this.appCode, this.widgetId).pipe(
            catchError(error => throwError({
                error,
                getDetailsSuccess: false,
                acknowledgedSuccess: false
            })),
            concatMap((result) => {
                if (result[0].alert.status === this.resources.new || result[0].alert.status === 'New') {
                    return this.dataService.updateAlertStatus$({ alert_id: item.id, status: 'Read' }, this.appCode, this.widgetId, result[0].alert.facility_id).pipe(
                        catchError(error => throwError({
                            error,
                            getDetailsSuccess: true,
                            acknowledgedSuccess: false,
                            details: result[0].alert
                        })),
                        map(() => result[0].alert)
                    )
                }
                return of(result[0].alert);
            })
        )
        .subscribe((result: MedMinedModels.AlertDetail) => {
            if (item.status === this.resources.new) {

                item.status = this.resources.read;
            }
            this.currentAlertDetails[item.id] = this.createViewDetails(result);
            if(this.clinicalOverviewTable.isRowExpanded(item))
            {
                this.clinicalOverviewTable.toggleRow(item);
            }
        }, (error) => {
                item.status = this.resources.new;
            if (!error.getDetailsSuccess) {
                console.log("Error trying to get alert details: ", error);
            }
            else {
                console.log("Error when tried to update alert status: ", error);
                console.log(error.details);
                this.currentAlertDetails[item.id] = this.createViewDetails(error.details);
            }
        });
    }
}

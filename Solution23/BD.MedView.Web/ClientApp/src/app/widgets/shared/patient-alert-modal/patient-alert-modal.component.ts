import { Component, Output, EventEmitter, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as _ from 'lodash';

import { ResourceService } from 'container-framework';
import { MenuService } from 'bd-nav/core';
import { MenuItem } from 'bd-nav/models';

import { MedMinedModels } from '../medmined-models';
import { DataFormatPipe } from '../../pipes/mvd-data-format.pipe';
import { MedminedTransformationService } from '../../services/medmined-transformation.service';
import { MvdMedMinedDataService } from '../../services/mvd-medmined-data.service';
import { MvdConstants } from '../mvd-constants';
import { AppState } from '../../store';
import { ClinicalDashboardItemSelected } from '../../store/clinical-dashboard/clinical-dashboard.actions';
import { MvdListElement } from '../mvd-models';
import { ClinicalOverviewConfigurationService } from '../../medview/clinical-overview/mvd-clinical-overview-configuration.service';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap';

@Component({
    selector: 'patient-alert-modal',
    templateUrl: './patient-alert-modal.component.html',
    styleUrls: ['patient-alert-modal.component.scss']
})
export class PatientAlertComponent implements OnInit, OnDestroy {
    @Output()
    onClose = new EventEmitter();

    @Input('alertsDetailsIds')
    alertsDetailsIds: MedMinedModels.MedMinedAlertHeader[] =[];

    @Input()
    appCode: string;

    @Input()
    widgetId: string;

    @Input()
    modalRef: BsModalRef;

    private alertsDetailsSubscription: Subscription;
    private menuSubscription: Subscription;

    currentPage: any;
    alertTitle: string;
    loading = false;
    resources: any;
    showError = false;
    totalRecords = 0;
    

    constructor(private dataFormat: DataFormatPipe,
        private transformationService: MedminedTransformationService,
        private dataService: MvdMedMinedDataService,
        private resourceService: ResourceService,
        private store: Store<AppState>,
        private router: Router,
        private configurationService: ClinicalOverviewConfigurationService,
        private menuService: MenuService
    ) {
        this.setResources();
    }

    ngOnInit() {
        
    }

    ngOnDestroy() {
        if (this.alertsDetailsSubscription) {
            this.alertsDetailsSubscription.unsubscribe();
        }
        if (this.menuSubscription) {
            this.menuSubscription.unsubscribe();
        }
    }

    setAlertsDetailsIds(data: MedMinedModels.MedMinedAlertHeader[]) {
        this.alertsDetailsIds = data;
        this.totalRecords = data.length;
        this.paginate({ first: 0, rows: 1 });
    }

    private createViewDetails(alert: MedMinedModels.AlertDetail, pageData: MedMinedModels.MedMinedAlertHeader) {
        const detailsView = {
            drugInfo: [],
            labInfo: [],
            organismInfo: [],
            patientName: '',
            alertId: alert.alert_id,
            facilityId: pageData.medMinedfacilityId,
            itemKey: `title=${pageData.alertTitle}&category=${pageData.alertCategory}&priority=${alert.priority}&ownership=${alert.ownership}`,
        };

        if (!alert) {
            return detailsView;
        }

        if (alert.drugs && alert.drugs.length > 0) {
            detailsView.drugInfo = alert.drugs.map((drugItem: MedMinedModels.Drug) => {
                return {
                    drugName: drugItem.drug,
                    orderingPhysician: drugItem.ordering_physician || '',
                    startDate : this.dataFormat.transform(drugItem.started_on, MvdConstants.PIPE_TYPES_DATETIME) || '',
                    endDate : drugItem.stopped_on ? this.dataFormat.transform(drugItem.stopped_on, MvdConstants.PIPE_TYPES_DATETIME) : '',
                    drugDose: this.transformationService.mapDrugDose(drugItem)
                };
            });
        }

        if (alert.lab_results && alert.lab_results.length > 0) {
            detailsView.labInfo = alert.lab_results.map((labItem: MedMinedModels.LabResult) => {
                return {
                    testName: labItem.test_name || '',
                    rawValue: labItem.raw_value || '',
                    interpretation: labItem.interpretation || '',
                    resultedDate: this.dataFormat.transform(labItem.resulted_date, MvdConstants.PIPE_TYPES_DATETIME) || '',
                    referenceRange: labItem.reference_range || '',
                };
            });
        }

        if (alert.organisms && alert.organisms.length > 0) {

            detailsView.organismInfo = alert.organisms.map((orgItem: MedMinedModels.Organism) => {
                    return {
                        organism: orgItem.organism || '',
                        siteTest: orgItem.site_test || '',
                        resultedDate: this.dataFormat.transform(orgItem.resulted_date, MvdConstants.PIPE_TYPES_DATETIME),
                    };
            });
        }

        if (alert.patient) {
            detailsView.patientName = alert.patient.name;
        }
        return detailsView;
    }


    closeModal() {
        this.onClose.emit();
    }

    paginate(event) {
        this.loading = true;
        const pageData = this.alertsDetailsIds[event.first];
        this.alertsDetailsSubscription = this.dataService
            .getMedMinedAlertDetail$(pageData.alertId, pageData.medMinedfacilityId, this.appCode, this.widgetId)
            .subscribe((response: any[]) => {
                const [firstAlertDedtail] = response;
                const { alert } = firstAlertDedtail;
                this.showError = false;
                this.alertTitle = pageData.alertTitle;
                this.loading = false;
                this.currentPage = this.createViewDetails(alert, pageData);
            },
            (error) => {
                this.showError = true;
                this.loading = false;
                this.currentPage = undefined;
                console.log(error);
            });
    }

    navigateToAlert({ itemKey, alertId, facilityId }) {
        this.modalRef.hide();
        let itemSelected: MvdListElement = {
            key: itemKey,
            facilityKeys: [facilityId],
            priority: '', counter: 0, title: '', label: '', value: ''
        };

        this.store.dispatch(new ClinicalDashboardItemSelected({ itemSelected: itemSelected, fromSummary: true }));

        // preserve alert Id to be found and expanded
        let config = this.configurationService.getConfiguration();
        config.navigateToAlertId = `${alertId}`;
        config.expandedAlertsIds = [`${alertId}`];
        config.globalSearchCriteria = undefined;
        if (config && config.filters) {
            // Clear filters before navigation
            config.filters = this.configurationService.getDataFiltersConfiguration();
        }

        this.configurationService.setUserConfiguration(config);

        // Navigate to Clinical Alerts
        this.menuSubscription = this.menuService.getTopMenuList().pipe(
            take(1),
            map((items: MenuItem[]) => {
                let item = items.find(a => a.code.toLowerCase() === MvdConstants.CLINICALOVERVIEW_MENU_CODE.toLowerCase());
                if (item)
                    return [item];
                return [];
            })
        ).subscribe(response => {
            if (response && response.length > 0) {

                this.menuService.setActiveMenu(response[0]);

            }
            else {
                this.router.navigate(['Unauthorized']);
            }
        });
    }

    private setResources() {
        this.resources = {
            drug: this.resourceService.resource('drug'),
            labResults: this.resourceService.resource('labResults'),
            organism: this.resourceService.resource('organism'),
            patientAlertModalTitle: this.resourceService.resource('patientAlertModalTitle'),
            patientAlertCounterTitle: this.resourceService.resource('patientAlertCounterTitle'),
            unableToRetrieveDetails: this.resourceService.resource('unableToRetrieveDetails'),
            drugName: this.resourceService.resource('drugName'),
            drugAmount: this.resourceService.resource('drugAmount'),
            startDate: this.resourceService.resource('startDate'),
            endDate: this.resourceService.resource('endDate'),
            orderingPhysician: this.resourceService.resource('orderingPhysician'),
            testName: this.resourceService.resource('testName'),
            value: this.resourceService.resource('value'),
            resultedDate: this.resourceService.resource('resultedDate'),
            referenceRange: this.resourceService.resource('referenceRange'),
            mappedSourceTest: this.resourceService.resource('mappedSourceTest'),
            clickHereToOpenAlert: this.resourceService.resource('clickHereToOpenAlert')
        };
    }
}

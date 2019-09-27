import { Component, Input, OnInit, OnDestroy } from "@angular/core";
import { Router } from '@angular/router';

import { EventBusService, MainContainerComponent } from "container-framework";
import { MenuService } from 'bd-nav/core';
import { MenuItem } from 'bd-nav/models';

import { Subscription, Observable, of } from "rxjs";
import { filter, switchMap, skipWhile, map, tap, take, concatMap } from "rxjs/operators";

import { Store, select } from "@ngrx/store";
import { AppState } from "../../store";
import { ClinicalAlertSummaryDataLoaded } from "../../store/clinical-dashboard/clinical-dashboard.actions";
import { selectDataSummary } from "../../store/clinical-dashboard/clinical-dashboard.selectors";

import { MedminedTransformationService } from "../../services/medmined-transformation.service";
import { MvdMedMinedDataService } from "../../services/mvd-medmined-data.service";
import { MedMinedModels } from "../../shared/medmined-models";
import { MvdListElement } from "../../shared/mvd-models";
import { MvdConstants } from '../../shared/mvd-constants';

import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { UserConfigurationService } from "../../../services/user-configuration.service";
import { AlertsDlgComponent } from '../clinical-overview/alerts-dlg/alerts-dlg.component';
import { AlertsConfigurationService } from '../clinical-overview/alerts-configuration-services/alerts-configuration.service';
import { ResourceService } from "container-framework";
import { ClinicalOverviewConfigurationService } from '../clinical-overview/mvd-clinical-overview-configuration.service';
import { DashboardHeaderService } from "../../services/mvd-dashboard-header.service";

@Component({
    selector: 'mvd-critical-alerts',
    templateUrl: './mvd-critical-alerts.component.html',
    styleUrls: [
        './mvd-critical-alerts.component.scss'
    ]
})
export class CriticalAlertsComponent implements OnInit, OnDestroy {
    public static ComponentName = "medViewCriticalAlerts";
    public modalRef: BsModalRef;

    @Input() appCode: string;
    @Input() widgetId: string;
    @Input() user: string;
    @Input() mainContainer: MainContainerComponent;

    private eventBusStateSubscription: Subscription;
    private menuSubscription: Subscription;
    private autoRefresh: string;
    private manualRefresh: string;

    private clinicalOverviewWidgetName = MvdConstants.CLINICALOVERVIEW_WIDGET_KEY;
    private configurationPreferences: any;
    private alertCategoriesCofiguration: any;

    private configAlerts = {
        animated: true,
        keyboard: true,
        backdrop: true,
        ignoreBackdropClick: false,
        class: 'white doc-form modal-lg'
    };

    summaryData$: Observable<MedMinedModels.SummaryCategory[]>;

    resources = {
        unacknowledged: this.resourceService.resource('unacknowledged'),
        total: this.resourceService.resource('total')
    }

    constructor(
        private eventBus: EventBusService,
        private store: Store<AppState>,
        private dataService: MvdMedMinedDataService,
        private transformationService: MedminedTransformationService,
        private router: Router,
        private menuService: MenuService,
        private userConfigurationService: UserConfigurationService,
        private alertsConfigurationService: AlertsConfigurationService,
        private clinicalOverviewConfigurationService: ClinicalOverviewConfigurationService,
        private modalService: BsModalService,
        private resourceService: ResourceService,
        private headerService: DashboardHeaderService
    ) {

    }

    ngOnInit() {
        this.headerService.cleanHeader(this.appCode);

        this.autoRefresh = this.eventBus.subcribeRequestAutoRefresh(this.appCode, this.widgetId);
        this.manualRefresh = this.eventBus.subcribeRequestManualRefresh(this.appCode, this.widgetId);
        this.eventBusStateSubscription = this.eventBus.eventBusState$
            .pipe(
                filter((state: any) => state.target === this.autoRefresh || state.target === this.manualRefresh),
                switchMap(() => this.userConfigurationService.getCurrentConfig()),
                concatMap(userConfig => of({ facilities: this.transformationService.processFacilities(userConfig), preferences: userConfig })),
                concatMap(({ facilities, preferences }) =>
                    this.dataService.getMedMinedSummaryAlerts$(this.appCode, this.widgetId, facilities.facilities, '').pipe(
                        map(summaries => ({ summaries, preferences }))
                    ))
            )
            .subscribe(({ summaries, preferences }) => {
                this.headerService.updateHeader(this.appCode, preferences);
                this.configurationPreferences = preferences;
                this.store.dispatch(new ClinicalAlertSummaryDataLoaded({ data: summaries }));
                this.eventBus.emitLoadDataSuccess(this.appCode, this.widgetId);
            });

        this.summaryData$ = this.store.pipe(
            select(selectDataSummary),
            skipWhile((dataSummary) => !dataSummary || !this.configurationPreferences),
            map(dataSummary => this.filterActiveAlerts(dataSummary)),
            tap(({ summaries }) => {
                if (summaries.length === 0) {
                    this.eventBus.emitNoDataAvailable(this.appCode, this.widgetId);
                }
            }),
            map(({ summaries }) => this.transformationService.dataSummaryTransform(summaries)),
            map(summaries => {
                summaries.forEach(t => t.selected = true);
                return summaries;
            })
        );

    }

    ngOnDestroy() {
        this.eventBusStateSubscription.unsubscribe();
        if (this.menuSubscription) {
            this.menuSubscription.unsubscribe();
        }
    }

    itemSelectedChanged(itemSelected: MvdListElement) {
        const config = this.clinicalOverviewConfigurationService.getConfiguration();
        if (config) {
            config.filters = this.clinicalOverviewConfigurationService.getDataFiltersConfiguration();
            config.globalSearchCriteria = undefined;
            this.clinicalOverviewConfigurationService.setUserConfiguration(config);
        }

        this.menuSubscription = this.menuService.getTopMenuList().pipe(
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
        })
    }

    onWidgetSettingsClicked(){
        this.modalRef = this.modalService.show(AlertsDlgComponent, this.configAlerts);

        this.userConfigurationService.getCurrentConfig().pipe(
            concatMap(userConfig => of(this.transformationService.processFacilities(userConfig))),
            concatMap(({ facilities }) => this.alertsConfigurationService.getAlertsData$(this.appCode, this.widgetId, facilities))
        ).subscribe(response => {
            this.modalRef.content.setAlertsData(response.alertCategories);
            this.configurationPreferences = response.configuration;
        });

        this.modalRef.content.dlgApply.pipe(take(1)).subscribe(response => {
            this.alertsConfigurationService.applyConfiguration$(this.configurationPreferences, response).subscribe(
                (response) => {
                    //this.modalRef.hide();
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

    private filterActiveAlerts(dataSummary: MedMinedModels.AlertSummariesResponse){
        dataSummary.summaries = dataSummary.summaries.filter(x => x.ownership === MvdConstants.ALERT_SYSTEM_OWNERSHIP);
        const widgets = this.configurationPreferences.userPreferences.generalSettings || [];
        const clinicalOverviewWidget = widgets.find((widget) => widget.id === this.clinicalOverviewWidgetName);
        let alertCategoriesCofiguration = null;

        if (clinicalOverviewWidget && clinicalOverviewWidget.configuration && clinicalOverviewWidget.configuration.alertCategories) {
            alertCategoriesCofiguration = [...clinicalOverviewWidget.configuration.alertCategories];
        }

        if(alertCategoriesCofiguration){
            dataSummary.summaries = dataSummary.summaries.filter(x => !alertCategoriesCofiguration.find(y => y.category === x.category)
                    || !alertCategoriesCofiguration.find(y => y.category === x.category).alerts.find(y => y.title == x.title && y.status === '0'));

            return dataSummary;
        }

        return dataSummary;
    }
}

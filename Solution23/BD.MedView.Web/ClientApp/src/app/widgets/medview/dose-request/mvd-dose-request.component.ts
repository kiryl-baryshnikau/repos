import { Component, Input, OnDestroy, OnInit} from '@angular/core';

import { Subscription, Observable, throwError, iif, of } from 'rxjs';
import { filter, map, switchMap, retry, catchError, tap } from 'rxjs/operators';

import { UserConfigurationService } from '../../../services/user-configuration.service';
import { DoseRequestTransformationService } from './shared/mvd-dose-request-transformation.service';

import { EventBusService, GatewayService, ResourceService, MainContainerComponent } from 'container-framework';
import { DispensingFacilityKeyTranslatorService } from '../../services/mvd-dispensing-facility-key-translator.service';
import { DashboardHeaderService } from '../../services/mvd-dashboard-header.service';

import { MvdConstants } from '../../shared/mvd-constants';

import * as _ from 'lodash';

@Component({
    selector: 'mvd-dose-request',
    templateUrl: './mvd-dose-request.component.html',
    styleUrls: ['./mvd-dose-request.component.scss']
})
export class DoseRequestComponent implements OnDestroy, OnInit {

    public static ComponentName = "mvdDoseRequestComponent";

    public iconClassCallback: Function;

    @Input() appCode: string;
    @Input() widgetId: string;
    @Input() user: string;

    @Input() mainContainer: MainContainerComponent;

    errorMessage: string;
    doseRequests: any;

    private widgetDataSubscription: Subscription;
    private autoRefresh: string;
    private manualRefresh: string;

    constructor(
        private dataService: GatewayService,
        private eventBus: EventBusService,
        private resourcesService: ResourceService,
        private userConfigurationService: UserConfigurationService,
        private doseRequestTransformationService: DoseRequestTransformationService,
        private facilityKeyService: DispensingFacilityKeyTranslatorService,
        private headerService: DashboardHeaderService) {

        this.iconClassCallback = this.getIconClass.bind(this);
    }

    ngOnInit() {
        this.headerService.cleanHeader(this.appCode);
        this.autoRefresh = this.eventBus.subcribeRequestAutoRefresh(this.appCode, this.widgetId);
        this.manualRefresh = this.eventBus.subcribeRequestManualRefresh(this.appCode, this.widgetId);
        this.widgetDataSubscription = this.widgetData$().subscribe(
            data => {
                this.doseRequests = data;
                if (data && data.data && data.data.length > 0) {
                    this.eventBus.emitLoadDataSuccess(this.appCode, this.widgetId);
                } else {
                    this.eventBus.emitNoDataAvailable(this.appCode, this.widgetId);
                }
            },
            (error) => this.emitLoadDataFail(error)
        );
    }

    private widgetData$(): Observable<any> {
        const eventBus$ = this.eventBus.eventBusState$.pipe(
            filter(state => state.target === this.autoRefresh || state.target === this.manualRefresh)
        );

        const facilities$ = this.userConfigurationService.getCurrentConfig().pipe(
            map(userConfig => {
                this.headerService.updateHeader(this.appCode, userConfig);
                const authorizationConfig = userConfig.authorizationConfig;
                const facilitiesConfig = _.get(userConfig, 'userPreferences.facilities', []) || [];

                return this.facilityKeyService.translateFacilityKeys(facilitiesConfig, authorizationConfig) || [];
            })
        );

        const emptyResponse$ = () => of([]);

        const pDataWithBody$ = (response: { body: any; }) => of(response).pipe(
            map(() => this.doseRequestTransformationService.transform(response.body))
        );

        const pData$ = (facilities: any[]) => this.dataService.loadData([this.createRequest(facilities)]).pipe(
            map(([response = {}]: any[]) => response),
            switchMap(response => iif(() => response && response.body && response.body.length > 0,
                pDataWithBody$(response),
                emptyResponse$()
            )),
        );

        const providerData$ = facilities$.pipe(
            switchMap(facilities => {
                return iif(() => facilities.length > 0,
                    pData$(facilities),
                    emptyResponse$()
                );
            }),
        );

        return eventBus$.pipe(
            switchMap(() => providerData$),
            catchError(error => {
                this.emitLoadDataFail(error);
                return throwError(error);
            }),
            retry()
        );
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
            api: "DoseRequest",
            queryParams: [
                {
                    name: 'facilityKeys',
                    value: facilityParameter
                }
            ]
        };
    }

    private getIconClass(item: any) {
        let cssClass = 'fa';
        if (item.value && !isNaN(item.value) && Number(item.value) > 0) {
            cssClass += " fa-circle fa-circle-blue";
        }
        return cssClass;
    }

    emitLoadDataFail(error: any) {
        console.log('DoseRequestComponent: Data Load Failed:', error);
        this.errorMessage = error;
        this.eventBus.emitLoadDataFail(this.appCode, this.widgetId);
    }

    ngOnDestroy() {
        this.widgetDataSubscription.unsubscribe();
    }

    onClick(item: any) {
        this.mainContainer.showDetailView("mvdDoseRequestDetailComponent", item);
    }
}

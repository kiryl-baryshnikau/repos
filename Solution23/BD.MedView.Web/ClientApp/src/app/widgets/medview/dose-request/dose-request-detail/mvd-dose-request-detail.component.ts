import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription, of, iif, throwError } from 'rxjs';
import { filter, map, switchMap, catchError, retry } from 'rxjs/operators';

import { UserConfigurationService } from '../../../../services/user-configuration.service';
import { DoseRequestDetailTransformationService } from '../shared/mvd-dose-request-detail-transformation.service';
import { DoseRequestDetailConfigurationService } from '../shared/mvd-dose-request-detail-configuration.service';
import { DoseRequestTableComponent } from './dose-request-table/mvd-dose-request-table.component';
import { DispensingFacilityKeyTranslatorService } from '../../../services/mvd-dispensing-facility-key-translator.service';
import * as _ from 'lodash';
import { MvdConstants } from '../../../shared/mvd-constants';
import { ContextConstants, ContextService, EventBusService, GatewayService,
     ResourceService, MainContainerComponent } from 'container-framework';

@Component({
    selector: 'mvd-dose-request-detail',
    templateUrl: './mvd-dose-request-detail.component.html',
    styleUrls: ['./mvd-dose-request-detail.component.scss']
})
export class DoseRequestDetailComponent implements OnInit, OnDestroy {

    public static ComponentName = 'mvdDoseRequestDetailComponent';

    @Input() appCode: string;
    @Input() widgetId: string;
    @Input() user: string;
    @Input() selectedItem: string;
    @ViewChild(DoseRequestTableComponent) tableComponent: DoseRequestTableComponent;
    @Input() mainContainer: MainContainerComponent;

    detailPortletName: string;
    totals: any;
    items: any;
    detailData: any;
    selectedDetail: any;
    contextSubscription: Subscription;

    errorMessage: string;

    doseRequestDetail: any[] = [];
    columns: any[] = [];
    resources: any;

    trackAndDeliverySupported: boolean = false;

    private widgetDataSubscription: Subscription;
    private autoRefresh: string;
    private manualRefresh: string;

    constructor(private dataService: GatewayService,
        private eventBus: EventBusService,
        private resourcesService: ResourceService,
        private userConfigurationService: UserConfigurationService,
        private doseRequestDetailTransformationService: DoseRequestDetailTransformationService,
        private doseRequestDetailConfigurationService: DoseRequestDetailConfigurationService,
        private contextService: ContextService,
        private facilityKeyService: DispensingFacilityKeyTranslatorService) {
        this.resources = this.getResources();
    }

    ngOnInit(): void {
        this.contextSubscription = this.contextService.getContext(this.appCode).subscribe((data) => {
            const detailViewInfo = data.get(ContextConstants.DETAIL_VIEW_PAYLOAD);
            if (detailViewInfo) {
                this.selectedItem = detailViewInfo.key;
            }
        });

        console.log(`DoseRequestDetailComponent: appCode  = ${this.appCode} widgetId = ${this.widgetId} user = ${this.user}`);
        this.autoRefresh = this.eventBus.subcribeRequestAutoRefresh(this.appCode, this.widgetId);
        this.manualRefresh = this.eventBus.subcribeRequestManualRefresh(this.appCode, this.widgetId);
        this.widgetDataSubscription = this.widgetData$().subscribe(
            widgetData => {
                console.log('DoseRequestDetailComponent: Data retrieved', widgetData);
                if (widgetData.body.length > 0) {
                    this.initializeComponent(widgetData.body, widgetData.maskData);
                    this.eventBus.emitLoadDataSuccess(this.appCode, this.widgetId);
                } else {
                    this.cleanWidget();
                    this.eventBus.emitNoDataAvailable(this.appCode, this.widgetId);
                }
            },
            (error) => this.emitLoadDataFail(error)
        );
    }

    private widgetData$() {
        const eventBus$ = this.eventBus.eventBusState$.pipe(
            filter(state => state.target === this.autoRefresh || state.target === this.manualRefresh)
        );

        const config$ = this.userConfigurationService.getCurrentConfig().pipe(
            map(config => {
                const authorizationConfig = config.authorizationConfig;
                const facilitiesConfig = _.get(config, 'userPreferences.facilities', []) || [];

                const facilities = this.facilityKeyService.translateFacilityKeys(facilitiesConfig, authorizationConfig) || [];
                return { facilities: facilities, userConfig: config };
            })
        );

        const pDataWithBody$ = (response, userConfig) => of(response).pipe(
            map(() => {
                const maskData: boolean = _.get(userConfig, 'userPreferences.maskData', false);
                return { body: response.body, maskData: maskData };
            })
        );

        const emptyResult$ = of({body: [], maskData: false});

        const pData$ = (facilities: any[], userConfig: any) => this.dataService.loadData([this.createRequest(facilities)]).pipe(
            map(([providerData = {}]) => providerData),
            switchMap(providerData => iif(() => providerData && providerData.body && providerData.body.length > 0,
                pDataWithBody$(providerData, userConfig),
                emptyResult$
            ))
        );

        const providerData$ = config$.pipe(
            switchMap(currentConfig => {
                return iif(() => currentConfig.facilities.length > 0,
                    pData$(currentConfig.facilities, currentConfig.userConfig),
                    emptyResult$
                );
            })
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

    cleanWidget() {
        this.items = [];
        this.totals = 0;
        this.detailData = [];
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
            api: "DoseRequestDetail",
            queryParams: [
                {
                    name: 'facilityKeys',
                    value: facilityParameter
                }
            ]
        };
    }

    emitLoadDataFail(error: any) {
        console.log('DoseRequestDetailComponent: Data Load Failed:', error);
        this.errorMessage = error;
        this.eventBus.emitLoadDataFail(this.appCode, this.widgetId);
    }

    ngOnDestroy(): void {
        this.widgetDataSubscription.unsubscribe();
    }

    calulateTotals(items: any) {
        let totalRequestsCount = 0;
        let totalNewRequestsCount = 0;

        items.forEach(item => {
            totalRequestsCount += item.allItemsCount;
            totalNewRequestsCount += item.newItemsCount;
        });
        return {
            totalRequestsCount: totalRequestsCount,
            totalNewRequestsCount: totalNewRequestsCount
        };
    }

    initializeComponent(initialData: any, maskData: boolean) {
        this.doseRequestDetailTransformationService.maskData = maskData || false;
        const configuration = this.doseRequestDetailConfigurationService.getConfiguration();
        if (configuration) {
            this.columns = configuration.columns
                .filter((col) => col.hideOptions.visible)
                .map((col) => col);
            this.items = [...this.doseRequestDetailTransformationService.transform(initialData)];
            this.totals = this.calulateTotals(this.items);
            this.setSelectedItems();
            this.tableComponent.recoverTableState(configuration);
        }

    }

    getResources(): any {
        return {
            doseRequestExportFileName: this.resourcesService.resource('doseRequestExportFileName')
        };
    }

    onSelectionChanged(event: any) {
        if (event) {
            this.detailData = this.doseRequestDetailTransformationService.transformDetails(event);
            this.detailData = [...event];
            this.selectedItem = event.careUnit;
        }
    }

    /**
     * This function exports current iv status grid into selected (csv) file format.
     * In case of any filter applied to the current gird, it would be reflected in the export as well.
     * This event subscribed from toolbar export click event.
     *
     * @param event
     * @returns {void}
     */
    onExportButtonClicked(event: any[]): void {
        const options = {};
        let tempTable = _.cloneDeep(this.tableComponent.dataTable);
        const requestDurationColumnIndex = tempTable.columns.map((col) => {
            return col.field;
        }).indexOf('requestDuration');
        tempTable.columns[requestDurationColumnIndex].field = 'durationDisplayFormatted';
        tempTable.exportFilename = this.resources.doseRequestExportFileName;
        tempTable.exportCSV(options);
    }

    setSelectedItems() {
        if (this.items && this.items.length > 0) {
            let found = this.items.find((item:any) => {
                return item.careUnit === this.selectedItem;
            });
            this.selectedItem = found.careUnit;
            this.detailData = this.doseRequestDetailTransformationService.transformDetails(found);
            this.detailData = [...(found || this.items[0]).sort((a, b) => a.requestDuration - b.requestDuration)];
            this.selectedDetail = found || null;
        }
        else {
            this.detailData = [];
        }
    }
}

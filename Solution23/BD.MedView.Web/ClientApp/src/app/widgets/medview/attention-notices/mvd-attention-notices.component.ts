import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { EventBusService, GatewayService, MainContainerComponent, ResourceService } from 'container-framework';
import { Subscription, timer, throwError, merge, of } from 'rxjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { UserConfigurationService } from '../../../services/user-configuration.service';
import { PorletCountHandlerService } from '../../../widgets/services/mvd-porletcount-handler.service';
import { DashboardHeaderService } from '../../services/mvd-dashboard-header.service';
import { DispensingDataTransformationService } from '../../services/mvd-dispensing-data-transformation-service';
import { DispensingFacilityKeyTranslatorService } from '../../services/mvd-dispensing-facility-key-translator.service';
import { MvdConstants } from '../../shared/mvd-constants';
import * as models from '../../shared/mvd-models';
import {
    AttentionNoticesExtendedViewComponent,
} from './attention-notices-extendedview/mvd-attention-notices-extendedview.component';
import { AttentionNoticesSummaryComponent } from './attention-notices-summary/mvd-attention-notices-summary.component';
import { AttentionNoticesTransformationService } from './shared/mvd-attention-notices-transformation.service';
import { AttentionNoticesConfiguration } from './attention-notices-configuration/mvd-attention-notices-configuration.component';
import { switchMap, first, take, filter, tap, catchError, retry, map } from 'rxjs/operators';
import * as _ from 'lodash';

import { AttentionNoticeKeyGeneratorService } from '../../services/mvd-attention-notice-key-generator.service';
import { AttentionNoticeStatusesService, AttentionNoticeStatus } from '../../services/mvd-attention-notice-statuses.service';
import { AttentionNotice } from '../../services/mvd-attention-notice-entities';
import { RolePermissionsValidatorService } from '../../services/mvd-role-permissions.service';

@Component({
    selector: 'mvd-attention-notices',
    templateUrl: './mvd-attention-notices.component.html',
    styleUrls: ['./mvd-attention-notices.component.scss']
})
export class AttentionNoticesComponent implements OnDestroy, OnInit {

    public static ComponentName = 'mvdAttentionNoticesComponent';
    public iconClassCallback: Function;
    public borderClassCallback: Function;

    @ViewChild('summary') summaryComponent: AttentionNoticesSummaryComponent;
    @ViewChild('extendedView') extendedViewComponent: AttentionNoticesExtendedViewComponent;

    @Input() appCode: string;
    @Input() widgetId: string;
    @Input() user: string;
    @Input() selectedItem: models.MvdListElement;
    @Input() mainContainer: MainContainerComponent;
    @Input() emitDrillDownEvent = true;
    @Input() isDetailView = false;
    @Input() setToolbar = true;

    @Output() onItemSelectionChanged = new EventEmitter();

    myResources: any;
    criticalData: models.MvdListData;
    nonCriticalData: models.MvdListData;
    public config = {
        animated: true,
        keyboard: true,
        backdrop: true,
        ignoreBackdropClick: false,
        class: 'gray modal-lg'
    };

    public modalRef: BsModalRef;

    private eventBusStateChanged$: Subscription;
    private autoRefresh: string;
    private manualRefresh: string;

    private userPreferences;
    private innerClick = false;
    private attentionNoticesWidgetName = MvdConstants.ATTENTIONNOTICES_WIDGET_KEY;
    private attentionNoticeCriticalThresholdDuration = 90; // minutes

    private porletHandlerNotification$: Subscription;

    @Input() isExtendedView = false;

    private setResources() {
        this.myResources = {
            criticalText: this.resourcesService.resource('critical'),
            nonCriticalText: this.resourcesService.resource('nonCritical')
        };
    }

    constructor(
        private dataService: GatewayService,
        private eventBus: EventBusService,
        private userConfigurationService: UserConfigurationService,
        private resourcesService: ResourceService,
        private transformationService: AttentionNoticesTransformationService,
        private dispensingTransformationService: DispensingDataTransformationService,
        private facilityKeyService: DispensingFacilityKeyTranslatorService,
        private headerService: DashboardHeaderService,
        private porletCountHandlerService: PorletCountHandlerService,
        private modalService: BsModalService,
        private rolePermissionService: RolePermissionsValidatorService,
        private attentionNoticeStatusesService: AttentionNoticeStatusesService,
        private attentionNoticeKeyGeneratorService: AttentionNoticeKeyGeneratorService) {
    }

    ngOnInit() {
        console.log(`AttentionNoticesComponent: appCode  = ${this.appCode} widgetId = ${this.widgetId} user = ${this.user}`);
        this.setResources();
        if (!this.isDetailView) {
            this.headerService.cleanHeader(this.appCode);
        }

        this.autoRefresh = this.eventBus.subcribeRequestAutoRefresh(this.appCode, this.widgetId);
        this.manualRefresh = this.eventBus.subcribeRequestManualRefresh(this.appCode, this.widgetId);

        this.eventBusStateChanged$ = this.loadWidgetData$()
            .subscribe(({ facilityKeys, userConfig, attentionNotices, facilitiesResponse }) => {

                const facilities = _.get(facilitiesResponse, 'body', []);
                if (facilities.length) {
                    this.attentionNoticeCriticalThresholdDuration = this.getCurrentThreshold(facilitiesResponse.body, facilityKeys);
                }
                this.initializeComponent(attentionNotices, userConfig);
            },
            (error) => this.handleError(error));

        this.porletHandlerNotification$ = this.porletCountHandlerService.getNotification().subscribe((event: any) => {
            if (event.key === 'portletCountChanged') {
                this.onPortletCountChanged(event.data);
            }
        });
    }

    private loadWidgetData$() {

        const eventBus$ = this.eventBus.eventBusState$.pipe(
            filter((state) => state.target === this.autoRefresh || state.target === this.manualRefresh),
            tap(() => {
                this.criticalData = null;
                this.nonCriticalData = null;
            })
        );

        const userPreferences$ = this.userConfigurationService.getUpdatedConfig().pipe(
            tap((userConfig) => {
                if (!this.isDetailView) {
                    this.headerService.updateHeader(this.appCode, userConfig);
                }
            }),
            map((userConfig) => {
                const authorizationConfig = userConfig.authorizationConfig;
                const facilitiesConfig = userConfig.userPreferences.facilities;
                const facilityKeys = this.rolePermissionService.getAuthorizedFacilitiesFor(authorizationConfig,
                    MvdConstants.ATTENTIONNOTICES_WIDGET_KEY,
                    MvdConstants.DISPENSING_PROVIDER_NAME,
                    facilitiesConfig);
                    //this.facilityKeyService.translateFacilityKeys(facilitiesConfig, authorizationConfig);
                return { facilityKeys, userConfig, authorizationConfig, facilitiesConfig };
            }),
            catchError((error) => {
                this.handleError(error);
                return throwError(error);
            })
        );

        // Note: Dispensing API does not support following requests in parallel (forkJoin not possible for now)
        const providerData$ = userPreferences$.pipe(
            tap(({ facilityKeys }) => {
                if (!facilityKeys || !facilityKeys.length) {
                    this.summaryComponent.initializeComponent(this.criticalData, this.nonCriticalData, this.isExtendedView);
                    this.eventBus.emitNoDataAvailable(this.appCode, this.widgetId);
                }
            }),
            filter(({ facilityKeys }) => facilityKeys && facilityKeys.length > 0),
            switchMap(({ facilityKeys
                , userConfig
                , authorizationConfig
                , facilitiesConfig }) => this.dataService.loadData([this.createRequest(facilityKeys)]).pipe(
                    map(([attentionNotices]) => ({ facilityKeys, userConfig, authorizationConfig, facilitiesConfig, attentionNotices })),
                    catchError((error) => {
                        this.handleError(error);
                        return throwError(error);
                    }),
                )
            ),
            //#region inject
            switchMap(({ facilityKeys
                , userConfig
                , authorizationConfig
                , facilitiesConfig
                , attentionNotices }) => this.attentionNoticeStatusesService.select(
                    null,
                    (attentionNotices.body as AttentionNotice[]).map(item => {
                        let key = this.attentionNoticeKeyGeneratorService.getKey(item);
                        item.key = key;
                        return key;
                    })
                ).pipe(
                    map((attentionNoticeStatuses) => {
                        (attentionNotices.body as AttentionNotice[]).forEach(an => {
                            let key = an.key;
                            let entry = attentionNoticeStatuses.find(item => item.key == key);
                            if (entry == null) {
                                entry = { id: 0, key: key, status: 'New' } as AttentionNoticeStatus;
                            }
                            (an as any).status = entry.status;
                        });

                        return {
                            facilityKeys,
                            userConfig,
                            authorizationConfig,
                            facilitiesConfig,
                            attentionNotices
                        };
                    }),
                    catchError((error) => {
                        this.handleError(error);
                        return throwError(error);
                    }),
                )),
            //#endregion inject
            switchMap(({ facilityKeys
                , userConfig
                , authorizationConfig
                , facilitiesConfig
                , attentionNotices }) => this.dataService.loadData([this.createFacilitiesRequest()]).pipe(
                    map(([facilitiesResponse]) => {
                        return {
                            facilityKeys,
                            userConfig,
                            authorizationConfig,
                            facilitiesConfig,
                            attentionNotices,
                            facilitiesResponse
                        };
                    }),
                    catchError((error) => {
                        console.log(`Error at pollThreashold: ${error}`);
                        this.initializeComponent(attentionNotices, userConfig);
                        return throwError(error);
                    }),
                )),
        );

        return eventBus$.pipe(
            switchMap(() => providerData$),
            catchError((error) => {
                return throwError(error);
            }),
            retry()
        );
    }

    //private getAttentionNoticesIds(values: AttentionNotice[]): string[] {
    //    let ret = values.map(item => {
    //        return this.attentionNoticeKeyGeneratorService.getKey(item);
    //    });
    //    return ret;
    //}

    private onPortletCountChanged(data: any) {
        if (data.appCode !== this.appCode || !data.widgetsInfo || data.widgetsInfo.length <= 0) { return; }

        const existContinuousInfusion = data.widgetsInfo.some(e => e.name === 'medViewContinuousInfusion');
        if (existContinuousInfusion) { return; }

        if (!this.isDetailView) { this.isExtendedView = true; }

        this.summaryComponent.initializeComponent(null, this.nonCriticalData, this.isExtendedView);
        timer(0).subscribe(() => {
            if (this.isExtendedView && this.criticalData) {
                this.extendedViewComponent.initializeData(this.criticalData.data);
            }
        });
    }

    private handleError(error) {
        this.eventBus.emitLoadDataFail(this.appCode, this.widgetId);
    }


    private initializeComponent(result: any, userConfig: any) {
        const widget =
            userConfig.userPreferences
                .generalSettings.find((a) => a.id === this.attentionNoticesWidgetName);

        this.userPreferences = {
            facility: {
                attentionNoticeCriticalThresholdDuration: this.attentionNoticeCriticalThresholdDuration
            },
            noticeTypes: []
        };

        if (widget && widget.configuration && widget.configuration.noticeTypes) {
            this.userPreferences.noticeTypes = widget.configuration.noticeTypes;
        }

        if (result && result.body && result.body.length > 0) {
            const shapedData =
                this.dispensingTransformationService.shapeData(result.body,
                    this.userPreferences,
                    undefined);
            this.criticalData =
                this.transformationService.transform(
                    shapedData.filter((a: any) => a.critical),
                    true, !this.isDetailView);
            this.nonCriticalData =
                this.transformationService.transform(
                    shapedData.filter((a: any) => !a.critical),
                    false);

            this.summaryComponent.initializeComponent(this.criticalData, this.nonCriticalData, this.isExtendedView);
            if (this.isExtendedView) {
                this.extendedViewComponent.initializeData(this.criticalData.data);
            }
            if (this.selectedItem) {
                this.summaryComponent.setSelectedItem(this.selectedItem);
            }
            this.eventBus.emitLoadDataSuccess(this.appCode, this.widgetId);
        } else {
            this.summaryComponent.initializeComponent(this.criticalData, this.nonCriticalData, this.isExtendedView);
            this.eventBus.emitNoDataAvailable(this.appCode, this.widgetId);
        }
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
            api: 'AttentionNotices',
            queryParams: [
                {
                    name: 'facilityKeys',
                    value: facilityParameter
                }
            ]
        };
    }

    createFacilitiesRequest() {
        return {
            appCode: this.appCode,
            widgetId: this.widgetId,
            api: 'dispensingfacilities'
        };
    }

    onElementChanged(event: any) {
        this.onItemSelectionChanged.emit(event);
        if (this.emitDrillDownEvent) {
            this.mainContainer.showDetailView('mvdAttentionNoticesDetail', event);
        }
    }

    ngOnDestroy() {
        this.eventBusStateChanged$.unsubscribe();
        this.porletHandlerNotification$.unsubscribe();
    }

    onWidgetSettingsClicked() {
        this.modalRef = this.modalService.show(AttentionNoticesConfiguration, this.config);
        this.modalRef.content.appCode = this.appCode;
        this.modalRef.content.widgetId = this.widgetId;
        this.modalRef.content.user = this.user;
        this.modalRef.content.loadData();
        this.modalRef.content.onCloseDialog
            .pipe(take(1))
            .subscribe(this.closeAttentionNoticesDialog.bind(this));
    }

    private closeAttentionNoticesDialog(preferences: any) {
        if (preferences) {
            this.syncForAttentionNoticesConfiguration(preferences);
        }
        this.modalRef.hide();
    }

    private syncForAttentionNoticesConfiguration(preferences) {
        this.userConfigurationService
        .getCurrentConfig()
        .pipe(
            first(),
            switchMap((preferencesResponse) => this.updatePreferences$(preferences, preferencesResponse))
        )
        .subscribe((response) => {
            this.eventBus.emitRequestManualRefresh(this.appCode, this.widgetId);
        },
        (error) => console.log('MvdAttentionNoticesComponent: syncForAttentionNoticesConfiguration Error: ', error));
    }

    private updatePreferences$(data, currentPreferences) {
        if (data) {
            const widgetConfiguration = data.generalSettings;

            if (widgetConfiguration.length) {
                const attentionNoticesConfig = widgetConfiguration
                    .find((item: any) => item.id === MvdConstants.ATTENTIONNOTICES_WIDGET_KEY);

                if (attentionNoticesConfig
                    && currentPreferences.userPreferences) {

                    currentPreferences.userPreferences.generalSettings = currentPreferences.userPreferences.generalSettings || [];

                    const currentConfig = currentPreferences.userPreferences.generalSettings
                        .find((item: any) => item.id === MvdConstants.ATTENTIONNOTICES_WIDGET_KEY);
                    if (currentConfig) {
                        currentConfig.configuration = attentionNoticesConfig.configuration;
                    } else {
                        currentPreferences.userPreferences
                            .generalSettings.push({
                            id: MvdConstants.ATTENTIONNOTICES_WIDGET_KEY,
                            configuration: attentionNoticesConfig.configuration
                        });
                    }
                }
            }
        }
        return this.userConfigurationService.setUserPreferences(currentPreferences.userPreferences);
    }

    private getCurrentThreshold(data: any, facilities: any[]): number {
        const facilityKey = facilities.length > 1 ?
            this.dispensingTransformationService.getAllFacilitiesKey() :
            facilities[0];
        let polledThreshold = 0;
        if (this.dispensingTransformationService.getAllFacilitiesKey() === facilityKey) {
            polledThreshold = data.reduce((a, b) => Math.max(a, b.attentionNoticeCriticalThresholdDuration || 0), 0);
        } else {
            const facility = (data || []).find(f => f.facilityKey === facilityKey);
            if (facility) {
                polledThreshold = facility.attentionNoticeCriticalThresholdDuration || 0;
            }
        }
        return polledThreshold;

    }

}

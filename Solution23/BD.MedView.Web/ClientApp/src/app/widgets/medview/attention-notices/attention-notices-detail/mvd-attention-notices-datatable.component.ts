import { Component, Input, OnDestroy, OnInit, ViewChild, AfterViewChecked } from '@angular/core';

import { timer, Subscription, throwError, of, iif } from 'rxjs';
import { DataTable } from 'primeng/primeng';
import { EventBusService, GatewayService, ResourceService } from 'container-framework';

import { UserConfigurationService } from '../../../../services/user-configuration.service';
import { DispensingDataTransformationService } from '../../../services/mvd-dispensing-data-transformation-service';
import { AttentionNoticesTransformationService } from '../shared/mvd-attention-notices-transformation.service';
import { AttentionNoticesConfigurationService } from '../shared/mvd-attention-notices-configuration.service';
import { SortingService } from '../../../services/mvd-sorting-service';
import { DispensingFacilityKeyTranslatorService } from '../../../services/mvd-dispensing-facility-key-translator.service';
import * as models from '../../../shared/mvd-models';
import { MvdConstants } from '../../../shared/mvd-constants';
import { UserPreferences } from '../shared/UserPreferences';
import { filter, map, switchMap, tap, catchError } from 'rxjs/operators';

import { AttentionNoticeKeyGeneratorService } from '../../../services/mvd-attention-notice-key-generator.service';
import { AttentionNoticeStatusesService, AttentionNoticeStatus } from '../../../services/mvd-attention-notice-statuses.service';
import { AttentionNotice, EnumAttentionNoticeStatus } from '../../../services/mvd-attention-notice-entities';
import { RolePermissionsValidatorService } from '../../../services/mvd-role-permissions.service';
import * as moment from 'moment';
import { AuthenticationService } from 'bd-nav/core';
import { FacilityLookUpService } from '../../../../services/facility-look-up.service';


@Component({
    selector: 'mvd-attention-notices-datatable',
    templateUrl: './mvd-attention-notices-datatable.component.html',
    styleUrls: ['./mvd-attention-notices-detail.component.scss', './mvd-attention-notices-datatable.component.scss' ]
})
export class AttentionNoticesDataTableComponent implements OnDestroy, OnInit, AfterViewChecked {

    selectedItem: models.MvdListElement;
    columns: models.ColumnOption[] = [];
    attentionNoticeData: any;
    resources: any;

    private userPreferences;
    private isAutomaticOnPageEvent = false;
    @ViewChild('dt') dataTable: DataTable;
    @Input() appCode: string;
    @Input() widgetId: string;
    @Input() user: string;

    acknowledgedError: boolean = false;
    attnNoticeErrorMessage: string = '';
    attnNoticeAlreadyAcknowledgeMsg: string = '';

    private eventBusStateChanged$: Subscription;
    private autoRefresh: string;
    private manualRefresh: string;

    constructor(private dataService: GatewayService,
        private eventBus: EventBusService,
        private userConfigurationService: UserConfigurationService,
        private resourcesService: ResourceService,
        private sortingService: SortingService,
        private dispensingTransformationService: DispensingDataTransformationService,
        private userWidgetConfiguration: AttentionNoticesConfigurationService,
        private attentionNoticeStatusesService: AttentionNoticeStatusesService,
        private attentionNoticeKeyGeneratorService: AttentionNoticeKeyGeneratorService,
        private authenticationService: AuthenticationService,
        private rolePermissionService: RolePermissionsValidatorService,
        private facilityKeyService: DispensingFacilityKeyTranslatorService,
        private facilityLookUpService: FacilityLookUpService) {
    }

    ngOnInit() {
        this.userPreferences = new UserPreferences().getUserPreferences();
        this.setResources();

        this.autoRefresh = this.eventBus.subcribeRequestAutoRefresh(this.appCode, this.widgetId);
        this.manualRefresh = this.eventBus.subcribeRequestManualRefresh(this.appCode, this.widgetId);

        this.eventBusStateChanged$ = this.detailWidgetData$()
            .subscribe(({ noticesDetails, authorizationConfig }) => {

                if (noticesDetails && noticesDetails.body && noticesDetails.body.length > 0) {
                    this.dispensingTransformationService.authorizationConfiguration = [...authorizationConfig];
                    const shapedData = this.dispensingTransformationService
                                            .shapeNoticeDetailsData(noticesDetails.body, this.selectedItem.key);
                    this.getColumnConfiguration(shapedData.columns, shapedData.data);
                    this.attentionNoticeData = shapedData.data.map(a => {
                        return {
                            ...a,
                            writeAccess: this.rolePermissionService.hasWriteAccess(
                                MvdConstants.ATTENTIONNOTICES_WIDGET_KEY,
                                authorizationConfig,
                                a.facilityKey,
                                MvdConstants.DISPENSING_PROVIDER_NAME
                            )
                        }
                    });
                    
                    this.setWidgetState();

                    this.eventBus.emitLoadDataSuccess(this.appCode, this.widgetId);
                } else {
                    this.attentionNoticeData = [];
                    this.eventBus.emitNoDataAvailable(this.appCode, this.widgetId);
                }
                this.checkDimensions();
            },
            (error: any) => this.handleError(error));
    }

    changeSelectedType(item: models.MvdListElement) {
        this.selectedItem = item;
        this.eventBus.emitRequestManualRefresh(this.appCode, this.widgetId);
    }

    private detailWidgetData$() {

        const eventBus$ = this.eventBus.eventBusState$.pipe(
            filter((state) => state.target === this.autoRefresh || state.target === this.manualRefresh && !!this.selectedItem)
        );

        const userPreferences$ = this.userConfigurationService.getUpdatedConfig().pipe(
            map((userConfig) => {
                const authorizationConfig = userConfig.authorizationConfig;
                const facilitiesConfig = userConfig.userPreferences.facilities;
                const facilityKeys = this.rolePermissionService.getAuthorizedFacilitiesFor(authorizationConfig,
                    MvdConstants.ATTENTIONNOTICES_WIDGET_KEY,
                    MvdConstants.DISPENSING_PROVIDER_NAME,
                    facilitiesConfig);
                    //this.facilityKeyService.translateFacilityKeys(facilitiesConfig, authorizationConfig);
                return { authorizationConfig, facilitiesConfig, facilityKeys };
            })
        );

        const providerData$ = userPreferences$.pipe(
            tap(({ facilityKeys }) => {
                if (!facilityKeys || !facilityKeys.length) {
                    this.eventBus.emitNoDataAvailable(this.appCode, this.widgetId);
                }
            }),
            switchMap(({ facilityKeys, ...data }) => this.dataService.loadData([this.createRequest(facilityKeys, this.selectedItem.key)]).pipe(
                    map(([noticesDetails]) => ({ noticesDetails, facilityKeys, ...data }))
            )),
            switchMap(({ noticesDetails, ...data }) => {
                return this.attentionNoticeStatusesService.select(
                    null,
                    (noticesDetails.body as AttentionNotice[]).map(item => {
                        item.noticeTypeInternalCode = this.selectedItem.key as any;
                        let key = this.attentionNoticeKeyGeneratorService.getKey(item);
                        item.key = key;
                        return key;
                    })
                ).pipe(
                    map((attentionNoticeStatuses) => {
                        (noticesDetails.body as AttentionNotice[]).forEach(an => {
                            let key = an.key;
                            let entry = attentionNoticeStatuses.find(item => item.key == key);
                            if (entry == null) {
                                entry = { id: 0, key: key, status: 'New' } as AttentionNoticeStatus;
                            } else {
                                (an as any).id = entry.id;
                                (an as any).updatedBy = entry.updatedBy;
                                (an as any).updatedDateTime = entry.updatedDateTime;
                            }
                            (an as any).status = entry.status;
                        });

                        return {
                            noticesDetails,
                            ...data
                        };
                    }),
                    catchError((error) => {
                        this.handleError(error);
                        return throwError(error);
                    }),
                )
            })
        );

        return eventBus$.pipe(switchMap(() => providerData$));
    }

    private getColumnConfiguration(columnData: any, data: any) {
        const defaulSortColumn = columnData.some(a => a.code === 'noticeDuration') ? 'noticeDuration' : 'eventDuration';
        const columnConfig = [];
        columnData.forEach((column) => {
            columnConfig.push(
                {
                    colIndex: 0,
                    header: column.name,
                    field: this.getDataFieldName(column.code),
                    hideOptions: { enabled: false, visible: true } as models.HideOption,
                    sortOptions: { enabled: 'custom', method: this.getSortingType(column.code, data) } as models.SortOption,
                    filterOptions: { enabled: false, allChecked: true, criteria: [] } as models.FilterOption
                });
        });
        columnConfig.forEach((config: models.ColumnOption, i: number) => config.colIndex = ++i);
        this.columns = columnConfig;
        this.userWidgetConfiguration.setColumnConfiguration(this.columns, this.selectedItem.key, defaulSortColumn);
    }

    private getDataFieldName(field: string) {
        let fieldName = '';
        switch (field) {
            case 'noticeDuration':
            case 'eventDuration':
            case 'noticeStartUtcDateTime':
            case 'eventStartUtcDateTime':
            case 'status':
            case 'inboundInterruptTypeInternalCode':
                fieldName = field;
                break;
            default:
                fieldName = field + 'Display';
        }
        return fieldName;
    }

    private getSortingType(field: string, data: any) {
        let method = '';
        if (data) {
            data.forEach((item) => {
                if (!isNaN(item[field])) {
                    method = method === 'numeric' || method === '' ? 'numeric' : 'alphabetical';
                } else if (!isNaN(Date.parse(item[field]))) {
                    method = method === 'date' || method === '' ? 'date' : 'alphabetical';
                } else {
                    method = 'alphabetical';
                }
            });
        }
        return method || 'alphabetical';
    }

    createRequest(params: any, internalCode: any) {
        let facilityParameter = '';
        let allFacilitiesIncluded = params.some(s => s === MvdConstants.ALL_FACILITIES_KEY);

        if (params && params.length > 0 && !allFacilitiesIncluded) {
            facilityParameter = params.join(',');
        }
        return {
            appCode: this.appCode,
            widgetId: this.widgetId,
            api: 'AttentionNoticesDetails',
            queryParams: [
                {
                    name: 'facilityKeys',
                    value: facilityParameter
                }
            ],
            pathParams: [
                {
                    name: 'noticeTypeInternalCode',
                    value: internalCode
                }
            ]
        };
    }

    setWidgetState() {
        const userSettings = this.userWidgetConfiguration.getConfiguration(this.selectedItem.key);
        if (userSettings) {
            this.recoverTableState(userSettings);
        }
    }

    recoverTableState(userSettings: any) {
        this.isAutomaticOnPageEvent = true;
        this.setSortingFromConfiguration(userSettings);
        this.updateSortOptions({
            field: userSettings.options.sorting.field,
            order: userSettings.options.sorting.order
        });
        setTimeout(() => {

            const userConfiguration = this.userWidgetConfiguration.getConfiguration(this.selectedItem.key);
            if (userConfiguration.options.pagination) {
                this.setPageFromConfiguration(userConfiguration.options.pagination);
            }
        }, 0);
    }

    updateSortOptions(event: any) {
        if (event) {
            this.dataTable.sortField = event.field;
            this.dataTable.sortOrder = event.order;
        }
    }

    setSortingFromConfiguration(userSettings: any) {
        const columnConfig = userSettings.columns.find((column: any) => column.field === userSettings.options.sorting.field);
        const sortingMethod = columnConfig ? columnConfig.sortOptions.method : 'alphabetical';
        this.attentionNoticeData = [...this.sortingService
            .sortData(userSettings.options.sorting.field,
                userSettings.options.sorting.order, sortingMethod, this.attentionNoticeData)];
    }

    onPage(event) {
        if (!this.isAutomaticOnPageEvent) {
            this.userWidgetConfiguration.setWidgetOptions({ pagination: event }, this.selectedItem.key);
        }
        this.isAutomaticOnPageEvent = false;
        this.checkDimensions();
    }

    onSort(event) {
        this.userWidgetConfiguration.setWidgetOptions({ sorting: event }, this.selectedItem.key);
        const userConfiguration = this.userWidgetConfiguration.getConfiguration(this.selectedItem.key);
        if (userConfiguration.options.pagination) {
            this.setPageFromConfiguration(userConfiguration.options.pagination);
        }
    }

    sortData(event: any, sortingMethod: any) {
        this.isAutomaticOnPageEvent = true;
        this.attentionNoticeData = [...this.sortingService
            .sortData(event.field, event.order, sortingMethod, this.attentionNoticeData)];
    }

    setPageFromConfiguration(configuration: any) {
        const config = this.getPaginatorConfiguration(configuration);
        this.isAutomaticOnPageEvent = (this.dataTable.rows !== config.rows || this.dataTable.first !== config.first);
        if (this.isAutomaticOnPageEvent) {
            this.dataTable.rows = config.rows;
            this.dataTable.first = config.first;
        }
        this.userWidgetConfiguration.setWidgetOptions({ pagination: { rows: config.rows, first: config.first } }, this.selectedItem.key);
    }

    getPaginatorConfiguration(configuration: any) {
        let pagingConfig = { first: 0, rows: this.dataTable.rows };
        const pageExists = configuration.first < this.dataTable.totalRecords;
        if (pageExists) {
            pagingConfig = configuration;
        }
        return pagingConfig;
    }

    ngOnDestroy() {
        this.eventBusStateChanged$.unsubscribe();
    }

    ngAfterViewChecked() {
        this.isAutomaticOnPageEvent = false;
    }

    acknowledge(rowData: any) {
        this.userConfigurationService.getCurrentConfig().pipe(
            switchMap((userConfig) => {
                return this.changeAcknowledgementStatus(rowData.key, {
                    id: rowData.id,
                    key: rowData.key,
                    facilityId: this.facilityLookUpService.masterFacilityIdLookUp(rowData.facilityKey, userConfig.authorizationConfig, MvdConstants.DISPENSING_PROVIDER_NAME),
                    status: EnumAttentionNoticeStatus.Acknowledged,
                    updatedBy: this.authenticationService.accessToken["loginName"] || this.user,
                    updatedDateTime: moment(new Date()).utc().toDate()
                })
            })
        ).subscribe(response => {
            this.acknowledgedError = false;
            this.eventBus.emitRequestManualRefresh(this.appCode, this.widgetId);

            if (this.dataTable.isRowExpanded(rowData)) {
                this.dataTable.toggleRow(rowData);
            }
        }, (error) => {
                this.acknowledgedError = true;
                this.attnNoticeErrorMessage = this.resources.acknowledgeError.replace('{{operationError}}', this.resources.acknowledge);
        });
    }

    unAcknowledge(rowData: any) {
        this.userConfigurationService.getCurrentConfig().pipe(
            switchMap((userConfig) => {
                return this.changeAcknowledgementStatus(rowData.key, {
                    id: rowData.id,
                    key: rowData.key,
                    facilityId: this.facilityLookUpService.masterFacilityIdLookUp(rowData.facilityKey, userConfig.authorizationConfig, MvdConstants.DISPENSING_PROVIDER_NAME),
                    status: EnumAttentionNoticeStatus.New,
                    updatedBy: this.authenticationService.accessToken["loginName"] || this.user,
                    updatedDateTime: moment(new Date()).utc().toDate()
                })
            })
        ).subscribe(response => {
            this.acknowledgedError = false;
            this.eventBus.emitRequestManualRefresh(this.appCode, this.widgetId);

            if (this.dataTable.isRowExpanded(rowData)) {
                this.dataTable.toggleRow(rowData);
            }
        }, (error) => {
            this.acknowledgedError = true;
                this.attnNoticeErrorMessage = this.resources.acknowledgeError.replace('{{operationError}}', this.resources.unAcknowledge);
        });
    }


    private changeAcknowledgementStatus(key: string, noticeStatus: AttentionNoticeStatus) {
        const get$ = this.attentionNoticeStatusesService.read(key);
        const create$ = (notice) => this.attentionNoticeStatusesService.create(notice);
        const update$ = (id: number, value: AttentionNoticeStatus) => {
            value.id = id;
            return this.attentionNoticeStatusesService.update(id, value);
        };

        const empty$ = (status: AttentionNoticeStatus, alreadyChanged: boolean) => {
            const date = status.updatedDateTime ? moment.utc(status.updatedDateTime).local() : undefined;
            status.updatedDateTime = date.toDate();
            return of({ status, alreadyChanged });
        };

        return get$.pipe(
            switchMap((status) => iif(() => status.status === noticeStatus.status,
                empty$(status, true),
                update$(status.id, noticeStatus),
            )),
            catchError((error) => create$(noticeStatus).pipe(
                catchError((e) => throwError(e))
            )));
    }

    onRowExpand(data: any) {
        this.acknowledgedError = false;
    }

    private handleError(error) {
        this.eventBus.emitLoadDataFail(this.appCode, this.widgetId);
        this.columns = [];
        this.attentionNoticeData = [];
    }

    private setResources() {
        this.resources = {
            noRecordsFound: this.resourcesService.resource('noRecordsFound'),
            acknowledge: this.resourcesService.resource('acknowledge'),
            cancel: this.resourcesService.resource('cancel'),
            ok: this.resourcesService.resource('ok'),
            unAcknowledge: this.resourcesService.resource('attnNoticeUnacknowledged'),
            acknowledgeError: this.resourcesService.resource('attnNoticeAcknowledgedError'),
            attnNoticeAlreadyAcknowledged: this.resourcesService.resource('attnNoticeAlreadyAcknowledged'),
            at: this.resourcesService.resource('atDesktop'),
        };
    }

    private checkDimensions(setAuto: boolean = true) {
        const element = this.dataTable as any;
        timer(0).subscribe(t => {
            try {
                const parentDiv = element.el.nativeElement.querySelector('.ui-datatable-tablewrapper');
                const widgetContainer = element.el.nativeElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
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
}

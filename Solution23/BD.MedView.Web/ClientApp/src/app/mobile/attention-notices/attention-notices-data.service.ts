import { Injectable } from '@angular/core';
import { UserConfigurationService } from '../../services/user-configuration.service';
import { GatewayService, ApiCall } from 'container-framework';
import { Observable, of, iif, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import * as _ from 'lodash';
import * as moment from 'moment';

import {
    AttentionNoticesTransformationService,
    MvdConstants,
    MvdListData,
    DispensingDataTransformationService,
    AttentionNoticeStatusesService,
    AttentionNoticeKeyGeneratorService,
    AttentionNotice,
    AttentionNoticeStatus,
    RolePermissionsValidatorService
} from '../../widgets';
import { AttentionNoticeModel, EnumAttentionNoticeStatus } from '../shared/mvd-mobile-models';
import { AuthenticationService } from 'bd-nav/core';
import { FacilityLookUpService } from '../../services/facility-look-up.service';

@Injectable()
export class AttentionNoticesDataService {

    private defaultThresholdDuration = 90; // In minutes
    private emptyElement = { data: [] } as MvdListData;

    constructor(private userPreferencesService: UserConfigurationService,
        private gatewayService: GatewayService,
        private transformerService: AttentionNoticesTransformationService,
        private dispensingTransformer: DispensingDataTransformationService,
        private statusesService: AttentionNoticeStatusesService,
        private attentionNoticeKeyGeneratorService: AttentionNoticeKeyGeneratorService,
        private authenticationService: AuthenticationService,
        private rolePermissionService: RolePermissionsValidatorService,
        private facilityLookUpService: FacilityLookUpService) {

    }

    getDetailData$(internalCode: string): Observable<any[]> {

        const userInfo$ = this.buildUserInfo$();
        const emptyDetail$ = of([]);
        const hasFacilities = (facilityKeys) => !!(facilityKeys && facilityKeys.length);

        const noticesDetail$ = ((authorizationConfig
            , facilitiesConfig
            , facilityKeys) => this.noticesDetails$(facilityKeys, internalCode).pipe(
                map(([noticesDetails = { body: [] }]) => ({
                    noticesDetails
                    , facilityKeys
                    , facilitiesConfig
                    , authorizationConfig
                    , internalCode
                })),
                switchMap((result) => {

                    const { noticesDetails,
                        facilityKeys: keys,
                        facilitiesConfig: config,
                        authorizationConfig: authConfig,
                        internalCode: code } = result;
                    const authorizedFacilityKeys = this.rolePermissionService.getAuthorizedFacilitiesFor(authorizationConfig
                        , MvdConstants.ATTENTIONNOTICES_WIDGET_KEY
                        , MvdConstants.DISPENSING_PROVIDER_NAME
                        , facilitiesConfig);

                    const notices = noticesDetails.body.map(item => {
                        item.noticeTypeInternalCode = code;
                        item.key = this.attentionNoticeKeyGeneratorService.getKey(item);
                        return item.key;
                    });
                    return this.statusesService.select(null, notices).pipe(
                        map((attentionNoticesStatuses) => {
                            (noticesDetails.body as AttentionNotice[]).forEach(an => {
                                const key = an.key;
                                let entry = attentionNoticesStatuses.find(item => item.key === key);
                                if (entry == null) {
                                    entry = { id: 0, key: key, status: EnumAttentionNoticeStatus.New } as AttentionNoticeStatus;
                                }
                                (an as any).status = entry.status;
                                (an as any).id = entry.id;
                                (an as any).updatedBy = entry.updatedBy;
                                (an as any).updatedDateTime = entry.updatedDateTime;
                            });

                            return {
                                facilityKeys: authorizedFacilityKeys,
                                authorizationConfig: authConfig,
                                facilitiesConfig: config,
                                noticesDetails,
                                internalCode
                            };
                        })
                    );
                }),
                map((result) => this.mapDetailData(result)),
            ));

        return userInfo$.pipe(
            switchMap(({ authorizationConfig
                , facilitiesConfig
                , facilityKeys }) => iif((() => hasFacilities(facilityKeys)),
                    noticesDetail$(authorizationConfig, facilitiesConfig, facilityKeys),
                    emptyDetail$))
        );
    }

    getSummaryData$(): Observable<{ critical: MvdListData, nonCritical: MvdListData }> {

        const userInfo$ = this.buildUserInfo$();
        const hasFacilities = (facilityKeys) => !!(facilityKeys && facilityKeys.length);

        const providerData$ = (nativeKeys
            , preferencesParam
            , authConfig
            , facilityConfig) => this.attentionNotices$(nativeKeys).pipe(
                map(([attentionNotices]) => ({
                    facilityKeys: nativeKeys
                    , preferences: preferencesParam
                    , authorizationConfig: authConfig
                    , facilitiesConfig: facilityConfig
                    , attentionNotices
                })),
                switchMap(({ facilityKeys
                    , preferences
                    , authorizationConfig
                    , facilitiesConfig
                    , attentionNotices }) => this.facilities$().pipe(
                        map(([facilitiesResponse]) => {
                            return {
                                facilityKeys,
                                preferences,
                                authorizationConfig,
                                facilitiesConfig,
                                attentionNotices,
                                facilitiesResponse
                            };
                        }))),
                map((providerData) => this.mapDataForSummary(providerData)));

        return userInfo$.pipe(
            switchMap(({ facilityKeys
                , preferences
                , authorizationConfig
                , facilitiesConfig }) => iif(() => hasFacilities(facilityKeys),
                    providerData$(facilityKeys, preferences, authorizationConfig, facilitiesConfig),
                    this.emptySummary$(this.emptyElement))));
    }

    acknowledgeNotice$(key: string, facilityKey: string) {

        const noticeStatus = {
            updatedBy: this.authenticationService.accessToken['loginName'],
            updatedDateTime: moment(new Date()).utc().toDate(),
            key,
            status: EnumAttentionNoticeStatus.Acknowledged
        } as AttentionNoticeStatus;

        return this.userPreferencesService.getCurrentConfig().pipe(
            switchMap((userConfig) => {
                noticeStatus.facilityId = this.facilityLookUpService
                    .masterFacilityIdLookUp(facilityKey, userConfig.authorizationConfig, MvdConstants.DISPENSING_PROVIDER_NAME);
                return this.changeAcknowledgementStatus(key, noticeStatus);
            })
        );

    }

    unacknowledgeNotice$(id: number, key: string, facilityKey: string) {
        const noticeStatus = {
            id,
            updatedBy: this.authenticationService.accessToken['loginName'],
            updatedDateTime: moment(new Date()).utc().toDate(),
            key,
            status: EnumAttentionNoticeStatus.New
        } as AttentionNoticeStatus;

        return this.userPreferencesService.getCurrentConfig().pipe(
            switchMap((userConfig) => {
                noticeStatus.facilityId = this.facilityLookUpService
                    .masterFacilityIdLookUp(facilityKey, userConfig.authorizationConfig, MvdConstants.DISPENSING_PROVIDER_NAME);
                return this.changeAcknowledgementStatus(key, noticeStatus);
            })
        );
    }


    private changeAcknowledgementStatus(key: string, noticeStatus: AttentionNoticeStatus) {
        const get$ = this.statusesService.read(key);
        const create$ = (notice) => this.statusesService.create(notice);
        const update$ = (id: number, value: AttentionNoticeStatus) => {
            value.id = id;
            return this.statusesService.update(id, value);
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

    private emptySummary$ = (emptyElement) => of({ critical: emptyElement, nonCritical: emptyElement });

    private userPreferences$ = () => this.userPreferencesService.getCurrentConfig();

    private facilities$ = () => this.providerData$(this.getDispendingFaciltiesParams)();

    private attentionNotices$ = (...args: any) => this.providerData$(this.getAttentionNoticesParams)(...args);

    private noticesDetails$ = (...args: any) => this.providerData$(this.getNoticesDetailsParams)(...args);

    private providerData$ = (
        createParamsFn: (...t: any) => ApiCall) =>
        (...args: any) =>
            this.gatewayService.loadData([createParamsFn(...args)])

    private buildUserInfo$() {
        return this.userPreferences$().pipe(
            map((preferences: any) => {
                const authorizationConfig = preferences.authorizationConfig;
                const facilitiesConfig = preferences.userPreferences.facilities;
                const facilityKeys = this.rolePermissionService.getAuthorizedFacilitiesFor(authorizationConfig
                    , MvdConstants.ATTENTIONNOTICES_WIDGET_KEY
                    , MvdConstants.DISPENSING_PROVIDER_NAME
                    , facilitiesConfig);

                return { facilityKeys, preferences, authorizationConfig, facilitiesConfig };
            })
        );
    }

    private mapDetailData(noticesData: any): AttentionNoticeModel[] {

        const { noticesDetails
            , authorizationConfig
            , internalCode } = noticesData;

        if (!noticesDetails || !noticesDetails.body || !noticesDetails.body.length) {
            return [];
        }

        const shapedData = this.dispensingTransformer.transformNoticeDetails(
            noticesDetails.body
            , internalCode
            , authorizationConfig);


        const data = shapedData.data.map((item: AttentionNoticeModel, index) => {

            item.isAcknowledge = EnumAttentionNoticeStatus[item.status] === EnumAttentionNoticeStatus.Acknowledged;
            item.isCollapsed = true;
            item.rowIndex = index;
            item.hasWriteAccess = this.rolePermissionService
                .hasWriteAccess(
                    MvdConstants.ATTENTIONNOTICES_WIDGET_KEY,
                    authorizationConfig,
                    item.facilityKey,
                    MvdConstants.DISPENSING_PROVIDER_NAME);
            return item;
        });

        return data || [];
    }

    private mapDataForSummary(providerData): { critical: MvdListData, nonCritical: MvdListData } {

        const { facilityKeys,
            preferences,
            attentionNotices,
            facilitiesResponse } = providerData;

        const facilities = _.get(facilitiesResponse, 'body', []);
        const currentThreshold = facilities.length ?
            this.getCurrentThreshold(facilitiesResponse.body, facilityKeys) :
            this.defaultThresholdDuration;

        const widget =
            preferences.userPreferences
                .generalSettings.find((a) => a.id === MvdConstants.ATTENTIONNOTICES_WIDGET_KEY);

        const userPreferences = {
            facility: {
                attentionNoticeCriticalThresholdDuration: currentThreshold
            },
            noticeTypes: []
        };

        if (widget && widget.configuration && widget.configuration.noticeTypes) {
            userPreferences.noticeTypes = widget.configuration.noticeTypes;
        }

        if (!attentionNotices || !attentionNotices.body || !attentionNotices.body.length) {
            return { critical: this.emptyElement, nonCritical: this.emptyElement };
        }

        const notices =
            this.dispensingTransformer.shapeData(attentionNotices.body,
                userPreferences,
                undefined);

        const { criticalNotices, nonCriticalNotices } = notices.reduce((acc, curr) => {
            if (curr.critical) {
                acc.criticalNotices.push(curr);
            } else {
                acc.nonCriticalNotices.push(curr);
            }
            return acc;
        }, { criticalNotices: [], nonCriticalNotices: [] });

        const critical = this.transformerService.transform(criticalNotices, true, false);
        const nonCritical = this.transformerService.transform(nonCriticalNotices, false);

        return { critical, nonCritical };
    }

    private getNoticesDetailsParams(params: any, internalCode: any) {

        let facilityParameter = '';
        const allFacilitiesIncluded = params.some(s => s === MvdConstants.ALL_FACILITIES_KEY);

        if (params && params.length > 0 && !allFacilitiesIncluded) {
            facilityParameter = params.join(',');
        }
        return {
            appCode: '',
            widgetId: '',
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

    private getAttentionNoticesParams(params: any): ApiCall {

        let facilityParameter = '';
        const allFacilitiesIncluded = params.some(s => s === MvdConstants.ALL_FACILITIES_KEY);

        if (params && params.length > 0 && !allFacilitiesIncluded) {
            facilityParameter = params.join(',');
        }

        return {
            appCode: '',
            widgetId: '',
            api: 'AttentionNotices',
            queryParams: [
                {
                    name: 'facilityKeys',
                    value: facilityParameter
                }
            ]
        } as ApiCall;
    }

    private getDispendingFaciltiesParams(): ApiCall {
        return {
            appCode: '',
            widgetId: '',
            api: 'dispensingfacilities'
        } as ApiCall;
    }

    private getCurrentThreshold(data: any, facilities: any[]): number {
        const facilityKey = facilities.length > 1 ?
            this.dispensingTransformer.getAllFacilitiesKey() :
            facilities[0];

        let polledThreshold = 0;
        if (this.dispensingTransformer.getAllFacilitiesKey() === facilityKey) {
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

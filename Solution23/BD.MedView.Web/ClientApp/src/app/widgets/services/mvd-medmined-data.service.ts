import { Injectable } from '@angular/core';

import { GatewayService, ApiCall } from 'container-framework';
import { MedMinedModels } from '../shared/medmined-models';
import { Observable, Subscriber, forkJoin, of } from 'rxjs';
import { map, concatMap } from 'rxjs/operators';
import { MvdConstants } from '../shared/mvd-constants';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import {HttpParams} from '@angular/common/http';
import * as _ from 'lodash';

@Injectable()
export class MvdMedMinedDataService {

    private documentationURL = window['medminedUIDocumentationInfo'] || '';

    private MaxAlertHeadersRows = 1000;

    constructor(
        private gatewayService: GatewayService,
        private http: HttpClient
    ) {

    }

    public getMedMinedSummaryAlerts$(appCode: string, widgetId: string, facilityKeys: string[], globalSearchCriteria: string): Observable<MedMinedModels.AlertSummariesResponse> {
        return this.gatewayService.loadData([this.createRequestAlertsSummary(appCode, widgetId, facilityKeys.toString(), globalSearchCriteria)])
            .pipe(
                map<any, MedMinedModels.AlertSummariesResponse>((response) => response[0] || { summaries: [] })
            );
    }


    public getMedMinedAlertDetails$(appCode: string, widgetId: string, title: string,
        facilityKeys: string, category: string, ownership: string, globalCriteria: string, total?: number): Observable<MedMinedModels.AlertsDetailsHeaderResults> {
        let defaultResponse = {
            results: {
                page_number: 0,
                page_size: 0,
                category: '',
                title: '',
                alerts: []
            }
        };

        if (total && total > this.MaxAlertHeadersRows) {

            let requests$ = [];
            let totalRequests = Math.ceil(total / this.MaxAlertHeadersRows);
            for (let i = 1; i <= totalRequests; i++) {
                requests$.push(
                    this.gatewayService.loadData([this.createRequestAlertsDetailsHeader(appCode, widgetId, title, facilityKeys, category, ownership, globalCriteria, i, this.MaxAlertHeadersRows)])
                );
            }
            return forkJoin(requests$).pipe(
                map((responses) => {
                    if (responses && responses.length > 0) {
                        let alerts = [];
                        let category = '';
                        let title = '';
                        responses.forEach(d => {
                            if (d[0]) {
                                category = d[0].results.category;
                                title = d[0].results.title;
                                alerts = [...alerts, ...d[0].results.alerts];
                            }
                        });
                        return {
                            results: {
                                page_number: 1,
                                page_size: total,
                                category: category,
                                title: title,
                                alerts: alerts
                            }
                        };
                    }
                    else {
                        return defaultResponse;
                    }
                }),
                map<MedMinedModels.AlertsDetailsHeaderResponse, MedMinedModels.AlertsDetailsHeaderResults>(({ results }) => results)
            );
        }

        return this.gatewayService.loadData([this.createRequestAlertsDetailsHeader(appCode, widgetId, title, facilityKeys, category, ownership, globalCriteria, 1, this.MaxAlertHeadersRows)])
            .pipe(
            map<any, any>((response) => response[0] || defaultResponse),
            map<MedMinedModels.AlertsDetailsHeaderResponse, MedMinedModels.AlertsDetailsHeaderResults>(({ results }) => results)
            );
    }

    public getMedMinedAlertsMetadata$(appCode: string, widgetId: string, facilityKeys: string[]) {
        const facilityParameter = facilityKeys ? facilityKeys.toString() : null;
        return this.gatewayService.loadData([this.createRequestAlertsMetadata(appCode, widgetId, facilityParameter)])
            .pipe(
                map((response) => response[0] || null)
            );
    }

    public getAlertsSubscriptions$(appCode: string, widgetId: string, facilityKeys: string, type: string): Observable<MedMinedModels.AlertsSubscriptions[]> {
        return this.gatewayService.loadData([this.createRequestGetAlertsSubscription(appCode, widgetId, facilityKeys, type)])
            .pipe(
                map(response => response[0] ? response[0].results : [])
            );
    }


    public updateSubscriptionAlerts$(newSubscribedAlertsData: MedMinedModels.AlertSubscriptionItem[], dataAuthorization, appCode: string, widgetId: string, facilityKeys: number[], type: string): any {
        return this.gatewayService.loadData([
            this.createRequestPostAlertsSubscription(
                appCode,
                widgetId,
                this.createAlertsSubscriptionObject(newSubscribedAlertsData, dataAuthorization),
                facilityKeys,
                type
            )]);
    }

    public updateAlertStatus$(alert: MedMinedModels.AlertStatusUpdateRequest, appCode: string, widgetId: string, facilityKey: number): Observable<any> {
        return this.gatewayService.loadData([
            this.createRequestAlertUpdateStatus(appCode,
                widgetId,
                alert,
                facilityKey
            )]);
    }

    public getMedMinedAlertDetail$(alertId: string, facilityId: string, appCode: string, widgetId: string): Observable<any> {
        return this.gatewayService.loadData([
            this.createRequestAlertDetail(appCode, widgetId, alertId, facilityId)
        ]);
    }

    getDocumentationInfo$(facilityKey: string, alertId: string, email: string): Observable<any> {
        let documentationInfoURL = window['medminedUIDocumentationInfo'] || '';
        documentationInfoURL = `${documentationInfoURL}/AddDocumentation?FacilityKey=${facilityKey}&AlertId=${alertId}`;

        return this.getRelayStateInfo$(documentationInfoURL);
    }

    getPatientInfo$(facilityKey: string, alertId: string, email: string): Observable<any> {
        let patientInfoURL = window['medminedUIPatientInfo'] || '';       
        patientInfoURL = `${patientInfoURL}/ViewPatientDetails?FacilityKey=${facilityKey}&AlertId=${alertId}`;
        return this.getRelayStateInfo$(patientInfoURL);
    }

    getSamlToken$(): Observable<any> {
        const headers = new HttpHeaders();
        const url = window['medminedSamlUrl'];
        var responseMapObservable = this.http.get(url, { headers: headers } ).pipe(
            map((res: any) => ({ token: res.SAMLResponse, acs: res.ACS }))
        );

        return responseMapObservable;
    }

    private getRelayStateInfo$(redirectUrl: string) {
        return this.getSamlToken$().pipe(
            concatMap(({ token, acs }) => {
                redirectUrl = encodeURIComponent(redirectUrl);
                const medminedIdmRedirectUrl = acs;
                return of({ token, medminedIdmRedirectUrl, redirectUrl });
            })
        );
    }

    public getSecondaryData$(appCode: string, widgetId: string, data: any): Observable<any> {
        return this.gatewayService.loadData([this.createRequestSecondaryData(appCode, widgetId, data)])
            .pipe(
                map<any, any>((response) => {
                    console.log(response);
                    return response;
                }));
    }


    private createRequestAlertsSummary(appCode: string, widgetId: string, facilityKeys: string, globalSearchCriteria: string): ApiCall {
        let request = {
            appCode: appCode,
            widgetId: widgetId,
            api: 'medminedalertsummary',
            queryParams: [
                {
                    name: 'FacilityKeys',
                    value: facilityKeys
                }
            ]
        };

        if (globalSearchCriteria) {
            request.queryParams.push({
                name: 'Search',
                value: globalSearchCriteria
            });
        }

        return request;
    }

    private createRequestAlertsDetailsHeader(appCode: string, widgetId: string, title: string, facilityKey: string,
        category: string, ownership: string, globalCriteria: string, start?: number, limit?: number): ApiCall {


        let requestObj = {
            appCode: appCode,
            widgetId: widgetId,
            api: 'medminedalertsdetailsheader',
            //pathParams: [
            //    {
            //        name: 'AlertId',
            //        value: alertId
            //    }],
            queryParams: [
                {
                    name: 'FacilityKeys',
                    value: facilityKey
                },
                {
                    name: 'Title',
                    value: title
                },
                {
                    name: 'Category',
                    value: category
                },
                {
                    name: 'Ownership',
                    value: ownership
                }
            ]
        };

        if (start && limit) {
            requestObj.queryParams.push({
                name: 'Start',
                value: `${start}`
            });
            requestObj.queryParams.push({
                name: 'Limit',
                value: `${limit}`
            });
        }
        if (globalCriteria) {
            requestObj.queryParams.push({
                name: 'Search',
                value: globalCriteria
            });
        }

        return requestObj;
    }

    private createRequestAlertsMetadata(appCode: string, widgetId: string, facilityParameter?: string): ApiCall {
        return {
            appCode: appCode,
            widgetId: widgetId,
            api: 'medminedalertsmetadata',
            queryParams: [
                {
                    name: 'FacilityKeys',
                    value: facilityParameter
                }
            ]
        };
    }

    private createRequestGetAlertsSubscription(appCode: string, widgetId: string, facilityKeys: string, type: string): ApiCall {
        return {
            appCode: appCode,
            widgetId: widgetId,
            api: 'medminedalertssubscriptions',
            queryParams: [
                {
                    name: 'FacilityKeys',
                    value: facilityKeys
                },
                {
                    name: 'Type',
                    value: type
                }
            ]
        };
    }

    private createRequestPostAlertsSubscription(appCode: string, widgetId: string, params: any, facilityKeys: number[], type: string): ApiCall {
        return {
            appCode: appCode,
            widgetId: widgetId,
            api: 'medminedpostalertssubscriptions',
            rawData: params,
            queryParams: [
                {
                    name: 'FacilityKeys',
                    value: facilityKeys.toString()
                },
                {
                    name: 'Type',
                    value: type
                }
            ]
        };
    }

    private createAlertsSubscriptionObject(newSubscribedAlertsData: MedMinedModels.AlertSubscriptionItem[], dataAuthorization: any[]) {
        let alertsSubsObj = {
            requests: []
        };

        dataAuthorization.forEach(item => {
            let synonym = item.synonyms.find(d => d.source.toLowerCase() === MvdConstants.MEDMINED_PROVIDER_NAME && d.type === 'Facility');
            if (synonym) {
                alertsSubsObj.requests.push({
                    facility_id: synonym.id,
                    subscriptions: [...newSubscribedAlertsData]
                });
            }
        });

        return alertsSubsObj;
    }

    private createRequestAlertUpdateStatus(appCode: string, widgetId: string, params: any, facilityKey: number): ApiCall {
        return {
            appCode: appCode,
            widgetId: widgetId,
            api: 'medminedalertsdetailsupdate',
            rawData: params,
            queryParams: [
                {
                    name: 'FacilityKey',
                    value: facilityKey.toString()
                }
            ]
        };
    }

    private createRequestAlertDetail(appCode: string, widgetId: string, alertId: string, facilityId: string): ApiCall {
        return {
            appCode: appCode,
            widgetId: widgetId,
            api: 'medminedalertsdetails',
            pathParams: [
                {
                    name: 'AlertID',
                    value: alertId
                }
            ],
            queryParams: [
                {
                    name: 'FacilityKey',
                    value: facilityId
                }
            ]
        };
    }

    private createRequestSecondaryData(appCode: string, widgetId: string, data: any): ApiCall {
        return {
            appCode: appCode,
            widgetId: widgetId,
            api: 'medminedsecondarydata',
            rawData: data
        };
    }

}

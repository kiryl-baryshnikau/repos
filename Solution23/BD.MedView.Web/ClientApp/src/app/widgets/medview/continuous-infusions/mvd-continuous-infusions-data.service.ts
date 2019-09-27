// tslint:disable:max-line-length
import { Injectable } from '@angular/core';
import { ApiCall, GatewayService } from 'container-framework';
import { IvPrepModels, IvPrepTimeFrameFilter } from '../../shared/mvd-models';
import { Observable, throwError } from 'rxjs';
import { catchError, concatMap, map, publishReplay, refCount, switchMap } from 'rxjs/operators';
import { MvdTimeTransformService } from '../../services/mvd-time-transform.service';
import * as moment from 'moment';
import { MvdOrderService } from './mvd-order-service.service';
import { ContinuousInfusionsTransformationService } from './mvd-continuous-infusions-transformation.service';

@Injectable()
export class ContinuousInfusionsDataService {

    private ivPrepQueryParamsFormat = 'YYYYMMDDTHHmm';
    private _ivPrepApiConfig: Observable<IvPrepModels.ApiConfig>;

    constructor(private dataService: GatewayService, private orderService: MvdOrderService,
        private transformationService: ContinuousInfusionsTransformationService,
        private timeTransformService: MvdTimeTransformService) {
    }

    clearIvPrepCache() {
        this._ivPrepApiConfig = undefined;
    }

    getInfusionData$(appCode: string, widgetId: string, params): Observable<any> {
        return this.dataService.loadData([this.createInfusionRequest(appCode, widgetId, params)]);
    }

    getOrders$(appCode: string, widgetId: string, infusionContainer: any, criteria: string) {
        return this.orderService.getOrder$(appCode, widgetId, infusionContainer, criteria);
    }

    getIvPrepConfig$(appCode: string, widgetId: string): Observable<IvPrepModels.ApiConfig> {
        if (!this._ivPrepApiConfig) {
            this._ivPrepApiConfig = this.dataService.loadData([this.getIvPrepApiConfigRequest(appCode, widgetId)]).pipe(
                catchError((error) => {
                    this._ivPrepApiConfig = undefined;
                    return throwError(error);
                }),
                map(response => this.mapIvPrepApiConfig(response[0])),
                publishReplay(1),
                refCount()
            );
        }

        return this._ivPrepApiConfig;
    }

    getIvPrepDoses$(appCode: string, widgetId: string, orderNumber: string, timeFrameValue: IvPrepTimeFrameFilter): Observable<IvPrepModels.Dose[]> {
        return this.createIvPrepRequest$(appCode, widgetId, orderNumber, timeFrameValue).pipe(
            switchMap(ivPrepRequest => this.dataService.loadData([ivPrepRequest]).pipe(
                map(responses => {
                    const dosesResponse = responses && responses[0] && (responses[0] as IvPrepModels.DosesResponse);
                    if (dosesResponse) {
                        return dosesResponse.Doses;
                    } else {
                        return [];
                    }
                }
                ))
            )
        );
    }

    acknowledge$(appCode: string, widgetId: string, params): Observable<any> {
        return this.dataService.loadData([this.createAcknowledgeRequest(appCode, widgetId, params)]);
    }

    changePriority$(appCode: string, widgetId: string, dose: IvPrepModels.Dose, value: boolean) {
        return this.dataService.loadData([this.getDoseUrgencyRequest(appCode, widgetId, dose.DoseId, value)]);
    }

    changePriorityAndAcknowledge$(appCode: string, widgetId: string, ivPrepDose: IvPrepModels.Dose, value: boolean, infusionContainerKey: any, userId: string): Observable<object> {
        return this.changePriority$(appCode, widgetId, ivPrepDose, value).pipe(
            catchError(error => throwError({
                prioritySuccess: false,
                acknowledgeSuccess: false,
                originalError: error
            })),
            concatMap(() => {
                const params = { userId: userId, containerKey: infusionContainerKey, acknowledgementstatus: 1 };
                return this.acknowledge$(appCode, widgetId, params).pipe(
                    catchError(error => throwError({
                        prioritySuccess: true,
                        acknowledgeSuccess: false,
                        originalError: error
                    }))
                );
            })
        );
    }

    private createInfusionRequest(appCode: string, widgetId: string, params: any): ApiCall {
        return <ApiCall>{
            appCode: appCode,
            widgetId: widgetId,
            api: 'containerandguardrailwarnings',
            rawData: params
        };
    }

    private createAcknowledgeRequest(appCode: string, widgetId: string, params: any): ApiCall {
        return <ApiCall>{
            appCode: appCode,
            widgetId: widgetId,
            api: 'ivacknowledgement',
            rawData: params
        };
    }

    private createIvPrepRequest$(appCode: string, widgetId: string, orderNumber: string, timeFrameValue: IvPrepTimeFrameFilter): Observable<ApiCall> {
        if (!orderNumber) {
            return throwError('Invalid Order number');
        }

        return this.getIvPrepConfig$(appCode, widgetId).pipe(
            map(ivPrepConfig => ({
                appCode: appCode,
                widgetId: widgetId,
                api: 'ivprepdoses',
                queryParams: [
                    { name: 'fromDateTime', value: this.getIvPrepStartDateTime(ivPrepConfig, timeFrameValue.pastOptionValue) },
                    { name: 'toDateTime', value: this.getIvPrepEndDateTime(ivPrepConfig, timeFrameValue.futureOptionValue) },
                    { name: 'orderNumber', value: orderNumber }
                ]
            } as ApiCall))
        );
    }

    private getIvPrepApiConfigRequest(appCode: string, widgetId: string): ApiCall {
        return <ApiCall>{
            appCode: appCode,
            widgetId: widgetId,
            api: 'ivprepconfiguration'
        };
    }

    private mapIvPrepApiConfig(apiConfig): IvPrepModels.ApiConfig {
        const duration = moment.duration((apiConfig && apiConfig.TimeZoneOffset) || '00:00:00');

        // convert returned offset to the standard format browsers use. For instance for GMT-05, offset should be '05:00:00'
        apiConfig.TimeZoneOffset = moment.utc(-duration).format('HH:mm:ss');

        return apiConfig;
    }

    private getIvPrepStartDateTime(apiConfigResponse: IvPrepModels.ApiConfig, hours: number): string {
        const startLocal = moment(new Date()).subtract(moment.duration(hours, 'hours'));
        const startServer = this.timeTransformService.toServerTime(startLocal, apiConfigResponse.TimeZoneOffset);
        return startServer.format(this.ivPrepQueryParamsFormat);
    }

    private getIvPrepEndDateTime(apiConfigResponse: IvPrepModels.ApiConfig, hours: number): string {
        const endLocal = moment(new Date()).add(moment.duration(hours, 'hours'));
        const endServer =
            this.timeTransformService.toServerTime(endLocal, apiConfigResponse.TimeZoneOffset);
        return endServer.format(this.ivPrepQueryParamsFormat);
    }

    private getDoseUrgencyRequest(appCode: string, widgetId: string, doseId: string, value: boolean): ApiCall {
        return <ApiCall>{
            appCode: appCode,
            widgetId: widgetId,
            api: 'ivprepseturgency',
            pathParams: [{ name: 'id', value: doseId }],
            rawData: { urgent: value }
        };
    }
}

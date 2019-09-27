import {Injectable} from '@angular/core';
import {GatewayService, ApiCall} from 'container-framework';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import * as _ from 'lodash';

@Injectable()
export class MvdOrderService {
    constructor(private dataService: GatewayService) {
    }

    getOrder$(appCode: string, widgetId: string, infusionContainer: any, criteria: string): Observable<any> {
        console.log('Request order service for infusionContainer', infusionContainer);

        const request = this.createOrdersRequest(appCode, widgetId, infusionContainer, criteria);
        return this.dataService.loadData([request]).pipe(
            map((responses: any[]) => {
                if (responses && responses.length > 0) {
                    return responses[0];
                } else {
                    return {};
                }
            })
        );
    }

    private createOrdersRequest(appCode: string, widgetId: string, infusionContainer: any, criteria: string): ApiCall {
        const orderRequest = {
            'patient.identifier': null,
            'patient.organization.name': null,
            'route': 'IV',
            'notOlderThanDays': 7,
            'timingCode': null,
            '_include': ['MedicationOrder:Medication', 'MedicationOrder:Patient', 'MedicationOrder:Encounter']
        };

        if (infusionContainer.placerOrderId) {
            // Interop
            orderRequest['identifier'] = infusionContainer.placerOrderId;
        } else {
            // Non interop
            orderRequest['patient.identifier'] = infusionContainer.patientId;
            orderRequest['patient.organization.name'] = infusionContainer.adtFacility;

            orderRequest['timingCode'] = 'Continuous';
            orderRequest['drugInfo'] = this.getInteropDrugInfoRequest(infusionContainer, criteria);
        }

        console.log('********** Order Request *************');
        console.log(orderRequest);

        return {
            appCode: appCode,
            widgetId: widgetId,
            api: 'orderservice',
            rawData: orderRequest
        };
    }

    private getInteropDrugInfoRequest(infusionContainer: any, criteria: string) {
        return {
            name: {
                terms: this.getTerms(infusionContainer)
            },
            concentration: {
                amount: infusionContainer.originalDrugAmount,
                amountUnits: infusionContainer.drugUnit,
                volume: infusionContainer.diluentAmount,
                volumeUnits: infusionContainer.diluentUnit,
                criteria: criteria
            }
        };
    }

    private getTerms(infusionContainer: any ): string[] {
        return [`${this.sanitizeInfusionName(infusionContainer.infusionName || '')}`];
    }

    private sanitizeInfusionName(infusionName: string): string {
        let firstCharFound = false;
        const result = infusionName.split('').filter(c => {
            if (firstCharFound) { return true; }
            if (c.match('[A-Za-z]')) {
                firstCharFound = true;
                return true;
            } else { return false; }
        }).join('');

        console.log(`Original Drug name '${infusionName}'. Sanitized Drug name '${result}'`);
        return result;
    }
}

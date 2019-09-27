import { Injectable } from '@angular/core';

import { Observable, of, pipe } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { ApiCall, GatewayService } from 'container-framework';
import { MedMinedModels } from '../../../shared/medmined-models';

@Injectable()
export class ProviderFacilitiesDataService {

    private facilitiesDataSourceCode: {
        [key: string]: {
            code: string,
            pipeFunction: Function
        }
    } = {
        'medmined': {
            code: 'medminedfacilities',
            pipeFunction: this.pipeMedMinedFacilities
        },
        'cato': {
            code: 'ivprepfacilities',
            pipeFunction: this.pipeCatoFacilities
        },
        'dispensing': {
            code: 'dispensingfacilities',
            pipeFunction: this.pipeDispensingFacilities
        }

    };

    constructor(
        private gatewayService: GatewayService
    ) {

    }

    public getFacilities$(appCode: string, widgetId: string, provider: string): Observable<MedMinedModels.FacilitySelectItem[]> {
        if (!this.facilitiesDataSourceCode[provider])
            return of([]);

        return this.gatewayService
            .loadData([this.getFacilitiesRequest(appCode, widgetId, provider)])
            .pipe(
                this.facilitiesDataSourceCode[provider].pipeFunction(),
                take(1)
            );
    }

    public getMedminedFacilities$(appCode: string, widgetId: string) {
        return this.gatewayService
            .loadData([this.getFacilitiesRequest(appCode, widgetId, 'medmined')])
            .pipe(take(1));
    }

    private pipeCatoFacilities() {
        return pipe(
            map(response => response[0] || { Facilities: [] }),
            map(({ Facilities: facilities }) =>
                facilities.map(facility => ({
                    label: facility.Designation,
                    value: {
                        id: facility.Id,
                        name: facility.Designation
                    }
                })))
        );
    }

    private pipeDispensingFacilities() {
        return pipe(
            map(response => response[0] || { body: [] }),
            map(({ body: facilities }) =>
                facilities.map(facility => ({
                    label: facility.facilityName,
                    value: {
                        id: facility.facilityKey,
                        name: facility.facilityName
                    }
                })))
        );
    }

    private pipeMedMinedFacilities() {
        return pipe(
            map<any, MedMinedModels.FacilitiesResponse>(response => response[0] || { facilities: [] }),
            map<MedMinedModels.FacilitiesResponse, MedMinedModels.FacilitySelectItem[]>(({ facilities }) => {
                return facilities.map(item => ({
                    label: item.facility_name,
                    value: {
                        id: `${item.facility_id}`,
                        name: item.facility_name
                    }
                }))
            })
        );
    }



    private getFacilitiesRequest(appCode: string, widgetId: string, provider: string): ApiCall {
        return {
            appCode,
            widgetId,
            api: this.facilitiesDataSourceCode[provider].code,
        };
    }

}

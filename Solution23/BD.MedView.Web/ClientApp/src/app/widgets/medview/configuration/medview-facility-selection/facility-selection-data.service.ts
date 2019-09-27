import { TreeNode } from 'primeng/primeng';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import * as _ from 'lodash';

import { UserConfigurationService } from '../../../../services/user-configuration.service';
import { GatewayService } from 'container-framework';
import { MvdFacilitySelectionTransformService } from '../../../services/mvd-facility-selection-transformation.service';
import { FacilityInfo } from '../../../shared/mvd-models';
import { FacilityLookUpService } from '../../../../services/facility-look-up.service';
import { MvdConstants } from '../../../shared/mvd-constants';
import {
    FacilityFilter,
    FacilityFilterConfiguration,
    FacilityMapping,
    PatientFilter,
    UnitFilter
} from './facility-selection.models';

@Injectable()
export class FacilitySelectionDataService {

    constructor(private transformService: MvdFacilitySelectionTransformService,
        private userConfigurationService: UserConfigurationService,
        private cfwGatewayService: GatewayService,
        private facilityLookUpService: FacilityLookUpService)
    {
    }

    getInfusionFacilityInfoList(appCode: string, widgetId: string, facilities: string[]): Observable<FacilityInfo[]> {
        console.log('FacilitySelectionDataService requesting data for facilities: ', facilities);
        return this.cfwGatewayService.loadData([this.createRequest(appCode, widgetId, facilities)])
            .pipe(
                map((responses: any[]) => {
                    console.log('FacilitySelectionDataService received data', responses);
                    const response = responses[0] || [];
                    return response;
                })
            );
    }

    private createRequest(appCode: string, widgetId: string, params: any) {
        return {
            appCode: appCode,
            widgetId: widgetId,
            api: 'guardrailwarningsfacilitiesinfo',
            rawData: params
        };
    }
}

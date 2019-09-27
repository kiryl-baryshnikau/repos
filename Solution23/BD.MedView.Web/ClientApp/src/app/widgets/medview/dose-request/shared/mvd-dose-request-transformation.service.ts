import { Injectable } from '@angular/core';

import { DispensingDataTransformationService } from '../../../services/mvd-dispensing-data-transformation-service'

import { ContextConstants, ContextService, EventBusService, GatewayService, ResourceService } from 'container-framework';

import * as models from '../../../shared/mvd-models';

@Injectable()
export class DoseRequestTransformationService {

    constructor(private dispensingTransformationService: DispensingDataTransformationService,
        private resourceService: ResourceService ) {
    }

    transform(data: any): models.MvdListData{
        let items = this.dispensingTransformationService.processDoseRequestData(data);
        items = items.sort((item1, item2) => {
            if (item1.careUnit > item2.careUnit)
                return 1;
            if (item1.careUnit < item2.careUnit)
                return -1;
            return 0;
        });

        return this.transformToListInput(items);
    }

    private transformToListInput(data) : models.MvdListData {
        let dataList: models.MvdListData = {
            options: { displayIcons: true, showAnimations: false } as models.OptionsListPriorities,
            data: []
        };
        dataList.data = data.map((item: any) => {
            return {
                key: item.careUnit,
                priority: '',
                counter: item.allItemsCount,
                title: item.careUnit,
                label: this.resourceService.resource('new'),
                value: item.newItemsCount
            }
        });
        return dataList;
    }
}
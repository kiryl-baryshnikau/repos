import { Injectable } from "@angular/core";

import { DispensingDataTransformationService } from '../../../services/mvd-dispensing-data-transformation-service'

import { ContextConstants, ContextService, EventBusService, GatewayService, ResourceService } from 'container-framework';

import * as models from '../../../shared/mvd-models';

@Injectable()
export class AttentionNoticesTransformationService {

    private myResources;

    private setResources() {
        this.myResources = {
            oldest: this.resourcesService.resource("oldest"),
        }
    }

    constructor(private dispensingTransformationService: DispensingDataTransformationService,
        private resourcesService: ResourceService) {
        this.setResources();
    }

    transform(data: any, critical: boolean, blinking?: boolean): models.MvdListData {
        if(!data)
            return null;

        let items: models.MvdListElement[] = data.map((item: any) => {
            return {
                key: item.noticeTypeInternalCode,
                priority: item.noticeSeverityInternalCode,
                counter: item.noticeCount,
                title: item.noticeTypeDescription,
                label: this.myResources.oldest,
                value: this.getDurationDisplay(item.oldestNoticeDuration),
                blinkingRow: item.highlight,
                originalItem: item,
                critical: critical
            };
        });
        return {
            options: { displayIcons: true, showAnimations: (blinking != undefined ? blinking : true), showBorder: critical } as models.OptionsListPriorities,
            data: items
        };
    }

    private getDurationDisplay(duration: any) {
        return this.dispensingTransformationService.getDurationDisplay(duration);
    }
}
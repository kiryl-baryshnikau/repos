import { Output, Component, EventEmitter, } from '@angular/core';

import { ResourceService } from 'container-framework';

import * as models from '../../../shared/mvd-models';

@Component({
    //KB moduleId: module.id,
    selector: 'mvd-attention-notices-extended',
    styleUrls: ['./mvd-attention-notices-extendedview.component.scss'],
    templateUrl: './mvd-attention-notices-extendedview.component.html'
})
export class AttentionNoticesExtendedViewComponent
{
    @Output() elementClick = new EventEmitter<any>();

    criticalData: Array<models.MvdListElement> = [];
    myResources: any;

    private setResources() {
        this.myResources = {
            criticalText: this.resourcesService.resource("critical")
        }
    }

    constructor(private resourcesService: ResourceService) {
        this.setResources();
    }

    initializeData(input: any) {
        this.criticalData = input;
    }

    onElementClick(event: any) {
        this.elementClick.emit(event);
    }
}

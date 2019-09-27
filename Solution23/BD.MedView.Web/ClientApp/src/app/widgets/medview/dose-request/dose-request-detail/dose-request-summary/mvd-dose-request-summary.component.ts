import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ResourceService } from 'container-framework';
@Component({
    selector: 'mvd-dose-request-summary',
    templateUrl: './mvd-dose-request-summary.component.html',
    styleUrls: ['./mvd-dose-request-summary.component.scss']
})
export class DoseRequestSummaryComponent {

    @Input() items: any = [];
    @Input() totals: any;
    @Input() selectedItem: string;
    @Output() onSelectionChange = new EventEmitter<any>();

    @Input() iconStyleClass: Function;
    @Input() borderStyleClass: Function;

    resources: any;

    constructor(private resourcesService: ResourceService) {
        this.resources = this.getResources();
    }

    getResources() {
        return {
            allLocations: this.resourcesService.resource('columnAllLocations'),
            request: this.resourcesService.resource('request'),
            requests: this.resourcesService.resource('requests'),
            columnNew: this.resourcesService.resource('columnNew'),
            newestItem: this.resourcesService.resource('newestItem')
        };
    }

    onClick(event: any, item: any) {
        if (item) {
            this.selectedItem = item.careUnit;
            this.onSelectionChange.emit(item);
        }
    }


}


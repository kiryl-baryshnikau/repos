import { Component, Output, EventEmitter, Input } from '@angular/core';
import { ResourceService } from 'container-framework';

@Component({
    selector: 'mvd-export-table',
    styleUrls: ['./mvd-export-table.component.scss'],
    templateUrl: './mvd-export-table.component.html'
})
export class ExportTableComponent {
    @Output() cancelClicked: EventEmitter<void> = new EventEmitter();
    @Output() exportClicked: EventEmitter<void> = new EventEmitter();

    assetsUrl = './dist/assets/images/';

    resources = {
        exportTable: this.resourcesService.resource('exportTable')
        , cancel: this.resourcesService.resource('cancel')
        , export: this.resourcesService.resource('export')
    };

    constructor(private readonly resourcesService: ResourceService) {
    }
}

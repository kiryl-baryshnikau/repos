import { Component, Input, Output, EventEmitter } from '@angular/core';
import * as models from '../../../shared/mvd-models';

@Component({
    selector: 'clinical-overview-list',
    templateUrl: './clinical-overview-list.component.html',
    styleUrls: [
        './clinical-overview-list.component.scss',
        '../mvd-clinical-overview-shared.scss'
    ]
})
export class ClinicalOverviewListComponent {
    @Input() listData: models.MvdListData;
    @Input() iconStyleClass: Function;
    @Input() borderStyleClass: Function;
    @Input() selectedItem: models.MvdListElement;

    @Output() onElementClick = new EventEmitter();

    setSelectedItem(item: models.MvdListElement) {
        this.selectedItem = item;
    }

    elementClick(event: any, item: models.MvdListElement) {
        this.selectedItem = item;
        this.onElementClick.emit(item);
    }

    getSelectedClass(item: models.MvdListElement) {
        if (this.selectedItem && (this.selectedItem.key && this.selectedItem.key === item.key)) {
            return true;
        }
    }
}

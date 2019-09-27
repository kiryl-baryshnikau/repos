import { Component, Input, Output, OnInit, OnChanges, EventEmitter, ChangeDetectionStrategy }      from '@angular/core';

import * as models from '../../shared/mvd-models';

@Component({
  moduleId: module.id,
  selector: 'mvd-list-priorities',
  templateUrl: './mvd-list-priorities.component.html',
  styleUrls: [
'./mvd-list-priorities.component.scss',
'../../medview/clinical-overview/mvd-clinical-overview.component.scss'
],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MvdListPrioritiesComponent implements OnInit, OnChanges {

    @Input() listData: models.MvdListData;
    @Input() iconStyleClass: Function;
    @Input() borderStyleClass: Function;
    @Input() selectedItem: models.MvdListElement;

    @Output() onElementClick = new EventEmitter();

    constructor(){
    }

    ngOnInit() {
    }

    ngOnChanges(){

    }

    setSelectedItem(item: models.MvdListElement) {
        this.selectedItem = item;
    }

    private elementClick(event: any, item: models.MvdListElement) {
        this.selectedItem = item;
        this.onElementClick.emit(item);
    }

    private getSelectedClass(item: models.MvdListElement) {
        if (this.selectedItem &&
            (item.originalItem === this.selectedItem.originalItem || 
            (this.selectedItem.key && this.selectedItem.key === item.key))) {
            return true;
        }
    }
}

import { Component, Input, Output, EventEmitter } from '@angular/core'

import { SelectItem } from 'primeng/primeng';

@Component({
    selector: 'mvd-checkbox-picklist',
    templateUrl: './mvd-checkbox-picklist.component.html',
    styleUrls: [ './mvd-checkbox-picklist.component.scss' ]
})
export class CheckboxPicklistComponent {
    @Input() sourceList: SelectItem[] = [];
    @Input() targetList: SelectItem[] = [];
    @Input() sourceListLabel: string;
    @Input() targetListLabel: string;

    selectedItemsSource: any[] = [];
    selectedItemsTarget: any[] = [];

    @Output() selectionToRightEvent = new EventEmitter();
    @Output() allSourceToRightEvent = new EventEmitter();
    @Output() selectionToLeftEvent = new EventEmitter();
    @Output() allTargetToLeftEvent = new EventEmitter();


    onSelectionToRight() {
        this.selectionToRightEvent.emit([...this.selectedItemsSource]);
        this.selectedItemsSource = [];
    }

    onAllToRight() {
        this.allSourceToRightEvent.emit();
    }

    onSelectionToLeft() {
        this.selectionToLeftEvent.emit([...this.selectedItemsTarget]);
        this.selectedItemsTarget = [];
    }

    onAllToLeft() {
        this.allTargetToLeftEvent.emit();
    }
}

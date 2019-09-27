import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';

@Component({
    selector: 'mvd-button-selection',
    templateUrl: './button-selection.component.html',
    styleUrls: ['./button-selection.component.scss']
})
export class ButtonSelectionComponent {

    @Output() selectionToRight = new EventEmitter();
    @Output() allToRight = new EventEmitter();
    @Output() selectionToLeft = new EventEmitter();
    @Output() allToLeft = new EventEmitter();

    onSelectionToRight() {
        this.selectionToRight.emit();
    }

    onAllToRight() {
        this.allToRight.emit();
    }

    onSelectionToLeft() {
        this.selectionToLeft.emit();
    }

    onAllToLeft() {
        this.allToLeft.emit();
    }
}

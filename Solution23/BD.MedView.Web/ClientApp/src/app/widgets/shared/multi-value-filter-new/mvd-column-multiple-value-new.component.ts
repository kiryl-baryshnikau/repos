import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { MultipleValueFilter } from '../multi-value-filter/mvd-column-multiple-value.component';

@Component({
    selector: 'mvd-column-multiple-value-new',
    templateUrl: 'mvd-column-multiple-value-new.component.html',
    styleUrls: ['mvd-column-multiple-value-new.component.scss']
})
export class MultipleValueFilterComponent extends MultipleValueFilter implements OnInit {
    @Output() cancelClicked = new EventEmitter();

    ngOnInit(): void {
        this.resources['filterInfusions'] = this.resourceService.resource('filterInfusions');
        this.resources['cancel'] = this.resourceService.resource('cancel');
    }

    cancel(): void {
        this.cancelClicked.emit();
    }
}

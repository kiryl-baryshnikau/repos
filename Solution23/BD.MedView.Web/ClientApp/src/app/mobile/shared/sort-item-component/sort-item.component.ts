import { Component, Output, EventEmitter, Input } from '@angular/core';
import { SortDirection, SortItemClickEvent } from '../mvd-mobile-models';

@Component({
    selector: 'mvd-sort-item-mobile',
    templateUrl: './sort-item.component.html',
    styleUrls: ['./sort-item.component.scss']
})
export class SortItemComponent {
    @Input() id: string;
    @Input() label: string;
    @Input() sortDirection: SortDirection;

    @Output() clicked = new EventEmitter<SortItemClickEvent>();

    isAscending() { return this.sortDirection === SortDirection.Ascending; }
    isDescending() { return this.sortDirection === SortDirection.Descending; }
    isUnset() { return this.sortDirection === SortDirection.Unset; }

    onClicked() {
        this.clicked.emit({ id: this.id, sortDirection: this.sortDirection } as SortItemClickEvent);
    }
}

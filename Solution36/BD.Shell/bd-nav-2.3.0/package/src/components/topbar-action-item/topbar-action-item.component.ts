import { Component, Input, Output, EventEmitter } from '@angular/core'


@Component({
    selector: 'topbar-action-item',
    templateUrl: './topbar-action-item.component.html',
    styleUrls: ['./topbar-action-item.component.scss'],
    host: { 'class': 'topbar--action-item' }
})
export class TopbarActionItemComponent {
    @Input() iconStyle: string;
    @Output() iconClick = new EventEmitter<Event>();

    onIconClick(event) {
        this.iconClick.emit(event);
    }
}

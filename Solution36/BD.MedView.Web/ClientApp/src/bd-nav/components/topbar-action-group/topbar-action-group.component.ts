import { Component, Input, Output, EventEmitter, HostBinding } from '@angular/core'


@Component({
    selector: 'topbar-action-group',
    templateUrl: './topbar-action-group.component.html',
    styleUrls: ['./topbar-action-group.component.scss'],
    host: { 'class': 'topbar--action-container' }
})
export class TopbarActionGroupComponent {
    @Input() iconStyle: string = 'uss--icon-more-vertical';
    @Input() @HostBinding('class.show') actionGroupVisible: boolean = false;
    @Output() iconClick = new EventEmitter<Event>();

    onIconClick(event) {
        this.iconClick.emit(event);
        this.actionGroupVisible = !this.actionGroupVisible;
    }
}

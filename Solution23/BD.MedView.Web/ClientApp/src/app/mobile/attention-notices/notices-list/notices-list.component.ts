import { Component, Input, EventEmitter, Output } from '@angular/core';
import { MvdListData, MvdListElement } from '../../../widgets';

@Component({
    selector: 'mvd-notices-list',
    templateUrl: './notices-list.component.html',
    styleUrls: ['./notices-list.component.scss']
})
export class NoticesListComponent {

    @Input() notices: MvdListData;
    @Output() noticeSelected = new EventEmitter<MvdListElement>();

    onNoticeSelected(selectedNotice: MvdListElement) {
        this.noticeSelected.emit(selectedNotice);
    }

    getIconClass(item: MvdListElement) {
        let cssClass = 'fa';

        switch (item.priority) {
            case 'H':
                cssClass += ' fa-stop fa-rotate-45';
                break;
            case 'M':
                cssClass += ' fa-play fa-rotate-270';
                break;
            case 'L':
                cssClass += ' fa-stop';
                break;
            default:
                cssClass += ' fa-circle';
                break;
        }

        return cssClass;
    }

    getBorderClass(item: MvdListElement) {
        let cssClass = 'leftBorder';

        switch (item.priority) {
            case 'H':
                cssClass += ' highPriorityBorder';
                break;
            case 'M':
                cssClass += ' mediumPriorityBorder';
                break;
            case 'L':
                cssClass += ' lowPriorityBorder';
                break;
            default:
                cssClass += ' normalPriorityBorder';
                break;
        }
        return cssClass;
    }

}

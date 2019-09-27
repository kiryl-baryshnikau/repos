import { Component, OnChanges, SimpleChanges, Input, OnInit } from '@angular/core';

@Component({
    selector: "iv-prep-table-icons",
    templateUrl: "./iv-prep-table-icons.component.html",
    styleUrls: [ "./iv-prep-table-icons.component.scss" ]
})
export class IvPrepTableIconsComponent implements OnChanges, OnInit {
    statusClass: string;

    @Input()
    doseStatus: string;

    @Input()
    iconStatus: string;

    @Input()
    deliveryMode: boolean;

    canceledLabel: string = 'CANCELED';
    onHoldLabel: string = 'ON HOLD';

    ngOnInit() {
        this.setClass();
    }

    private setClass() {
        let statusClass = '';
        if (this.iconStatus !== 'ONHOLD' && this.iconStatus !== 'CANCELED' && this.iconStatus !== 'ONHOLDSTAT') {

            switch (this.doseStatus) {
                case 'QUEUEDPREP':
                    statusClass = 'queue-for-prep-icon';
                    break;
                case 'READYPREP':
                    statusClass = 'ready-for-prep-icon';
                    break;
                case 'INPREP':
                    statusClass = 'in-prep-icon';
                    break;
                case 'READYCHECK':
                    statusClass = 'ready-for-check-icon';
                    break;
                case 'READYDELIVERY':
                    statusClass = 'ready-for-delivery-icon';
                    break;
                case 'COMPLETED':
                case 'DELIVERY':
                    statusClass = 'completed';
                    break;
                default:
                    statusClass = '';
            }
            statusClass = this.iconStatus === 'STAT' ? statusClass + '-s' : statusClass;
            this.statusClass = this.deliveryMode ? statusClass + '-del' : statusClass;
        }
        else {
            statusClass = this.iconStatus === 'CANCELED' ? 'canceled' : (this.iconStatus === 'ONHOLD' ? 'canceled' : 'onhold-s');
            this.statusClass = this.deliveryMode ? statusClass + '-del' : statusClass;
        }

    }

    ngOnChanges(changes: SimpleChanges) {
        if ((changes.iconStatus || changes.doseStatus) && (changes.iconStatus.previousValue !== undefined || changes.doseStatus.previousValue !== undefined)) {
            this.setClass();
        }
    }
}

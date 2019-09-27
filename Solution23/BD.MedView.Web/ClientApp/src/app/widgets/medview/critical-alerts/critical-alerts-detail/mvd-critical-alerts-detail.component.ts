import { Component, Input, OnInit, OnDestroy } from "@angular/core";
import { EventBusService } from "container-framework";
import { Subscription } from "rxjs";
import { filter } from "rxjs/operators";

@Component({
    selector: 'mvd-critical-alerts-detail',
    template: '<h3>Placeholder for Critical Alerts Detail Widget. appCode {{appCode}} widgetId {{widgetId}} user {{user}}</h3>'
})
export class CriticalAlertsDetailComponent implements OnInit, OnDestroy {
    public static ComponentName = "medViewCriticalAlertsDetails";

    @Input() appCode: string;
    @Input() widgetId: string;
    @Input() user: string;

    private eventBusStateSubscription: Subscription;
    private autoRefresh: string;
    private manualRefresh: string;

    constructor(private eventBus: EventBusService, ) {

    }

    ngOnInit() {
        this.autoRefresh = this.eventBus.subcribeRequestAutoRefresh(this.appCode, this.widgetId);
        this.manualRefresh = this.eventBus.subcribeRequestManualRefresh(this.appCode, this.widgetId);
        this.eventBusStateSubscription = this.eventBus.eventBusState$
            .pipe(
                filter((state: any) => state.target === this.autoRefresh || state.target === this.manualRefresh)
            )
            .subscribe(() => {
                this.eventBus.emitNoDataAvailable(this.appCode, this.widgetId);
            });

    }

    ngOnDestroy() {
        this.eventBusStateSubscription.unsubscribe();
    }
}

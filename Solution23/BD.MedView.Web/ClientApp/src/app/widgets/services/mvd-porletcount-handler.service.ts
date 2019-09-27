import { Injectable, OnDestroy } from '@angular/core';
import { Observable, ReplaySubject, Subscription, timer } from 'rxjs';
import { filter } from 'rxjs/operators';
import { PortletCountChangedInfo, PortletCountChangeReason, DashboardEventBusService, SetWidgetPositionEventInfo, SetWidgetSizeAndPositionEventInfo } from 'container-framework';

@Injectable()
export class PorletCountHandlerService implements OnDestroy {
    private dashboardId = 'MedViewPriorities';
    private portletCountChanged: string;
    private eventBusStateChanged$: Subscription;
    private notify = new ReplaySubject<any>(1);

    notifyObservable$ = this.notify.asObservable();

    constructor(private dashboardEventBus: DashboardEventBusService) {
        this.portletCountChanged = this.dashboardEventBus.subscribePortletCountChanged(this.dashboardId);
        this.eventBusStateChanged$ = this.dashboardEventBus.eventBusState$.pipe(
            filter(state => state.target === this.portletCountChanged)
        ).subscribe((state: any) => {
            timer(0).subscribe(() =>   this.onPortletCountChanged(state.data));
            this.notifyEvent('portletCountChanged', state.data);
        });
    }

    private applySingleWidgetLayout(event: PortletCountChangedInfo) {
        const attnNoticesIndex = event.widgetsInfo.findIndex(e => e.name === 'medViewAttentionNotices');
        const totalWidth = event.gridsterConfigInfo.colCount;
        if (attnNoticesIndex >= 0) {
            const resizeWidget: SetWidgetSizeAndPositionEventInfo[] = [
                {
                    widgetId: event.widgetsInfo[attnNoticesIndex].id,
                    posX: 0,
                    posY: 0,
                    sizeX: totalWidth,
                    sizeY: 22
                }
            ];
            this.dashboardEventBus.emitSetWidgetSizeAndPosition(this.dashboardId, resizeWidget);
            return;
        }

        const doseRequestIndex = event.widgetsInfo.findIndex(e => e.name === 'medViewDoseRequest');
        if (doseRequestIndex >= 0) {
            const positionItems = [
                {
                    widgetId: event.widgetsInfo[doseRequestIndex].id,
                    posX: 0,
                    posY: 0
                }
            ];
            this.dashboardEventBus.emitSetWidgetPosition(this.dashboardId, positionItems);
            return;
        }
    }

    private applyTwoWidgetsLayout(event: PortletCountChangedInfo) {
        // We only care when Attention Notices is visible, and Continuous Infusions is not
        const attnNoticesIndex = event.widgetsInfo.findIndex(e => e.name === 'medViewAttentionNotices');
        const continuousInfusionsIndex = event.widgetsInfo.findIndex(e => e.name === 'medViewContinuousInfusion');
        if (attnNoticesIndex < 0 || continuousInfusionsIndex >= 0) { return; }

        const totalHeight = event.gridsterConfigInfo.rowCount;
        const totalWidth = event.gridsterConfigInfo.colCount;
        const minHeight = Math.floor(totalHeight / 2);

        const doseRequestIndex = event.widgetsInfo.findIndex(e => e.name === 'medViewDoseRequest');
        const medminedIndex = event.widgetsInfo.findIndex(e => e.name === 'medViewCriticalAlerts');

        // Set attention notices to top, horizontally maximized
        const resizeWidget: SetWidgetSizeAndPositionEventInfo[] = [
            {
                widgetId: event.widgetsInfo[attnNoticesIndex].id,
                posX: 0,
                posY: 0,
                sizeX: totalWidth,
                sizeY: minHeight
            }
        ];

        // Set the other widget to the bottom-left, preserve current X-size
        let widgetId: string;
        let sizeX: number;
        if (doseRequestIndex >= 0) {
            widgetId = event.widgetsInfo[doseRequestIndex].id;
            sizeX = 7;
        } else if (medminedIndex >= 0) {
            widgetId = event.widgetsInfo[medminedIndex].id;
            sizeX = event.widgetsInfo[medminedIndex].sizeX;
        }

        resizeWidget.push(
            {
                widgetId: widgetId,
                posX: 0,
                posY: minHeight,
                sizeX: sizeX,
                sizeY: minHeight
            }
        );

        this.dashboardEventBus.emitSetWidgetSizeAndPosition(this.dashboardId, resizeWidget);
        return;
    }

    private applyThreeWidgetsLayout(event: PortletCountChangedInfo) {
        // We only care when Attention Notices is visible, and Continuous Infusions is not
        const attnNoticesIndex = event.widgetsInfo.findIndex(e => e.name === 'medViewAttentionNotices');
        const continuousInfusionsIndex = event.widgetsInfo.findIndex(e => e.name === 'medViewContinuousInfusion');
        const doseRequestIndex = event.widgetsInfo.findIndex(e => e.name === 'medViewDoseRequest');
        const medminedIndex = event.widgetsInfo.findIndex(e => e.name === 'medViewCriticalAlerts');

        const totalHeight = event.gridsterConfigInfo.rowCount;
        const totalWidth = event.gridsterConfigInfo.colCount;
        const halfHeight = Math.floor(totalHeight / 2);

        let resizeWidget: SetWidgetSizeAndPositionEventInfo[];
        if (attnNoticesIndex < 0 || continuousInfusionsIndex >= 0) { return; }

        resizeWidget = [
            {
                widgetId: event.widgetsInfo[attnNoticesIndex].id,
                posX: 0,
                posY: 0,
                sizeX: totalWidth,
                sizeY: halfHeight
            },
            {
                widgetId: event.widgetsInfo[medminedIndex].id,
                posX: 0,
                posY: halfHeight,
                sizeX: 7,
                sizeY: 13
            },
            {
                widgetId: event.widgetsInfo[doseRequestIndex].id,
                posX: 7,
                posY: halfHeight,
                sizeX: 18,
                sizeY: 13
            }
        ];
        this.dashboardEventBus.emitSetWidgetSizeAndPosition(this.dashboardId, resizeWidget);
    }

    private onPortletCountChanged(event: PortletCountChangedInfo) {
        if (event.appCode === this.dashboardId && event.widgetsInfo && event.widgetsInfo.length > 0) {

            switch(event.widgetsInfo.length) {
                case 1:
                    this.applySingleWidgetLayout(event);
                    return;
                case 2:
                    this.applyTwoWidgetsLayout(event);
                    return;
                case 3:
                    this.applyThreeWidgetsLayout(event);
                    return;
                case 4:
                default:
                    return;
            }
        }
    }

    public notifyEvent(key: any, data: any) {
        this.notify.next({ key: key, data: data });
    }

    public getNotification() {
        return this.notifyObservable$;
    }

    ngOnDestroy() {
        this.eventBusStateChanged$.unsubscribe();
    }

}

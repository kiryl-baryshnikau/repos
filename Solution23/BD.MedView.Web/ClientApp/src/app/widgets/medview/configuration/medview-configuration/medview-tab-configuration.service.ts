import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { MvdConstants } from '../../../shared/mvd-constants';

@Injectable()
export class TabConfigurationService{
    private attentionNoticesWidget: string = MvdConstants.ATTENTIONNOTICES_WIDGET_KEY;
    private continuousInfusionsWidget: string = MvdConstants.CONTINUOUSINFUSIONS_WIDGET_KEY;
    private deliveryTrackingWidget: string = MvdConstants.DELIVERYTRACKING_WIDGET_KEY;
    private doseRequestWidget: string = MvdConstants.DOSEREQUEST_WIDGET_KEY;
    private ivStatusWidget: string = MvdConstants.IVSTATUS_WIDGET_KEY;
    private ivPrepWidget: string = MvdConstants.IVPREP_WIDGET_KEY;
    private clinicalOverviewWidget: string = MvdConstants.CLINICALOVERVIEW_WIDGET_KEY;

    private tabsData = [
        {
            routeUrl: 'None',
            routeName: 'None',
            order: 0,
            widgets: null
        },
        {
            routeUrl: 'ContinuousInfusion',
            routeName: 'Priorities',
            order: 1,
            widgets: [
                this.attentionNoticesWidget,
                this.doseRequestWidget,
                this.continuousInfusionsWidget
            ]
        },
        {
            routeUrl: 'IVStatus',
            routeName: 'IV Status',
            order: 5,
            widgets: [this.ivStatusWidget]
        },
        {
            routeUrl: 'IVPrep',
            routeName: 'IV Prep',
            order: 3,
            widgets: [this.ivPrepWidget]
        },        
        {
            routeUrl: 'DeliveryTracking',
            routeName: 'Delivery Tracking',
            order: 4,
            widgets: [this.deliveryTrackingWidget]
        },
        {
            routeUrl: 'ClinicalOverview',
            routeName: 'Clinical Alerts',
            order: 2,
            widgets: [this.clinicalOverviewWidget]
        }
    ];


    getTabs(selectedWidgets: string[]):any{
        let orderedTabs = this.tabsData.filter(tab => tab.widgets === null || selectedWidgets.some(widget => tab.widgets.some(x => x === widget)));
        orderedTabs = _.sortBy(orderedTabs, ['order']);
        return orderedTabs;
    }

    getTabById(widgetId: string):any{
       return this.tabsData.filter(x => x.widgets).find(tab => tab.widgets.some(x => x === widgetId));
    }

    getTabNone(){
        return this.tabsData.find(x => x.routeName === 'None');
    }
}

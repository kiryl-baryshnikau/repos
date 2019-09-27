import { Injectable } from '@angular/core';

import { IVStatusComponent } from '../medview/iv-status/mvd-iv-status.component';
import { ContinuousInfusions } from '../medview/continuous-infusions/mvd-continuous-infusions.component';
import { InfusionsLineChart } from '../medview/continuous-infusions/infusions-line-chart/mvd-infusions-line-chart.component';
import { AttentionNoticesComponent } from '../medview/attention-notices/mvd-attention-notices.component';
import { DeliveryTrackingComponent } from '../medview/delivery-tracking/mvd-delivery-tracking.component';
import { DoseRequestComponent } from '../medview/dose-request/mvd-dose-request.component';
import { ConfigurationComponent } from '../medview/configuration/configuration.component';
import { AttentionNoticesDetailComponent } from '../medview/attention-notices/attention-notices-detail/mvd-attention-notices-detail.component';
import { DoseRequestDetailComponent } from '../medview/dose-request/dose-request-detail/mvd-dose-request-detail.component';

import { IVPrepComponent } from '../medview/iv-prep/mvd-iv-prep.component';

import { CriticalAlertsComponent } from '../medview/critical-alerts/mvd-critical-alerts.component';
import { CriticalAlertsDetailComponent } from '../medview/critical-alerts/critical-alerts-detail/mvd-critical-alerts-detail.component';

import { ClinicalOverviewComponent } from '../medview/clinical-overview/mvd-clinical-overview.component';

// Register components to be loaded dynamically
//
// Note, that in the Widgets object each entry name must match
//       the CFW.Widget.Name value in the CFW database and
//       it is case sensitive
//
const Widgets = {
    medViewIVStatus: IVStatusComponent,
    medViewContinuousInfusion: ContinuousInfusions,
    medViewInfusionsLineChart: InfusionsLineChart,
    medViewAttentionNotices: AttentionNoticesComponent,
    medViewDeliveryTracking: DeliveryTrackingComponent,
    medViewDoseRequest: DoseRequestComponent,
    medViewConfiguration: ConfigurationComponent,
    medViewIVPrep: IVPrepComponent,
    medViewCriticalAlerts: CriticalAlertsComponent,
    medViewClinicalOverview: ClinicalOverviewComponent,
    //for temporal integration
    mvdAttentionNoticesDetail: AttentionNoticesDetailComponent,
    mvdDoseRequestDetailComponent: DoseRequestDetailComponent,
    medViewCriticalAlertsDetails: CriticalAlertsDetailComponent
};

export const WidgetsList = [
    IVStatusComponent,
    ContinuousInfusions,
    InfusionsLineChart,
    AttentionNoticesComponent,
    DeliveryTrackingComponent,
    DoseRequestComponent,
    ConfigurationComponent,
    IVPrepComponent,
    CriticalAlertsComponent,
    ClinicalOverviewComponent,
    //for temporal integration
    AttentionNoticesDetailComponent,
    DoseRequestDetailComponent,
    CriticalAlertsDetailComponent
];

@Injectable()
export class MedViewWidgetsService {
    getComponent(widgetName: string): any {
        return Widgets[widgetName];
    };

    getComponents(): any[] {
        // Object.values(Widgets); // No support by IE
        return Object.keys(Widgets).map(key => Widgets[key]);
    };
}

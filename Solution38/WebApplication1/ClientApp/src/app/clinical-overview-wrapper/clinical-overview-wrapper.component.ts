import { Component } from '@angular/core';

@Component({
    selector: 'clinical-overview-wrapper',
    //template: `<cfw-main-container style="height:100%;"></cfw-main-container>`
    templateUrl: './clinical-overview-wrapper.component.html'
})
export class ClinicalOverviewWrapperComponent {
    dashboardId = "MedViewClinicalOverview";
    user: string;

    constructor() {
        this.user = "userInfo.loginName";
    }

    attentionNotices: boolean = true;
    continuousInfusions: boolean = true;
    doseRequests: boolean = true;

    widgetSet: string[] = ['ATTENTION NOTICES', 'CONTINUOUS INFUSIONS', 'DOSE REQUESTS'];
    widgetDrill: string = '';

    onSetSelectionChange(): void {
        let widgetSet: Array<string> = [];
        if (this.attentionNotices) { widgetSet.push('ATTENTION NOTICES') }
        if (this.continuousInfusions) { widgetSet.push('CONTINUOUS INFUSIONS') }
        if (this.doseRequests) { widgetSet.push('DOSE REQUESTS') }
        this.widgetSet = widgetSet;
    }

}

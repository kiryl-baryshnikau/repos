import { Component } from '@angular/core';

import { AuthenticationService } from 'bd-nav/core';
import * as models from 'bd-nav/models';

@Component({
    selector: 'clinical-overview-wrapper',
    template: `<cfw-main-container style="height:100%;" dashboard="{{dashboardId}}" user="{{user}}"></cfw-main-container>`
})
export class ClinicalOverviewWrapperComponent {
    dashboardId = "MedViewClinicalOverview";
    user: string;

    constructor(private authenticationService: AuthenticationService) {
        let userInfo = <any>this.authenticationService.accessToken;
        this.user = userInfo.loginName;
    }
}

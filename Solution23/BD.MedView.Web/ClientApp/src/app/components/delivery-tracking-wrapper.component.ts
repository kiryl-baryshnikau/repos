import { Component } from '@angular/core';

import { AuthenticationService } from 'bd-nav/core';
import * as models from 'bd-nav/models';

@Component({
    selector: 'delivery-tracking-wrapper',
    template: `<cfw-main-container dashboard="{{dashboardId}}" user="{{user}}"></cfw-main-container>`
})
export class DeliveryTrackingWrapperComponent {
    dashboardId = "MedViewDeliveryTracking";
    user: string;

    constructor(private authenticationService: AuthenticationService) {
        let userInfo = <any>this.authenticationService.accessToken;
        this.user = userInfo.loginName;
    }
}

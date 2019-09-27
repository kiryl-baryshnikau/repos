import { Component } from '@angular/core';

import { AuthenticationService } from 'bd-nav/core';
import * as models from 'bd-nav/models';

@Component({
    selector: 'iv-status-wrapper',
    template:`<cfw-main-container style="height:100%;" dashboard="{{dashboardId}}" user="{{user}}"></cfw-main-container>`
})
export class IVStatusWrapperComponent {
    dashboardId = "MedView";
    user: string;

    constructor(private authenticationService: AuthenticationService) {
        let userInfo = <any>this.authenticationService.accessToken;
        this.user = userInfo.loginName;
    }
}

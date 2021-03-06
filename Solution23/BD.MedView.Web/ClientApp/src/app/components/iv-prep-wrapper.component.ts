﻿import { Component } from '@angular/core';

import { AuthenticationService } from 'bd-nav/core';
import * as models from 'bd-nav/models';

@Component({
    selector: 'iv-prep-wrapper',
    template: `<cfw-main-container dashboard="{{dashboardId}}" user="{{user}}"></cfw-main-container>
               <p-toast baseZIndex="0" autoZIndex="false" styleClass="custom-toast" key="custom"></p-toast>`
})
export class IVPrepWrapperComponent {
    dashboardId = "MedViewIVPrep";
    user: string;

    constructor(private authenticationService: AuthenticationService) {
        let userInfo = <any>this.authenticationService.accessToken;
        this.user = userInfo.loginName;
    }
}

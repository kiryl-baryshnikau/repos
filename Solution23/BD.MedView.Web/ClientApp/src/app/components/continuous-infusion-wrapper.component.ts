import { Component } from '@angular/core';

import { AuthenticationService } from 'bd-nav/core';

import { PorletCountHandlerService } from '../widgets/services/mvd-porletcount-handler.service';

import * as models from 'bd-nav/models';

@Component({
    selector: 'continuous-infusion-wrapper',
    template: `<cfw-main-container style="height:100%;" dashboard="{{dashboardId}}" user="{{user}}">
    </cfw-main-container><p-toast baseZIndex="0" autoZIndex="false" styleClass="continuous-infusion-toast" key="custom"></p-toast>`
})
export class ContinuousInfusionWrapperComponent {
    dashboardId = 'MedViewPriorities';
    user: string;

    constructor(private authenticationService: AuthenticationService,
        // DO NOT REMOVE, needs to be instantiated before attention notices widget
        private porletCountHandlerService: PorletCountHandlerService) {
        const userInfo = <any>this.authenticationService.accessToken;
        this.user = userInfo.loginName;
    }
}

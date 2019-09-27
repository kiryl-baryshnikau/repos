import { Component } from '@angular/core';

import { AuthenticationService } from 'bd-nav/core';
import * as models from 'bd-nav/models';

@Component({
    selector: 'configuration-wrapper',
    template: `<cfw-main-container dashboard="{{dashboardId}}" user="{{user}}" ></cfw-main-container>
               <p-toast baseZIndex="0" autoZIndex="false" styleClass="configuration-toast" key="configuration"></p-toast>`,
    styles: ['::ng-deep configuration-wrapper .Dashboard__Controls { display: none !important }']
})
export class ConfigurationWrapperComponent {
    dashboardId = "MedViewConfiguration";
    user: string;

    constructor(private authenticationService: AuthenticationService) {
        let userInfo = <any>this.authenticationService.accessToken;
        this.user = userInfo.loginName;
    }
}

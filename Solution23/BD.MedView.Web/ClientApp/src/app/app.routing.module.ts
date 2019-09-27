import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ModalModule } from 'ngx-bootstrap';

import { CfwModule } from 'container-framework';
import { WidgetsModule } from './widgets/widgets.module';

import { TabViewModule, DataTableModule, SharedModule } from 'primeng/primeng';

import { AuthenticationGuard } from 'bd-nav/core';
import { AuthenticationAdapter } from './services/bearer-authentication-adapter';
import { AuthorizationGuard } from './services/authorization-guard';
import { SiteSelectionService } from './services/site-selection.service';
import { ContinuousInfusionWrapperComponent } from './components/continuous-infusion-wrapper.component';
import { IVStatusWrapperComponent } from './components/iv-status-wrapper.component';
import { IVPrepWrapperComponent } from './components/iv-prep-wrapper.component';
import { DeliveryTrackingWrapperComponent } from './components/delivery-tracking-wrapper.component';
import { ClinicalOverviewWrapperComponent } from './components/clinical-overview-wrapper.component';
import { PageNotFoundComponent } from './components/page-not-found.component';
import { UnauthorizedComponent } from './components/unauthorized.component';
import { WelcomeComponent } from './components/welcome.component';
import { ConfigurationWrapperComponent } from './components/configuration-wrapper.component';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

const routes: Routes = [
    { path: 'ContinuousInfusion', component: ContinuousInfusionWrapperComponent, canActivate: [AuthenticationGuard, AuthorizationGuard] },
    { path: 'IVStatus', component: IVStatusWrapperComponent, canActivate: [AuthenticationGuard, AuthorizationGuard] },
    { path: 'IVPrep', component: IVPrepWrapperComponent, canActivate: [AuthenticationGuard, AuthorizationGuard] },
    { path: 'DeliveryTracking', component: DeliveryTrackingWrapperComponent, canActivate: [AuthenticationGuard, AuthorizationGuard] },
    { path: 'PatientAlerts', component: ClinicalOverviewWrapperComponent, canActivate: [AuthenticationGuard, AuthorizationGuard] },
    { path: 'Configuration', component: ConfigurationWrapperComponent, canActivate: [AuthenticationGuard, AuthorizationGuard] },
    { path: 'Unauthorized', component: UnauthorizedComponent, canActivate: [AuthenticationGuard, AuthorizationGuard] },
    { path: 'mobile', loadChildren: './mobile/mobile.module#MobileModule'},
    { path: '', component: WelcomeComponent, canActivate: [AuthenticationGuard] },
    { path: '**', component: PageNotFoundComponent }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, { useHash: true }),
        BrowserModule,
        FormsModule,
        ModalModule,
        CfwModule,
        WidgetsModule,
        DataTableModule,
        TabViewModule,
        SharedModule,
        ToastModule
    ],
    exports: [RouterModule],
    providers: [
        AuthenticationAdapter,
        AuthorizationGuard,
        SiteSelectionService,
        MessageService
    ],

    // do not register child components below. Place them in component.service.ts
    declarations: [
        ContinuousInfusionWrapperComponent,
        IVStatusWrapperComponent,
        IVPrepWrapperComponent,
        DeliveryTrackingWrapperComponent,
        PageNotFoundComponent,
        UnauthorizedComponent,
        WelcomeComponent,
        ConfigurationWrapperComponent,
        ClinicalOverviewWrapperComponent
    ]
})
export class AppRoutingModule {
    constructor(authenticationAdapter: AuthenticationAdapter) {
        authenticationAdapter.authorize();
    }
}

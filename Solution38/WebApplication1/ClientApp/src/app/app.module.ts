import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';
import { CounterComponent } from './counter/counter.component';
import { FetchDataComponent } from './fetch-data/fetch-data.component';
import { ClinicalOverviewWrapperComponent } from './clinical-overview-wrapper/clinical-overview-wrapper.component';

import { MainContainerComponent } from './components/main-container/cfw-main-container.component';
import { GridContainerComponent } from './components/grid-container/cfw.grid-container.component';
import { DrillDownContainerComponent } from './components/drill-down-container/drill-down-container.component';
import { WidgetSet } from './components/main-container/cfw-main-container.directive';
import { WidgetSetCase } from './components/main-container/cfw-main-container.directive';
import { WidgetDrillCase } from './components/main-container/cfw-main-container.directive';


import { AttentionNoticesComponent } from './widgets/medview/attention-notices/mvd-attention-notices.component';
import { AttentionNoticesDetailComponent } from './widgets/medview/attention-notices/attention-notices-detail/mvd-attention-notices-detail.component';
import { ContinuousInfusions } from './widgets/medview/continuous-infusions/mvd-continuous-infusions.component';
import { DoseRequestComponent } from './widgets/medview/dose-request/mvd-dose-request.component';
import { DoseRequestDetailComponent } from './widgets/medview/dose-request/dose-request-detail/mvd-dose-request-detail.component';


@NgModule({
    declarations: [
        AppComponent,
        NavMenuComponent,
        HomeComponent,
        CounterComponent,
        FetchDataComponent,
        ClinicalOverviewWrapperComponent,

        MainContainerComponent,
        GridContainerComponent,
        DrillDownContainerComponent,
        WidgetSet,
        WidgetSetCase,
        WidgetDrillCase,

        AttentionNoticesComponent,
        AttentionNoticesDetailComponent,
        ContinuousInfusions,
        DoseRequestComponent,
        DoseRequestDetailComponent,
    ],
    imports: [
        BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
        HttpClientModule,
        FormsModule,
        RouterModule.forRoot([
            //{ path: '', component: HomeComponent, pathMatch: 'full' },
            { path: '', redirectTo: '/ContinuousInfusion', pathMatch: 'full' },

            { path: 'counter', component: CounterComponent },
            { path: 'fetch-data', component: FetchDataComponent },

            { path: 'ContinuousInfusion', component: ClinicalOverviewWrapperComponent }
        ])
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }

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
        WidgetDrillCase
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

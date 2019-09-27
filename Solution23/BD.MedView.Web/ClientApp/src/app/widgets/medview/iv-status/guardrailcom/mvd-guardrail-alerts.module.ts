import { NgModule }           from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { TooltipModule } from 'ngx-bootstrap';

import { GuardRailAlertsComponent }     from './mvd-guardrail-alerts.component';

@NgModule({
    imports: [CommonModule, BrowserModule, TooltipModule.forRoot()],
    declarations: [GuardRailAlertsComponent],
    exports: [GuardRailAlertsComponent ]
})
export class GuardRailAlertsModule { }

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ShellModule } from '../modules/shell.module';
import { FormsModule } from '@angular/forms';
import { SiteSelectionExtendedComponent } from '../components/site-selection-extended/site-selection-extended.component';
import { FacilitySelectorComponent } from '../components/facility-selector/facility-selector.component';

@NgModule({
    declarations: [
        SiteSelectionExtendedComponent,
        FacilitySelectorComponent
    ],
    imports: [
        BrowserModule,
        ShellModule,
        FormsModule
    ],
    providers: [],
    exports: [SiteSelectionExtendedComponent]
}) export class SiteSelectionExtendedModule {

}

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ShellModule } from '../modules/shell.module';
import { FormsModule } from '@angular/forms';
import { SiteSelectionComponent } from '../../src/components/site-selection/site-selection.component';

@NgModule({
    declarations: [
        SiteSelectionComponent
    ],
    imports: [
        BrowserModule,
        ShellModule,
        FormsModule
    ],
    providers: [],
    exports: [SiteSelectionComponent]
}) export class SiteSelectionModule {

}

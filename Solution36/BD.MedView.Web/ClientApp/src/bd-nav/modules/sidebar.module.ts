import { NgModule }                                     from '@angular/core';
import { BrowserModule }                                from '@angular/platform-browser';
import { ShellModule }                                  from '../modules/shell.module';
import { SidebarComponent }                             from '../components/sidebar/sidebar.component';
import { SidebarNestedMenuComponent }                   from '../components/sidebar-nested-menu/sidebar-nested-menu.component';
import { SidebarNestedSecondMenuComponent }             from '../components/sidebar-nested-second-menu/sidebar-nested-second-menu.component';

@NgModule({
    declarations: [
        SidebarComponent,
        SidebarNestedMenuComponent,
        SidebarNestedSecondMenuComponent
    ],
    imports: [
        BrowserModule,
        ShellModule
    ],
    providers: [],
    exports: [SidebarComponent]
}) export class SidebarModule {

}

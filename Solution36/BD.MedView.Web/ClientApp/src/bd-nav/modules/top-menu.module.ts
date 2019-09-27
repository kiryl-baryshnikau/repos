import { NgModule }                                     from '@angular/core';
import { BrowserModule }                                from '@angular/platform-browser';
import { ShellModule }                                  from '../modules/shell.module';
import { TopMenuComponent }                             from '../components/top-menu/top-menu.component';
import { SubmenuComponent }                             from '../components/submenu/submenu.component';

@NgModule({
    declarations: [
        TopMenuComponent,
        SubmenuComponent
    ],
    imports: [
        BrowserModule,
        ShellModule 
    ],
    providers: [],
    exports: [TopMenuComponent]
})
export class TopMenuModule {

}

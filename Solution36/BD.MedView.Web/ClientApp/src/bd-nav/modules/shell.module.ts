import { BrowserModule }                    from '@angular/platform-browser';
import { NgModule }                         from '@angular/core';
import { FormsModule }                      from '@angular/forms';
import { HttpClientModule }                 from '@angular/common/http';
import { TopbarComponent }                  from '../components/topbar/topbar.component';
import { LogoComponent }                    from '../components/logo/logo.component';
import { UserInfoWidgetComponent }          from '../components/user-info-widget/user-info-widget.component';
import { HelpLinkComponent }                from '../components/helplink/helplink.component';
import { BdNavComponent }                   from '../components/bd-nav/bd-nav.component';
import { AutoLogoutComponent }              from '../components/auto-logout/auto-logout.component';
import { RouterModule }                     from '@angular/router';
import { ComponentService }                 from '../services/component.service/component.service';
import { LocaleService }                    from '../services/locale.service/locale.service';
import { RoutingService }                   from '../services/routing-service/routing.service';
import { ApplicationConfigurationService }  from '../services/application-configuration.service/application-configuration.service';
import { UserInfoActionService }            from '../services/user-info-action-service/user-info-action.service';
import { ComponentFactoryDirective }        from '../directives/component-factory.directive';
import { ClickOutside }                     from '../directives/click-outside.directive';
import { OverflowTooltip }                  from '../directives/overflow-tooltip.directive';
import { MenuDataService }                  from '../services/menu-data-service/menu-data.service';
import { MenuService }                      from '../services/menu-service/menu.service';
import { UserService }                      from '../services/user-service/user.service';
import { GlobalService }                    from '../services/global-service/global.service';
import { SharedContentService }             from '../services/shared-content/shared-content.service';
import { AuthenticationService }            from '../services/authentication/authentication.service';
import { AuthenticationGuard }              from '../services/authentication-guard/authentication-guard.service';
import { DomActivityService }               from '../services/dom-activity.service/dom-activity.service';
import { ShellHttpService }                 from '../services/shell-http-service/shell-http.service';
import { SessionService }                   from '../services/session.service/session.service';
import { BrowserAnimationsModule }          from '@angular/platform-browser/animations';
import { ArraySearchPipe }                  from '../pipes/array-search/array-search.pipe';
import { ArrayFindPipe }                    from '../pipes/array-find/array-find.pipe';
import { ArrayCountPipe }                   from '../pipes/array-count/array-count.pipe';
import { StringFormatPipe }                 from '../pipes/string-format/string-format.pipe';
import { TopbarActionItemComponent }        from '../components/topbar-action-item/topbar-action-item.component';
import { TopbarActionGroupComponent }       from '../components/topbar-action-group/topbar-action-group.component';

@NgModule({
    declarations: [
        AutoLogoutComponent,
        BdNavComponent,
        TopbarComponent,
        LogoComponent,
        UserInfoWidgetComponent,
        TopbarActionGroupComponent,
        TopbarActionItemComponent,
        HelpLinkComponent,
        ComponentFactoryDirective,
        ClickOutside,
        OverflowTooltip,
        ArraySearchPipe,
        ArrayFindPipe,
        ArrayCountPipe,
        StringFormatPipe
    ],
    imports: [
        BrowserModule,
        FormsModule,
        //HttpModule,
        HttpClientModule,
        RouterModule,
        BrowserAnimationsModule
    ],
    providers: [RoutingService, ApplicationConfigurationService, GlobalService, LocaleService, MenuDataService, MenuService, DomActivityService, UserService, UserInfoActionService, ComponentService, SharedContentService, AuthenticationGuard, AuthenticationService, ShellHttpService, SessionService],
    exports: [BrowserAnimationsModule, AutoLogoutComponent, BdNavComponent, TopbarComponent, HttpClientModule, LogoComponent, UserInfoWidgetComponent, TopbarActionGroupComponent, TopbarActionItemComponent, HelpLinkComponent, ComponentFactoryDirective, ClickOutside, OverflowTooltip, ArraySearchPipe, ArrayFindPipe, ArrayCountPipe, StringFormatPipe]
})
export class ShellModule { }

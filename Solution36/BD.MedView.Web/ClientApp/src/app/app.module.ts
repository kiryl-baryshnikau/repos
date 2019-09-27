//import { BrowserModule } from '@angular/platform-browser';
//import { NgModule } from '@angular/core';
//import { FormsModule } from '@angular/forms';
//import { HttpClientModule } from '@angular/common/http';
//import { RouterModule } from '@angular/router';

//import { AppComponent } from './app.component';
//import { NavMenuComponent } from './nav-menu/nav-menu.component';
//import { HomeComponent } from './home/home.component';
//import { CounterComponent } from './counter/counter.component';
//import { FetchDataComponent } from './fetch-data/fetch-data.component';

//@NgModule({
//  declarations: [
//    AppComponent,
//    NavMenuComponent,
//    HomeComponent,
//    CounterComponent,
//    FetchDataComponent
//  ],
//  imports: [
//    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
//    HttpClientModule,
//    FormsModule,
//    RouterModule.forRoot([
//      { path: '', component: HomeComponent, pathMatch: 'full' },
//      { path: 'counter', component: CounterComponent },
//      { path: 'fetch-data', component: FetchDataComponent },
//    ])
//  ],
//  providers: [],
//  bootstrap: [AppComponent]
//})
//export class AppModule { }

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

import { ShellModule, TopMenuModule } from '../bd-nav/core';
import { ApplicationConfigurationService, ComponentService, UserInfoActionService, AuthenticationService, SharedContentService, MenuDataService, MenuService, RoutingService, GlobalService, UserService } from '../bd-nav/core';
import { LogoComponent, UserInfoWidgetComponent } from '../bd-nav/core';
import * as model from '../bd-nav/models';


@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    CounterComponent,
    FetchDataComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot([
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'counter', component: CounterComponent },
      { path: 'fetch-data', component: FetchDataComponent },
    ]),
    ShellModule,
    TopMenuModule
  ],
  providers: [
    GlobalService
  ],
  entryComponents: [
    LogoComponent,
    UserInfoWidgetComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  private userInfoViewModel: model.UserInfoViewModel;
  constructor(
    private globalService: GlobalService
  ) {
    this.init();
  }

  private init() {
    this.globalService.bdShellDependentServices([model.BdShellServices.TopMenuService]);

    let config = {
    "bdShellServiceUrl": "https://bd-hsv-local-legacy-bdportal-configuration.carefusionservices.com/",
    "application": "MedView",
    "applicationConfigurationUrl": "api/applicationconfiguration/get/",
    "topMenuUrl": "api/menu/TopMenus/",
    "subMenuUrl": "api/menu/SubMenus/",
    "sideMenuUrl": "api/menu/SideMenus/",
    "userInfoUrl": "api/usermanager/UserInfo/",
    "sharedContentUrl": "api/sharedcontent/",
    "localeServiceUrl": "api/locale/get/",
    "localeResourceTypeName": "BdShell-UIElements",
    "changePasswordUrl": "ChangePassword/?AppId=235",
    "securityQuestionUrl": "SecurityQuestions/",
    "logoutUrl_": "SLO?appName=KP",
    "activeDirectoryDomains": [ "bd.com", "carefusion.com" ],
    "logOutUrl": "https://bd-hsv-local-legacy-medview-web.carefusionservices.com/api/logout",
    "accessTokenUrl": "https://bd-hsv-local-legacy-medview-web.carefusionservices.com/api/token",
    "processAuthenticationUrl": "https://bd-hsv-local-legacy-medview-web.carefusionservices.com/api/authorize",
    "isAuthenticatedUrl": "https://bd-hsv-local-legacy-medview-web.carefusionservices.com/api/keepAlive",
    "medminedSamlUrl": "https://bd-hsv-local-legacy-medview-web.carefusionservices.com/api/saml",
    "cfwDataServiceUrl": "https://bd-hsv-local-legacy-containerframework-data.carefusionservices.com/",
    "mvdUserAuthorizationBaseUrl": "https://bd-hsv-local-legacy-medview-services.carefusionservices.com/",
    "medminedUserAuthorizationBaseUrl": "https://localhost/DispensingData/HSVIntegration/",
    "idmGetUserUrl": "https://bd-hsv-local-legacy-medview-web.carefusionservices.com/api/getuser",
    "idmGetUserByNameUrl": "https://bd-hsv-local-legacy-medview-web.carefusionservices.com/api/getuserbyname",
    "applicationSessionResetUrl": "https://bd-hsv-local-legacy-bdportal-configuration.carefusionservices.com/api/refresh",
    "medminedUIDocumentationInfo": "https://dev.edison.medmined.com/Phoenix/HsvIntegration",
    "medminedUIPatientInfo": "https://dev.edison.medmined.com/Phoenix/HsvIntegration",
    "medminedIdm": "https://bd-hsv-local-legacy-idm-sts.carefusionservices.com/ids",
    "hsvOnlineHelpUrl": "./OnlineHelp/MVD/Default.htm",
    "disableAutoTimeout": false,
    "logoutTime": 1200,
    "logoutWarningTime": 60,
    "localIdsUserMigrationEnabled": 0,
    "orderServiceEnabled": 1,
    "trackingEnabled": false,
    "hashingEnabled": false,
    "medminedSecondaryDataPageCount": 3,
    "userConfigSingleRequestPerSession": 1
  }

    this.globalService.setConfiguration(config);
  }
}

import { NgModule, LOCALE_ID  } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { of } from 'rxjs';
import { catchError, concatMap, map, tap, take } from 'rxjs/operators';

import * as _ from 'lodash';

import { registerLocaleData } from '@angular/common';
import localeEN from '@angular/common/locales/en';
import localeENGB from '@angular/common/locales/en-GB';
import localeFR from '@angular/common/locales/fr';

import { DeviceDetectorModule } from 'ngx-device-detector';

import { CfwModule, ContextService, WidgetsService, WidgetsAuthorizationService, CfwApiVersionService,
    CfwApiVersionHeadersService } from 'container-framework';
import { WidgetsModule } from './widgets/widgets.module';
import { MedViewWidgetsService } from './widgets/services/widgets.service';

import { Widgets, TopComponents, LogoComponents, MedViewComponentService } from './component.service';
import { AppRoutingModule } from './app.routing.module';
import { AppComponent } from './app.component';
import { ConfigIconComponent } from './components/config-icon/config-icon.component';
import { ShellModule, TopMenuModule, ApplicationConfigurationService, ComponentService, UserInfoActionService } from 'bd-nav/core';
import { LogoComponent, AuthenticationService, SharedContentService, MenuDataService, MenuService, RoutingService } from 'bd-nav/core';
import { UserInfoWidgetComponent } from 'bd-nav/core';
import { GlobalService } from 'bd-nav/core';
import { UserService } from 'bd-nav/core';
import { ConfigurationService } from './services/configuration.service';
import { AuthorizationService } from './services/authorization.service';
import { ResourcesService } from './services/cfw-resources.service';
import { MigrateAccountService } from './services/migrate-account.service';

import { UserConfigurationService } from './services/user-configuration.service';
import { FacilityPatientIdMappingService } from './services/facility-patient-id-mapping.service';
import { FacilityLookUpService } from './services/facility-look-up.service';
import { HttpClientAuthenticationInterceptor } from './services/httpclient.authentication.interceptor';

import { AboutComponent } from './components/about/about.component';
import { WidgetsAuthorization } from './services/widget-authorization';
import {
    AppMenuService
} from './services/app-menu.service';
import { TrackingService } from './services/tracking/tracking.service';

import * as model from 'bd-nav/models';
import { DefaultWidgetService } from './services/defaultwidget.service';

import { BdMedViewServicesClient } from './services/bd-medview-services-client';

import { TopMenuUserSettingsService } from './widgets/services/topmenu-usersettings.service';

export let localeName = normalizeLocaleName();

let supportedLocalesMap = {
    'en': localeEN,
    'en-GB': localeENGB,
    'fr': localeFR
};

const brandName = 'HealthSight';
const productName = 'Viewer';

setLocalizationContext(localeName, supportedLocalesMap);

@NgModule({
    declarations: [
        AboutComponent,
        ConfigIconComponent,
        AppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        CfwModule,
        WidgetsModule,
        ShellModule,
        TopMenuModule,
        AppRoutingModule,
        DeviceDetectorModule.forRoot()
    ],
    providers: [
        { provide: LOCALE_ID, useValue: localeName },
        ContextService,
        { provide: WidgetsService, useClass: MedViewWidgetsService },
        GlobalService,
        SharedContentService,
        AuthorizationService,
        ConfigurationService,
        UserConfigurationService,
        FacilityPatientIdMappingService,
        FacilityLookUpService,
        AppMenuService,
        ResourcesService,
        MigrateAccountService,
        { provide: HTTP_INTERCEPTORS, useClass: HttpClientAuthenticationInterceptor, multi: true },
        { provide: WidgetsAuthorizationService, useClass: WidgetsAuthorization },
        ApplicationConfigurationService,
        DefaultWidgetService,
        TopMenuUserSettingsService,
        BdMedViewServicesClient,
        CfwApiVersionService,
        CfwApiVersionHeadersService
    ],
    entryComponents: [
        LogoComponent,
        UserInfoWidgetComponent,
        AboutComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
    private userInfoViewModel: model.UserInfoViewModel;
    private autoLogoutRoute: string = null;

    constructor(
        private trackingService: TrackingService,
        private migrateAccountService: MigrateAccountService,
        private authorizationService: AuthorizationService,
        private resourcesService: ResourcesService,
        private globalService: GlobalService,
        private configurationService: ConfigurationService,
        private userService: UserService,
        private authenticationService: AuthenticationService,
        private menuDataService: MenuDataService,
        private sharedContentService: SharedContentService,
        private menuService: MenuService,
        private routingService: RoutingService,
        private userConfigurationService: UserConfigurationService,
        private applicationConfigurationService: ApplicationConfigurationService,
        private componentService: ComponentService,
        private userInfoActionService: UserInfoActionService,
        private defaultWidgetService: DefaultWidgetService,
        private appMenuService: AppMenuService,
        private topMenuUserSettingService: TopMenuUserSettingsService
    ) {

        this.init();
    }

    private init() {
        this.globalService.bdShellDependentServices([model.BdShellServices.TopMenuService]);

        // Set brand name and product name labels
        this.applicationConfigurationService.modify((applicationConfigurations) => {
            applicationConfigurations['brandName'] = brandName;
            applicationConfigurations['productName'] = productName;
        });

        this.configurationService.get()
            .pipe(
                tap(config => {
                    this.globalService.setConfiguration(config);
                    this.setApplicationContext(config);
                }),
                concatMap(() =>
                    this.authenticationService.getAuthenticationStatus()
                ),
                concatMap((authenticated) => {
                    if (authenticated) {
                        console.log("**** user authenticated");

                        this.resourcesService.getResources('MedViewAbout')
                            .subscribe(resources => {
                                this.setUserInfoViewModel(resources);
                            });

                        //this.setMenus();

                        if (!!window['localIdsUserMigrationEnabled']) {
                            return this.migrateAccountService.processAuthorizedUserInfo();
                        }
                        return of({ body: [] });
                    }

                    console.log("**** user not authenticated!!!");
                    return of({ body: [] });
                }),
                concatMap((idsInfo: any) => {
                    let info: any = idsInfo.body.length > 0 ? idsInfo.body[0] : {};
                    if (info.userAuthDetails && info.userAuthDetails.mergedUserId) {
                        let authDetails = info.userAuthDetails;
                        if (authDetails.mergedUserId !== authDetails.userId) {
                            return this.userConfigurationService.migrateLocalIdsUser(authDetails.userId, authDetails.mergedUserId)
                                .pipe(catchError(ex => {
                                    console.log("**** migrateLocalIdsUser failed", ex);
                                    return of(true);
                                }));
                        }
                    }
                    return of(true);
                }),
                concatMap(() => {
                    this.authorizationService.authContextRefresh();
                    return of(true);
                }),
                concatMap(() => this.globalService.getConfiguration()),
                concatMap((config) => this.userConfigurationService.getUserPreferences().pipe(map((preferences) => ({ config, preferences })))),
                concatMap(({ config, preferences }) => this.userConfigurationService.ensureLastActiveRoute().pipe(map((lastActiveRoute) => ({ config, preferences, lastActiveRoute }))))
            )
            .subscribe((response: any) => {
                let configuration = response.config;
                let userPreferences = response.preferences;
                let lastActiveRoute = response.lastActiveRoute;
                if (userPreferences) {
                    this.topMenuUserSettingService.processUserPreferencesMenu(userPreferences);

                    console.log("getUserPreferences - configuration");
                    const currentConfiguration = userPreferences;
                    const sessionTimeOut = currentConfiguration.sessionTimeout;
                    this.autoLogoutRoute = lastActiveRoute.value;

                    if (this.autoLogoutRoute) {
                        this.userConfigurationService.setAutoLogoutRoute("").subscribe();
                    }

                    if (sessionTimeOut > 0) {
                        // BD Shell changed implementation in 2.x version. Warning and session are inverted
                        const warningTimeOut = configuration.logoutWarningTime;
                        this.applicationConfigurationService.modify((applicationConfigurations) => {
                            applicationConfigurations['autoLogoutTime'] = warningTimeOut;
                            applicationConfigurations['autoLogoutWarningTime'] = sessionTimeOut;
                        });
                    } else {
                        console.log("getUserPreferences - error");
                    }

                    // Set logout URL
                    this.applicationConfigurationService.modify((applicationConfigurations) => {
                            applicationConfigurations['applicationSessionResetUrl'] = configuration['applicationSessionResetUrl'];
                            applicationConfigurations['logOutUrl'] = configuration["logOutUrl"];
                        });
                    let defaultWidget = userPreferences.facilities.find(facility => facility.selected === true)
                        .widgets.find(widget => widget.default === true && widget.enabled === true);

                    this.setMenus(defaultWidget);

                }
                else {
                    console.log("getUserPreferences - error");
                }
            },
                (error: any) => {
                    console.error("Init app module: " + error);
                    this.setMenus();
                });

        this.registerDynamicComponents();
        this.addTopComponents();
    }

    private setApplicationContext(configuration: any) {
        window['cfwDataServiceContext'] = configuration['cfwDataServiceUrl'];
        console.log('cfwDataServiceContext: ' + window['cfwDataServiceContext']);

        window['medminedAuthorizationServiceUrl'] = this.preProcessUrl(configuration['medminedUserAuthorizationBaseUrl']) + 'v1/Users';
        console.log('medminedAuthorizationServiceUrl: ' + window['medminedAuthorizationServiceUrl']);

        window['dispensingAuthorizationServiceUrl'] = this.preProcessUrl(configuration['cfwDataServiceUrl']) + 'api/gateway';
        console.log('dispensingAuthorizationServiceUrl: ' + window['dispensingAuthorizationServiceUrl']);

        window['mvdUserAuthorizationBaseUrl'] = configuration['mvdUserAuthorizationBaseUrl'];
        console.log('mvdUserAuthorizationBaseUrl: ' + window['mvdUserAuthorizationBaseUrl']);

        window['mvdAuthorizationServiceUrl'] = this.preProcessUrl(window['mvdUserAuthorizationBaseUrl']) + 'api/effectivePermissions';
        console.log('mvdAuthorizationServiceUrl: ' + window['mvdAuthorizationServiceUrl']);

        window['mvdUserPreferenceUrl'] = this.preProcessUrl(window['mvdUserAuthorizationBaseUrl']) + 'api/userpreferences/';
        console.log('mvdUserPreferenceUrl: ' + window['mvdUserPreferenceUrl']);

        window['mvdFacilityPatientIdMappingUrl'] = this.preProcessUrl(window['mvdUserAuthorizationBaseUrl']) + 'api/facilitypatientidmappings/';
        console.log('mvdFacilityPatientIdMappingUrl: ' + window['mvdFacilityPatientIdMappingUrl']);

        window['mvdGlobalPreferenceUrl'] = this.preProcessUrl(window['mvdUserAuthorizationBaseUrl']) + 'api/globalpreferences/';
        console.log('mvdGlobalPreferenceUrl: ' + window['mvdGlobalPreferenceUrl']);

        window['idmGetUserUrl'] = configuration['idmGetUserUrl'];
        console.log('idmGetUserUrl: ' + window['idmGetUserUrl']);

        window['idmGetUserByNameUrl'] = configuration['idmGetUserByNameUrl'];
        console.log('idmGetUserByNameUrl: ' + window['idmGetUserByNameUrl']);

        window['localIdsUserMigrationEnabled'] = typeof (configuration['localIdsUserMigrationEnabled']) == "undefined" ? false : (configuration['localIdsUserMigrationEnabled'] == 1);
        console.log(`localIdsUserMigrationEnabled: ${window['localIdsUserMigrationEnabled']}`);

        window['orderServiceEnabled'] = typeof (configuration['orderServiceEnabled']) == "undefined" ? true : (configuration['orderServiceEnabled'] == 1);
        console.log(`orderServiceEnabled: ${window['orderServiceEnabled']}`);

        window['hsvOnlineHelpUrl'] = configuration['hsvOnlineHelpUrl'];
        console.log(`hsvOnlineHelpUrl: ${window['hsvOnlineHelpUrl']}`);


        window['medminedUIDocumentationInfo'] = configuration['medminedUIDocumentationInfo'];
        console.log(`medminedUIDocumentationInfo: ${window['medminedUIDocumentationInfo']}`);

        window['medminedUIPatientInfo'] = configuration['medminedUIPatientInfo'];
        console.log(`medminedUIPatientInfo: ${window['medminedUIDocumentationInfo']}`);

        window['medminedSecondaryDataPageCount'] = configuration['medminedSecondaryDataPageCount'];
        console.log(`medminedSecondaryDataPageCount: ${window['medminedSecondaryDataPageCount']}`);

        window['medminedSamlUrl'] = configuration['medminedSamlUrl'];
        console.log(`medminedSamlUrl: ${window['medminedSamlUrl']}`);

        window['medminedIdm'] = configuration['medminedIdm'];
        console.log(`medminedIdm: ${window['medminedIdm']}`);

        window['userConfigSingleRequestPerSession'] = configuration['userConfigSingleRequestPerSession'];
        console.log(`userConfigSingleRequestPerSession: ${window['userConfigSingleRequestPerSession']}`);
    }

    private preProcessUrl(url: any): string {
        url = url || '';
        return url.lastIndexOf('/') == url.length - 1 ? url : url + '/';
    }

    private registerDynamicComponents() {
        // Register components for dynamic loading
        Widgets['LogoComponent'] = LogoComponent;
        Widgets['UserInfoWidgetComponent'] = UserInfoWidgetComponent;
        Widgets['AboutComponent'] = AboutComponent;
    }

    private addTopComponents() {
        // Register logo component
        LogoComponents.push('LogoComponent');

        // Following components will appear in Top-Right bar
        TopComponents.push('AboutComponent');
        TopComponents.push('UserInfoWidgetComponent');
    }

    private formatUserDisplayName(firstName: string, lastName: string, loginName: string, userNameFormat: string): string {
        if (lastName) {
            if (firstName) {
                return (userNameFormat || '?')
                    .replace("{{LastName}}", lastName)
                    .replace("{{FirstName}}", firstName);
            }
            return lastName;
        }
        return loginName || "???";
    }

    private setUserInfoViewModel(resources: {} = {}) {
        let userNameFormat = this.resourcesService.mapResource(resources, 'userNameFormat') || "{{LastName}} {{FirstName}}";
        let logoutText = this.resourcesService.mapResource(resources, 'logoutText') || 'logout';
        let userInfo = <any>this.authenticationService.accessToken;
        let userDisplayName = this.formatUserDisplayName(userInfo.firstName, userInfo.lastName, userInfo.loginName, userNameFormat);

        this.trackingService.init();
        this.trackingService.start();

        this.globalService.getConfiguration().subscribe((config: model.Configuration) => {
            this.userInfoViewModel = <model.UserInfoViewModel>{};
            this.userInfoViewModel.userInfo = {
                userName: '',
                fullName: userDisplayName,
                firstName: '',
                lastName: '',
                privileges: [1],
            };
            config['logoutText'] = logoutText;
            this.setUserInfoWidget(config);
        });
    }

    private setMenus(widget?: any) {
        let widgetName;
        let widgetAuthorized = true;

        if (this.autoLogoutRoute) {
            widgetName = this.autoLogoutRoute.toLowerCase();
        }
        else if (widget) {
            this.authorizationService.isAuthorized2(widget.id).subscribe((status) => {
                widgetAuthorized = status;
            });

            if (widgetAuthorized) {
                widgetName = !widget.route ? widget.id.split('.').pop().replace(" ", "").toLowerCase()
                    : widget.route.toLowerCase();
            }
            else {
                widgetName = undefined;
            }
        }
        this.defaultWidgetService.setDefaultWidget(widgetName);

        this.menuService.hasLocalMenuItems().subscribe(localMenuItemsExists => {
            if (!localMenuItemsExists) {
                this.menuDataService.getTopMenus().subscribe();
            }
        });
    }

    private setUserInfoWidget(config: model.Configuration) {
        this.registerLogoutAction(config);
        this.userInfoViewModel.actionItems = [];
        const item = {
            itemName: config['logoutText'],
            action: 'logout',
        } as model.DrillDownItem;
        this.userInfoViewModel.actionItems.push(item);
        this.globalService.setUserInfoViewModel(this.userInfoViewModel);
    }

    private registerLogoutAction(config: model.Configuration) {
        this.userInfoActionService.setAction('logout', (drillDownItem) => {
            sessionStorage.clear();
            localStorage.removeItem("/allActiveTopMenu");

            this.globalService.getConfiguration().pipe(
                concatMap((config) => this.userConfigurationService.getUserPreferences().pipe(map((preferences) => ({ config, preferences })))),
                concatMap(({ config, preferences }) => {
                    let widget = preferences.facilities.find(facility => facility.selected === true)
                        .widgets.find(widget => widget.default === true && widget.enabled === true);

                    let widgetAuthorized = true;

                    if (widget) {
                        this.authorizationService.isAuthorized2(widget.id).subscribe((status) => {
                            widgetAuthorized = status;
                        });
                    }

                    if (!widget || !widgetAuthorized) {
                        return of(true);
                    }
                    else {
                        return of(false);
                    }
                }),
                concatMap((saveLasActiveRoute) =>{
                    if(saveLasActiveRoute){

                        let activeTopMenu = this.menuService.allActiveTopMenu[config.application] || null;
                        if (activeTopMenu) {
                            return this.userConfigurationService.setAutoLogoutRoute(activeTopMenu.code);
                        }
                    }
                    return of([]);
                }),
                concatMap(() => {
                    return this.sharedContentService.clear().pipe(take(1));
                })
            ).subscribe(
                    () => location.href = config['logOutUrl'],
                    (error) => location.href = config['logOutUrl'],
                );
        });
    }

}

function setLocalizationContext(localeName, supportedLocalesMap) {
    console.log('>>>>> AppModule: setting LocalizationContext...');

    var locale = supportedLocalesMap[localeName];

    if (locale) {
        registerLocaleData(locale);

        console.log(`>>>>> AppModule: Localization Context set for Locale with the name='${localeName}'`);
    }
    else {
        console.log(`>>>>> AppModule: Failed to set Localization Context for Locale with the name='${localeName}'`);
    }
}

function normalizeLocaleName() {
    let localeName = window['localeName'] || '';

    console.log(`>>>>> AppModule: raw localeName='${localeName}'`);

    if (localeName.toLowerCase() == 'en-us') {
        localeName = 'en';
    }
    else if (localeName.toLowerCase() == 'fr-fr') {
        localeName = 'fr';
    }

    console.log(`>>>>> AppModule: normalized localeName='${localeName}'`);

    return localeName;
}

import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { Observable, Subscription, zip } from 'rxjs';

import { TabViewModule } from 'primeng/primeng';

import { AuthenticationService } from 'bd-nav/core';
import { AuthorizationService } from '../../../services/authorization.service';

import { ContextConstants, ContextService, EventBusService, ResourceService } from 'container-framework';

import { MedviewConfigurationComponent } from './medview-configuration/medview-configuration.component'
import { FacilityManagementService } from '../../services/mvd-facility-management.service';
import { MvdConstants } from '../../shared/mvd-constants';
import { MedViewSystemAdminConfigComponent } from './medview-system-admin/medview-system-admin.component';
import { take } from 'rxjs/operators';

@Component({
    moduleId: module.id,
    selector: 'configuration',
    templateUrl: 'configuration.component.html',
    styleUrls: ['./configuration.component.scss'],
})

export class ConfigurationComponent implements OnDestroy, OnInit {

    public static ComponentName = "medViewConfiguration";
    private SuperUserRoleName = "BD.MedView.Web.Super";
    private SystemUserRoleName = "BD.MedView.Web.System";
    private AdminRoleName = "BD.MedView.Web.Admin";

    @Input() appCode: string;
    @Input() widgetId: string;
    @Input() user: string;
    @ViewChild(MedviewConfigurationComponent) medviewConfigurationComponent: MedviewConfigurationComponent;
    @ViewChild(MedViewSystemAdminConfigComponent) medViewSystemAdminConfigComponent: MedViewSystemAdminConfigComponent;


    isConfigurationTabSelected = false;
    isSystemAdminTabSelected = false;
    isAuthorizationTabSelected = false;
    isFacilityManagementTabSelected = false;

    isSystemInfusionSettingsEnabled: boolean = true;
    isUserInfusionSettingsEnabled: boolean = true;
    isPixysIvPrepEnabled: boolean = true;


    private eventBusStateChanged$: Subscription;
    private autoRefresh: string;
    private manualRefresh: string;
    private userName: string;

    errorMessage: string;
    resources: any;
    isAdmin: boolean;
    isSuperAdmin: boolean;
    isSystemAdmin: boolean;
    isFacilityAdmin: boolean;
    isStandardUser: boolean;
    isInitialized: boolean;

    constructor(
        private authenticationService: AuthenticationService,
        private authorizationService: AuthorizationService,
        private eventBus: EventBusService,
        private resourceService: ResourceService,
        private facilityManagementService: FacilityManagementService) {

        let userInfo = <any>this.authenticationService.accessToken;
        this.userName = userInfo.loginName;
        this.resources = this.getResources();
    }

    ngOnInit() {
        console.log(`ConfigurationComponent: appCode  = ${this.appCode} widgetId = ${this.widgetId} user = ${this.user}`);
        this.autoRefresh = this.eventBus.subcribeRequestAutoRefresh(this.appCode, this.widgetId);
        this.manualRefresh = this.eventBus.subcribeRequestManualRefresh(this.appCode, this.widgetId);
        this.eventBusStateChanged$ = this.eventBus.eventBusState$
            .subscribe((state: any) => {
                if (state.target === this.autoRefresh || state.target === this.manualRefresh) {
                    console.log(`ConfigurationComponent: Requesting and processing data`);
                    this.getData();
                }
            });

        this.eventBus.emitRequestManualRefresh(this.appCode, this.widgetId);
    }

    ngOnDestroy() {
        this.eventBusStateChanged$.unsubscribe();
    }

    private getData() {
        this.getAdminEligibility();
    }

    private getAdminEligibility() {
        this.isAdmin = false;
        this.isSuperAdmin = false;
        this.isSystemAdmin = false;
        this.isFacilityAdmin = false;
        this.isStandardUser = true;
        this.loadUserData(true);
    }

    private loadUserData(reload: boolean) {
        //console.log('***** ConfigurationComponent: loadUserData [reload mode]=' + reload);
        this.authorizationService.authContextRefresh();
        let isSuperAdmin$ = this.authorizationService.isAuthorized2("BD.MedView.Web.Screens.Super");
        let isSystemAdmin$ = this.authorizationService.isAuthorized2("BD.MedView.Web.Screens.System");
        let isFacilityAdmin$ = this.authorizationService.isAuthorized2("BD.MedView.Web.Screens.Admin");
        let isPharmacist$ = this.authorizationService.isAuthorized2(MvdConstants.PHARMACIST_ROLE_ID);
        let isClinician$ = this.authorizationService.isAuthorized2(MvdConstants.CLINICIAN_ROLE_ID);
        let isClinicalPharmacist$ = this.authorizationService.isAuthorized2(MvdConstants.CLINICAL_PHARMACIST_ROLE_ID);
        let isTechnician$ = this.authorizationService.isAuthorized2(MvdConstants.TECHNICIAN_ROLE_ID);
        let authInfo$ = this.authorizationService.authorize();
        zip(isSuperAdmin$, isSystemAdmin$, isFacilityAdmin$, isPharmacist$, isClinician$, isClinicalPharmacist$, isTechnician$, authInfo$)
        .pipe(take(1))
        .subscribe(
            (users) => {
                console.log('***** ConfigurationComponent: loadUserData SUCCESS');
                let [isSuperAdmin, isSystemAdmin, isFacilityAdmin, isPharmacist, isClinician, isClinicalPharmacist, isTechnician, authInfo] = users;
                let isAdmin = isFacilityAdmin || isSystemAdmin || isSuperAdmin;
                let isStandardUser = (isPharmacist || isClinician || isClinicalPharmacist || isTechnician);

                console.log('***** ConfigurationComponent: loadUserData: isSuperAdmin         = ' + isSuperAdmin);
                console.log('***** ConfigurationComponent: loadUserData: isSystemAdmin        = ' + isSystemAdmin);
                console.log('***** ConfigurationComponent: loadUserData: isFacilityAdmin      = ' + isFacilityAdmin);
                console.log('***** ConfigurationComponent: loadUserData: isPharmacist         = ' + isPharmacist);
                console.log('***** ConfigurationComponent: loadUserData: isClinician          = ' + isStandardUser);
                console.log('***** ConfigurationComponent: loadUserData: isClinicalPharmacist = ' + isClinicalPharmacist);
                console.log('***** ConfigurationComponent: loadUserData: isTechnician         = ' + isTechnician);
                console.log('***** ConfigurationComponent: loadUserData: isAdmin              = ' + isAdmin);
                console.log('***** ConfigurationComponent: loadUserData: isStandardUser       = ' + isStandardUser);

                this.isSuperAdmin = isSuperAdmin;
                this.isSystemAdmin = isSystemAdmin;
                this.isFacilityAdmin = isFacilityAdmin;
                this.isAdmin = isAdmin;
                this.isStandardUser = isStandardUser;
                this.setSelectedTab();
                if (reload) {
                    this.onDataLoad();
                }
                this.facilityManagementService
                    .getEnabledDataSources()
                    .subscribe((response: any) => {
                        this.updateSettingsVisibility(response, authInfo);
                    },
                    (error: any) => {
                        this.isSystemInfusionSettingsEnabled = false;
                        this.isUserInfusionSettingsEnabled = false;
                        this.isPixysIvPrepEnabled = false;
                    });
            },
            (error: any) => {
                console.log('***** ConfigurationComponent: loadUserData - fall back to a standard user');
                this.isSuperAdmin = this.isSystemAdmin = this.isFacilityAdmin = this.isAdmin = false;
                this.isConfigurationTabSelected = this.isStandardUser = true;
                if (reload) {
                    this.onDataLoad();
                }
            });
    }

    private updateSettingsVisibility(enabledSources: any, authInfo: any) {
        this.isSystemInfusionSettingsEnabled = false;
        this.isUserInfusionSettingsEnabled = false;
        this.isPixysIvPrepEnabled = false;

        if (enabledSources && enabledSources.length) {
            let providerEnabled = enabledSources.some((item) =>
                ('' || item.name).toLowerCase() === ('' || MvdConstants.INFUSION_PROVIDER_NAME).toLowerCase());
            this.isSystemInfusionSettingsEnabled = providerEnabled;
            if (authInfo && authInfo.length) {
                let synonymsOnboarded = authInfo.some((authItem) => {
                    return authItem
                        .permissions
                        .some((permission) => {
                            let resource = (permission.resource.toLowerCase() || '');
                            return resource === MvdConstants.IVSTATUS_WIDGET_KEY.toLowerCase() ||
                                resource === MvdConstants.CONTINUOUSINFUSIONS_WIDGET_KEY.toLowerCase();
                        });
                });
                this.isUserInfusionSettingsEnabled = providerEnabled && synonymsOnboarded;

                let catoProviderEnabled = enabledSources.some((item) =>
                ('' || item.name).toLowerCase() === ('' || MvdConstants.CATO_PROVIDER_NAME).toLowerCase());
                this.isPixysIvPrepEnabled = catoProviderEnabled;
            }
        }
    }


    private onDataLoad() {
        this.isInitialized = true;
        setTimeout(() => {
            this.eventBus.emitLoadDataSuccess(this.appCode, this.widgetId);
        }, 0);
    }

    private getResources() {
        return {
            settings: this.resourceService.resource('settings'),
            userAuthorization: this.resourceService.resource('userAuthorization'),
            facilityManagement: this.resourceService.resource('facilityManagement'),
            globalSystemAdminSettings: this.resourceService.resource('globalSystemAdminSettings')
        };
    }

    initConfiguration() {
        this.loadUserData(false);
        if (this.medviewConfigurationComponent) {
            this.medviewConfigurationComponent.updateConfiguration(this.user);
        }
        if (this.medViewSystemAdminConfigComponent) {
            this.medViewSystemAdminConfigComponent.getSystemAdminData();
        }
    }

    private setSelectedTab() {
        if (!this.isSelectedTabVisble()) {
            this.selectFirstVisibleTab();
        }
    }

    private isSelectedTabVisble(): boolean {
        if (this.isStandardUser && this.isConfigurationTabSelected) {
            return true;
        }

        if (this.isAdmin && (this.isAuthorizationTabSelected)) {
            return true;
        }

        if (this.isSystemAdmin && (this.isSystemAdminTabSelected)) {
            return true;
        }

        if (this.isSuperAdmin && (this.isFacilityManagementTabSelected)) {
            return true;
        }
        return false;
    }

    selectFirstVisibleTab() {
        this.isConfigurationTabSelected = false;
        this.isSystemAdminTabSelected = false;
        this.isAuthorizationTabSelected = false;
        this.isFacilityManagementTabSelected = false;

        if (this.isStandardUser) {
            this.isConfigurationTabSelected = true;
            return;
        }

        if (this.isAdmin) {
            this.isAuthorizationTabSelected = true;
            return;
        }

        if (this.isSystemAdmin) {
            this.isSystemAdminTabSelected = true;
            return;
        }

        if (this.isSuperAdmin) {
            this.isFacilityManagementTabSelected = true;
            return;
        }
    }

    tabChanged(event: any) {
        this.isConfigurationTabSelected = false;
        this.isSystemAdminTabSelected = false;
        this.isAuthorizationTabSelected = false;
        this.isFacilityManagementTabSelected = false;

        switch (event.originalEvent.target.textContent) {
            case this.resources.facilityManagement:
                this.isFacilityManagementTabSelected = true;
                break;
            case this.resources.userAuthorization:
                this.isAuthorizationTabSelected = true;
                break;
            case this.resources.globalSystemAdminSettings:
                this.isSystemAdminTabSelected = true;
                break;
            case this.resources.settings:
                this.isConfigurationTabSelected = true;
                break;
            default:
                this.selectFirstVisibleTab();
                break;
        }
    }
}

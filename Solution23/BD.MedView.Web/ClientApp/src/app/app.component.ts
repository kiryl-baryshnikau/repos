import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { LocalStorageService, GlobalService, TopMenuComponent, UserInfoActionService, MenuService } from 'bd-nav/core';
import * as model from 'bd-nav/models';
import { CfwWidgetToolbarService } from 'container-framework';
import { ConfigurationService } from './services/configuration.service';
import { UserConfigurationService } from './services/user-configuration.service';
import { ResourcesService } from './services/cfw-resources.service';

import { Observable, ReplaySubject } from 'rxjs';
import { first, concatMap, filter, map } from 'rxjs/operators';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
    moduleId: module.id,
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    providers: [LocalStorageService]
})
export class AppComponent implements OnInit {
    private resourceId = 'MedViewCore'; // Use configuration resources to store app
    private resource$: ReplaySubject<object> = new ReplaySubject(1);

    activeTopMenu: model.MenuItem = <model.MenuItem>{};
    SubMenuItems: model.SubMenuItem[];
    autoLogoutEnabled = false;
    configIconTitle: Observable<string> = this.getResource('configIconTitle');
    aboutIconTitle: Observable<string> = this.getResource('aboutIconTitle');
    isMobile = false;

    @ViewChild(TopMenuComponent) topMenuComponent: TopMenuComponent;

    constructor(
        private router: Router,
        private configurationService: ConfigurationService,
        private resourceService: ResourcesService,
        private cfwWidgetToolbarService: CfwWidgetToolbarService,
        private userConfigurationService: UserConfigurationService,
        private globalService: GlobalService,
        private menuService: MenuService,
        private userInfoActionService: UserInfoActionService,
        private deviceDetectorService: DeviceDetectorService
    ) {
        this.cfwWidgetToolbarService.setEllipsisImgUrl('./dist/assets/images/ellipsis-h.png');

        router.events.subscribe(e => {
            if (this.topMenuComponent
                && (e instanceof NavigationEnd)
                && (e as NavigationEnd).urlAfterRedirects.endsWith('Configuration')) {
                this.topMenuComponent.activeTopMenu = <model.MenuItem>{};
                this.topMenuComponent.highlightedTopMenu = <model.MenuItem>{};
            }
        });
    }

    ngOnInit() {
        this.isMobile = this.deviceDetectorService.isMobile();
        this.globalService.bdShellLoaded().pipe(
            filter(loaded => !!loaded),
            first(),
            concatMap(() =>
                this.userConfigurationService.getCurrentConfig().pipe(first()))
        ).subscribe(
            config => {
                if (config && config.userPreferences && config.userPreferences.sessionTimeout > 0) {
                    this.autoLogoutEnabled = true;
                }
                else {
                    this.autoLogoutEnabled = false;
                }
            }
        );

        this.configurationService.get().pipe(
            first(),
            concatMap((config) =>
                this.resourceService.getResourcesFromContext(this.resourceId, config['cfwDataServiceUrl'])
            )
        ).subscribe(
            response => {
                console.log(`Resources for ${this.resourceId} received`, response);
                this.resource$.next(response);
            },
            error => {
                console.log(`Error retrieving resources for ${this.resourceId}`, error);
                this.resource$.next([]);
            }
        );
    }

    beforeLogout(event: any) {
        event.handled = true;
        this.globalService.getConfiguration().subscribe(config => {
            var activeTopMenu = this.menuService.allActiveTopMenu[config.application];

            this.userConfigurationService.setAutoLogoutRoute(activeTopMenu ? activeTopMenu.code : 'Configuration').subscribe(() => {
                    this.userInfoActionService.getAction('signOut').apply({}, [<model.DrillDownItem>{ url: event.logoutUrl }]);
                });

        });
    }

    onConfigureIconClick() {
        this.router.navigate(['/Configuration']);
    }

    private getResource(id: string): Observable<string> {
        return this.resource$.pipe(
            first(),
            map(resourceResponse => this.resourceService.mapResource(resourceResponse, id))
        );
    }
}

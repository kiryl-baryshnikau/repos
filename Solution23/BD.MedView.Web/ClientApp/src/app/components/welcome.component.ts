import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { GlobalService, AuthenticationService, MenuService, MenuState } from 'bd-nav/core';
import { MenuItem } from 'bd-nav/models';

import { Observable, of } from 'rxjs';
import { filter, concatMap, map, first } from 'rxjs/operators';

import { AuthorizationService } from '../services/authorization.service';
import { DefaultWidgetService } from '../services/defaultwidget.service';

@Component({
    template: `
<div style='position: absolute; top: 50%; left: 50%; transform: translate3d(-50%,-50%,0);'>
</div>`
})
export class WelcomeComponent implements OnInit {

    constructor(
        private router: Router,
        private globalService: GlobalService,
        private menuService: MenuService,
        private authorizationService: AuthorizationService,
        private defaultWidgetService: DefaultWidgetService
        ) {
    }

    private status$: Observable<{ status: boolean, menuItem?: MenuItem }> =
        this.authorizationService.isAuthorized(null).pipe(
            concatMap(status => {
                if (!status) {
                    return of({ status: false });
                } else {
                    return this.globalService.bdShellLoaded().pipe(
                        filter(loaded => !!loaded),
                        concatMap(() => this.menuService.getTopMenuList()),
                        filter(menuItems => menuItems && menuItems.length > 0),
                        concatMap(menuItems => this.defaultWidgetService.getDefaultWidgetName$().pipe(
                            first(),
                            map(defaultWidgetName => ({
                                defaultWidgetName,
                                menuItems
                            }))
                            )
                        ),
                        map(({ defaultWidgetName, menuItems }) => {
                            if (defaultWidgetName && defaultWidgetName.toLowerCase() !== 'configuration') {
                                let defaultWidget = menuItems.find(menu => menu.code.replace(" ", "").toLowerCase() === defaultWidgetName);
                                return defaultWidget || menuItems.find(menuItem => !menuItem.hasOwnProperty('state') || menuItem['state'] !== MenuState.Hidden);
                            }
                            return undefined;
                        }),
                        map(menuItem => ({ status: true, menuItem: menuItem }))
                    );
                }
            }));

    ngOnInit() {
        this.status$.pipe(first()).subscribe(
            response => {
                if (!response.status) {
                    this.router.navigate(['Unauthorized']);
                } else {
                    if (response.menuItem) {
                        this.menuService.setActiveMenu(response.menuItem);
                    } else {
                        this.router.navigate(['Configuration']);
                    }
                }
            }
        );
    }
}

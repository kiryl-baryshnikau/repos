import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map, concatMap, filter, first} from 'rxjs/operators';

import { MenuService, GlobalService, MenuState } from 'bd-nav/core';
import { MenuItem } from 'bd-nav/models';

export const continuousInfusion = 'ContinuousInfusion'.toLocaleLowerCase();
export const deliveryTracking = 'DeliveryTracking'.toLocaleLowerCase();
export const ivStatus = 'IVStatus'.toLocaleLowerCase();
export const configuration = "Configuration".toLocaleLowerCase();
export const ivPrep = "IVPrep".toLocaleLowerCase();
export const clinicalOverview = "ClinicalOverview".toLocaleLowerCase();

@Injectable()
export class AppMenuService {

    private supportedRoutes = [
        // configuration, // this route is not hideable
        continuousInfusion,
        deliveryTracking,
        ivStatus,
        ivPrep,
        clinicalOverview
    ];

    constructor(private globalService: GlobalService, private menuService: MenuService) {
    }

    hideTopMenuItem(code: string): void {
        console.log(`AppMenuService.hideTopMenuItem: code = ${code}`);
        if (this.isSupportedRoute(code)) {
            console.log(`AppMenuService.hideTopMenuItem: true`);
            this.getMenuItem(code).subscribe(menuItem => {
                if (menuItem) {
                    menuItem.state = MenuState.Hidden;
                }
            });
        }
        console.log(`AppMenuService.hideTopMenuItem completed`);
    }

    showTopMenuItem(code: string): void {
        console.log(`AppMenuService.showTopMenuItem: code = ${code}`);
        if (this.isSupportedRoute(code)) {
            console.log(`AppMenuService.showTopMenuItem false`);
            this.getMenuItem(code).subscribe(menuItem => {
                if (menuItem) {
                    menuItem.state = MenuState.Visible;
                }
            });
        }
        console.log(`AppMenuService.showTopMenuItem completed`);
    }

    isSupportedRoute(route: string): boolean {
        route = (route || '').toLocaleLowerCase();
        return this.supportedRoutes.some(x => x === route);
    }

    getSupportedRoutes(): string[] {
        return this.supportedRoutes.slice(0);
    }

    private getMenuItem(code: string): Observable<MenuItem> {
        const normalizedCode = (code || '').toLowerCase();
        return this.globalService.bdShellLoaded().pipe(
            filter(loaded => !!loaded),
            first(),
            concatMap(() => this.menuService.getTopMenuList().pipe(map((menuItems: MenuItem[]) => {
                const item = menuItems.find(x => (x.code || '').toLowerCase() === normalizedCode);
                return item;
            })))
        );
    }
}

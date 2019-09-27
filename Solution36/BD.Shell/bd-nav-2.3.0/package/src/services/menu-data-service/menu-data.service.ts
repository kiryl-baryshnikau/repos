import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';
import { map, concatMap, publishReplay, refCount, tap } from 'rxjs/operators';
import { GlobalService } from '../global-service/global.service';
import { MenuService } from '../menu-service/menu.service';
import { ShellHttpService } from '../shell-http-service/shell-http.service';
import * as model from '../../models';

@Injectable()
export class MenuDataService {

    private $sideMenuItemRequest: Observable<model.SideMenuItem[]>;
    constructor(private globalService: GlobalService, private shellHttpService: ShellHttpService, private menuService: MenuService) {
    }

    getTopMenus(): Observable<model.MenuItem[]> {
        return this.globalService.getConfiguration()
            .pipe(
                concatMap((config: any) => this.shellHttpService.get(config.bdShellServiceUrl + config.topMenuUrl + config.application)),
                map(res => <model.MenuItem[]>res),
                tap((menuItems: model.MenuItem[]) => this.menuService.setTopMenuList(menuItems)),
                tap((TopMenusServiceExecuted:any) => this.globalService.bdshellServiceExecuted(model.BdShellServices.TopMenuService)));
    }

    getSubMenus(code: string): Observable<model.SubMenuItem[]> {
        return this.globalService.getConfiguration()
            .pipe(
                concatMap((config: any) => this.shellHttpService.get(config.bdShellServiceUrl + config.subMenuUrl + code)),
                map(res => <model.SubMenuItem[]>res),
                tap((subMenuItems:any) => this.menuService.setSubMenuList(code, subMenuItems)));
    }

    getSideMenus(): Observable<model.SideMenuItem[]> {
        if (!this.$sideMenuItemRequest) {
            this.$sideMenuItemRequest = this.globalService.getConfiguration()
                .pipe(
                    concatMap((config: any) => this.shellHttpService.get(config.bdShellServiceUrl + config.sideMenuUrl + config.application)),
                    publishReplay(1),
                    refCount(),
                    map(res => <model.SideMenuItem[]>res),
                    tap((sideMenus: any) => this.menuService.setSideMenuList(sideMenus)),
                    tap(sideMenusServiceExecuted => this.globalService.bdshellServiceExecuted(model.BdShellServices.SideMenuService)));
        }

        return this.$sideMenuItemRequest;
    }

    // private methods

    private extractTopMenus(response: Response, index: number): model.MenuItem[] {
        return response.json();
    }

    private extractSideMenus(response: Response, index: number): model.SideMenuItem[] {
        return response.json();
    }

    private extractSubMenus(response: Response, index: number): model.SubMenuItem[] {
        var arr: any[] = response.json();
        for (var i = 0; i < arr.length; i++) {
            var subMenus = arr[i]["components"] || [];
            for (var j = 0; j < subMenus.length; j++) {
                subMenus[j]["subMenus"] = subMenus[j]["components"];
            }

            arr[i]["subMenus"] = subMenus;
        }

        return arr;
    }
}

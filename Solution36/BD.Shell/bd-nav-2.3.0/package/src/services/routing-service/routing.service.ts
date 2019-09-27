import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { MenuService } from "../menu-service/menu.service";
import * as model from '../../models';
import { UrlType } from '../../enums/url-type.enum'
import { MenuState } from "../../enums/menu-state.enum";

@Injectable()
export class RoutingService {

    constructor(private menuService: MenuService, private router: Router) {
        this.subscribeToMenuService();
    }

    private subscribeToMenuService(): void {
        this.menuService.getActiveMenu().subscribe(topMenuItem => {
            this.navigate(topMenuItem);
        });

        this.menuService.getActiveSideMenu().subscribe(sideMenuItem => {
            this.navigateSideMenu(sideMenuItem);
        });
    }

    navigateToRoute(route: string): void {
        this.router.navigate([route]);
    }

    navigateSideMenu(sideMenu: model.SideMenuItem) {
        if (sideMenu.state > MenuState.Visible) {
            return;
        }

        if (!sideMenu.subMenus || !sideMenu.subMenus.length) {
            if (sideMenu.urlType == UrlType.External) {
                location.href = sideMenu.url;
            }
            else if (sideMenu.urlType == UrlType.NewTab) {
                window.open(sideMenu.url, '_blank');
            }
            else {
                this.router.navigate([sideMenu.url]);
            }
        }
    }

    navigate(menu: model.MenuItem) {
        if (menu.state > MenuState.Visible) {
            return;
        }

        if (!menu.subMenus || !menu.subMenus.length) {
            if (menu.urlType == UrlType.External) {
                location.href = menu.url;
            }
            else if (menu.urlType == UrlType.NewTab) {
                window.open(menu.url, '_blank');
            }
            else {
                this.router.navigate([menu.url]);
            }
        }
    }
}

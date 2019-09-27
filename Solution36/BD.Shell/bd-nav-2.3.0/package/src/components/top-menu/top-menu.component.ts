import { Component, OnInit } from '@angular/core';
import { MenuService } from '../../services/menu-service/menu.service';
import { MenubarBase } from '../menubar-base/menubar-base';
import { MenuType } from '../../enums/menu-type.enum';
import { MenuState } from '../../enums/menu-state.enum';
import * as model from '../../models';

@Component({
    selector: 'top-menu',
    templateUrl: './top-menu.component.html',
    styleUrls: ['./top-menu.component.scss']
})
export class TopMenuComponent extends MenubarBase implements OnInit {
    activeTopMenu: model.MenuItem = <model.MenuItem>{};
    highlightedTopMenu: model.MenuItem = <model.MenuItem>{};
    topMenuItems: model.MenuItem[] = [];
    expandToTwoRows: boolean = false;

    constructor(private menuService: MenuService) {
        super(MenuType.TopMenu);
    }

    ngOnInit(): void {
        this.menuService.getTopMenuList().subscribe(items => {
            this.topMenuItems = this.menuList = items;

            this.updateMenuSelection(this.activeTopMenu);
        });

        this.menuService.getActiveMenu().subscribe(activeMenu => this.activeTopMenu = activeMenu);
        this.menuService.getHighlightedMenu().subscribe(highlightedMenu => this.highlightedTopMenu = highlightedMenu);
    }

    updateMenuSelection(menuItem: model.MenuItem) {
        if (menuItem.code && menuItem.state != MenuState.Hidden && menuItem.state != MenuState.Disable && !menuItem.isDisabled) {
            menuItem["hover"] = false;
            var hasSubMenu = menuItem.subMenus && menuItem.subMenus.length;

            if (!hasSubMenu) {
                this.menuService.setActiveMenu(menuItem);
            }
        }
    }

    getTopMenuCss(menuItem: model.MenuItem): string {
        if (menuItem.state == MenuState.Disable || menuItem.isDisabled) {
            return 'disable';
        }

        var css = (menuItem.css || '') + (menuItem["hover"] ? ' show' : '');
        var isActive = false;

        if (this.highlightedTopMenu) {
            isActive = menuItem.code == this.highlightedTopMenu.code || menuItem.code == this.highlightedTopMenu.topParentCode;
        } else {
            isActive = menuItem.defaultUrl;
        }

        return isActive ? css + ' active-primary' : css;
    }

    toggleMore(event) {
        this.expandToTwoRows = !this.expandToTwoRows;
    }
}

import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import * as model from '../../models';
import { MenuService } from '../../services/menu-service/menu.service';
import { MenubarBase } from '../menubar-base/menubar-base';
import { MenuType } from '../../enums/menu-type.enum';
import { MenuState } from '../../enums/menu-state.enum';

@Component({
    selector: 'sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    host: { 'class': 'bdshell-sidebar bdshell-override' }
})

export class SidebarComponent extends MenubarBase implements OnInit {
    @Input() sideMenuItems: model.SideMenuItem[];
    @Input() activeSideMenu: model.SideMenuItem;
    toggle: boolean = false;
    toggleMenu: boolean = false;
    isSidebarVisible: boolean = true;
    highlightedSideMenu: model.SideMenuItem;

    constructor(private menuService: MenuService) {
        super(MenuType.SideMenu);
    }

    ngOnInit(): void {
        if (this.highlightedSideMenu != null) {
            this.toggleMenu = true;
        }

        this.menuService.getSideMenuList()
            .subscribe(items => this.sideMenuItems = this.menuList = items);

        this.menuService.getActiveSideMenu()
            .subscribe(activeSideMenu => this.activeSideMenu = activeSideMenu);
        this.menuService.getSidebarVisibility().subscribe(visibility => this.isSidebarVisible = visibility);

        this.menuService.getHighlightedSideMenu().subscribe(highlightedMenu => this.highlightedSideMenu = highlightedMenu);
    }

    updateSelectedItem(item: model.SideMenuItem) {
        if (item.isDisabled || item.state == MenuState.Disable || item.state == MenuState.Hidden) {
            return;
        }

        this.toggle = true;
        var hasSubMenus = item.subMenus && item.subMenus.length;
        var sideMenuSelectionChanged = !this.highlightedSideMenu || this.highlightedSideMenu.code != item.code && this.highlightedSideMenu.topParentCode != item.code;

        if (hasSubMenus) {
            if (sideMenuSelectionChanged) {
                this.toggleMenu = true;
            }
            else {
                this.toggleMenu = !this.toggleMenu;
            }

            if ((!this.highlightedSideMenu || this.highlightedSideMenu.topParentCode != item.code) && sideMenuSelectionChanged) {
                this.highlightedSideMenu = item;
            }
        }
        else {
            this.menuService.setActiveSideMenu(item);
        }
    }
    
    getSidebarCss(menuItem: model.MenuItem): string {
        if (menuItem.state == MenuState.Hidden) {
            return "d-none";
        }

        if (menuItem.isDisabled || menuItem.state == MenuState.Disable) {
            return "disable";
        }

        var hasSub = menuItem.subMenus && menuItem.subMenus.length;
        var css = hasSub ? "hassub " : "";

        var isActive = false;

        if (this.highlightedSideMenu) {
            isActive = menuItem.code == this.highlightedSideMenu.code;

            if (!isActive) {
                isActive = menuItem.code == this.highlightedSideMenu.topParentCode;
            }
        }

        return isActive ? css + "active" : css;
    }
}

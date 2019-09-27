import { Component, OnInit, Input } from '@angular/core';
import { MenuService } from '../../services/menu-service/menu.service';
import * as model from '../../models';
import { MenuState } from '../../enums/menu-state.enum';

@Component({
    selector: '[submenu]',
    templateUrl: './submenu.component.html',
    host: { 'class': 'dropdown-menu' },
    styleUrls: ['./submenu.component.scss']
})
export class SubmenuComponent implements OnInit {
    @Input() subMenus: model.SubMenuItem[] = [];
    activeTopMenu: model.MenuItem = <model.MenuItem>{};
    highlightedTopMenu: model.MenuItem = <model.MenuItem>{};

    constructor(private menuService: MenuService) {

    }

    ngOnInit(): void {
        this.menuService.getActiveMenu().subscribe(activeMenu => this.activeTopMenu = activeMenu);
        this.menuService.getHighlightedMenu().subscribe(highlightedMenu => this.highlightedTopMenu = highlightedMenu);
    }

    updateMenuSelection(menuItem: model.MenuItem) {
        var hasSubMenu = menuItem.subMenus && menuItem.subMenus.length;

        if (!hasSubMenu && menuItem.state != MenuState.Hidden && menuItem.state != MenuState.Disable && !menuItem.isDisabled) {
            this.menuService.setActiveMenu(menuItem);
        }
    }

    getSubMenuCss(subMenuItem: model.SubMenuItem): string {
        if (subMenuItem.state == MenuState.Hidden) {
            return 'd-none';
        }
        
        var css = subMenuItem["hover"] ? 'show ' + subMenuItem.css : subMenuItem.css;
        
        if (subMenuItem.subMenus && subMenuItem.subMenus.length) {
            css += ' hasChild dropright';
        }

        if (subMenuItem.state == MenuState.Disable || subMenuItem.isDisabled) {
            return css + ' disable';
        }

        var isActive = false;

        if (this.highlightedTopMenu) {
            isActive = subMenuItem.code == this.highlightedTopMenu.code || subMenuItem.code == this.highlightedTopMenu.topParentCode;
        }

        if (!isActive) {
            isActive = this.findActiveChild(subMenuItem);
        }

        return isActive ? css + ' active' : css;
    }

    private findActiveChild(menuItem: model.MenuItem): boolean {

        if (menuItem.topParentCode == this.highlightedTopMenu.topParentCode) {

            for (var index in menuItem.subMenus) {
                var childMenuItem = menuItem.subMenus[index];
                if (childMenuItem.code == this.highlightedTopMenu.code) {
                    return true;
                }

                if (this.findActiveChild(childMenuItem)) {
                    return true;
                }
            }

            return false;
        }
    }

}

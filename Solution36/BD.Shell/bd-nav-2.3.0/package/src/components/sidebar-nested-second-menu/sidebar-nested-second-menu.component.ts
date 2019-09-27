import { Component, OnInit,Input } from '@angular/core';
import { LocalStorage, SessionStorage } from '../web-storage/web-storage';
import * as models from '../../models';
import { MenuService } from '../../services/menu-service/menu.service';
@Component({
  selector: 'sidebar-nested-second-menu',
  templateUrl: './sidebar-nested-second-menu.component.html',
  styleUrls: ['./sidebar-nested-second-menu.component.scss']
})
export class SidebarNestedSecondMenuComponent  {
    constructor(private menuService: MenuService){}
    @LocalStorage() open: boolean;

    @Input() configuration: models.SideMenuItem;
    @LocalStorage() @Input() activeSecondNestedMenu: models.SideMenuItem;

    toggleNestedMenu() {
        this.open = !this.open;
    }

    updateSelectedItem(item: any) {
        this.menuService.setActiveSideMenu(item);
        return this.activeSecondNestedMenu = item;
    }


    isItemSelected(code: string) {
        if (this.activeSecondNestedMenu == null || !(this.activeSecondNestedMenu.code == code)) {
            return false;
        }
        else { return true; }
    }


}

import { MenuItem } from "../../models";
import { MenuType } from "../../enums/menu-type.enum";
import { MenuState } from "../../enums/menu-state.enum";

export class MenubarBase {

    // fields
    readonly menuType: MenuType;
    menuList: MenuItem[] = [];

    // constructors
    constructor(menuType: MenuType) {
        this.menuType = menuType;
    }

    // public methods
    changeMenuState(menuCode: string, menuState: MenuState) {
        var menuItem = this.getMenuItemByCode(menuCode);
        if (menuItem && !menuItem.isDisabled) {
            menuItem["state"] = menuState;
        }
    }

    getMenuItemByCode(menuCode: string): MenuItem {
        return this.findMenuItemByCode(menuCode, this.menuList);
    }

    // private methods
    private findMenuItemByCode(menuCode: string, menuList: MenuItem[]): MenuItem {
        let menuItemFound: MenuItem;

        for (var i = 0; i < menuList.length; i++) {
            var menuItem = menuList[i];
            if (menuItem.code.toLowerCase() == menuCode.toLowerCase()) {
                menuItemFound = menuItem;
                break;
            } else {
                menuItemFound = this.findMenuItemByCode(menuCode, menuItem.subMenus || []);
                if (menuItemFound) {
                    break;
                }
            }
        }

        return menuItemFound;
    }
}

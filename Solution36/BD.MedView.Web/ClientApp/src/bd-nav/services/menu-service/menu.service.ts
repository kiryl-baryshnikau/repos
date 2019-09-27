import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Observable, ReplaySubject } from 'rxjs';
import { LocalStorage, SessionStorage } from '../../components/web-storage/web-storage';
import { GlobalService } from '../global-service/global.service';
import * as model from '../../models';
import { UrlType } from '../../enums/url-type.enum';

@Injectable()
export class MenuService {
    // Constructor
    constructor(private globalService: GlobalService, router: Router) {

        let requestToHome = false;
        var cancelEvent = router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                requestToHome = event.url === '/';
                cancelEvent.unsubscribe();
            }
        });

        globalService.getConfiguration().subscribe(config => {
            var localMenuItems = this.allTopMenuItems[config.application] || [];
            var localSideMenus = this.allSideMenuItems[config.application] || [];
            var activeTopMenu = this.allActiveTopMenu[config.application] || null;

            if (localMenuItems.length) {
                // TODO: Check authentication service first
                this.globalService.bdshellServiceExecuted(model.BdShellServices.TopMenuService);

                this.setTopMenuList(localMenuItems);
            }

            if (localSideMenus.length) {
                this.globalService.bdshellServiceExecuted(model.BdShellServices.SideMenuService);

                this.setSideMenuList(localSideMenus);
            }

            if (requestToHome) {
                if (activeTopMenu) this.setActiveMenu(activeTopMenu);
            }
            else {
                delete this.allActiveTopMenu[config.application];
                delete this.allHighlightedTopMenu[config.application];
            }

            this.localMenuItemsExists$.next(localMenuItems.length > 0);
            this.localSideMenusExists$.next(localSideMenus.length > 0);
            this.activeMenuItemExists$.next(!!activeTopMenu);
        });
    }

    // Observables
    protected localMenuItemsExists$: ReplaySubject<boolean> = new ReplaySubject(1);
    protected localSideMenusExists$: ReplaySubject<boolean> = new ReplaySubject(1);
    protected activeMenuItemExists$: ReplaySubject<boolean> = new ReplaySubject(1);
    protected selectedTopMenu$: ReplaySubject<model.MenuItem> = new ReplaySubject<model.MenuItem>(1);
    protected highlightedTopMenu$: ReplaySubject<model.MenuItem> = new ReplaySubject<model.MenuItem>(1);
    protected highlightedSideMenu$: ReplaySubject<model.SideMenuItem> = new ReplaySubject<model.SideMenuItem>(1);
    protected topMenuList$: ReplaySubject<model.MenuItem[]> = new ReplaySubject<model.MenuItem[]>(1);
    protected subMenuList$: ReplaySubject<{ parentCode: string, items: model.SubMenuItem[] }> = new ReplaySubject<{ parentCode: string, items: model.SubMenuItem[] }>(1);
    protected sideMenuList$: ReplaySubject<model.SideMenuItem[]> = new ReplaySubject<model.SideMenuItem[]>(1);
    protected selectedSideMenu$: ReplaySubject<model.SideMenuItem> = new ReplaySubject<model.SideMenuItem>(1);
    protected sidebarVisibility$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

    private sideMenuStateChangeHandler: (stateChange: model.SideMenuStateChange) => void;
    private topMenuStateChangeHandler: (stateChange: model.TopMenuStateChange) => void;

    // WebStorage
    @SessionStorage()
    allTopMenuItems: { [applicationCode: string]: model.MenuItem[] } = {};

    @SessionStorage()
    allSideMenuItems: { [applicationCode: string]: model.SideMenuItem[] } = {};

    @LocalStorage()
    allActiveTopMenu: { [id: string]: model.MenuItem } = {};

    allHighlightedTopMenu: { [id: string]: model.MenuItem } = {};

    // Public methods
    hasLocalMenuItems(): Observable<boolean> {
        return this.localMenuItemsExists$.asObservable();
    }

    hasSideMenuCache(): Observable<boolean> {
        return this.localSideMenusExists$.asObservable();
    }

    hasActiveMenuItem(): Observable<boolean> {
        return this.activeMenuItemExists$.asObservable();
    }

    getActiveMenu(): Observable<model.MenuItem> {
        return this.selectedTopMenu$.asObservable();
    }

    getHighlightedMenu(): Observable<model.MenuItem> {
        return this.highlightedTopMenu$.asObservable();
    }
    setHighlightedMenu(menuItem: model.MenuItem): void {
        this.highlightedTopMenu$.next(menuItem);
    }
    setHighlightedMenuByCode(code: string) {
        this.getTopMenuList().subscribe(menuList => {
            var menuItem = this.findTopMenuItemByCode(menuList, code);
            if (menuItem) {
                this.highlightedTopMenu$.next(menuItem);
            }
        });
    }

    getHighlightedSideMenu(): Observable<model.SideMenuItem> {
        return this.highlightedSideMenu$.asObservable();
    }
    setHighlightedSideMenu(menuItem: model.SideMenuItem): void {
        this.highlightedSideMenu$.next(menuItem);
    }
    setHighlightedSideMenuByCode(code: string): void {
        this.getSideMenuList().subscribe(menuList => {
            var menuItem = this.findSideMenuItemByCode(menuList, code);
            if (menuItem) {
                this.highlightedSideMenu$.next(menuItem);
            }
        });
    }

    getActiveSideMenu(): Observable<model.SideMenuItem> {
        return this.selectedSideMenu$.asObservable();
    }
    setActiveMenu(topMenuItem: model.MenuItem): void {

        let setActiveMenuFunction: () => void = function () {
            this.globalService.getConfiguration().subscribe((config: model.Configuration) => {
                if (!(topMenuItem.urlType == UrlType.External)) {
                    this.allActiveTopMenu[config.application] = topMenuItem;
                    this.allHighlightedTopMenu[config.application] = topMenuItem;
                }

                this.selectedTopMenu$.next(topMenuItem);
                this.highlightedTopMenu$.next(topMenuItem);
            });
        }

        if (!this.topMenuStateChangeHandler) {
            setActiveMenuFunction.apply(this);
        }

        else {
            var stateChange = new model.TopMenuStateChange();
            stateChange.item = topMenuItem;
            this.topMenuStateChangeHandler(stateChange);

            if (!stateChange.cancel) {
                this.selectedTopMenu$.next(topMenuItem);
                this.highlightedTopMenu$.next(topMenuItem);
            }

            stateChange.onContinue().subscribe(c => setActiveMenuFunction.apply(this));
        }
    }

    setActiveSideMenu(item: model.SideMenuItem): void {
        if (!this.sideMenuStateChangeHandler) {
            this.selectedSideMenu$.next(item);
            this.highlightedSideMenu$.next(item);
        }
        else {
            var stateChange = new model.SideMenuStateChange();
            stateChange.item = item;
            this.sideMenuStateChangeHandler(stateChange);

            if (!stateChange.cancel) {
                this.selectedSideMenu$.next(item);
                this.highlightedSideMenu$.next(item);
            }

            stateChange.onContinue().subscribe(c => this.selectedSideMenu$.next(item));
        }
    }

    setActiveSideMenuCode(code: string) {
        this.getSideMenuList().subscribe(menuList => {
            var menuItem = menuList.find(menu => menu.code == code);
            if (menuItem) {
                this.setActiveSideMenu(menuItem);
            }
        });
    }

    getTopMenuList(): Observable<model.MenuItem[]> {
        return this.topMenuList$.asObservable();
    }

    setTopMenuList(menuList: model.MenuItem[]): void {
        this.globalService.getConfiguration().subscribe(config => {
            this.allTopMenuItems[config.application] = menuList;
            this.topMenuList$.next(menuList);
        });
    }

    getSubMenuList(): Observable<{ parentCode: string, items: model.SubMenuItem[] }> {
        return this.subMenuList$.asObservable();
    }

    setSideMenuList(sideMenuItems: model.SideMenuItem[]): void {
        this.globalService.getConfiguration().subscribe(config => {
            this.allSideMenuItems[config.application] = sideMenuItems;
            this.sideMenuList$.next(sideMenuItems);
        });
    }

    getSideMenuList(): Observable<model.SideMenuItem[]> {
        return this.sideMenuList$.asObservable();
    }

    setSubMenuList(parentCode: string, subMenuList: model.SubMenuItem[]): void {
        this.subMenuList$.next({ parentCode: parentCode, items: subMenuList });
    }

    handleSideMenuStateChange(handler: (sideMenuStateChange: model.SideMenuStateChange) => void): void {
        this.sideMenuStateChangeHandler = handler;
    }

    handleTopMenuStateChange(handler: (topMenuStateChange: model.TopMenuStateChange) => void): void {
        this.topMenuStateChangeHandler = handler;
    }

    getSidebarVisibility(): Observable<boolean> {
        return this.sidebarVisibility$.asObservable();
    }

    setSidebarVisibility(visibile: boolean) {
        this.sidebarVisibility$.next(visibile);
    }

    private findTopMenuItemByCode(menuList: model.MenuItem[], code: string): model.MenuItem {
        code = (code || '').toLowerCase();
        menuList = menuList || [];

        for (var i = 0; i < menuList.length; i++) {
            var menuItem = menuList[i];
            var menuCode = (menuItem.code || '').toLowerCase();

            if (menuCode == code) {
                return menuItem;
            }
            else {
                var childMenuItem = this.findTopMenuItemByCode(menuItem.subMenus, code);

                if (!!childMenuItem) {
                    return childMenuItem;
                }
            }
        }

        return null;
    }

    private findSideMenuItemByCode(menuList: model.SideMenuItem[], code: string): model.SideMenuItem {
        code = (code || '').toLowerCase();
        menuList = menuList || [];

        for (var i = 0; i < menuList.length; i++) {
            var menuItem = menuList[i];
            var menuCode = (menuItem.code || '').toLowerCase();

            if (menuCode == code) {
                return menuItem;
            }
            else {
                var childMenuItem = this.findSideMenuItemByCode(menuItem.subMenus, code);

                if (!!childMenuItem) {
                    return childMenuItem;
                }
            }
        }

        return null;
    }
}

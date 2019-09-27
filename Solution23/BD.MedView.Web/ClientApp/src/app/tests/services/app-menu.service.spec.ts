import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { GlobalService, MenuService, MenuState } from 'bd-nav/core';
import { AppMenuService } from '../../services/app-menu.service';
import { of } from 'rxjs';
import * as _ from 'lodash';
import { MenuItem } from 'bd-nav/models';

const expectedSupportedRoutes = [
    'ContinuousInfusion',
    'DeliveryTracking',
    'IVStatus',
    'IVPrep',
    'ClinicalOverview'
];

function getMenuItems(): MenuItem[] {
    const menuItemTemplate: MenuItem = {
        code: '',
        defaultUrl: true,
        isDisabled: false,
        state: MenuState.Visible
    };

    const menuItems = expectedSupportedRoutes.map(route => {
        const menuItem = _.cloneDeep(menuItemTemplate); menuItem.code = route; return menuItem;
    });

    return menuItems;
}

describe('AppMenuService', () => {


    let service: AppMenuService;
    let httpMock: HttpTestingController;
    let globalServiceSpy: jasmine.SpyObj<GlobalService>;
    let menuServiceSpy: jasmine.SpyObj<MenuService>;

    beforeEach(() => {
        const _globalServiceSpy = jasmine.createSpyObj(['bdShellLoaded']);
        const _menuService = jasmine.createSpyObj(['getActiveMenu', 'getTopMenuList']);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                AppMenuService,
                { provide: GlobalService, useValue: _globalServiceSpy },
                { provide: MenuService, useValue: _menuService }
            ]
        });

        service = TestBed.get(AppMenuService);
        httpMock = TestBed.get(HttpTestingController);
        globalServiceSpy = TestBed.get(GlobalService);
        menuServiceSpy = TestBed.get(MenuService);

        globalServiceSpy.bdShellLoaded.and.returnValue(of(true));
        menuServiceSpy.getTopMenuList.and.returnValue(of(getMenuItems()));
    });

    describe('hideTopMenuItem', () => {
        it('should ignore the call for unsupported routes', () => {
            const unsupportedRoute = 'unsupportedRoute';

            service.hideTopMenuItem(unsupportedRoute);

            expect(globalServiceSpy.bdShellLoaded.calls.count()).toBe(0);
        });

        it('should set the menu item state to hidden for supported routes', () => {
            const menuItems = getMenuItems();
            menuServiceSpy.getTopMenuList.and.returnValue(of(menuItems));

            expectedSupportedRoutes.forEach(route => {
                service.hideTopMenuItem(route);

                const menuItem = menuItems.find(x => x.code === route);

                expect(menuItem).toBeDefined();
                expect(menuItem.state).toEqual(MenuState.Hidden);
            });
        });

        it('should set the menu item state with different code casing (case insensitive)', () => {
            const menuItems = getMenuItems();
            menuServiceSpy.getTopMenuList.and.returnValue(of(menuItems));

            expectedSupportedRoutes.forEach(route => {
                service.hideTopMenuItem(route.toUpperCase());

                const menuItem = menuItems.find(x => x.code === route);

                expect(menuItem).toBeDefined();
                expect(menuItem.state).toEqual(MenuState.Hidden);
            });
        });
    });

    describe('showTopMenuItem', () => {
        it('should ignore the call for unsupported routes', () => {
            const unsupportedRoute = 'unsupportedRoute';

            service.showTopMenuItem(unsupportedRoute);

            expect(globalServiceSpy.bdShellLoaded.calls.count()).toBe(0);
        });

        it('should set the menu item state to visible for supported routes', () => {
            const menuItems = getMenuItems();
            menuServiceSpy.getTopMenuList.and.returnValue(of(menuItems));

            expectedSupportedRoutes.forEach(route => {
                service.showTopMenuItem(route);

                const menuItem = menuItems.find(x => x.code === route);

                expect(menuItem).toBeDefined();
                expect(menuItem.state).toEqual(MenuState.Visible);
            });
        });

        it('should set the menu item state to visible with different code casing (case insensitive)', () => {
            const menuItems = getMenuItems();
            menuServiceSpy.getTopMenuList.and.returnValue(of(menuItems));

            expectedSupportedRoutes.forEach(route => {
                service.showTopMenuItem(route.toUpperCase());

                const menuItem = menuItems.find(x => x.code === route);

                expect(menuItem).toBeDefined();
                expect(menuItem.state).toEqual(MenuState.Visible);
            });
        });
    });

    describe('isSupportedRoute', () => {
        it('should return true for supported routes', () => {
            expectedSupportedRoutes.forEach(route => {
                const isSupportedRoute = service.isSupportedRoute(route);
                expect(isSupportedRoute).toBeTruthy();
            });
        });

        it('should return true for supported routes (case insensitive)', () => {
            expectedSupportedRoutes.forEach(route => {
                const isSupportedRoute = service.isSupportedRoute(route.toUpperCase());
                expect(isSupportedRoute).toBe(true);
            });
        });

        it('should return false for unsupported routes', () => {
            const isSupportedRoute = service.isSupportedRoute('unsupported');
            expect(isSupportedRoute).toBe(false);
        });
    });

    describe('getSupportedRoutes', () => {
        it('should return all the supported routes', () => {
            const supportedRoutes = service.getSupportedRoutes();
            expect(_.isEqual(
                _.sortBy(expectedSupportedRoutes.map(x => x.toUpperCase())),
                _.sortBy(supportedRoutes.map(x => x.toUpperCase())))
            ).toBeTruthy();
        });
    });
});

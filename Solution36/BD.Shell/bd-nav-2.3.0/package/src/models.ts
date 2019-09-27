import { Observable, ReplaySubject } from 'rxjs';
import { MenuState } from './enums/menu-state.enum';

export interface MenuItem {
    code: string;
    url?: string;
    displayName?: string;
    componentName?: string;
    css?: string;
    defaultUrl: boolean;
    urlType?: number;
    state?: MenuState;
    subMenus?: SubMenuItem[];
    isDisabled: boolean;
    topParentCode?: string;
}

export interface SubMenuItem extends MenuItem {
    sectionHeader?: string
}

export interface SideMenuItem extends SubMenuItem {
    subMenus?: SideMenuItem[];
    description: boolean;
    iconCss?: string;
}

export interface Configuration {
    bdShellServiceUrl: string;
    application: string;
    topMenuUrl: string;
    subMenuUrl: string;
    sideMenuUrl: string;
    userInfoUrl: string;
    sharedContentUrl: string;
    accessTokenUrl: string;
    processAuthenticationUrl: string;
    isAuthenticatedUrl: string;
    localeServiceUrl: string;
    localeResourceTypeName: string;
    applicationConfigurationUrl: string;
}

export interface UserInfo {
    userName: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    lastLoginType?: number;
    authenticationTypeId?: number;
    privileges: number[];
}

export interface UserInfoViewModel {
    userInfo: UserInfo;
    actionItems?: DrillDownItem[];
}

export interface DrillDownItem {
    itemCode?: string;
    itemName?: string;
    action?: string;
    url?: string;
    css?: any;
    componentName?: string;
    isSeparator?: boolean;
}

export interface AutoLogoutEvent {
    handled: boolean;
    logoutUrl: string;
}

export interface AccessToken {
    accessToken: string;
    error: string;
    expiresIn: number;
    httpErrorReason: string;
    httpErrorStatusCode: number;
    identityToken: string;
    isError: boolean;
    isHttpError: boolean;
    refreshToken: string;
    tokenType: string;
}

export interface IAuthenticationAdapter {
    authorize(): void;
}

export interface Idn {
    id: number;
    name: string;
}

export interface Facility {
    id: number;
    name: string;
    idnId: number;
}

// Locale models
export interface SiteSelectionComponentLocale {
    idn: string;
    facility: string;
    selectIdnFacility: string;
    noFacilityMessage: string;
    popupTitle: string;
    popupClose: string;
    save: string;
    cancel: string;
    selectOption: string;
}

export class TopMenuStateChange {
    private continue$: ReplaySubject<boolean> = new ReplaySubject(1);

    item: MenuItem;
    cancel: boolean;

    continue(): void {
        this.continue$.next(true);
    }

    onContinue(): Observable<boolean> {
        return this.continue$;
    }
}

export class SideMenuStateChange {
    private continue$: ReplaySubject<boolean> = new ReplaySubject(1);

    item: SideMenuItem;
    cancel: boolean;

    continue(): void {
        this.continue$.next(true);
    }

    onContinue(): Observable<boolean> {
        return this.continue$;
    }
}

export enum BdShellServices {
    ApplicationConfigService = 0,
    BdShellUIElementsLocaleService = 1,
    BdShellResourceTypes = 2,
    TopMenuService = 3,
    SideMenuService = 4,
    UserInfoService = 5
}

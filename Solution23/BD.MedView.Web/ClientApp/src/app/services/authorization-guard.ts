import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

import { AuthenticationService, MenuService } from 'bd-nav/core';
import { AuthorizationService } from './authorization.service';

import { MvdConstants } from '../widgets/shared/mvd-constants';

import { Observable, zip, of } from 'rxjs';
import { tap, map, concatMap } from 'rxjs/operators';
import { UserConfigurationService } from './user-configuration.service';
import { DeviceDetectorService } from 'ngx-device-detector';

@Injectable()
export class AuthorizationGuard implements CanActivate {
    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        private authorizationService: AuthorizationService,
        private menuService: MenuService,
        private userConfigurationService: UserConfigurationService,
        private deviceDetectorService: DeviceDetectorService
    ) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        const isMobile = this.deviceDetectorService.isMobile();
        const regExp = new RegExp('.*/mobile.*');
        const isMobileUrl = regExp.test(state.url);

        // If coming from mobile device, redirect to attention notices mobile
        if (isMobile) {
            if (!isMobileUrl) {
                setTimeout(() => {
                    this.router.navigate(['mobile']);
                }, 0);

                return of(false);
            }

            if (state.url === '/mobile/AttentionNotices') {
                return this.authorizationService.isAuthorized2(MvdConstants.ATTENTIONNOTICES_WIDGET_KEY).pipe(
                    tap(status => {
                        if (!status) {
                            setTimeout(() => {
                                this.router.navigate(['mobile/Unauthorized']);
                            }, 0);
                        }
                    })
                );
            }

            if (state.url === '/mobile/Unauthorized') {
                return of(true);
            }
        }

        // If not mobile and trying to access mobile content -> redirect to Desktop route
        if (!isMobile && isMobileUrl) {
            if (state.url === '/mobile/Unauthorized') {
                setTimeout(() => {
                    this.router.navigate(['Unauthorized']);
                }, 0);

                return of(false);
            }

            // Attention Notices Mobile -> Redirect to Priorities
            if (state.url === '/mobile/AttentionNotices') {
                setTimeout(() => {
                    this.router.navigate(['ContinuousInfusion']);
                }, 0);

                return of(false);
            }

            // Everything else redirect to Desktop root
            setTimeout(() => {
                this.router.navigate(['']);
            }, 0);
            return of(false);
        }

        return this.authenticationService.getAuthenticationStatus().pipe(
            concatMap(authStatus => authStatus
                ? this.canActivateInternal(route, state).pipe(
                    tap((canActivate: boolean) => {
                        const userConfigSingleRequestPerSession = window['userConfigSingleRequestPerSession'];
                        if (canActivate && !userConfigSingleRequestPerSession) {
                            this.userConfigurationService.clearUserPreferencesCache();
                        }
                    })
                )
                : of(false))
        );
    }

    private canActivateInternal(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        const userInfo = <any>this.authenticationService['accessToken'];
        if (!userInfo || !userInfo.loginName) {
            return of(false);
        }

        if (state.url === '/ContinuousInfusion') {
            const nfCheck = this.authorizationService.isAuthorized2(MvdConstants.ATTENTIONNOTICES_WIDGET_KEY);
            const ciCheck = this.authorizationService.isAuthorized2(MvdConstants.CONTINUOUSINFUSIONS_WIDGET_KEY);
            const drCheck = this.authorizationService.isAuthorized2(MvdConstants.DOSEREQUEST_WIDGET_KEY);
            const caCheck = this.authorizationService.isAuthorized2(MvdConstants.CLINICALOVERVIEW_WIDGET_KEY);

            return zip(nfCheck, ciCheck, drCheck, caCheck).pipe(
                map(results => results[0] || results[1] || results[2] || results[3]),
                tap(status => {
                    if (!status) {
                        this.router.navigate(['Unauthorized']);
                    } else {
                        this.menuService.setHighlightedMenuByCode(MvdConstants.PRIORITIES_MENU_CODE);
                    }
                })
            );
        }

        if (state.url === '/IVStatus') {
            return this.authorizationService.isAuthorized2(MvdConstants.IVSTATUS_WIDGET_KEY).pipe(tap(status => {
                if (!status) {
                    this.router.navigate(['Unauthorized']);
                } else {
                    this.menuService.setHighlightedMenuByCode(MvdConstants.IV_STATUS_MENU_CODE);
                }
            }));
        }

        if (state.url === '/DeliveryTracking') {
            return this.authorizationService.isAuthorized2(MvdConstants.DELIVERYTRACKING_WIDGET_KEY).pipe(tap(status => {
                if (!status) {
                    this.router.navigate(['Unauthorized']);
                } else {
                    this.menuService.setHighlightedMenuByCode(MvdConstants.DELIVERY_TRACKING_MENU_CODE);
                }
            }));
        }

        if (state.url === '/IVPrep') {
            return this.authorizationService.isAuthorized2(MvdConstants.IVPREP_WIDGET_KEY).pipe(tap(status => {
                if (!status) {
                    this.router.navigate(['Unauthorized']);
                } else {
                    this.menuService.setHighlightedMenuByCode(MvdConstants.IV_PREP_MENU_CODE);
                }
            }));
        }

        if (state.url === '/Configuration') {
            return this.authorizationService.isAuthorized(null).pipe(tap(status => {
                if (!status) {
                    this.router.navigate(['Unauthorized']);
                }
            }));
        }

        if (state.url === '/ClinicalOverview') {
            return this.authorizationService.isAuthorized2(MvdConstants.CLINICALOVERVIEW_WIDGET_KEY).pipe(tap(status => {
                if (!status) {
                    this.router.navigate(['Unauthorized']);
                } else {
                    this.menuService.setHighlightedMenuByCode(MvdConstants.CLINICALOVERVIEW_MENU_CODE);
                }
            }));
        }

        if (state.url === '/AttentionNoticesMobile') {
            return of(true);
        }

        if (state.url === '/Unauthorized' || state.url === '/UnauthorizedMobile') {
            return of(true);
        }

        return this.authorizationService.isAuthorized(null).pipe(tap(status => {
            console.log('[' + userInfo.loginName + '] AuthorizationStatus: ' + status);
            if (!status) {
                this.router.navigate(['Unauthorized']);
            }
        }));
    }
}

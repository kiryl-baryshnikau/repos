import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { EventBusService } from 'container-framework';

import { Observable, throwError, of, iif } from 'rxjs';
import { map, mergeMap, catchError, take, shareReplay, tap, switchMap, retry, filter } from 'rxjs/operators';

import * as _ from 'lodash';

import { ApplicationConfigurationService, AuthenticationService } from 'bd-nav/core';

import { MvdConstants } from '../widgets/shared/mvd-constants';

import { ConfigurationService } from '../services/configuration.service';
import { BdMedViewServicesClient } from '../services/bd-medview-services-client';

//TODO: KB: our service uses three contexts instead of only one. Something must be wrong with it.
import * as auth from '../services/authorization.service';
import * as conf from '../services/bd-medview-configuration-entities';
import * as rnt from '../services/bd-medview-runtime-entities';

export type Config = { authorizationConfig: auth.AuthorizationModel[], userPreferences: conf.UserPreference };

@Injectable()
export class UserConfigurationService {
    private authConfig: auth.AuthorizationModel[];
    private currentPreferences: conf.UserPreference;
    private allFacilitiesKey = MvdConstants.ALL_FACILITIES_KEY;
    private userPreferencesCache$: Observable<conf.UserPreference>;
    private widgetPrefix = MvdConstants.FACILITY_WIDGET_ID_PREFIX;

    constructor(private bdMedViewServicesClient: BdMedViewServicesClient,
        private configurationService: ConfigurationService,
        private authorizationService: auth.AuthorizationService,
        private applicationConfigurationService: ApplicationConfigurationService,
        private authenticationService: AuthenticationService,
        private eventBus: EventBusService) {
    }

    getCurrentConfig(): Observable<Config> {
        return this.getConfig(false);
    }

    getUpdatedConfig(): Observable<Config> {
        return this.getConfig(true);
    }

    private getConfig(isUpdate: boolean): Observable<Config> {
        return (isUpdate ? this.authorizationService.getUpdatedAuthorizationModel() : this.authorizationService.authorize())
            .pipe(
                map((res) => res),
                mergeMap((authconfig) => {
                    return this.getAuthorizationListFromPreferences(authconfig);
                }),
                take(1),
                catchError((error: any) => {
                    return this.handleError(error);
                })
            );
    }

    private getAuthorizationListFromPreferences(authconfig: auth.AuthorizationModel[]): Observable<Config> {
        return this.getUserPreferences()
            .pipe(map((response) => {
                this.authConfig = authconfig;
                this.currentPreferences = response;
                this.cleanConfigurationObject();
                return {
                    authorizationConfig: this.authConfig,
                    userPreferences: this.currentPreferences
                };
            })
            );
    }

    /**
     * Gets the user preferences. This result is cached. Will return the previously requested preferences from API,
     * until @see clearUserPreferencesCache is called.
     */
    getUserPreferences(): Observable<conf.UserPreference> {
        if (!this.userPreferencesCache$) {
            this.userPreferencesCache$ = this.ensure()
                .pipe(
                    shareReplay(1),
                    take(1),
                    map(value => value),
                    catchError(error => {
                        this.clearUserPreferencesCache();
                        return this.handleError(error);
                    })
                );
        }
        return this.userPreferencesCache$;
    }

    //#region Moved from Server Side
    private ensure(): Observable<conf.UserPreference> {
        let user = this.authenticationService.accessToken["loginName"];
        return this.authorizationService.getEffectivePermissionsFor(user)
            .pipe(switchMap(accessControlList => {
                const list$ = this.bdMedViewServicesClient.list<conf.UserPreference>('UserPreferences');
                const create$ = () => {
                    return of(null)
                        .pipe(switchMap((x) => {
                            let value = this.newFor(user, accessControlList);
                            return this.bdMedViewServicesClient
                                .create('UserPreferences', value)
                                .pipe(map(tmp => {
                                    this.eventBus.emitRequestManualRefresh("this.appCode", "this.widgetId");
                                    return value;
                                }));
                        }));
                };
                const sync$ = (value: conf.UserPreference) => {
                    return of(null)
                        .pipe(switchMap((x) => {
                            this.synchFor(user, value, accessControlList);
                            return this.bdMedViewServicesClient
                                .update<conf.UserPreference>('UserPreferences', value.id, value)
                                .pipe(map(tmp => {
                                    this.eventBus.emitRequestManualRefresh("this.appCode", "this.widgetId");
                                    return value;
                                }));
                        }));
                };
                const ensure$ = list$.pipe(
                    switchMap((values) => iif(() => values.length == 0, create$(), iif(() => this.isUnsynched(values[0], accessControlList),
                        sync$(values[0]),
                        of(values[0]),
                    ))),
                    catchError((e) => throwError(e))
                );
                return ensure$;
            }));
    }

    private newFor(principalName: string, accessControlList: auth.AuthorizationModel[]): conf.UserPreference {
        let value: conf.UserPreference =
        {
            id: 0,
            user: principalName,
            sessionTimeout: 1200,
            maskData: true,
            facilities: this.getAuthorizedFacilities(accessControlList),
            filters:
            {
                facilityFilters: this.getDefaultFilters(accessControlList)
            },
            columnOptions: [],
            generalSettings: []
        };

        value.facilities = [
            {
                id: this.allFacilitiesKey,
                selected: true,
                widgets: this.getAuthorizedWidgets(this.allFacilitiesKey, accessControlList),
                units: []
            }]
            .concat(value.facilities)
            .filter((e, i, s) => i === s.findIndex(c => c.id == e.id))

        return value;
    }

    private isUnsynched(entity: conf.UserPreference, accessControlList: auth.AuthorizationModel[]): boolean {
        let ret = entity.filters == null ||
            !(entity.facilities.map(item => item.widgets != null ? item.widgets : []).reduce((x, y) => (x).concat(y), []).length > 0);
        if (ret) {
            return true;
        }

        let user = this.authenticationService.accessToken["loginName"];
        let value = this.newFor(user, accessControlList)
        let defaultFacilities = value.facilities;
        let currentFacilities = entity.facilities;
        if (currentFacilities.find(item => item.id == this.allFacilitiesKey)) {
            let newFacilities = defaultFacilities.filter(facility => !currentFacilities.find(f => f.id == facility.id));
            let oldFacilities = currentFacilities.filter(facility => !defaultFacilities.find(f => f.id == facility.id));
            if (newFacilities.length > 0 || oldFacilities.length > 0) {
                return true;
            }
        }
        else {
            let correctedFacilities = currentFacilities.filter(facility => defaultFacilities.find(f => f.id == facility.id));
            if (correctedFacilities.length != currentFacilities.length) {
                return true;
            }
        }

        let selectedFacilities = entity.facilities
            .filter(item => item.selected);
        if (selectedFacilities.length == 0 || entity.facilities.length == 2 && selectedFacilities.length == 1) {
            return true;
        }

        let isUnsynchedVal = false;

        entity.facilities.forEach(item => {
            let currentWidgets = item.widgets != null ? item.widgets : [];
            let defaultFacilityWidgets = defaultFacilities.find(f => f.id == item.id).widgets;
            let mismatchWidgets = defaultFacilityWidgets.filter(widget => !currentWidgets.find(w => w.id == widget.id));
            if (mismatchWidgets.length > 0) {
                isUnsynchedVal = true;
            }
        });

        console.log(`UserConfigurationService: isUnsynched is ${isUnsynchedVal}`);

        return isUnsynchedVal;
    }

    private synchFor(user: string, entity: conf.UserPreference, accessControlList: auth.AuthorizationModel[]) {
        let value = this.newFor(user, accessControlList)
        let defaultFacilities = value.facilities;
        let currentFacilities = entity.facilities;
        if (currentFacilities.find(item => item.id == this.allFacilitiesKey)) {
            let newFacilities = defaultFacilities.filter(facility => !currentFacilities.find(f => f.id == facility.id));
            let oldFacilities = currentFacilities.filter(facility => !defaultFacilities.find(f => f.id == facility.id));
            if (oldFacilities.length > 0) {
                entity.facilities = currentFacilities.filter(facility => !oldFacilities.find(f => f.id == facility.id));
            }
            let widget = currentFacilities.map(item => item.widgets != null ? item.widgets : [])
                .reduce((x, y) => (x).concat(y), [])
                .find(item => item.default);
            if (newFacilities.length > 0) {
                if (widget) {
                    let widgets = newFacilities.map(item => item.widgets != null ? item.widgets : [])
                        .reduce((x, y) => (x).concat(y), [])
                        .filter(item => item.id == widget.id);
                    widgets.forEach(item => item.default = true);
                }
                entity.facilities = entity.facilities.concat(newFacilities);
            }
        }
        else {
            let correctedFacilities = currentFacilities.filter(facility => defaultFacilities.find(f => f.id == facility.id));
            if (correctedFacilities.length == 0) {
                entity.facilities = defaultFacilities;
            }
            else if (correctedFacilities.length != currentFacilities.length) {
                entity.facilities = currentFacilities;
            }
        }

        let selectedFacilities = entity.facilities.filter(item => item.selected);
        if (selectedFacilities.length == 0 || entity.facilities.length == 2 && selectedFacilities.length == 1) {
            entity.facilities.forEach(item => item.selected = true);
        }

        // Let us fix the entity filters with default value
        if (entity.filters == null) {
            entity.filters = value.filters;
            entity.filters.facilityFilters = [];
        }

        /* Let us fix the missing widgets. Due different workflow accesscontrol list and user preference would mismatch
            with respect to widgets.  Fixing facilities alone not enough.  Widgets needs to be fixed as well.  Below
            code takes care fixing widgets with respect to current access control list
        */
        entity.facilities.forEach(item => {
            let currentWidgets = item.widgets != null ? item.widgets : [];
            let defaultFacilityWidgets = defaultFacilities.find(f => f.id == item.id).widgets;
            let mismatchWidgets = defaultFacilityWidgets.filter(widget => !currentWidgets.find(w => w.id == widget.id));
            if (mismatchWidgets.length > 0) {
                item.widgets = item.widgets.concat(mismatchWidgets);
            }
        });
    }

    private getDefaultFilters(accessControlList: auth.AuthorizationModel[]): conf.FacilityFilter[] {
        let values = accessControlList
            .filter(item => item.permissions.find(p => p.resource.indexOf(this.widgetPrefix) == 0))
            .map(item => item.synonyms != null ? item.synonyms : []).reduce((x, y) => (x).concat(y), [])
            .filter(item => item.source == 'Infusion')
            .map(item => item.id)
            .filter((e, i, s) => i === s.indexOf(e))
            .map(item => ({
                facilityId: item,
                units: []
            } as conf.FacilityFilter));
        return values;
    }

    private getAuthorizedFacilities(accessControlList: auth.AuthorizationModel[]): conf.Facility[] {
        let values = accessControlList
            //new code
            .filter(item => item.permissions.find(p => p.resource.indexOf(this.widgetPrefix) == 0))
            .map(item => item.id.toString())
            .filter((e, i, s) => i === s.indexOf(e))
            .map(item => ({
                id: item,
                //selected: false,
                selected: true,
                widgets: this.getAuthorizedWidgets(item, accessControlList),
                units: []
            } as conf.Facility));
        return values;
    }

    private getAuthorizedWidgets(facility: string, accessControlList: auth.AuthorizationModel[]): conf.Widget[] {
        var values = accessControlList.filter(item => item.id.toString() == facility || facility == this.allFacilitiesKey)
            .map(item => item.permissions != null ? item.permissions : []).reduce((x, y) => (x).concat(y), [])
            .filter(item => item.action == MvdConstants.READ_ACCESS_PERMISSION)
            .map(item => item.resource)
            .filter((e, i, s) => i === s.indexOf(e))
            .map(item => ({
                id: item,
                configuration: null,
                enabled: true
            } as conf.Widget));

        return values;
    }
    //#endregion Moved from Server Side

    /**
     * Invalidates user preferences cache, forcing to do a request to API on the next call to @see getUserPreferences
     */
    clearUserPreferencesCache(): void {
        this.userPreferencesCache$ = null;
    }

    setUserPreferences(userPreferences: conf.UserPreference): Observable<any> {
        if (userPreferences.sessionTimeout >= 0) {
            this.configurationService.get().subscribe(config => {
                const configuration = <any>config;
                if (userPreferences.sessionTimeout > 0) {
                    // BD Shell changed implementation in 2.x version. Warning and session are inverted
                    const sessionTimeOut = userPreferences.sessionTimeout;
                    const warningTimeOut = configuration.logoutWarningTime;

                    this.applicationConfigurationService.modify((applicationConfigurations) => {
                        applicationConfigurations['autoLogoutTime'] = warningTimeOut;
                        applicationConfigurations['autoLogoutWarningTime'] = sessionTimeOut.toString();
                    });
                }
            });
        }

        //TODO: KB DEBUG: id should be there
        return this.bdMedViewServicesClient.update<conf.UserPreference>('UserPreferences', userPreferences.id, userPreferences)
            .pipe(
                catchError(this.handleError),
                tap(() => this.setUserPreferencesCache(userPreferences))
            );
    }

    cleanConfigurationObject(): void {
        if (this.authConfig && this.currentPreferences) {
            this.currentPreferences = this.cleanUpFacilities(this.authConfig, this.currentPreferences);
        }
    }

    setAutoLogoutRoute(route: string): Observable<rnt.LastActiveRoute> {
        return this.ensureLastActiveRoute()
            .pipe(
                switchMap((value) => {
                    value.value = route;
                    return this.bdMedViewServicesClient.update<rnt.LastActiveRoute>('LastActiveRoutes', value.id, value);
                }),
                catchError(this.handleError)
            );
    }

    //#region move
    public ensureLastActiveRoute(): Observable<rnt.LastActiveRoute> {
        let user = this.authenticationService.accessToken["loginName"];
        const list$ = this.bdMedViewServicesClient.list<rnt.LastActiveRoute>('LastActiveRoutes');
        const create$ = () => {
            return this.bdMedViewServicesClient.create<rnt.LastActiveRoute>('LastActiveRoutes', {
                id: 0,
                user: user,
                value: 'Configuration'
            });
        };

        return list$.pipe(
            switchMap((values) => iif(() => (values.length == 0),
                create$(),
                of(values[0]),
            )),
            catchError((error) => throwError(error))
        );
    }
    //#endregion move

    cleanUpFacilities(authorizationConfig: auth.AuthorizationModel[], currentUserPreferences: conf.UserPreference): conf.UserPreference {
        const authConfig = authorizationConfig;
        let currentPreferences = _.cloneDeep(currentUserPreferences);

        let userFacilities: conf.Facility[] = currentPreferences.facilities || [];
        const allFacilitiesItem: conf.Facility = userFacilities.find(d => d.id === MvdConstants.ALL_FACILITIES_KEY);

        // authorized facilities that aren't in user preferences
        const newAuthFacilities: auth.AuthorizationModel[] = authConfig.filter(auth => {
            if (!userFacilities.some(f => `${auth.id}` === `${f.id}`)) {
                const widgetsAuthorized = auth.permissions.filter(a => a.resource.indexOf(this.widgetPrefix) >= 0);
                return widgetsAuthorized && widgetsAuthorized.length > 0;
            }
            return false;
        });

        if (newAuthFacilities && newAuthFacilities.length > 0) {
            newAuthFacilities.forEach(nf => {
                userFacilities.push({
                    id: `${nf.id}`,
                    selected: allFacilitiesItem ? allFacilitiesItem.selected : false,
                    units: [],
                    widgets: []
                } as conf.Facility);
            });
        }

        type AuthFacility = { id: string, name: string, widgets: auth.PermissionModel[] };
        let facilities: AuthFacility[] = authConfig.map((config) => {
            return {
                id: config.id ? config.id.toString() : '0',//config.id,
                name: config.name,
                widgets: config.permissions
            }
        });

        userFacilities.forEach((facility: conf.Facility) => {
            let authFacility: number = facilities.findIndex((item: AuthFacility) => item.id === facility.id);
            let index: number = currentPreferences.facilities.findIndex((a: conf.Facility) => a.id === facility.id);
            //remove not authorized facilities
            if (authFacility < 0 && facility.id !== this.allFacilitiesKey) {
                if (index >= 0) {
                    currentPreferences.facilities.splice(index, 1);
                }
            }
            else {
                //if authorized, clean up widgets
                let widgets: conf.Widget[];
                if (facility.id !== this.allFacilitiesKey) {
                    widgets = facilities[authFacility].widgets.reduce((widgetsPerFacility, permission) => {
                        if (!widgetsPerFacility.some(a => a.id === permission.resource)) {
                            let currentWidget: conf.Widget = facility.widgets.find(a => a.id === permission.resource);
                            widgetsPerFacility.push({
                                id: permission.resource,
                                enabled: currentWidget ? currentWidget.enabled : true,
                                default: currentWidget ? currentWidget.default : false,
                                configuration: currentWidget ? currentWidget.configuration : null
                            } as conf.Widget);
                        }
                        return widgetsPerFacility;
                    }, []);
                }
                else {
                    widgets = facility.widgets.filter((widget) => {
                        let found: boolean;
                        let widgetsAvailables = facilities.reduce((arrayResume: { id: string }[], config: AuthFacility) => {
                            config.widgets.forEach((innerWidget: auth.PermissionModel) => {
                                let element = arrayResume.filter((d: any) => d.id === innerWidget.resource);
                                if (!element[0]) {
                                    arrayResume.push({
                                        id: innerWidget.resource
                                    });
                                }
                            });
                            return arrayResume;
                        }, []);
                        found = widgetsAvailables.some((a) => a.id === widget.id);
                        return found;
                    });
                }
                currentPreferences.facilities[index].widgets = widgets;
            }
        });
        return currentPreferences;
    }

    private handleError(error: HttpErrorResponse): Observable<never> {
        let errMsg: string;
        if (error.error instanceof Error) {
            errMsg = error.error.message ? error.error.message : error.toString();
        }
        else {
            errMsg = `${error.status} - ${error.statusText || ''} ${error.error}`;
        }

        console.error('UserConfigurationService.handleError:', errMsg, error);

        return throwError(errMsg);
    }

    migrateLocalIdsUser(userId: string, mergedUserId: string): Observable<any> {
        console.log(`***** migrateLocalIdsUser: userId=${userId} mergedUserId=${mergedUserId}`);
        let body: conf.MigrateRequest = {
            oldPrincipalName: mergedUserId,
            newPrincipalName: userId,
            appCodes: MvdConstants.DASHBOARD_APP_CODES
        }
        return this.bdMedViewServicesClient.staticMethodCall('UserPreferences', 'Migrate', body);
    }

    updateColumnOptions$(columnOptions: conf.ColumnOption): Observable<any> {
        return this.ensure().
            pipe(switchMap(currentPreferences => {
                var preference = currentPreferences.columnOptions.find(x => x.widget == columnOptions.widget);

                if (preference != null) {
                    currentPreferences.columnOptions
                        = currentPreferences.columnOptions.filter(item => item != preference);
                }
                currentPreferences.columnOptions.push(columnOptions);

                return this.bdMedViewServicesClient.update<conf.UserPreference>('UserPreferences', currentPreferences.id, currentPreferences);
            }))
            .pipe(
                catchError(this.handleError),
                tap(() => this.updateColumnOptionInCache(columnOptions))
            );
    }

    updateGeneralSettings$(setting: conf.GeneralSetting): Observable<any> {
        return this.ensure().
            pipe(switchMap(currentPreferences => {
                var preference = currentPreferences.generalSettings.find(x => x.id == setting.id);

                if (preference != null) {
                    currentPreferences.generalSettings
                        = currentPreferences.generalSettings.filter(item => item != preference);
                }

                currentPreferences.generalSettings.push({
                    id: setting.id,
                    configuration: setting.configuration
                });
                return this.bdMedViewServicesClient.update<conf.UserPreference>('UserPreferences', currentPreferences.id, currentPreferences);
            }))
            .pipe(
                catchError(this.handleError),
                tap(() => this.updateGeneralSettingInCache(setting))
            );
    }

    private setUserPreferencesCache(userPreferences: any): void {
        this.userPreferencesCache$ = of(userPreferences).pipe(
            shareReplay(1),
            take(1)
        );
    }

    private updateColumnOptionInCache(columnOption: conf.ColumnOption): void {
        this.getUserPreferences().subscribe(
            userPreferences => {
                const currentColumnOptions = _.get(userPreferences,
                    'columnOptions') as conf.ColumnOption[];
                if (!currentColumnOptions || !currentColumnOptions.length) {
                    console.log('Error updating column options in Preferences cache: Unable to get Current Column options');
                    return;
                }

                const index = currentColumnOptions.findIndex(s => s.widget === columnOption.widget);
                index >= 0 ? currentColumnOptions[index] = columnOption : currentColumnOptions.push(columnOption);
                this.setUserPreferencesCache(userPreferences);
            },
            error => {
                console.log('Error updating column options in Preferences cache: Unable to get Current User Preferences', error);
            }
        );
    }

    private updateGeneralSettingInCache(setting: conf.GeneralSetting): void {
        this.getUserPreferences().subscribe(
            userPreferences => {
                const generalSettings = _.get(userPreferences, 'generalSettings') as conf.GeneralSetting[];
                if (!generalSettings) {
                    console.log('Error updating General Settings in Preferences cache: Unable to get Current General Settings');
                    return;
                }

                const index = generalSettings.findIndex(s => s.id === setting.id);
                index >= 0 ? generalSettings[index] = setting : generalSettings.push(setting);
                this.setUserPreferencesCache(userPreferences);
            }
        );
    }
}

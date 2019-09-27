import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, ReplaySubject, of, forkJoin } from 'rxjs';
import { catchError, map, publishReplay, refCount, switchMap, take } from 'rxjs/operators';
import * as _ from 'lodash';

import { AuthenticationService } from 'bd-nav/core';
import { MvdConstants } from '../widgets/shared/mvd-constants';
import { DeviceDetectorService } from 'ngx-device-detector';

import {
    AppMenuService,
    continuousInfusion,
    deliveryTracking,
    ivStatus,
    ivPrep,
    clinicalOverview
 } from './app-menu.service';
import { BdMedViewServicesClient } from './bd-medview-services-client';
import { Access } from './bd-medview-authorization-entities';
import { Facility } from './bd-medview-facility-entities';
import { precisionFixed } from 'd3';

const InfusionWidgets =
    [
        MvdConstants.CONTINUOUSINFUSIONS_WIDGET_KEY,
        MvdConstants.IVSTATUS_WIDGET_KEY
    ];

const CatoWidgets = [
    MvdConstants.IVPREP_WIDGET_KEY
];

const MedminedWidgets = [
    MvdConstants.CLINICALOVERVIEW_WIDGET_KEY
];

@Injectable()
export class AuthorizationService {
    private mvdUrl = window['mvdAuthorizationServiceUrl'];
    private dispensingUrl = window['dispensingAuthorizationServiceUrl'];
    private medminedUrl = window['medminedAuthorizationServiceUrl'];

    private authorize$: ReplaySubject<AuthorizationModel[]> = new ReplaySubject(1);

    private getAuthorizationStatus() {
        return this.authorize$;
    }

    private setAuthorizationStatus(status: AuthorizationModel[]) {
        this.authorize$.next(status);
    }

    private emptyAuthorizationStatus: AuthorizationModel[] = new Array<AuthorizationModel>();

    constructor(private http: HttpClient,
        private authenticationService: AuthenticationService,
        private appMenuService: AppMenuService,
        private deviceDetectorService: DeviceDetectorService,
        private bdMedViewServicesClient: BdMedViewServicesClient
    ) {
        console.log(`@@@ AuthorizationService @@@`);
    }

    private getAuthorizationModel(): Observable<AuthorizationModel[]> {
        this.mvdUrl = this.mvdUrl || window['mvdAuthorizationServiceUrl'];

        console.log("@@@ AuthorizationService: mvd authorized for url " + this.mvdUrl);
        let authorizationDataFetch = this.bdMedViewServicesClient.batch()
            .list("Accesses", "Realm,Realm.Claims,Permission,Permission.Resource")
            .list("Facilities", "Synonyms,Synonyms.Provider,Synonyms.Provider.KeyType")
            .execute()
            .pipe(map(items => {
                let accesses = items[0].asEntitySet<Access>();
                let facilities = items[1].asEntitySet<Facility>();
                let facilityMap = new Map<string, Facility>();
                facilities.forEach(facility => facilityMap.set(facility.id.toString(), facility));
                let authorizationMap = new Map<number, AuthorizationModel>();
                accesses.forEach(access => {
                    if (!authorizationMap.has(access.realmId)) {
                        let item: AuthorizationModel = {
                            id: access.realmId,
                            name: access.realm.name,
                            parentId: access.realm.parentId,
                            permissions: [],
                            synonyms: []
                        };
                        let facilityIdClaim = access.realm.claims.find(item => {
                            return item.issuer == 'BD.MedView.Facility'
                                && item.originalIssuer == 'BD.MedView.Facility'
                                && item.subject == 'Harness'
                                && item.type == 'Provider.Id'
                                && item.valueType == 'Int32'
                        });

                        if (facilityIdClaim != null && facilityMap.has(facilityIdClaim.value)) {
                            let facility = facilityMap.get(facilityIdClaim.value);

                            if (facility.parentId != null) {
                                item.synonyms.push({
                                    id: facility.id.toString(),
                                    idType: 'Int32',
                                    source: 'BD.MedView.Facility',
                                    type: 'Facility',
                                    name: facility.name
                                });
                            }

                            facility.synonyms.forEach(synonym => {
                                item.synonyms.push({
                                    id: synonym.key,
                                    idType: synonym.provider.keyType.name,
                                    source: synonym.provider.name,
                                    type: 'Facility',
                                    name: synonym.name
                                });
                            });
                        }

                        authorizationMap.set(access.realmId, item);
                    }
                    let model: AuthorizationModel = authorizationMap.get(access.realmId);
                    model.permissions.push({ resource: access.permission.resource.name, action: access.permission.name });
                });
                var authorizationModel: Array<AuthorizationModel> = Array.from(authorizationMap.values());
                return authorizationModel;
            })).pipe(
                map(result => result || []),
                catchError(err => of([]))
            );

        let authorization$ = authorizationDataFetch.pipe(
            switchMap(result => {
                let authorizationData = result as Array<AuthorizationModel>;

                let facilityDataFetch = of({ body: [] });
                let doDispensing = authorizationData.find(auth => auth.synonyms.find(syn => syn.source == "Dispensing" && syn.type == "Facility") !== undefined) !== undefined;
                if (doDispensing) {
                    this.dispensingUrl = this.dispensingUrl || window['dispensingAuthorizationServiceUrl'];
                    console.log("@@@ AuthorizationService: dispensing authorized for url " + this.dispensingUrl);
                    facilityDataFetch = this.http.post(this.dispensingUrl, { api: 'dispensingfacilities' })
                        .pipe(
                            map(result => result || { body: [] }),
                            catchError(err => of({ body: [] } as any))
                    );
                }

                let medminedDataFetch = of(null);
                const isMobile = this.deviceDetectorService.isMobile();
                const doMedMined = !isMobile &&
                    authorizationData.find(auth => auth.synonyms.find(syn => syn.source == "MedMined" && syn.type == "Facility") !== undefined) !== undefined;
                if (doMedMined) {
                    this.medminedUrl = this.medminedUrl || window['medminedAuthorizationServiceUrl'];
                    console.log("@@@ AuthorizationService: medmined authorized for url " + this.medminedUrl);
                    if (this.authenticationService.accessToken["email"] != null) {
                        var email = this.authenticationService.accessToken["email"] as string;
                        medminedDataFetch = this.http.get(this.medminedUrl + `?Email=${email}`)
                            .pipe(
                                map(result => result || null),
                                catchError(err => of(null))
                            );
                    }
                }

                return forkJoin([facilityDataFetch, medminedDataFetch])
                    .pipe(
                        map(results => this.processResults(authorizationData, (results[0].body || []) as Array<FacilityModel>, (results[1] as MedminedModel))),
                        take(1)
                );
            }));

        return authorization$;
    }

    getUpdatedAuthorizationModel(): Observable<any> {
        this.getAuthorizationModel()
        .pipe(
            take(1)
        ).subscribe(value => this.setAuthorizationStatus(value));
        return this.getAuthorizationStatus()
            .pipe(
                map(value => value as any),
                publishReplay(1),
                refCount()
            );
     }

    authorize(): Observable<any> {
        return this.getAuthorizationStatus()
            .pipe(
                map(value => value as any),
                publishReplay(1),
                refCount()
            );
    }

    authorizedFor(params: any): Observable<any> {
        return this.getAuthorizationStatus()
            .pipe(catchError(this.handleError));
    }

    isAuthorized(params: any): Observable<any> {
        return this.getAuthorizationStatus()
            .pipe(
                map(value => value.length > 0),
                catchError(this.handleError)
            );
    }

    isAuthorized2(resource: string): Observable<any> {
        return this.getAuthorizationStatus()
            .pipe(
                map(value => this.processResourceFilter(value, resource)),
                catchError(this.handleError)
            );
    }

    authContextRefresh(): void {
        this.authenticationService
            .getAuthenticationStatus()
            .subscribe(value => {
                if (value) {
                    //TODO: Switch on authorization refresh
                    console.log("AuthorizationService: refresh begin");
                    this.getAuthorizationModel().subscribe(value => this.setAuthorizationStatus(value));
                }
                else {
                    //TODO: Switch off authorization refresh
                    console.log("AuthorizationService: refresh end");
                    this.setAuthorizationStatus(this.emptyAuthorizationStatus);
                }
            },
            err => {
                console.log("***** AuthorizationService: refresh failed");
                this.setAuthorizationStatus(this.emptyAuthorizationStatus);
            });
    }

    private handleStatusError(error: any) {
        return of(false);
    }

    private handleError(error: HttpErrorResponse) {
        let errMsg: string;
        if (error.error instanceof Error) {
            errMsg = error.error.message ? error.error.message : error.toString();
        }
        else {
            errMsg = `${error.status} - ${error.statusText || ''} ${error.error}`;
        }
        console.error(`AuthorizationService::handleError:  ${errMsg}`);

        return of([]);
    }

    /**
     * Processes filter authorizationData with facilityData:
     *
     * Step 1: facilityData Cleanup
     * 1.1: if item has "remoteDispensing": false, "StatusBoardDoseRequest" should be removed from "facilityPermissions"
     * 1.2: if item has "delivery": false, "StatusBoardTrackAndDeliver" should be removed from "facilityPermissions"
     * Step 2: authorizationData Cleanup
     * 2.1: if facilityData for facility doesnt have permission "StatusBoardAttentionNotices" in "facilityPermissions", permission with resource "BD.MedView.Web.Widgets.Attention Notices" should be removed
     * 2.2: if facilityData for facility doesnt have permission "StatusBoardDoseRequest" in "facilityPermissions", permission with resource "BD.MedView.Web.Widgets.Dose Requests" should be removed
     * 2.3: if facilityData for facility doesnt have permission "StatusBoardTrackAndDeliver" in "facilityPermissions", permission with resource "BD.MedView.Web.Widgets.Delivery Tracking" should be removed
     * 2.4: if facility is not presented in facility list, permissions: "BD.MedView.Web.Widgets.Attention Notices", "BD.MedView.Web.Widgets.Dose Requests", "BD.MedView.Web.Widgets.Delivery Tracking" should be removed
     * 2.5: if authorizationData for facility has empty permission list, facility should be removed from authorization data
     * 3: KB: What step 3 is doing?
     * @param authorizationData
     * @param facilityData
     */
    private processResults(authorizationData: Array<AuthorizationModel>, facilityData: Array<FacilityModel>, medminedData: MedminedModel): Array<AuthorizationModel> {
        //#region Step 1
        for (let i = 0; i < facilityData.length; i++) {
            let facilityModel = facilityData[i];
            //#region 1.1
            if (!facilityModel.remoteDispensing) {
                let index = facilityModel.facilityPermissions.indexOf("StatusBoardDoseRequest");
                if (index > -1) {
                    facilityModel.facilityPermissions.splice(index, 1);
                }
            }
            //#endregion 1.1
            //#region 1.2
            if (!facilityModel.delivery) {
                let index = facilityModel.facilityPermissions.indexOf("StatusBoardTrackAndDeliver");
                if (index > -1) {
                    facilityModel.facilityPermissions.splice(index, 1);
                }
            }
            //#endregion 1.2
        }
        //#endregion Step 1

        //#region Step 2
        for (let i = 0; i < facilityData.length; i++) {
            let facilityModel = facilityData[i];
            let dispensingId = facilityModel.facilityKey;

            let authorizationModelIndex = authorizationData.findIndex(auth =>
                auth.synonyms.find(syn =>
                    syn.id == dispensingId
                    && syn.idType == "String"
                    && syn.source == "Dispensing"
                    && syn.type == "Facility"
                ) !== undefined
            );

            if (authorizationModelIndex < 0) {
                //TODO: This is exeptional case. Our Authorization must have facility registered
                continue;
            }

            let authorizationModel = authorizationData[authorizationModelIndex];

            //#region 2.1
            if (!facilityModel.facilityPermissions.find(item => item == "StatusBoardAttentionNotices")) {
                for (let permissionIndex = authorizationModel.permissions.findIndex(item => item.resource == MvdConstants.ATTENTIONNOTICES_WIDGET_KEY);
                    permissionIndex >= 0;
                    permissionIndex = authorizationModel.permissions.findIndex(item => item.resource == MvdConstants.ATTENTIONNOTICES_WIDGET_KEY)
                ) {
                    authorizationModel.permissions.splice(permissionIndex, 1);
                }
            }
            //#endregion 2.1

            //#region 2.2
            if (!facilityModel.facilityPermissions.find(item => item == "StatusBoardDoseRequest")) {
                for (let permissionIndex = authorizationModel.permissions.findIndex(item => item.resource == MvdConstants.DOSEREQUEST_WIDGET_KEY);
                    permissionIndex >= 0;
                    permissionIndex = authorizationModel.permissions.findIndex(item => item.resource == MvdConstants.DOSEREQUEST_WIDGET_KEY)
                ) {
                    authorizationModel.permissions.splice(permissionIndex, 1);
                }
            }
            //#endregion 2.2

            //#region 2.3
            if (!facilityModel.facilityPermissions.find(item => item == "StatusBoardTrackAndDeliver")) {
                for (let permissionIndex = authorizationModel.permissions.findIndex(item => item.resource == MvdConstants.DELIVERYTRACKING_WIDGET_KEY);
                    permissionIndex >= 0;
                    permissionIndex = authorizationModel.permissions.findIndex(item => item.resource == MvdConstants.DELIVERYTRACKING_WIDGET_KEY)
                ) {
                    authorizationModel.permissions.splice(permissionIndex, 1);
                }
            }
            //#endregion 2.3
        }

        for (let i = authorizationData.length - 1; i >= 0; i--) {
            let authorizationModelIndex = i;
            let authorizationModel = authorizationData[authorizationModelIndex];

            //#region 2.4
            let dispensingSynonym = authorizationModel.synonyms.find(syn =>
                syn.idType == "String"
                && syn.source == "Dispensing"
                && syn.type == "Facility"
            );

            if (typeof dispensingSynonym === "undefined" || typeof (facilityData.find(fa => fa.facilityKey == (<SynonymModel>dispensingSynonym).id)) === "undefined") {
                for (let permissionIndex = authorizationModel.permissions.findIndex(item => item.resource == MvdConstants.ATTENTIONNOTICES_WIDGET_KEY);
                    permissionIndex >= 0;
                    permissionIndex = authorizationModel.permissions.findIndex(item => item.resource == MvdConstants.ATTENTIONNOTICES_WIDGET_KEY)
                ) {
                    authorizationModel.permissions.splice(permissionIndex, 1);
                }
                for (let permissionIndex = authorizationModel.permissions.findIndex(item => item.resource == MvdConstants.DOSEREQUEST_WIDGET_KEY);
                    permissionIndex >= 0;
                    permissionIndex = authorizationModel.permissions.findIndex(item => item.resource == MvdConstants.DOSEREQUEST_WIDGET_KEY)
                ) {
                    authorizationModel.permissions.splice(permissionIndex, 1);
                }
                for (let permissionIndex = authorizationModel.permissions.findIndex(item => item.resource == MvdConstants.DELIVERYTRACKING_WIDGET_KEY);
                    permissionIndex >= 0;
                    permissionIndex = authorizationModel.permissions.findIndex(item => item.resource == MvdConstants.DELIVERYTRACKING_WIDGET_KEY)
                ) {
                    authorizationModel.permissions.splice(permissionIndex, 1);
                }
            }
            //#endregion 2.4

            //#region 2.5
            if (authorizationModel.permissions.length == 0) {
                authorizationData.splice(authorizationModelIndex, 1);
            }
            //#endregion 2.5
        }
        //#endregion Step 2

        //#region Step 3
        for (let i = authorizationData.length - 1; i >= 0; i--) {
            let authorizationModelIndex = i;
            let authorizationModel = authorizationData[authorizationModelIndex];

            //#region 3.1
            let infusionSynonym = authorizationModel.synonyms.find(syn =>
                                                                        syn.idType == "String"
                                                                        && syn.source == "Infusion"
                                                                        && syn.type == "Facility"
                                                                    );

            if (typeof infusionSynonym === "undefined") {
                InfusionWidgets.forEach(widgetName => {
                    for (let permissionIndex = authorizationModel.permissions.findIndex(item => item.resource == widgetName);
                        permissionIndex >= 0;
                        permissionIndex = authorizationModel.permissions.findIndex(item => item.resource == widgetName)
                    ) {
                        authorizationModel.permissions.splice(permissionIndex, 1);
                    }
                });
            }
            //#endregion 3.1

            //#region 3.2
            if (authorizationModel.permissions.length == 0) {
                authorizationData.splice(authorizationModelIndex, 1);
            }
            //#endregion 3.2
        }
        //#endregion Step 3

        //#region Step 4
        if (medminedData == null) {
            medminedData = {
                user: {
                    allowed_facilities: [],
                    has_alert_access: false,
                }
            } as MedminedModel;
        }
        if (!medminedData.user.has_alert_access) {
            medminedData.user.allowed_facilities = [];
        }
        //#endregion Step 4

        //#region Step 5
        for (let i = authorizationData.length - 1; i >= 0; i--) {
            let authorizationModelIndex = i;
            let authorizationModel = authorizationData[authorizationModelIndex];

            //#region 5.1
            let medminedSynonym = authorizationModel.synonyms.find(syn =>
                syn.idType == "String"
                && syn.source == "MedMined"
                && syn.type == "Facility"
            );

            if (typeof medminedSynonym === "undefined" || medminedData.user.allowed_facilities.findIndex(id => ("" + id) == medminedSynonym.id) < 0) {
                MedminedWidgets.forEach(widgetName => {
                    for (let permissionIndex = authorizationModel.permissions.findIndex(item => item.resource == widgetName);
                        permissionIndex >= 0;
                        permissionIndex = authorizationModel.permissions.findIndex(item => item.resource == widgetName)
                    ) {
                        authorizationModel.permissions.splice(permissionIndex, 1);
                    }
                });
            }
            //#endregion 5.1

            //#region 5.2
            if (authorizationModel.permissions.length == 0) {
                authorizationData.splice(authorizationModelIndex, 1);
            }
            //#endregion 5.2
        }
        //#endregion Step 5

        // Check for CATO Widgets;
        this.removeWidgets(authorizationData, CatoWidgets, "Cato");
        _.remove(authorizationData, (facility) => facility.permissions.length === 0);

        // Check for Medmined Widgets;
        this.removeWidgets(authorizationData, MedminedWidgets, "MedMined");
        _.remove(authorizationData, (facility) => facility.permissions.length === 0);


        console.log("resultData");
        //console.log(JSON.stringify(authorizationData));

        //#region 4: Show / Hide menu items

        console.log('Processing show / hide ContinuousInfusion menu');
        let nf_Check = this.processResourceFilter(authorizationData, MvdConstants.ATTENTIONNOTICES_WIDGET_KEY);
        let ci_Check = this.processResourceFilter(authorizationData, MvdConstants.CONTINUOUSINFUSIONS_WIDGET_KEY);
        let dr_Check = this.processResourceFilter(authorizationData, MvdConstants.DOSEREQUEST_WIDGET_KEY);

        let statusCO = this.processResourceFilter(authorizationData, MvdConstants.CLINICALOVERVIEW_WIDGET_KEY);

        let status = nf_Check || ci_Check || dr_Check;
        // check for Clinical Alert widgets to show / hide Priorities tab
        if (!status && !statusCO) {
            console.log('Hide ContinuousInfusion menu');
            this.appMenuService.hideTopMenuItem(continuousInfusion);
        }

        console.log('Processing show /  hide DeliveryTracking menu');
        status = this.processResourceFilter(authorizationData, MvdConstants.DELIVERYTRACKING_WIDGET_KEY);
        if (!status) {
            console.log('Hide DeliveryTracking menu');
            this.appMenuService.hideTopMenuItem(deliveryTracking);
        }

        console.log('Processing show / hide IVStatus menu');
        status = this.processResourceFilter(authorizationData, MvdConstants.IVSTATUS_WIDGET_KEY);
        if (!status) {
            console.log('Hide IVStatus menu');
            this.appMenuService.hideTopMenuItem(ivStatus);
        }

        console.log('Processing show / hide IVPrep menu');
        status = this.processResourceFilter(authorizationData, MvdConstants.IVPREP_WIDGET_KEY);
        if (!status) {
            console.log('Hide IVPrep menu');
            this.appMenuService.hideTopMenuItem(ivPrep);
        }

        console.log('Processing show / hide Clinical Overview menu');
        if (!statusCO) {
            console.log('Hide Clinical Overview menu');
            this.appMenuService.hideTopMenuItem(clinicalOverview);
        }

        //#endregion 4
        return authorizationData;
    }

    private removeWidgets(authorizationData: any[], widgets: string[], source: string) {
        authorizationData.forEach(facility => {
            if (!facility.synonyms.some(syn => syn.idType == "String"
                && syn.source == source
                && syn.type == "Facility")) {
                _.remove(facility.permissions, (p: any) => widgets.some(w => w === p.resource));
            }
        });
    }

    private processResourceFilter(authorizationData: Array<AuthorizationModel>, resource: string): boolean {
        return typeof (authorizationData.find(auth => typeof auth.permissions.find(perm => perm.resource == resource) !== "undefined")) !== "undefined";
    }

    public getEffectivePermissionsFor(principalName: string): Observable<AuthorizationModel[]> { return this.getAuthorizationModel(); }
}

export interface AuthorizationModel {
    id: number;
    name: string;
    parentId: number | null;
    permissions: Array<PermissionModel>;
    synonyms: Array<SynonymModel>;
}

export interface PermissionModel {
    resource: string;
    action: string;
}

export interface SynonymModel {
    id: string;
    idType: string;
    source: string;
    type: string;
    name: string;
}

export interface FacilityModel {
    facilityKey: string;
    facilityCode: string;
    facilityName: string;
    attentionNoticeCriticalThresholdDuration: number;
    remoteDispensing: boolean;
    delivery: boolean;
    facilityPermissions: Array<string>;
}

export interface MedminedUserModel {
    allowed_facilities: Array<number>;
    user_id: number;
    email: string;
    name: string;
    has_alert_access: boolean;
}

export interface MedminedModel {
    user: MedminedUserModel;
}

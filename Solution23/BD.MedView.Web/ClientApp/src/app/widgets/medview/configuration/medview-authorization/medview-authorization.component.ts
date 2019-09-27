import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';


import * as _ from 'lodash';

import { ResourceService } from 'container-framework';

import { IdmUsersApi, PrincipalRolesApi, PrincipalsApi, RolesApi, PrincipalClaimsApi } from './api/api';
import { FacilityDto, IdmUser, Principal, PrincipalRoleDto, PrincipalRoleModificationOperation, Role, PrincipalClaim } from './model/models';

import { take, map, concatMap } from 'rxjs/operators';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { EmailDlgComponent } from './email-dlg/email-dlg.component';
import { of, Observable } from 'rxjs';

@Component({
    moduleId: module.id,
    selector: 'medview-authorization',
    templateUrl: './medview-authorization.component.html',
    styleUrls: ['./medview-authorization.component.scss'],
    providers: [RolesApi, PrincipalsApi, PrincipalClaimsApi, PrincipalRolesApi, IdmUsersApi]
})
export class MedviewAuthorizationComponent implements OnInit {
    @Input() appCode: string;
    @Input() widgetId: string;
    @Input() user: string;
    @Output() userRoleChanged = new EventEmitter<any>();

    resources: any;

    usernamelike: string;
    isListView: boolean;
    isCreateUserView: boolean;
    userDetailLoaded: boolean;
    hasUserDataChanged: boolean;

    currentUserEmails: any [] = [];

    // hide user table before search
    userSearched: boolean;

    // loading spinner
    isLoadingData: boolean;

    // count for principalrole update requests
    principalRoleRequestCount: number;

    public isConfirmModalOpen = false;

    private modalRef: BsModalRef;
    private modalOptions: ModalOptions = {
        class: 'modal-md',
        keyboard: false,
        ignoreBackdropClick: true,
        animated: true,
        focus: true
    };

    private rolesApiExpansion = 'Principals($expand=Claims),Realm';
    private superAdminRoleName = 'BD.MedView.Web.Super';
    private systemAdminRoleName = 'BD.MedView.Web.System';

    currentUser: Principal;
    currentUserOriginal: Principal;
    selectedIdmUser: IdmUser;
    superAdminPrincipalRole: PrincipalRoleDto;
    systemAdminPrincipalRole: PrincipalRoleDto;

    roleNames = [];
    users: any[];
    facilities = new Array<FacilityDto>();
    idmUsers = new Array<IdmUser>();
    userEmails: string[] = [];

    roleIdsToBeAdded = new Array<number>();
    roleIdsToBeRemoved = new Array<number>();

    constructor(
        private principalsApi: PrincipalsApi,
        private principalClaimsApi: PrincipalClaimsApi,
        private rolesApi: RolesApi,
        private resourcesService: ResourceService,
        private principalRolesApi: PrincipalRolesApi,
        private idmUsersApi: IdmUsersApi,
        private modalService: BsModalService)
    {
    }

    ngOnInit() {
        this.setResources();
        this.initializeComponent();
    }

    private getUsers(callback) {
        console.log('MedviewAuthorizationComponent: getUsers');
        this.isLoadingData = true;
        this.rolesApi.rolesGetRoles().subscribe((allRoles) => {
                if (allRoles && allRoles.length > 0) {
                    this.roleNames.length = 0;
                    this.facilities.length = 0;
                    if (!this.users) {
                        this.users = new Array<any>();
                    }

                    this.users.length = 0;

                    // build up role names list and facilities list
                    allRoles.forEach(role => {
                        if (role.name !== this.superAdminRoleName && role.name !== this.systemAdminRoleName) {
                            const roleIndex = this.roleNames.findIndex(p => p == role.name);
                            if (roleIndex < 0) {
                                this.roleNames.push(role.name);
                            }

                            if (role.realm && role.realm.name) {
                                const facilityIndex = this.facilities.findIndex(p => p.id == role.realm.id);
                                if (facilityIndex < 0) {
                                    const facility = new FacilityDto();
                                    facility.id = role.realm.id;
                                    facility.name = role.realm.name;
                                    this.facilities.push(facility);
                                }
                            }
                        }
                    });

                    // add principal roles for facilities
                    if (this.facilities && this.roleNames) {
                        this.facilities.forEach(facility => {
                            facility.principalRoles = new Array<PrincipalRoleDto>();
                            this.roleNames.forEach(roleName => {
                                const principalRole = new PrincipalRoleDto();
                                const role = allRoles.find(p => p.name == roleName && p.realm.id == facility.id);
                                if (role) {
                                    principalRole.roleId = role.id;
                                    principalRole.roleName = role.name;
                                    principalRole.realmId = facility.id;
                                }

                                facility.principalRoles.push(principalRole);
                            });
                        });
                    }

                    // build up users list based on roles list
                    allRoles.forEach(role => {
                        if (role.principals) {
                            role.principals.forEach(user => {
                                const userIndex = this.users.findIndex(t => t.id == user.id);
                                if (userIndex == -1) {
                                    user.roles = new Array<Role>();
                                    user.roles.push(role);
                                    this.users.push(user);
                                } else {
                                    const roleIndex = this.users[userIndex].roles.findIndex(t => t.id == role.id);
                                    if (roleIndex == -1) {
                                        this.users[userIndex].roles.push(role);
                                    }
                                }
                            });
                        }
                    });

                    // initialize facility names of users
                    if (this.users) {
                        this.users.forEach(user => {
                            if (user.roles && user.roles.length > 0) {
                                const realmNames = new Array<string>();
                                user.roles.forEach(role => {
                                    if (!realmNames.find(p => p == role.realm.name)) {
                                        realmNames.push(role.realm.name);
                                    }
                                });

                                if (realmNames.length > 1) {
                                    user.isMultipleRealms = true;
                                } else {
                                    user.isMultipleRealms = false;
                                }

                                this.restoreUserPrimaryEmail(user);
                            }
                        });
                    }

                    if (callback) {
                        callback();
                    }
                    this.getAdminEligibility(allRoles);
                    this.checkOutputEmition();
                    this.isLoadingData = false;
                }
            },
            (error) => this.isLoadingData = false);
    }

    searchUser(event: any) {
        this.isLoadingData = true;
        this.userSearched = true;
        this.usernamelike = event.value;
        this.idmUsersApi
            .getUser(this.usernamelike)
            .subscribe((response) => {
                if (response) {
                    this.idmUsers = [...response];
                }
                this.isLoadingData = false;
            },
            (err) => {
                console.error(`MedviewAuthorizationComponent: Error on search user:`, err);
                this.isLoadingData = false;
            });
    }

    clearSearch() {
        this.usernamelike = '';
    }

    onClearSearchBox(event) {
        this.clearSearch();
    }

    onSelectedUser(user: IdmUser) {
        this.principalsApi.principalsGetPrincipals().subscribe((response) => {

            this.setUserMailDdObject(user);

            if (response) {
                const userInfo = response.find(p => p.name.toLowerCase() === user.username.toLowerCase());
                if (userInfo) {
                    const principal = this.users.find(p => p.name.toLowerCase() === userInfo.name.toLowerCase());
                    this.editUser(principal ? principal : userInfo);
                } else {
                    const principal: Principal = {
                        name: user.username
                    };
                    this.principalsApi.principalsPostPrincipal(principal).subscribe(result => {
                        if (result) {
                            this.editUser(result);
                        }
                    });
                }
            }
        });
    }

    newUser() {
        this.isListView = false;
        this.isCreateUserView = true;
        this.idmUsers.length = 0;
        this.clearSearch();
    }

    editUser(data: Principal) {
        this.restoreUserPrimaryEmail(data);

        this.isListView = false;
        this.isCreateUserView = false;
        this.userDetailLoaded = true;
        this.hasUserDataChanged = false;
        this.currentUser = _.cloneDeep(data);
        this.currentUserOriginal = data;
        this.currentUserEmails = [];
        this.facilities.forEach(uniqueFacility => {
            if (uniqueFacility.id) {
                uniqueFacility.principalRoles.forEach(role => {
                    role.operation = PrincipalRoleModificationOperation.Add;
                    role.isChecked = false;
                });
            }
        });

        this.idmUsersApi.getUserByName(this.currentUser.name).subscribe((response) => {
            if (response) {
                if (response.primaryEmailAddress && !this.currentUserEmails.find(email => email.value == response.primaryEmailAddress)) {
                    this.currentUserEmails.unshift({value: response.primaryEmailAddress, label: response.primaryEmailAddress});
                }

                if (response.aliasEmailAddresses != null && response.aliasEmailAddresses.length > 0) {
                JSON.parse(response.aliasEmailAddresses).forEach(email => {
                    if (!this.currentUserEmails.find(exEmail => exEmail.value === email)) {
                        this.currentUserEmails.push({ value: email, label: email });
                        }
                    });
                }
            }
        });

        if((this.currentUser as any).primaryEmail && !this.currentUserEmails.find(email => email.value == (this.currentUser as any).primaryEmail)){
            this.currentUserEmails.unshift({value: (this.currentUser as any).primaryEmail, label: (this.currentUser as any).primaryEmail});
        }

        if (this.currentUser.roles && this.currentUser.roles.length > 0) {
            if (this.superAdminPrincipalRole) {
                const adminRoles = this.currentUser.roles.filter(p => p.id === this.superAdminPrincipalRole.roleId);
                if (adminRoles.length > 0) {
                    this.superAdminPrincipalRole.operation = PrincipalRoleModificationOperation.Remove;
                    this.superAdminPrincipalRole.isChecked = true;
                } else {
                    this.superAdminPrincipalRole.operation = PrincipalRoleModificationOperation.Add;
                    this.superAdminPrincipalRole.isChecked = false;
                }
            }

            if (this.systemAdminPrincipalRole) {
                const adminRoles = this.currentUser.roles.filter(p => p.id === this.systemAdminPrincipalRole.roleId);
                if (adminRoles.length > 0) {
                    this.systemAdminPrincipalRole.operation = PrincipalRoleModificationOperation.Remove;
                    this.systemAdminPrincipalRole.isChecked = true;
                } else {
                    this.systemAdminPrincipalRole.operation = PrincipalRoleModificationOperation.Add;
                    this.systemAdminPrincipalRole.isChecked = false;
                }
            }

            this.currentUser.roles.forEach(userRole => {
                this.facilities.forEach(uniqueFacility => {
                    const role = uniqueFacility.principalRoles.find(pr => pr.roleId == userRole.id);
                    if (role) {
                        role.operation = PrincipalRoleModificationOperation.Remove;
                        role.isChecked = true;
                    }
                });
            });
        } else {
            if (this.superAdminPrincipalRole) {
                this.superAdminPrincipalRole.operation = PrincipalRoleModificationOperation.Add;
                this.superAdminPrincipalRole.isChecked = false;
            }
            if (this.systemAdminPrincipalRole) {
                this.systemAdminPrincipalRole.operation = PrincipalRoleModificationOperation.Add;
                this.systemAdminPrincipalRole.isChecked = false;
            }
        }
    }

    updateUserRole(callback) {
        this.isLoadingData = true;
        this.roleIdsToBeAdded.length = 0;
        this.roleIdsToBeRemoved.length = 0;
        this.facilities.forEach(facility => {
            if (facility.id) {
                facility.principalRoles.forEach(role => {
                    if (this.isRoleAdded(role)) {
                        this.roleIdsToBeAdded.push(role.roleId);
                    }

                    if (this.isRoleRemoved(role)) {
                        this.roleIdsToBeRemoved.push(role.roleId);
                    }
                });
            }
        });

        var userPrincipal: Principal = {
            id: this.currentUser.id,
            name: this.currentUser.name,
            roles: null,
            claims: this.currentUser.claims
        };
        (userPrincipal as any).primaryEmail = (this.currentUser as any).primaryEmail;


        if (this.superAdminPrincipalRole) {
            if (this.isRoleAdded(this.superAdminPrincipalRole)) {
                this.roleIdsToBeAdded.push(this.superAdminPrincipalRole.roleId);
            }

            if (this.isRoleRemoved(this.superAdminPrincipalRole)) {
                this.roleIdsToBeRemoved.push(this.superAdminPrincipalRole.roleId);
            }
        }

        if (this.systemAdminPrincipalRole) {
            if (this.isRoleAdded(this.systemAdminPrincipalRole)) {
                this.roleIdsToBeAdded.push(this.systemAdminPrincipalRole.roleId);
            }

            if (this.isRoleRemoved(this.systemAdminPrincipalRole)) {
                this.roleIdsToBeRemoved.push(this.systemAdminPrincipalRole.roleId);
            }
        }

        // workaround for multiple requests
        this.principalRoleRequestCount = this.roleIdsToBeAdded.length + this.roleIdsToBeRemoved.length;

        //this.principalsApi.principalsPutPrincipal(userPrincipal.id, userPrincipal).subscribe(() => {
        //    this.currentUserOriginal = this.currentUser;
        //    if (this.principalRoleRequestCount === 0) {
        //        this.updatePrincipalRoleRequestPostProcess();
        //        return;
        //    }
        //});
        this.updateUserPrimaryEmail(userPrincipal).subscribe(() => {
            this.currentUserOriginal = this.currentUser;
            if (this.principalRoleRequestCount === 0) {
                this.updatePrincipalRoleRequestPostProcess();
                return;
            }
        });

        this.roleIdsToBeAdded.forEach(p => {
            this.principalRolesApi.principalRolesPutPrincipalRole(this.currentUser.id, p).subscribe(
                q => {
                    console.log('MedviewAuthorizationComponent: roleIdsToBeAdded');

                    this.updatePrincipalRoleRequestPostProcess();
                });
        });

        this.roleIdsToBeRemoved.forEach(p => {
            this.principalRolesApi.principalRolesDeletePrincipalRole(this.currentUser.id, p).subscribe(
                q => {
                    console.log('MedviewAuthorizationComponent: roleIdsToBeRemoved');

                    this.updatePrincipalRoleRequestPostProcess();
                });
        });
    }

    updatePrincipalRoleRequestPostProcess() {
        this.principalRoleRequestCount--;
        if (this.principalRoleRequestCount <= 0) {
            this.doPrincipalRoleRequestPostProcessCallBack();
        }
    }

    doPrincipalRoleRequestPostProcessCallBack() {
        this.isLoadingData = false;
        this.initializeComponent();
    }

    initializeComponent() {
        console.log('MedviewAuthorizationComponent: initializeUsers');
        this.getUsers(() => {
            this.initializeListView();
        });
    }

    initializeListView() {
        this.isListView = true;
        this.isCreateUserView = false;
        this.userDetailLoaded = false;
        this.userSearched = false;
        this.hasUserDataChanged = false;
    }

    updateUsersPrimaryEmail() {
        this.users.forEach(user => {
            this.idmUsersApi.getUserByName(user.name).pipe(
                concatMap((userData) => {
                    this.resources.updateUsersPrimaryEmail = 'Updating: ' + user.name;

                    if (!user.primaryEmail && userData && userData.primaryEmailAddress) {
                        user.primaryEmail = userData.primaryEmailAddress;
                        //let userToUpdate = {
                        //    id: user.id,
                        //    name: user.name,
                        //    primaryEmail: user.primaryEmail
                        //};
                        //return this.principalsApi.principalsPutPrincipal(user.id, userToUpdate);
                        return this.updateUserPrimaryEmail(user);
                    }

                    return of({});
                }))
                .subscribe(() => {
                    this.resources.updateUsersPrimaryEmail = this.resourcesService.resource('updateUsersPrimaryEmail')
                })
        });
    }

    restoreUserPrimaryEmail(userPrincipal: Principal): void {
        let primaryEmailClaim = userPrincipal.claims.find(item => item.type == 'PrimaryEmail');
        if (primaryEmailClaim) {
            (userPrincipal as any).primaryEmail = primaryEmailClaim.value;
        }
    };

    updateUserPrimaryEmail(userPrincipal: Principal): Observable<{}> {
        let primaryEmail = (userPrincipal as any).primaryEmail;
        let primaryEmailClaim = userPrincipal.claims.find(item => item.type == 'PrimaryEmail');
        if (primaryEmailClaim) {
            if (primaryEmail) {
                primaryEmailClaim.value = primaryEmail;
                return this.principalClaimsApi.principalClaimsPutPrincipalClaim(primaryEmailClaim.id, primaryEmailClaim);
            }
            else {
                return this.principalClaimsApi.principalClaimsDeletePrincipalClaim(primaryEmailClaim.id);
            }
        }
        else {
            if (primaryEmail) {
                primaryEmailClaim = {
                    id: 0,
                    principalId: userPrincipal.id,
                    issuer: 'BD.MedView',
                    originalIssuer: 'BD.MedView',
                    subject: 'BD.MedView.Authorization',
                    type: 'PrimaryEmail',
                    value: primaryEmail,
                    valueType: 'String',
                } as PrincipalClaim;
                return this.principalClaimsApi.principalClaimsPostPrincipalClaim(primaryEmailClaim);
            }
            else {
                return of({});
            }
        }
    }

    private checkOutputEmition() {
        if (this.currentUser && this.user &&
            ((this.currentUser.name || '').toLowerCase()) === this.user.toLowerCase()) {
            this.userRoleChanged.emit();
        }
    }

    private getAdminEligibility(roles) {
        this.systemAdminPrincipalRole = null;
        this.superAdminPrincipalRole = null;

        if (roles && roles.length > 0) {
                const systemAdminRoles = roles.filter(p => p.name === this.systemAdminRoleName);
                if (systemAdminRoles.length > 0 && !this.systemAdminPrincipalRole) {
                    this.systemAdminPrincipalRole = new PrincipalRoleDto();
                    this.systemAdminPrincipalRole.roleId = systemAdminRoles[0].id;
                }

                const superAdminRoles = roles.filter(p => p.name === this.superAdminRoleName);
                if (superAdminRoles.length > 0 && !this.superAdminPrincipalRole) {
                    this.superAdminPrincipalRole = new PrincipalRoleDto();
                    this.superAdminPrincipalRole.roleId = superAdminRoles[0].id;
                }
            }
    }

    cancelUpdateUserRole() {
        this.initializeListView();
    }

    getRoleResourceName(roleName: string) {
        return roleName.charAt(0).toLowerCase() + roleName.slice(1);
    }

    getPrincipals() {
        const request = {
            appCode: this.appCode,
            widgetId: this.widgetId,
            api: 'principals'
        };

        return request;
    }

    postPrincipal(params: any) {
        const request = {
            appCode: this.appCode,
            widgetId: this.widgetId,
            api: 'principals',
            rawData: params
        };

        return request;
    }

    getRoles(params: any) {
        const request = {
            appCode: this.appCode,
            widgetId: this.widgetId,
            api: 'roles',
            rawData: params,
            queryParams: params
        };
        return request;
    }

    putPrincipalRole(id: number, link: number) {
        let rawData: any;
        rawData = `?id=${id}&link=${link}`;
        const request = {
            appCode: this.appCode,
            widgetId: this.widgetId,
            api: '[put]principalroles',
            rawData: rawData,
            queryParams: rawData
        };

        return request;
    }

    deletePrincipalRole(id: number, link: number) {
        let rawData: any;
        rawData = `?id=${id}&link=${link}`;
        let request = {
            appCode: this.appCode,
            widgetId: this.widgetId,
            api: "[delete]principalroles",
            rawData: rawData,
            queryParams: rawData
        };

        return request;
    }

    getIdmUsers(params: any) {
        let request = {
            appCode: this.appCode,
            widgetId: this.widgetId,
            api: "getuser",
            rawData: params,
            queryParams: params
        };

        return request;
    }

    sortData(event: any) {
        this.users.sort((left, right) => {
            const leftName = this.getFacilityName(left);
            const rightName = this.getFacilityName(right);
            return leftName >= rightName ? (leftName === rightName ? 0 : event.order) : -event.order;
        });

        this.users = [...this.users];
    }

    getFacilityName(data: any) {
        const rootRealmName = 'BD.MedView.Authorization';
        return data ?
        (data.isMultipleRealms || data.roles[0].realm.name == rootRealmName ?
            this.resources.multiple : data.roles[0].realm.name) : '';
    }

    onCheckBoxChange(event: any) {
        this.hasUserDataChanged = false;
        this.facilities.filter(facility => facility.id).forEach(facility => {
            facility.principalRoles.forEach(role => {
                if (this.isRoleChanged(role)) {
                    this.hasUserDataChanged = true;
                    return;
                }
            });

            if (this.hasUserDataChanged) {
                return;
            }
        });

        this.hasUserDataChanged = this.hasUserDataChanged || (this.superAdminPrincipalRole && this.isRoleChanged(this.superAdminPrincipalRole)) || (this.systemAdminPrincipalRole && this.isRoleChanged(this.systemAdminPrincipalRole));
    }

    isRoleChanged(role: PrincipalRoleDto) {
        return this.isRoleAdded(role) || this.isRoleRemoved(role);
    }

    isRoleAdded(role: PrincipalRoleDto) {
        return role.operation === PrincipalRoleModificationOperation.Add && role.isChecked;
    }

    isRoleRemoved(role: PrincipalRoleDto) {
        return role.operation === PrincipalRoleModificationOperation.Remove && !role.isChecked;
    }

    addNewEmail() {
        this.openConfirmModal(this.resources.addNewEmailText, '', this.resources.save, this.resources.cancel);
    }

    openConfirmModal(header: string, message: string, yesLabel: string, cancelLabel: string) {
        const initialState = { header, message, yesLabel, cancelLabel };
        this.modalOptions.initialState = initialState;
        this.modalRef = this.modalService.show(EmailDlgComponent, this.modalOptions);
        this.isConfirmModalOpen = true;
        this.modalRef.content.modalRef = this.modalRef;
        this.modalRef.content.dlgConfirm.pipe(take(1)).subscribe(response => {
            this.isConfirmModalOpen = false;
            this.currentUserEmails.unshift({value: response.email, label: response.email});
            (this.currentUser as any).primaryEmail = response.email;
            this.hasUserDataChanged = true;
            this.modalRef.hide();
        });
        this.modalRef.content.dlgCancel.pipe(take(1)).subscribe(() => {
            this.isConfirmModalOpen = false;
            this.modalRef.hide();
        });
    }

    private setResources() {
        this.resources = {
            userAuthorization: this.resourcesService.resource('userAuthorization'),
            newUser: this.resourcesService.resource('newUser'),
            facilities: this.resourcesService.resource('facilities'),
            multiple: this.resourcesService.resource('multiple'),
            edit: this.resourcesService.resource('edit'),
            keyword: this.resourcesService.resource('keyword'),
            userName: this.resourcesService.resource('userName'),
            primaryEmail: this.resourcesService.resource('primaryEmail'),
            firstName: this.resourcesService.resource('firstName'),
            lastName: this.resourcesService.resource('lastName'),
            apply: this.resourcesService.resource('apply'),
            cancel: this.resourcesService.resource('cancel'),
            back: this.resourcesService.resource('back'),
            assignRoles: this.resourcesService.resource('assignRoles'),
            save: this.resourcesService.resource('save'),
            addNewEmailText: this.resourcesService.resource('addNewEmailText'),
            selectEmailText: this.resourcesService.resource('selectEmailText'),
            primaryEmailText: this.resourcesService.resource('primaryEmailText'),
            updateUsersPrimaryEmail: this.resourcesService.resource('updateUsersPrimaryEmail')
        };
    }

    private setUserMailDdObject(user: any) {
        this.currentUserEmails = [];
        this.currentUserEmails = user.aliasEmailAddresses.filter(email => {
                return {value: email, label: email};
        }) || [];
        if (user.primaryEmailAddress && !this.currentUserEmails.find(email => email.value == user.primaryEmailAddress)) {
            this.currentUserEmails.unshift({value: user.primaryEmailAddress, label: user.primaryEmailAddress});
        }
    }

    selectedUser() {
        if ((this.currentUserOriginal as any).primaryEmail !== (this.currentUser as any).primaryEmail) {
            this.hasUserDataChanged = true;
        }
    }
}

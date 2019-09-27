'use strict';
//import * as models from './models';

export class PrincipalRoleDto {
    roleId?: number;
    roleName?: string;
    realmId: number
    operation?: PrincipalRoleModificationOperation;
    isChecked?: boolean;
}

export enum PrincipalRoleModificationOperation {
    Add = 1,
    Remove
}
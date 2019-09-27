export interface Access {
    principalId: number;
    permissionId: number;
    realmId: number;

    principal?: Principal;
    permission?: Permission;
    realm?: Realm;
}

export interface Permission {
    id: number;
    name: string;
    resourceId: number;

    resource?: Resource;
    roles?: Role[];
}

export interface Principal {
    id: number;
    name: string;

    roles?: Role[];
    claims?: PrincipalClaim[];
}

export interface PrincipalClaim {
    id: number;
    principalId: number;
    issuer: string;
    originalIssuer: string;
    subject: string;
    type: string;
    value: string;
    valueType: string;

    principal?: Principal;
}

export interface Realm {
    id: number;
    name: string;
    parentId: number | null;

    parent?: Realm;
    children?: Realm[];
    roles?: Role[];
    claims?: RealmClaim[];
}

export interface RealmClaim {
    id: number;
    realmId: number;
    issuer: string;
    originalIssuer: string;
    subject: string;
    type: string;
    value: string;
    valueType: string;

    realm?: Realm;
}

export interface Resource {
    id: number;
    name: string;

    permissions?: Permission[];
}

export interface Role {
    id: number;
    name: string;
    realmId: number;

    realm?: Realm;
    principals?: Principal[];
    permissions?: Permission[];
}

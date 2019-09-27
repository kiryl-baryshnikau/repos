'use strict';
//import * as models from './models';
import { PrincipalRoleDto } from './models';

export class FacilityDto {
    id?: number;
    name?: string;
    principalRoles?: Array<PrincipalRoleDto>;
}

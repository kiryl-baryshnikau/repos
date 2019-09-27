import { Injectable } from '@angular/core';
import { MvdConstants } from '../shared/mvd-constants';
import * as _ from 'lodash';

@Injectable()
export class RolePermissionsValidatorService {

    hasWriteAccess(widgetName: string, authorizationConfig, nativeFacility: string, providerName: string): boolean {

        if (!widgetName || !authorizationConfig || !authorizationConfig.length || !providerName) {
            return false;
        }

        const authConfig = authorizationConfig.filter((item) => item.name !== MvdConstants.AUTHORIZATION_ROOT_ID);
        const facilityInfo = authConfig.find(a =>
            a.synonyms.some(s => s.id === nativeFacility && (s.source || '').toLowerCase() === providerName)
        );

        if (!facilityInfo || !facilityInfo.permissions || !facilityInfo.permissions.length) {
            return false;
        }

        const result = facilityInfo.permissions
            .some((permission) => permission.resource === widgetName && permission.action === MvdConstants.WRITE_ACCESS_PERMISSION);
        return result;
    }

    getAuthorizedFacilitiesFor(authorizationConfig
        , resourceName: string
        , providerName: string
        , userPreferences) {

        if (!authorizationConfig || !resourceName || !providerName || !userPreferences) {
            return [];
        }

        const authConfig = authorizationConfig.filter(a => a.name !== MvdConstants.AUTHORIZATION_ROOT_ID);
        const allSelectedItem = userPreferences.find(p => p.id === MvdConstants.ALL_FACILITIES_KEY);
        const isAllSelected = allSelectedItem ? allSelectedItem.selected : false;

        const authorizedFacilties = authConfig.reduce((acc, curr) => {

            const hasPermissions = curr.permissions.some(p => p.resource === resourceName);
            const synonym = curr.synonyms.find(s => (s.source || '').toLowerCase() === (providerName || '').toLowerCase());
            const config = userPreferences.find(p => (p.id || '').toString() === (curr.id || '').toString());

            if (config && config.selected || isAllSelected) {
                return hasPermissions && !!synonym ? [...acc, synonym.id] : acc;
            }
            return acc;
        }, []);

        return authorizedFacilties;
    }
}

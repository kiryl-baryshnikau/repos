import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { UserConfigurationService } from '../../services/user-configuration.service';
import { FacilityLookUpService } from '../../services/facility-look-up.service';
import { MvdConstants } from '../shared/mvd-constants';
import { SystemAdminConfigurationService } from '../medview/configuration/medview-system-admin/system-admin-configuration.service';
import * as _ from 'lodash';

@Injectable()
export class InfusionDataFiltersService {

    private filters: any = window['infusionStatusFilters'];

    constructor(private userConfigurationService: UserConfigurationService,
                private facilityLookUpService: FacilityLookUpService,
                private systemAdminConfigService: SystemAdminConfigurationService
    ) { }

    getFilters(user: string) {
        return forkJoin([
            this.userConfigurationService.getCurrentConfig().pipe(first()),
            this.systemAdminConfigService.getGlobalPreferences()
        ]).pipe(
            map(([response, globalSettings]) => {
                const facilities = response.userPreferences.facilities || '';
                const infusionFilters = this.filters;
                if (facilities) {
                    const filters = {
                        facilities: []
                    };
                    let allFacilitiesSelected: boolean = false;
                    const selectedFacilities = facilities.filter(a => {
                        if (a.id === MvdConstants.ALL_FACILITIES_KEY && a.selected) {
                            allFacilitiesSelected = true;
                        }
                        return a.selected === true
                    });
                    

                    if (!selectedFacilities || selectedFacilities.length === 0 || allFacilitiesSelected) {
                        facilities.forEach((setting: any) => {
                            filters.facilities.push(setting.id);
                        });
                    } else {
                        selectedFacilities.forEach(selectedFacility => {
                            filters.facilities.push(selectedFacility.id);
                        });
                        
                    }
                    infusionFilters.facilities = this.buildFacilitiesFilter(filters, response.authorizationConfig);
                    infusionFilters.units = '';
                }
                response = this.addFacilityMasterToFilter(response);
                return {
                    api: infusionFilters,
                    userPreferences: response.userPreferences,
                    authorizationConfig: response.authorizationConfig,
                    globalSettings: globalSettings
                };
            })
        );
    }

    applyFacilityFilters(data: any, preferences: any, allowUnknowns = false) {
        let filters = (preferences
            && preferences.filters
            && preferences.filters.facilityFilters) ?
            preferences.filters.facilityFilters : [];

        const userPrefsFacilitiesInfo = preferences &&
            preferences.facilities || [];

        filters = filters.filter(f => this.isActiveInfusionFacilityFilter(f.masterFacility, userPrefsFacilitiesInfo));

        if (!data || !data.length || !filters) {
            return data;
        }

        let result = [];
        for (const filterCriteria of filters) {
            const filteredByFacility = data
                        .filter(item => item.adtFacility === filterCriteria.facilityId ||
                            (allowUnknowns ? !item.adtFacility : false));
            if (!filterCriteria.units.length && filteredByFacility.length) {
                result = [...result, ...filteredByFacility];
                continue;
            }
            if (filteredByFacility.length) {
                for (const unitCriteria of filterCriteria.units) {
                    const filteredByUnits = filteredByFacility.filter(item => item.patientCareUnit === unitCriteria.unitId);
                    if (!unitCriteria.patients.length && filteredByUnits.length) {
                        result = [...result, ...filteredByUnits];
                        continue;
                    }
                    if (filteredByUnits.length) {
                        for (const patientCriteria of unitCriteria.patients) {
                            const filteredByPatient = filteredByUnits.filter(item => item.adtPatientId === patientCriteria.patientId);
                            if (filteredByPatient.length) {
                                result = [...result, ...filteredByPatient];
                            }
                        }
                    }
                }
            }
        }
        const unique = _.uniqBy(result, 'infusionContainerKey');
        return unique;
    }

    applyInfusionsFilters(data: any, widgetConfiguration: any, { excludedInfusions: excludedInfusions }) {
        if (data) {
            if (!widgetConfiguration || !widgetConfiguration.configuration || !widgetConfiguration.configuration.infusionsToShow) {
                return data.filter(a => excludedInfusions.findIndex(infusion => infusion.name === a.infusion) < 0);
            } else {
                let infusionsToShow = widgetConfiguration.configuration.infusionsToShow || [];
                if (infusionsToShow.length > 0 && excludedInfusions && excludedInfusions.length > 0) {
                    infusionsToShow = infusionsToShow
                        .filter(a => excludedInfusions.findIndex(infusion => infusion.name === a) < 0);
                }
                return data
                    .filter(a => infusionsToShow.findIndex(infusion => infusion === a.infusion) >= 0);
            }
        }
        return data;
    }

    private buildFacilitiesFilter(filters, configuration) {
        if (!filters || !filters.facilities || !filters.facilities.length) {
            return '';
        }
        const facilities = [];
        filters.facilities
            .forEach(facility => facilities.push(this.facilityLookUpService
                .nativeFacilityLookUp(facility, configuration, MvdConstants.INFUSION_PROVIDER_NAME)));
        return facilities.join(';');
    }

    private addFacilityMasterToFilter(response: any) {
        const filters = (response
            && response.userPreferences
            && response.userPreferences.filters
            && response.userPreferences.filters.facilityFilters) ?
            response.userPreferences.filters.facilityFilters : [];

        filters.forEach((item: any) => {
            item.masterFacility = this.facilityLookUpService
                .masterFacilityIdLookUp(item.facilityId,
                    response.authorizationConfig,
                    MvdConstants.INFUSION_PROVIDER_NAME);
        });
        return response;
    }

    private isActiveInfusionFacilityFilter(masterFacility: string, userPrefsFacilities: any) {
        return userPrefsFacilities.some(f =>
            (masterFacility || '').toString() === (f.id || '')
            && (f.widgets || []).some(w => (w.id || '').indexOf(MvdConstants.FACILITY_WIDGET_ID_PREFIX) >= 0));
    }
}

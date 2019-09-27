import { Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';
import { first, map } from 'rxjs/operators';
import * as _ from 'lodash';

import { UserConfigurationService } from '../../../services/user-configuration.service';
import { FacilityLookUpService } from '../../../services/facility-look-up.service';
import { SystemAdminConfigurationService } from '../configuration/medview-system-admin/system-admin-configuration.service';
import { IvPrepTransformationService } from './mvd-iv-prep-transformation.service';

import { MvdConstants } from '../../shared/mvd-constants';
import { IvPrepModels } from '../../shared/mvd-models';

@Injectable()
export class CatoDataFiltersService {

    constructor(private userConfigurationService: UserConfigurationService,
        private facilityLookUpService: FacilityLookUpService,
        private systemAdminConfigService: SystemAdminConfigurationService,
        private transformationService: IvPrepTransformationService) { }


    getFilters$() {
        return forkJoin([
            this.userConfigurationService.getCurrentConfig().pipe(first()),
            this.systemAdminConfigService.getGlobalPreferences()
        ]).pipe(
            map(([response, globalSettings]) => {
                response = this.addFacilityMasterToFilter(response);
                const nativeFacilities =
                    this.getSelectedFacilities(response.userPreferences, response.authorizationConfig);
                return {
                    userPreferences: response.userPreferences,
                    authorizationConfig: response.authorizationConfig,
                    globalSettings: globalSettings,
                    nativeFacilities
                };
            }));
    }

    /**
     * Populates items to show for the Multi value filter
     * @param userPreferences HSV User Preferences
     * @param facilitiesResponse Facilities from GET/Facilities
     * @param unitsResponse Facilities from GET/Units
     * @param dosesResponse Doses from GET/Doses. Used to get the summary doses
     * @param stateMappings Mappings from Cato to HSV states
     * @param prioritiesResponse Supported priorities: STAT (true) | Normal (false)
     * @param containerTypesResponse Supported Container Types: syringe | bag
     */
    getMultiValueFilterDataFilters(authorizationConfig: any
        , userPreferences: any
        , authorizedNativeFacilities: string[]
        , facilitiesResponse: IvPrepModels.FacilitiesResponse
        , unitsResponse: IvPrepModels.UnitsResponse
        , prepSites: IvPrepModels.PrepSitesResponse
        , prioritiesResponse: IvPrepModels.PrioritiesResponse
        , containerTypesResponse: IvPrepModels.ContainerTypesResponse
    ): IvPrepModels.IvPrepViewModel[] {

        const filterData: IvPrepModels.IvPrepViewModel[] = [];
        const ivPrepSettings = this.getIvPrepSettings(userPreferences);
        const authorizedFacilities = this.filterAuthorizedFacilities(facilitiesResponse
            , authorizationConfig
            , ivPrepSettings
            , userPreferences);
        const facilityOptions = this.getFacilityFilterOptions(authorizedFacilities, authorizationConfig);
        const unitOptions = this.getUnitFilterOptions(authorizedFacilities, unitsResponse, ivPrepSettings);

        const prepSiteOptions = this.getPrepSiteOptions(prepSites, ivPrepSettings);
        const prioritiesOptions = this.getPrioritiesOptions(prioritiesResponse);
        const containerOptions = this.getContainerTypesOptions(containerTypesResponse);
        const facilityOption = _.head(facilityOptions);
        const unitOption = _.head(unitOptions);
        const prepSiteOption = _.head(prepSiteOptions);
        const priorityOption = _.head(prioritiesOptions);
        const containerOption = _.head(containerOptions);

        const allOptions = [facilityOptions, unitOptions, prepSiteOptions, prioritiesOptions, containerOptions];

        // Fill other data to avoid showing unnecesary 'unknown'
        if (facilityOption) {
            allOptions.filter(options => options !== facilityOptions)
                .forEach(options =>
                    options.forEach(o => o.masterFacility = facilityOption.masterFacility)
                );
        }

        if (unitOption) {
            allOptions.filter(options => options !== unitOptions)
                .forEach(options =>
                    options.forEach(o => { o.unit = unitOption.unit; o.unitId = unitOption.unitId; })
                );
        }

        if (prepSiteOption) {
            allOptions.filter(options => options !== prepSiteOptions)
                .forEach(options =>
                    options.forEach(o => { o.prepSite = prepSiteOption.prepSite; })
                );
        }

        if (priorityOption) {
            allOptions.filter(options => options !== prioritiesOptions)
                .forEach(options =>
                    options.forEach(o => { o.priorityDisplayName = priorityOption.priorityDisplayName; })
                );
        }

        if (containerOption) {
            allOptions.filter(options => options !== containerOptions)
                .forEach(options =>
                    options.forEach(o => { o.finalContainerType = containerOption.finalContainerType; })
                );
        }

        filterData.push(...facilityOptions);
        filterData.push(...unitOptions);
        filterData.push(...prepSiteOptions);
        filterData.push(...prioritiesOptions);
        filterData.push(...containerOptions);

        return filterData;
    }

    private getSelectedFacilitiesSetting(userPreferences: any): any[] {
        const facilities = _.get(userPreferences, 'facilities', []);
        const itemsSelected = facilities.filter(f => f.selected);
        if (!itemsSelected) {
            throw new Error('CatoDataFiltersService: No facility selected from User Preferences');
        }
        return itemsSelected;
    }

    private getFacilityFilterOptions(authorizedFacilities: IvPrepModels.FacilitiesResponse,
        authorizationConfig: any): IvPrepModels.IvPrepViewModel[] {
        return authorizedFacilities.Facilities.map(facility => {
            return {
                masterFacility: this.transformationService.mapMasterFacility(facility.Id, authorizationConfig)
            } as IvPrepModels.IvPrepViewModel;
        });
    }

    private getUnitFilterOptions(authorizedFacilities: IvPrepModels.FacilitiesResponse
        , unitsResponse: IvPrepModels.UnitsResponse
        , ivPrepSettings: IvPrepModels.IvPrepGeneralSettings): IvPrepModels.IvPrepViewModel[] {

        const units = this.filterUnitsResponse(authorizedFacilities, unitsResponse);
        if (!ivPrepSettings || (ivPrepSettings && ivPrepSettings.unitsSettings === null)) {
            return units.Units.map(unit => {
                return {
                    unitId: unit.Id,
                    unit: unit.Designation,
                } as IvPrepModels.IvPrepViewModel;
            });
        }
        const filteredUnits = units.Units
            .filter((u) => ivPrepSettings.unitsSettings.some((s) => s.unitId === u.Id));
        return filteredUnits.map(unit => {
            return {
                unitId: unit.Id,
                unit: unit.Designation,
            } as IvPrepModels.IvPrepViewModel;
        });

    }

    private getPrepSiteOptions(prepSites: IvPrepModels.PrepSitesResponse
        , ivPrepSettings: IvPrepModels.IvPrepGeneralSettings): IvPrepModels.IvPrepViewModel[] {


        if (!ivPrepSettings || ivPrepSettings && ivPrepSettings.prepSiteSettings === null) {
            return prepSites.Prepsites.map(prepSite => {
                return { prepSite: prepSite.Abbreviation } as IvPrepModels.IvPrepViewModel;
            });
        }

        if (ivPrepSettings &&
            ivPrepSettings.prepSiteSettings &&
            ivPrepSettings.prepSiteSettings.length === 0) {
            return [];
        }

        const filteredPrepsites = prepSites.Prepsites.filter((p) => ivPrepSettings.prepSiteSettings.some((s) => s.prepSiteId === p.Id));
        return filteredPrepsites.map(prepSite => {
            return { prepSite: prepSite.Abbreviation } as IvPrepModels.IvPrepViewModel;
        });
    }

    private getPrioritiesOptions(prioritiesOptions: IvPrepModels.PrioritiesResponse): IvPrepModels.IvPrepViewModel[] {
        return prioritiesOptions.Priorities.map(priorityOption => {
            return { priorityDisplayName: priorityOption.Id } as IvPrepModels.IvPrepViewModel;
        });
    }

    private getContainerTypesOptions(containerTypes: IvPrepModels.ContainerTypesResponse): IvPrepModels.IvPrepViewModel[] {
        return containerTypes.ContainerTypes.map(containerType => {
            return { finalContainerType: containerType.Id } as IvPrepModels.IvPrepViewModel;
        });
    }

    private filterAuthorizedFacilities(facilitiesResponse: IvPrepModels.FacilitiesResponse
        , authorizationConfig: any
        , ivPrepSettings: IvPrepModels.IvPrepGeneralSettings
        , userPreferences: any): IvPrepModels.FacilitiesResponse {

        if (!authorizationConfig || (ivPrepSettings &&
            ivPrepSettings.unitsSettings &&
            !ivPrepSettings.unitsSettings.length)) {
            return { Facilities: [] };
        }

        const selectedFacilities = this.getSelectedFacilitiesSetting(userPreferences);


        const isAllFacilitiesSelected = selectedFacilities.some(f => f.id === MvdConstants.ALL_FACILITIES_KEY);
        const authConfiguration = authorizationConfig.filter((f) => (f.name || '') !== MvdConstants.AUTHORIZATION_ROOT_ID);
        let authorizedFacilities = (facilitiesResponse.Facilities || []).filter((f) => {
            return authConfiguration.some((c) => this.hasProvider(c.synonyms, MvdConstants.CATO_PROVIDER_NAME) &&
                                                    this.hasPermissions(c.permissions, MvdConstants.IVPREP_WIDGET_KEY) &&
                                                    this.hasSynonymId(c.synonyms, f.Id));
        });
        if (!isAllFacilitiesSelected) {
            let authNativeFacilities = [];
            selectedFacilities.forEach(selectedFacility => {
                const authFacilityInfo = authorizationConfig.find(a => (a.id || '').toString() === selectedFacility.id);
                const nativeFacility = authFacilityInfo
                    .synonyms
                    .find(s => (s.source || '').toLowerCase() === MvdConstants.CATO_PROVIDER_NAME.toLowerCase());
                if (nativeFacility) {
                    authNativeFacilities.push(nativeFacility);
                }
            });
            

            authorizedFacilities = authorizedFacilities.filter(f => authNativeFacilities.some(af => af.id === f.Id));
        }

        if (!ivPrepSettings || (ivPrepSettings && ivPrepSettings.unitsSettings === null)) {
            return { Facilities: authorizedFacilities };
        }

        const filteredFacilities = authorizedFacilities.filter((f) => ivPrepSettings.unitsSettings.some((s) => s.facilityId === f.Id));
        return { Facilities: filteredFacilities };
    }

    filterFacilitiesResponse(facilitiesResponse: IvPrepModels.FacilitiesResponse,
        authorizedNativeFacilities: string[]): IvPrepModels.FacilitiesResponse {

        if (authorizedNativeFacilities && authorizedNativeFacilities.length) {
            const filteredFacilities = (facilitiesResponse.Facilities || []).filter(fr => _.includes(authorizedNativeFacilities, fr.Id));

            return { Facilities: filteredFacilities };
        }

        return { Facilities: [] };
    }

    private getIvPrepSettings(userPreferences: any): IvPrepModels.IvPrepGeneralSettings {
        if (!userPreferences ||
            !userPreferences.generalSettings ||
            !userPreferences.generalSettings.length) {
            return undefined;
        }

        const ivPrepSetting = userPreferences
            .generalSettings.find((s) => s.id === MvdConstants.IVPREP_WIDGET_KEY);
        if (!ivPrepSetting) {
            return undefined;
        }

        return ivPrepSetting.configuration as IvPrepModels.IvPrepGeneralSettings;
    }

    private hasProvider(synonyms: any[], providerName: string): boolean {
        return synonyms.some((s) => (s.source || '').toLowerCase() === (providerName || '').toLowerCase());
    }

    private hasPermissions(permissions: any[], resourceName: string): boolean {
        return permissions.some((p) => (p.resource || '').toLowerCase() === (resourceName || '').toLowerCase());
    }

    private hasSynonymId(synonyms: any[], synonymId: string): boolean {
        return synonyms.some((s) => (s.id || '').toLowerCase() === (synonymId || '').toLowerCase()
            && (s.source || '').toLowerCase() === MvdConstants.CATO_PROVIDER_NAME.toLowerCase());
    }

    filterUnitsResponse(authorizedFacilities: IvPrepModels.FacilitiesResponse,
        unitsResponse: IvPrepModels.UnitsResponse): IvPrepModels.UnitsResponse {

        const authorizedFacilitiesIds = authorizedFacilities.Facilities.map(af => af.Id);
        const filteredUnits = (unitsResponse.Units || [])
            .filter(unitResponse => _.includes(authorizedFacilitiesIds, unitResponse.FacilityId));

        return { Units: filteredUnits };
    }

    private getSelectedFacilities(userPreferences: any, authorizationConfig: any) {
        let selectedFacilities = [];
        if (!userPreferences || !authorizationConfig) {
            return selectedFacilities;
        }
        const facilities = userPreferences.facilities || '';
        if (facilities) {
            const filters = {
                facilities: []
            };
            let allFacilitiesSelected = false;
            const userSelectedFacilities = facilities.filter(a => {
                if (a.id === MvdConstants.ALL_FACILITIES_KEY && a.selected) {
                    allFacilitiesSelected = true;
                }
                return a.selected == true
            });
            if (!userSelectedFacilities || userSelectedFacilities.length === 0 || allFacilitiesSelected) {
                facilities.forEach((setting: any) => {
                    filters.facilities.push(setting.id);
                });
            } else {
                userSelectedFacilities.forEach(selectedFacility => {
                    filters.facilities.push(selectedFacility.id);
                });
            }
            selectedFacilities = this.buildFacilitiesFilter(filters, authorizationConfig);
        }
        return selectedFacilities;
    }

    private buildFacilitiesFilter(filters, configuration) {
        if (!filters || !filters.facilities || !filters.facilities.length) {
            return [];
        }
        const facilities = [];
        filters.facilities
            .forEach(facility => {
                const nativeFacility = this.facilityLookUpService
                    .nativeFacilityLookUp(facility, configuration, MvdConstants.CATO_PROVIDER_NAME, '');
                if (nativeFacility) {
                    facilities.push(nativeFacility);
                }
            });
        return facilities;
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
                    MvdConstants.CATO_PROVIDER_NAME);
        });
        return response;
    }
}

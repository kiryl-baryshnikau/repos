import { Injectable } from "@angular/core";

import { ContextConstants, ContextService, ResourceService } from 'container-framework';
import {MvdConstants} from '../../widgets/shared/mvd-constants';
import {FacilityLookUpService} from '../../services/facility-look-up.service';

@Injectable()
export class DashboardHeaderService {

    constructor(
        private contextService: ContextService,
        private facilityLookUpService: FacilityLookUpService,
        private resourceService: ResourceService) { }


    updateHeader(appCode: string, preferences: any) {
        if (!appCode || !preferences) {
            return;
        }
        let header = ''; 
        let facilities = preferences.userPreferences.facilities as any[];
        let facilitiesList: string[] = [];
        if (facilities.length) {
            let allFacilitiesSelected = false;
            let selectedFacilities = facilities.filter(a => {
                if (a.selected && a.id === MvdConstants.ALL_FACILITIES_KEY) {
                    allFacilitiesSelected = true;
                }
                return a.selected == true
            });



            if (allFacilitiesSelected) {
                header = this.resourceService.resource('allFacilities');
            } else if (selectedFacilities && selectedFacilities.length === 1) {
                header = this.getFacilityName(preferences, selectedFacilities[0].id);
            } else {
                header = "Multiple Facilities";

                selectedFacilities.forEach(f => {
                    facilitiesList.push(this.getFacilityName(preferences, f.id));
                });
            }

        }
        this.setHeader(header, appCode, facilitiesList);
    }

    cleanHeader(appCode: string) {
        this.setHeader('', appCode, []);
    }

    private setHeader(header: string, appCode: string, facilities: string[]) {
        if (!facilities || facilities.length === 0) {
            this.contextService.addOrUpdate(appCode, ContextConstants.DASHBOARD_TITLE, header);
            this.contextService.addOrUpdate(appCode, ContextConstants.DASHBOARD_TITLE_TOOLTIP, '');
        } else {
            this.contextService.addOrUpdate(appCode, ContextConstants.DASHBOARD_TITLE, header);
            this.contextService.addOrUpdate(appCode, ContextConstants.DASHBOARD_TITLE_TOOLTIP, facilities);
        }
    }

    private getFacilityName(userPreferences, nativeFacility: string) : string {
        let authorizationConfig = userPreferences.authorizationConfig;
        return this.facilityLookUpService.getFacilityName(authorizationConfig, nativeFacility);
    }
}

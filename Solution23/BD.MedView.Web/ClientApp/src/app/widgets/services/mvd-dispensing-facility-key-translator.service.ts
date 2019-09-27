import { Injectable } from "@angular/core";
import { FacilityLookUpService } from '../../services/facility-look-up.service';
import { MvdConstants } from '../shared/mvd-constants';

@Injectable()
export class DispensingFacilityKeyTranslatorService {

    constructor(private facilityLookUpService: FacilityLookUpService) {
        
    }

    translateFacilityKeys(masterFacilities: any[], authorizationConfig: any) {
        let facilityKeys = [];
        
        masterFacilities.filter(a => a.selected == true).forEach(master => {
            let facilityKey = this.translateMasterToSynonym(master.id, authorizationConfig);
            if (facilityKey) {
                facilityKeys.push(facilityKey);
            }
        });
        return facilityKeys;
    }

    private translateMasterToSynonym(masterFacilityName: string, authConfiguration: any): string {
        if (!masterFacilityName || !authConfiguration) {
            return '';
        }
        if (this.isProviderRegistered(masterFacilityName, authConfiguration, MvdConstants.DISPENSING_PROVIDER_NAME) ||
            masterFacilityName === MvdConstants.ALL_FACILITIES_KEY) {
            return this.facilityLookUpService
                .nativeFacilityLookUp(masterFacilityName, authConfiguration, MvdConstants.DISPENSING_PROVIDER_NAME);    
        }
        return '';
    }

    private isProviderRegistered(masterFacility, authConfiguration: any, providerName: string) {
        let masterFacilityInfo = authConfiguration.find((config: any) => config.id == masterFacility);
        if (!masterFacilityInfo) {
            return false; 
        }
        let nativeFacility = masterFacilityInfo
            .synonyms
            .find(synonym => (synonym.source || "").toLocaleLowerCase() === providerName);
        
        return !!nativeFacility; 
    }

}

import { Injectable } from "@angular/core";
import { ResourceService } from 'container-framework';
import { MvdConstants } from "../widgets/shared/mvd-constants";
import * as _ from "lodash";

@Injectable()
export class FacilityLookUpService {

    constructor(private resources: ResourceService) {

    }

    masterFacilityNameLookUp(nativeFacility: any, authorizationConfig: any, facilitySource: string): string {
        let masterFacilityInfo = this.getMasterFacilityInfo(nativeFacility, authorizationConfig, facilitySource);
        if (!masterFacilityInfo) {
            return this.resources.resource('unknown');
        }
        return masterFacilityInfo[0].name;
    }

    masterFacilityIdLookUp(nativeFacility: any, authorizationConfig: any, facilitySource: string) : number {
        let masterFacilityInfo = this.getMasterFacilityInfo(nativeFacility, authorizationConfig, facilitySource);
        if (!masterFacilityInfo) {
            return this.resources.resource('unknown');
        }
        return masterFacilityInfo[0].id;
    }

    nativeFacilityLookUp(masterFacilityId: any, authorizationConfig: any, facilitySource, defaultValue = null) {
        if (!masterFacilityId || !authorizationConfig || !facilitySource) {
            return masterFacilityId;
        }

        let masterFacilityInfo = authorizationConfig.find((config: any) => (config.id || '').toString() === masterFacilityId);
        if (!masterFacilityInfo) {
            if (masterFacilityId !== MvdConstants.ALL_FACILITIES_KEY) {
                console.log(`FacilityLookUpService: Master facility not found as: ${masterFacilityId} `);
            }
            return defaultValue !== null ? defaultValue : masterFacilityId;
        }

        let nativeFacility = masterFacilityInfo
            .synonyms
            .find(synonym => (synonym.source || '').toLocaleLowerCase() === facilitySource);
        if (!nativeFacility) {
            return defaultValue !== null ? defaultValue : masterFacilityId;
        }

        return nativeFacility.id
            ? nativeFacility.id.toString()
            : nativeFacility.id;
    }

    getNativeFacilityFromMasterFacilityName(masterFacilityName: string, authorizationConfig: any, facilitySource, defaultValue = null) {
        if (!masterFacilityName || !authorizationConfig || !facilitySource) {
            return masterFacilityName;
        }

        const masterFacilityInfo = authorizationConfig.find((config: any) => (config.name || '').toString() === masterFacilityName);
        if (!masterFacilityInfo) {
            console.log(`FacilityLookUpService: Master facility not found as: ${masterFacilityName} `);
            return defaultValue !== null ? defaultValue : masterFacilityName;
        }

        const nativeFacility = masterFacilityInfo
            .synonyms
            .find(synonym => (synonym.source || '').toLocaleLowerCase() === facilitySource);
        if (!nativeFacility) {
            return defaultValue !== null ? defaultValue : masterFacilityName;
        }

        return nativeFacility.id
            ? nativeFacility.id.toString()
            : nativeFacility.id;
    }

    resolveMasterFacilities(authorizationConfig: any[], facilitySource: string) {
        if (!authorizationConfig && !facilitySource) {
            return undefined;
        }
        const masterFacilityInfo = authorizationConfig
            .filter((config: any) => config.synonyms.some((synonym: any) =>
                (synonym.source || '').toLocaleLowerCase() === facilitySource.toLocaleLowerCase()))
            .map((authConfig: any) => {
                const synonym = authConfig.synonyms.find((s: any) => {
                    return (s.source || '').toLocaleLowerCase() === facilitySource;
                });
                return { master: authConfig.id, native: synonym.id };
            });
        return masterFacilityInfo;
    }

    getMasterFacilityName(authorizationConfig, nativeFacility: string): string {
        let facilityConfig = authorizationConfig.find((config: any) => {
            return (config.synonyms || []).some(synonym => synonym.id === nativeFacility);
        });
        return facilityConfig ? facilityConfig.name: nativeFacility;
    }

    getFacilityName(authorizationConfig, masterFacilityId: string): string {
        let facilityConfig = authorizationConfig.find((config: any) => (config.id || '').toString() === masterFacilityId);
        return facilityConfig
            ? facilityConfig.name
            : masterFacilityId;
    }

    private getMasterFacilityInfo(nativeFacility: any, authorizationConfig: any, facilitySource: string): any {
        if (!nativeFacility || !authorizationConfig || !facilitySource) {
            return undefined;
        }
        let masterFacilityInfo = authorizationConfig.filter((config: any) => {
            let exists = config.synonyms.findIndex((synonym: any) => {
                let source = (synonym.source || "").toLocaleLowerCase();
                return source === facilitySource && synonym.id === nativeFacility;
            });
            return exists >= 0;
        }, nativeFacility);

        if (!masterFacilityInfo.length) {
            return undefined;
        }

        return masterFacilityInfo;
    }

    getMedMinedNativeFacility(sourceNativeFacilityId: string, authorizationInfo, sourceProvider: string): string {
        if (!sourceNativeFacilityId) {
            return undefined;
        }

        const masterFacilityId = this.masterFacilityIdLookUp(
            sourceNativeFacilityId, authorizationInfo, sourceProvider);

        if (!masterFacilityId || masterFacilityId === this.resources.resource('unknown')) {
            return undefined;
        }

        const medMinedFacility = this.nativeFacilityLookUp(
            `${masterFacilityId}`, authorizationInfo, MvdConstants.MEDMINED_PROVIDER_NAME, '');

        return medMinedFacility ? medMinedFacility : undefined;
    }

    hasProvider(authorizationConfig: any, providerName: string): boolean {
        if (!authorizationConfig || !providerName) {
            return false;
        }
        const synonyms = _.flatMap(authorizationConfig, 'synonyms');
        return synonyms.some((s: any) => (s.source || '').toLowerCase() === (providerName || '').toLowerCase());
    }
}

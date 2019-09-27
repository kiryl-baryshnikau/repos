import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import * as _ from 'lodash';

import { ResourceService } from 'container-framework';
import { FacilityLookUpService } from '../../services/facility-look-up.service';
import { MvdConstants } from '../../widgets/shared/mvd-constants';

describe('FacilityLookUpService', () => {
    const masterFacilityId = 'masterFacilityId';
    const masterFacilityName = 'masterFacilityName';
    const nativeFacilityId = 'nativeFacilityId';
    const facilitySource = 'facilitysource';

    const unknownFacilitySource = 'unknownFacilitySource';

    let service: FacilityLookUpService;
    let httpMock: HttpTestingController;

    let resourceServiceSpy: jasmine.SpyObj<ResourceService>;

    beforeEach(() => {

        const _resourceServiceSpy = jasmine.createSpyObj(['resource']);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                FacilityLookUpService,
                { provide: ResourceService, useValue: _resourceServiceSpy }
            ]
        });

        service = TestBed.get(FacilityLookUpService);
        httpMock = TestBed.get(HttpTestingController);
        resourceServiceSpy = TestBed.get(ResourceService);

        resourceServiceSpy.resource.and.callFake((id) => id);
    });

    describe('masterFacilityNameLookUp', () => {
        it('should return "unknown" if native facility ID is not provided', () => {
            const name = service.masterFacilityNameLookUp(undefined, [], facilitySource);
            expect(name).toEqual('unknown');
        });

        it('should return "unknown" if authorization config is not provided', () => {
            const name = service.masterFacilityNameLookUp(nativeFacilityId, undefined , facilitySource);
            expect(name).toEqual('unknown');
        });

        it('should return "unknown" if facility source is not provided', () => {
            const name = service.masterFacilityNameLookUp(nativeFacilityId, [], undefined);
            expect(name).toEqual('unknown');
        });

        it('should return "unknown" if facility name is not found', () => {
            const name = service.masterFacilityNameLookUp('unknowFacility', [], facilitySource);
            expect(name).toEqual('unknown');
        });

        it('should return "unknown" if facility source is not found', () => {
            const name = service.masterFacilityNameLookUp(nativeFacilityId, [], 'unknownFacilitySource');
            expect(name).toEqual('unknown');
        });

        it('should return master facility name from authorization configuration', () => {
            const authConfig = [{
                synonyms: [{source: facilitySource, id: nativeFacilityId}],
                id: masterFacilityId,
                name: masterFacilityName
            }];
            const name = service.masterFacilityNameLookUp(nativeFacilityId, authConfig, facilitySource);
            expect(name).toEqual(masterFacilityName);
        });
    });

    describe('masterFacilityIdLookUp', () => {
        it('should return "unknown" if master facility ID is not provided', () => {
            const facilityId = service.masterFacilityIdLookUp(undefined, [], facilitySource) as any;
            expect(facilityId).toEqual('unknown');
        });

        it('should return "unknown" if authorization config is not provided', () => {
            const facilityId = service.masterFacilityIdLookUp(nativeFacilityId, undefined , facilitySource)  as any;
            expect(facilityId).toEqual('unknown');
        });

        it('should return "unknown" if facility source is not provided', () => {
            const facilityId = service.masterFacilityIdLookUp(nativeFacilityId, [], undefined)  as any;
            expect(facilityId).toEqual('unknown');
        });

        it('should return "unknown" if facility name is not found', () => {
            const facilityId = service.masterFacilityIdLookUp('unknowFacility', [], facilitySource) as any;
            expect(facilityId).toEqual('unknown');
        });

        it('should return "unknown" if facility facility source is not found', () => {
            const facilityId = service.masterFacilityIdLookUp(nativeFacilityId, [], 'unknownFacilitySource') as any;
            expect(facilityId).toEqual('unknown');
        });

        it('should return master facility id from authorization configuration', () => {
            const authConfig = [{
                synonyms: [{source: facilitySource, id: nativeFacilityId}],
                id: masterFacilityId,
                name: masterFacilityName
            }];
            const facilityId = service.masterFacilityIdLookUp(nativeFacilityId, authConfig, facilitySource) as any;
            expect(facilityId).toEqual(masterFacilityId);
        });
    });

    describe('nativeFacilityLookUp', () => {
        it('should return undefined if master facility ID is not provided', () => {
            const facilityId = service.nativeFacilityLookUp(undefined, [], facilitySource);
            expect(facilityId).toEqual(undefined);
        });

        it('should return <masterFacilityId> if authorization config is not provided', () => {
            const facilityId = service.nativeFacilityLookUp(masterFacilityId, undefined , facilitySource);
            expect(facilityId).toEqual(masterFacilityId);
        });

        it('should return <masterFacilityId> if facility source is not provided', () => {
            const facilityId = service.nativeFacilityLookUp(masterFacilityId, [], undefined);
            expect(facilityId).toEqual(masterFacilityId);
        });

        it('should return default value if master facility not found, and defaultValue parameter is provided', () => {
            const defaultValue = 'defaultValue';

            const facilityId = service.nativeFacilityLookUp('unknownMasterFacilityID', [], facilitySource, defaultValue);
            expect(facilityId).toEqual(defaultValue);
        });

        it('should return master facility ID if master facility ID is not found, and defaultValue parameter is not provided', () => {
            const facilityId = service.nativeFacilityLookUp('unknownMasterFacilityID', [], facilitySource);
            expect(facilityId).toEqual('unknownMasterFacilityID');
        });

        it('should return master facility ID if master facility ID is not found, and defaultValue parameter is null', () => {
            const facilityId = service.nativeFacilityLookUp('unknownMasterFacilityID', [], facilitySource, null);
            expect(facilityId).toEqual('unknownMasterFacilityID');
        });

        it('should return native facility ID from master facility ID', () => {
            const authConfig = [{
                synonyms: [{source: facilitySource, id: nativeFacilityId}],
                id: masterFacilityId,
                name: masterFacilityName
            }];

            const facilityId = service.nativeFacilityLookUp(masterFacilityId, authConfig, facilitySource);
            expect(facilityId).toEqual(nativeFacilityId);
        });
    });

    describe('getNativeFacilityFromMasterFacilityName', () => {
        it('should return undefined if master facility name is not provided', () => {
            const facilityId = service.getNativeFacilityFromMasterFacilityName(undefined, [], facilitySource);
            expect(facilityId).toEqual(undefined);
        });

        it('should return <masterFaciltyName> if authorization config is not provided', () => {
            const facilityId = service.getNativeFacilityFromMasterFacilityName(masterFacilityName, undefined , facilitySource);
            expect(facilityId).toEqual(masterFacilityName);
        });

        it('should return <masterFaciltyName> if facility source is not provided', () => {
            const facilityId = service.getNativeFacilityFromMasterFacilityName(masterFacilityName, [], undefined);
            expect(facilityId).toEqual(masterFacilityName);
        });

        it('should return default value if master facility name is not found in authorization info', () => {
            const authConfig = [{
                synonyms: [{ source: facilitySource, id: nativeFacilityId }],
                id: masterFacilityId,
                name: masterFacilityName
            }];
            const defaultValue = 'defaultValue';
            const facilityId = service.getNativeFacilityFromMasterFacilityName('unknownFacilityName', authConfig,
                facilitySource, defaultValue);
            expect(facilityId).toEqual(defaultValue);
        });

        it('should return <masterFaciltyName> if master facility name is not found and default value is not provided', () => {
            const authConfig = [{
                synonyms: [{ source: facilitySource, id: nativeFacilityId }],
                id: masterFacilityId,
                name: masterFacilityName
            }];
            const unknownMasterFacilityName = 'unknownFacilityName';
            const facilityId = service.getNativeFacilityFromMasterFacilityName(unknownMasterFacilityName, authConfig, facilitySource);
            expect(facilityId).toEqual(unknownMasterFacilityName);
        });

        it('should return default value if master facility name found, but facilitySource is not', () => {
            const authConfig = [{
                synonyms: [{ source: facilitySource, id: nativeFacilityId }],
                id: masterFacilityId,
                name: masterFacilityName
            }];
            const defaultValue = 'defaultValue';
            const facilityId = service.getNativeFacilityFromMasterFacilityName(masterFacilityName, authConfig,
                unknownFacilitySource, defaultValue);
            expect(facilityId).toEqual(defaultValue);
        });

        it('should return <masterFaciltyName> if master facility name is found, facilitySource is not found, and no default value', () => {
            const authConfig = [{
                synonyms: [{ source: facilitySource, id: nativeFacilityId }],
                id: masterFacilityId,
                name: masterFacilityName
            }];
            const facilityId = service.getNativeFacilityFromMasterFacilityName(masterFacilityName, authConfig, unknownFacilitySource);
            expect(facilityId).toEqual(masterFacilityName);
        });

        it('should return native facility ID from master facility name', () => {
            const authConfig = [{
                synonyms: [{ source: facilitySource, id: nativeFacilityId }],
                id: masterFacilityId,
                name: masterFacilityName
            }];
            const facilityId = service.getNativeFacilityFromMasterFacilityName(masterFacilityName, authConfig, facilitySource);
            expect(facilityId).toEqual(nativeFacilityId);
        });

        it('should return native facility ID as string', () => {
            const authConfig = [{
                synonyms: [{ source: facilitySource, id: 100 }],
                id: masterFacilityId,
                name: masterFacilityName
            }];
            const facilityId = service.getNativeFacilityFromMasterFacilityName(masterFacilityName, authConfig, facilitySource);
            expect(facilityId).toEqual('100');
        });
    });

    describe('resolveMasterFacilities', () => {
        it('should return mapped masterFacilityId - nativeFacilityId data for the provided facilitySource', () => {
            const authConfig = [{
                synonyms: [{ source: facilitySource, id: 100 }],
                id: 1,
                name: 'masterFacilityName1'
            },
            {
                synonyms: [{ source: facilitySource, id: 200 }],
                id: 2,
                name: 'masterFacilityName2'
            }];
            const mappedFacilities = service.resolveMasterFacilities(authConfig, facilitySource);
            expect(mappedFacilities).toBeDefined();
            expect(mappedFacilities.length).toBe(2);
            expect(mappedFacilities[0]).toEqual({ master: 1, native: 100 });
            expect(mappedFacilities[1]).toEqual({ master: 2, native: 200 });
        });

        it('should exclude other facility sources from mapping', () => {
            const authConfig = [{
                synonyms: [{ source: facilitySource, id: 100 }],
                id: 1,
                name: 'masterFacilityName1'
            },
            {
                synonyms: [{ source: 'otherFacilitySource', id: 200 }],
                id: 2,
                name: 'masterFacilityName2'
            },
            {
                synonyms: [{ source: facilitySource, id: 300 }],
                id: 3,
                name: 'masterFacilityName3'
            }];
            const mappedFacilities = service.resolveMasterFacilities(authConfig, facilitySource);
            expect(mappedFacilities).toBeDefined();
            expect(mappedFacilities.length).toBe(2);
            expect(mappedFacilities[0]).toEqual({ master: 1, native: 100 });
            expect(mappedFacilities[1]).toEqual({ master: 3, native: 300 });
        });
    });

    describe('getMasterFacilityName', () => {
        it('should return master facility name from native facility ID', () => {
            const authConfig = [{
                synonyms: [{ source: facilitySource, id: nativeFacilityId }],
                id: masterFacilityId,
                name: masterFacilityName
            }];
            const facilityName = service.getMasterFacilityName(authConfig, nativeFacilityId);
            expect(facilityName).toEqual(masterFacilityName);
        });

        it('should return native facility ID if a master facility is not found', () => {
            const authConfig = [{
                synonyms: [{ source: facilitySource, id: nativeFacilityId }],
                id: masterFacilityId,
                name: masterFacilityName
            }];
            const unknownNativeFacility = 'unknownNativeFacility';
            const facilityName = service.getMasterFacilityName(authConfig, unknownNativeFacility);
            expect(facilityName).toEqual(unknownNativeFacility);
        });
    });

    describe('getFacilityName', () => {
        it('should return master facility name from master facility ID', () => {
            const authConfig = [{
                synonyms: [{ source: facilitySource, id: nativeFacilityId }],
                id: masterFacilityId,
                name: masterFacilityName
            }];
            const facilityName = service.getFacilityName(authConfig, masterFacilityId);
            expect(facilityName).toEqual(masterFacilityName);
        });

        it('should return master facility ID if the master facility is not found by master facility ID', () => {
            const authConfig = [{
                synonyms: [{ source: facilitySource, id: nativeFacilityId }],
                id: masterFacilityId,
                name: masterFacilityName
            }];
            const unknownMasterFacilityId = 'unknownMasterFacilityId';
            const facilityName = service.getFacilityName(authConfig, unknownMasterFacilityId);
            expect(facilityName).toEqual(unknownMasterFacilityId);
        });
    });

    describe('getMedMinedNativeFacility', () => {
        it('should return undefined if source native facility ID is not provided', () => {
            const nativeFacility = service.getMedMinedNativeFacility(undefined, [], facilitySource);
            expect(nativeFacility).toBe(undefined);
        });

        it('should return undefined if source native facility ID is not found', () => {
            const authConfig = [{
                synonyms: [{ source: facilitySource, id: nativeFacilityId }],
                id: masterFacilityId,
                name: masterFacilityName
            }];
            const unknownNativeFacilityId = 'unknownNativeFacilityId';
            const nativeFacility = service.getMedMinedNativeFacility(unknownNativeFacilityId, authConfig, facilitySource);
            expect(nativeFacility).toBe(undefined);
        });

        it('should return medmined native facility from other provider native facility', () => {
            const medminedNativeFacility = 'medminedNativeFacility';
            const authConfig = [
                {
                    synonyms: [
                        { source: facilitySource, id: nativeFacilityId },
                        { source: MvdConstants.MEDMINED_PROVIDER_NAME, id: medminedNativeFacility }
                    ],
                    id: masterFacilityId,
                    name: masterFacilityName
                }
            ];
            const nativeFacility = service.getMedMinedNativeFacility(nativeFacilityId, authConfig, facilitySource);
            expect(nativeFacility).toEqual(medminedNativeFacility);
        });

        it('should return undefined if master facility exists, but it does not contains a medmined facility' , () => {
            const authConfig = [{
                synonyms: [{ source: facilitySource, id: nativeFacilityId }],
                id: masterFacilityId,
                name: masterFacilityName
            }];
            const nativeFacility = service.getMedMinedNativeFacility(nativeFacilityId, authConfig, facilitySource);
            expect(nativeFacility).toEqual(undefined);
        });
    });

    describe('hasProvider', () => {
        it('should return false if authorization info is not provided', () => {
            const hasProvider = service.hasProvider(undefined, facilitySource);
            expect(hasProvider).toBeFalsy();
        });

        it('should return false if provider name is not provided', () => {
            const authConfig = [{
                synonyms: [{ source: facilitySource, id: nativeFacilityId }],
                id: masterFacilityId,
                name: masterFacilityName
            }];

            const hasProvider = service.hasProvider(authConfig, undefined);
            expect(hasProvider).toBeFalsy();
        });

        it('should return true if authorization contains at least one entry for the provider', () => {
            const authConfig = [{
                synonyms: [{ source: facilitySource, id: nativeFacilityId }],
                id: masterFacilityId,
                name: masterFacilityName
            }];

            const hasProvider = service.hasProvider(authConfig, facilitySource);
            expect(hasProvider).toBeTruthy();
        });

        it('should return false if authorization contains does not contain at least one entry for the provider', () => {
            const authConfig = [{
                synonyms: [{ source: facilitySource, id: nativeFacilityId }],
                id: masterFacilityId,
                name: masterFacilityName
            }];

            const hasProvider = service.hasProvider(authConfig, 'otherProvider');
            expect(hasProvider).toBeFalsy();
        });
    });
});

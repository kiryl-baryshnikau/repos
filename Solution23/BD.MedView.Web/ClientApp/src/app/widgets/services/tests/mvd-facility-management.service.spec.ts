import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FacilityManagementService } from '../mvd-facility-management.service';
import { UserConfigurationService } from '../../../services/user-configuration.service';

describe('FacilityManagementService', () => {
    const baseUrl = 'http://test-url.com';
    let service: FacilityManagementService;
    let httpMock: HttpTestingController;
    let userConfigurationServiceSpy: jasmine.SpyObj<UserConfigurationService>;

    beforeEach(() => {
        window['mvdUserAuthorizationBaseUrl'] = baseUrl;

        userConfigurationServiceSpy = jasmine.createSpyObj(['clearUserPreferencesCache']);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                FacilityManagementService,
                { provide: UserConfigurationService, useValue: userConfigurationServiceSpy }
            ]
        });

        service = TestBed.get(FacilityManagementService);
        httpMock = TestBed.get(HttpTestingController);

    });

    describe('getSupportedDataSources', () => {
        it('should create a GET request', () => {
            service.getSupportedDataSources().subscribe();
            const req = httpMock.expectOne((httpReq) => httpReq.url.startsWith(`${baseUrl}/api/sources/`));
            expect(req.request.method).toEqual('GET');
            req.flush({});
        });
    });

    describe('getEnabledDataSources', () => {
        it('should create a GET request', () => {
            service.getEnabledDataSources().subscribe();
            const req = httpMock.expectOne((httpReq) => httpReq.url.startsWith(`${baseUrl}/api/providers/`));
            expect(req.request.method).toEqual('GET');
            req.flush({});
        });
    });

    describe('disabledDataSource', () => {
        it('should create a DELETE request', () => {
            service.disabledDataSource(0).subscribe();
            const req = httpMock.expectOne((httpReq) => httpReq.url.startsWith(`${baseUrl}/api/providers/`));
            expect(req.request.method).toEqual('DELETE');
            req.flush({});
        });

        it('should set id as path param', () => {
            service.disabledDataSource(100).subscribe();
            const req = httpMock.expectOne((httpReq) => httpReq.url.startsWith(`${baseUrl}/api/providers/`));
            expect(req.request.method).toEqual('DELETE');
            expect(req.request.url.endsWith('100')).toBeTruthy();
            req.flush({});
        });

        it('should clear user preferences cache', () => {
            userConfigurationServiceSpy.clearUserPreferencesCache.and.callFake(() => { });
            service.disabledDataSource(0).subscribe();
            const req = httpMock.expectOne((httpReq) => httpReq.url.startsWith(`${baseUrl}/api/providers/`));
            req.flush({});
            expect(userConfigurationServiceSpy.clearUserPreferencesCache).toHaveBeenCalledTimes(1);
        });
    });

    describe('enabledDataSource', () => {
        it('should create a POST request', () => {
            service.enabledDataSource(0).subscribe();
            const req = httpMock.expectOne((httpReq) => httpReq.url.startsWith(`${baseUrl}/api/providers/`));
            expect(req.request.method).toEqual('POST');
            req.flush({});
        });

        it('should set facility value in the body of request as JSON', () => {
            const facilityData = { id: 100, facilityName: 'testFacilityName' };
            service.enabledDataSource(facilityData).subscribe();
            const req = httpMock.expectOne((httpReq) => httpReq.url.startsWith(`${baseUrl}/api/providers/`));
            expect(req.request.body).toEqual(JSON.stringify(facilityData));
            req.flush({});
        });

        it('should clear user preferences cache', () => {
            userConfigurationServiceSpy.clearUserPreferencesCache.and.callFake(() => { });
            service.enabledDataSource(0).subscribe();
            const req = httpMock.expectOne((httpReq) => httpReq.url.startsWith(`${baseUrl}/api/providers/`));
            req.flush({});
            expect(userConfigurationServiceSpy.clearUserPreferencesCache).toHaveBeenCalledTimes(1);
        });
    });

    describe('getMasterFacilities', () => {
        it('should create a GET request', () => {
            service.getMasterFacilities().subscribe();
            const req = httpMock.expectOne((httpReq) => httpReq.url.startsWith(`${baseUrl}/api/facilities/`));
            expect(req.request.method).toEqual('GET');
            req.flush({});
        });
    });

    describe('getMasterFacility', () => {
        it('should create a GET request with path param equal to facility ID', () => {
            const facilityId = 1000;
            service.getMasterFacility(facilityId).subscribe();
            const req = httpMock.expectOne((httpReq) => httpReq.url.startsWith(`${baseUrl}/api/facilities/`));
            expect(req.request.method).toEqual('GET');
            expect(req.request.url.endsWith(facilityId.toString())).toBeTruthy();
            req.flush({});
        });
    });

    describe('updateMasterFacility', () => {
        it('should create a PUT request', () => {
            service.updateMasterFacility(0, {} ).subscribe();
            const req = httpMock.expectOne((httpReq) => httpReq.url.startsWith(`${baseUrl}/api/facilities/`));
            expect(req.request.method).toEqual('PUT');
            req.flush({});
        });

        it('should set path param equal to facility ID', () => {
            const facilityId = 1000;
            service.updateMasterFacility(facilityId, {}).subscribe();
            const req = httpMock.expectOne((httpReq) => httpReq.url.startsWith(`${baseUrl}/api/facilities/`));
            expect(req.request.url.endsWith(facilityId.toString())).toBeTruthy();
            req.flush({});
        });

        it('should set new facility data in the body of the request', () => {
            const facilityData = { id: 100, facilityName: 'testFacilityName' };
            service.updateMasterFacility(100, facilityData).subscribe();
            const req = httpMock.expectOne((httpReq) => httpReq.url.startsWith(`${baseUrl}/api/facilities/`));
            expect(req.request.body).toEqual(JSON.stringify(facilityData));
            req.flush({});
        });

        it('should clear user preferences cache', () => {
            userConfigurationServiceSpy.clearUserPreferencesCache.and.callFake(() => { });
            service.updateMasterFacility(100, {}).subscribe();
            const req = httpMock.expectOne((httpReq) => httpReq.url.startsWith(`${baseUrl}/api/facilities/`));
            req.flush({});
            expect(userConfigurationServiceSpy.clearUserPreferencesCache).toHaveBeenCalledTimes(1);
        });
    });

    describe('deleteMasterFacility', () => {
        it('should create a DELETE request', () => {
            service.deleteMasterFacility(0).subscribe();
            const req = httpMock.expectOne((httpReq) => httpReq.url.startsWith(`${baseUrl}/api/facilities/`));
            expect(req.request.method).toEqual('DELETE');
            req.flush({});
        });

        it('should use facility ID as a path param in URL', () => {
            const facilityId = 1000;
            service.deleteMasterFacility(facilityId).subscribe();
            const req = httpMock.expectOne((httpReq) => httpReq.url.startsWith(`${baseUrl}/api/facilities/${facilityId}`));
            req.flush({});
        });

        it('should clear user preferences cache', () => {
            userConfigurationServiceSpy.clearUserPreferencesCache.and.callFake(() => { });
            service.deleteMasterFacility(100).subscribe();
            const req = httpMock.expectOne((httpReq) => httpReq.url.startsWith(`${baseUrl}/api/facilities/`));
            req.flush({});
            expect(userConfigurationServiceSpy.clearUserPreferencesCache).toHaveBeenCalledTimes(1);
        });
    });

    describe('createMasterFacility', () => {
        it('should create a POST request', () => {
            service.createMasterFacility({ id: 1}).subscribe();
            const req = httpMock.expectOne((httpReq) => httpReq.url.startsWith(`${baseUrl}/api/facilities/`));
            expect(req.request.method).toEqual('POST');
            req.flush({});
        });

        it('should set facility data as JSON in the body of the request', () => {
            const facilityData = { id: 100, masterFacility: 'testMasterFacility' };
            service.createMasterFacility(facilityData).subscribe();
            const req = httpMock.expectOne((httpReq) => httpReq.url.startsWith(`${baseUrl}/api/facilities/`));
            expect(req.request.body).toEqual(JSON.stringify(facilityData));
            req.flush({});
        });

        it('should clear user preferences cache', () => {
            userConfigurationServiceSpy.clearUserPreferencesCache.and.callFake(() => { });
            service.createMasterFacility({ id: 1 }).subscribe();
            const req = httpMock.expectOne((httpReq) => httpReq.url.startsWith(`${baseUrl}/api/facilities/`));
            req.flush({});
            expect(userConfigurationServiceSpy.clearUserPreferencesCache).toHaveBeenCalledTimes(1);
        });
    });

    describe('createFacilityMapping', () => {
        it('should create a POST request', () => {
            service.createFacilityMapping({ id: 1}).subscribe();
            const req = httpMock.expectOne((httpReq) => httpReq.url.startsWith(`${baseUrl}/api/synonyms/`));
            expect(req.request.method).toEqual('POST');
            req.flush({});
        });

        it('should set facility data as JSON in the body of the request', () => {
            const facilityMapping = { id: 100, masterFacility: 'testMasterFacility', nativeFacility: 'testNativeFacility' };
            service.createFacilityMapping(facilityMapping).subscribe();
            const req = httpMock.expectOne((httpReq) => httpReq.url.startsWith(`${baseUrl}/api/synonyms/`));
            expect(req.request.body).toEqual(JSON.stringify(facilityMapping));
            req.flush({});
        });

        it('should clear user preferences cache', () => {
            userConfigurationServiceSpy.clearUserPreferencesCache.and.callFake(() => { });
            service.createFacilityMapping({ id: 1 }).subscribe();
            const req = httpMock.expectOne((httpReq) => httpReq.url.startsWith(`${baseUrl}/api/synonyms/`));
            req.flush({});
            expect(userConfigurationServiceSpy.clearUserPreferencesCache).toHaveBeenCalledTimes(1);
        });
    });

    describe('updateFacilityMapping', () => {
        it('should create a PUT request', () => {
            service.updateFacilityMapping(0, {} ).subscribe();
            const req = httpMock.expectOne((httpReq) => httpReq.url.startsWith(`${baseUrl}/api/synonyms/`));
            expect(req.request.method).toEqual('PUT');
            req.flush({});
        });

        it('should set path param equal to facility ID', () => {
            const facilityId = 1000;
            service.updateFacilityMapping(facilityId, {}).subscribe();
            const req = httpMock.expectOne((httpReq) => httpReq.url.startsWith(`${baseUrl}/api/synonyms/`));
            expect(req.request.url.endsWith(facilityId.toString())).toBeTruthy();
            req.flush({});
        });

        it('should set new facility data in the body of the request', () => {
            const facilityData = { id: 100, facilityName: 'testFacilityName' };
            service.updateFacilityMapping(100, facilityData).subscribe();
            const req = httpMock.expectOne((httpReq) => httpReq.url.startsWith(`${baseUrl}/api/synonyms/`));
            expect(req.request.body).toEqual(JSON.stringify(facilityData));
            req.flush({});
        });

        it('should clear user preferences cache', () => {
            userConfigurationServiceSpy.clearUserPreferencesCache.and.callFake(() => { });
            service.updateFacilityMapping(100, {}).subscribe();
            const req = httpMock.expectOne((httpReq) => httpReq.url.startsWith(`${baseUrl}/api/synonyms/`));
            req.flush({});
            expect(userConfigurationServiceSpy.clearUserPreferencesCache).toHaveBeenCalledTimes(1);
        });
    });


    describe('deleteFacilityMapping', () => {
        it('should create a DELETE request', () => {
            service.deleteFacilityMapping(0).subscribe();
            const req = httpMock.expectOne((httpReq) => httpReq.url.startsWith(`${baseUrl}/api/synonyms/`));
            expect(req.request.method).toEqual('DELETE');
            req.flush({});
        });

        it('should use facility ID as a path param in URL', () => {
            const facilityId = 1000;
            service.deleteFacilityMapping(facilityId).subscribe();
            const req = httpMock.expectOne((httpReq) => httpReq.url.startsWith(`${baseUrl}/api/synonyms/${facilityId}`));
            req.flush({});
        });

        it('should clear user preferences cache', () => {
            userConfigurationServiceSpy.clearUserPreferencesCache.and.callFake(() => { });
            service.deleteFacilityMapping(100).subscribe();
            const req = httpMock.expectOne((httpReq) => httpReq.url.startsWith(`${baseUrl}/api/synonyms/`));
            req.flush({});
            expect(userConfigurationServiceSpy.clearUserPreferencesCache).toHaveBeenCalledTimes(1);
        });
    });
});

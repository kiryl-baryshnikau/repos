import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import * as _ from 'lodash';

import { ResourceService, GatewayService, ApiCall } from 'container-framework';
import { AuthorizationService, AuthorizationModel } from '../../services/authorization.service';
import { AppMenuService } from '../../services/app-menu.service';
import { BdMedViewServicesClient, Batch } from '../../services/bd-medview-services-client';
import { AuthenticationService } from 'bd-nav/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { of } from 'rxjs';
import * as authMocks from './authorization.service.mocks.spec';
import { AccessToken } from 'bd-nav/models';

function verifyApiCalls(actualApiCalls: ApiCall[]) {
    expect(actualApiCalls).toBeDefined();
    expect(actualApiCalls.length).toEqual(2);

    expect(actualApiCalls[0].api).toEqual('bd.medview.services.list');
    expect(actualApiCalls[0].pathParams).toBeDefined();
    expect(actualApiCalls[0].pathParams.length).toEqual(1);
    expect(actualApiCalls[0].pathParams[0].name).toEqual('collection');
    expect(actualApiCalls[0].pathParams[0].value).toEqual('Accesses');

    expect(actualApiCalls[1].api).toEqual('bd.medview.services.list');
    expect(actualApiCalls[1].pathParams).toBeDefined();
    expect(actualApiCalls[1].pathParams.length).toEqual(1);
    expect(actualApiCalls[1].pathParams[0].name).toEqual('collection');
    expect(actualApiCalls[1].pathParams[0].value).toEqual('Facilities');
}

describe('AuthorizationService', () => {
    const baseUrl = 'http://www.hsv-test.com/';
    const dispensingBaseUrl = 'http://www.dispensing.com/';
    const medminedBaseUrl = 'http://www.medmined.com/';

    const userEmail = 'testUser@bd.com';
    const accessToken: AccessToken = {
        accessToken: 'accessToken',
        error: 'error',
        expiresIn: 1000,
        httpErrorReason: '',
        httpErrorStatusCode: 0,
        identityToken: 'identityToken',
        isError: false,
        isHttpError: false,
        refreshToken: 'refreshToken',
        tokenType: 'tokenType'
    };
    accessToken['loginName'] = 'loginName';

    let service: AuthorizationService;
    let httpMock: HttpTestingController;

    let gatewayServiceSpy: jasmine.SpyObj<GatewayService>;
    let authenticationServiceSpy: jasmine.SpyObj<AuthenticationService>;
    let appMenuServiceSpy: jasmine.SpyObj<AppMenuService>;
    let deviceDetectorServiceSpy: jasmine.SpyObj<DeviceDetectorService>;
    let bdMedViewServicesClientSpy: jasmine.SpyObj<BdMedViewServicesClient>;
    let resourceServiceSpy: jasmine.SpyObj<ResourceService>;

    beforeEach(() => {
        window['mvdAuthorizationServiceUrl'] = baseUrl;
        window['dispensingAuthorizationServiceUrl'] = dispensingBaseUrl;
        window['medminedAuthorizationServiceUrl'] =  medminedBaseUrl;


        const _gatewayServiceSpy = jasmine.createSpyObj(['loadData']);
        const _authenticationServiceSpy = jasmine.createSpyObj(['']);
        const _appMenuServiceSpy = jasmine.createSpyObj(['hideTopMenuItem']);
        const _deviceDetectorServiceSpy = jasmine.createSpyObj(['isMobile']);
        const _bdMedViewServicesClientSpy = jasmine.createSpyObj(['batch']);
        const _resourceServiceSpy = jasmine.createSpyObj(['']);

        accessToken['email'] = userEmail;
        _authenticationServiceSpy.accessToken = accessToken;

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                AuthorizationService,
                { provide: GatewayService, useValue: _gatewayServiceSpy },
                { provide: AuthenticationService, useValue: _authenticationServiceSpy },
                { provide: AppMenuService, useValue: _appMenuServiceSpy },
                { provide: DeviceDetectorService, useValue: _deviceDetectorServiceSpy },
                { provide: BdMedViewServicesClient, useValue: _bdMedViewServicesClientSpy},
                { provide: ResourceService, useValue: _resourceServiceSpy}
            ]
        });

        gatewayServiceSpy = TestBed.get(GatewayService);
        service = TestBed.get(AuthorizationService);
        httpMock = TestBed.get(HttpTestingController);
        authenticationServiceSpy = TestBed.get(ResourceService);
        appMenuServiceSpy = TestBed.get(AppMenuService);
        deviceDetectorServiceSpy = TestBed.get(DeviceDetectorService);
        bdMedViewServicesClientSpy = TestBed.get(BdMedViewServicesClient);
        resourceServiceSpy = TestBed.get(ResourceService);

        deviceDetectorServiceSpy.isMobile.and.returnValue(false);
        appMenuServiceSpy.hideTopMenuItem.and.callFake(() => {});
    });

    it('should instantiate service', () => {
        expect(service).toBeDefined();
    });

    describe('getUpdatedAuthorizationModel', () => {
        it('should instantiate service', () => {
            expect(service).toBeDefined();
        });

        it('should create appropiate ApiCalls for Access and Facilities Medview services', (done) => {
            const batchSpy = new Batch(gatewayServiceSpy);
            let actualApiCalls: ApiCall[];

            gatewayServiceSpy.loadData.and.callFake(apiCalls => {
                actualApiCalls = apiCalls;
                return of([{}, {}]);
             });
            bdMedViewServicesClientSpy.batch.and.returnValue(batchSpy);

            service.getUpdatedAuthorizationModel().subscribe(res => {
                verifyApiCalls(actualApiCalls);
                done();
            } );
        });

        it('should get dispensing facilities if Dispensing provider is enabled ', () => {
            const batchSpy = new Batch(gatewayServiceSpy);

            gatewayServiceSpy.loadData.and.returnValue(of([
                authMocks.getAccessesResponse(),
                authMocks.getHsvFacilities()
            ]));
            bdMedViewServicesClientSpy.batch.and.returnValue(batchSpy);

            service.getUpdatedAuthorizationModel().subscribe();

            const req = httpMock.expectOne(x => x.url.startsWith(dispensingBaseUrl));
            expect(req.request.method).toBe('POST');
            req.flush(authMocks.getDispensingFacilities());
        });

        it('should not get dispensing facilities if Dispensing provider is not configured', () => {
            const batchSpy = new Batch(gatewayServiceSpy);

            gatewayServiceSpy.loadData.and.returnValue(of([
                authMocks.getAccessesResponse(),
                authMocks.getHsvFacilitiesNoDispensing()
            ]));
            bdMedViewServicesClientSpy.batch.and.returnValue(batchSpy);

            service.getUpdatedAuthorizationModel().subscribe();
            httpMock.expectNone(x => x.url.startsWith(dispensingBaseUrl));
        });

        it('should get Medmined data if MM provider is enabled ', () => {
            const batchSpy = new Batch(gatewayServiceSpy);

            gatewayServiceSpy.loadData.and.returnValue(of([
                authMocks.getAccessesResponse(),
                authMocks.getHsvFacilities()
            ]));
            bdMedViewServicesClientSpy.batch.and.returnValue(batchSpy);

            service.getUpdatedAuthorizationModel().subscribe();

            const req = httpMock.expectOne(`${medminedBaseUrl}?Email=${userEmail}`);
            expect(req.request.method).toBe('GET');
            req.flush(authMocks.getMedminedData());
        });

        it('should not get Medmined data if there is not a configured MM provider ', () => {
            const batchSpy = new Batch(gatewayServiceSpy);

            gatewayServiceSpy.loadData.and.returnValue(of([
                authMocks.getAccessesResponse(),
                authMocks.getHsvFacilitiesNoMedmined()
            ]));
            bdMedViewServicesClientSpy.batch.and.returnValue(batchSpy);

            service.getUpdatedAuthorizationModel().subscribe();
            httpMock.expectNone(x => x.url.startsWith(medminedBaseUrl));
        });

        it('should not query medmined for mobile', () => {
            const batchSpy = new Batch(gatewayServiceSpy);

            gatewayServiceSpy.loadData.and.returnValue(of([
                authMocks.getAccessesResponse(),
                authMocks.getHsvFacilities()
            ]));
            deviceDetectorServiceSpy.isMobile.and.returnValue(true);
            bdMedViewServicesClientSpy.batch.and.returnValue(batchSpy);

            service.getUpdatedAuthorizationModel().subscribe();
            const req = httpMock.expectNone(x => x.url.startsWith(medminedBaseUrl));
        });
    });
    describe('authorize', () => {
        it('should return authorization data', (done) => {
            const batchSpy = new Batch(gatewayServiceSpy);

            gatewayServiceSpy.loadData.and.returnValue(of([
                authMocks.getAccessesResponse(),
                authMocks.getHsvFacilities()
            ]));
            bdMedViewServicesClientSpy.batch.and.returnValue(batchSpy);

            service.getUpdatedAuthorizationModel().subscribe();
            service.authorize().subscribe(auth => {
                expect(auth).toEqual(authMocks.getExpectedAuthorizationModel());
                done();
            });

            const reqDispensing = httpMock.expectOne(x => x.url.startsWith(dispensingBaseUrl));
            const reqMm = httpMock.expectOne(`${medminedBaseUrl}?Email=${userEmail}`);
            reqDispensing.flush(authMocks.getDispensingFacilities());
            reqMm.flush(authMocks.getMedminedData());
        });
    });

    describe('authorizedFor', () => {
        it('should return authorization data', (done) => {
            const batchSpy = new Batch(gatewayServiceSpy);

            gatewayServiceSpy.loadData.and.returnValue(of([
                authMocks.getAccessesResponse(),
                authMocks.getHsvFacilities()
            ]));
            bdMedViewServicesClientSpy.batch.and.returnValue(batchSpy);

            service.getUpdatedAuthorizationModel().subscribe();
            service.authorizedFor('unusedParams').subscribe(auth => {
                expect(auth).toEqual(authMocks.getExpectedAuthorizationModel());
                done();
            });

            const reqDispensing = httpMock.expectOne(x => x.url.startsWith(dispensingBaseUrl));
            const reqMm = httpMock.expectOne(`${medminedBaseUrl}?Email=${userEmail}`);
            reqDispensing.flush(authMocks.getDispensingFacilities());
            reqMm.flush(authMocks.getMedminedData());
        });
    });


    describe('isAuthorized2', () => {
        it('should return authorization data', (done) => {
            const batchSpy = new Batch(gatewayServiceSpy);

            gatewayServiceSpy.loadData.and.returnValue(of([
                authMocks.getAccessesResponse(),
                authMocks.getHsvFacilities()
            ]));
            bdMedViewServicesClientSpy.batch.and.returnValue(batchSpy);

            service.getUpdatedAuthorizationModel().subscribe();
            service.isAuthorized('unusedParams').subscribe(res => {
                expect(res).toBeTruthy();
                done();
            });

            const reqDispensing = httpMock.expectOne(x => x.url.startsWith(dispensingBaseUrl));
            const reqMm = httpMock.expectOne(`${medminedBaseUrl}?Email=${userEmail}`);
            reqDispensing.flush(authMocks.getDispensingFacilities());
            reqMm.flush(authMocks.getMedminedData());
        });
    });

});

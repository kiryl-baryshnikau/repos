import { TestBed } from '@angular/core/testing';
import { CfwResourcesService } from './cfw-resources.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';

describe('Service: CfwResourcesService', () => {
    const serviceBaseUrl = 'testBaseUrl';
    const api = 'api/resources';
    const resourceKey = 'testResourceKey';
    const testResources = ['test1', 'test2', 'test3'];

    let service: CfwResourcesService;
    let httpClient: HttpClient;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ HttpClientTestingModule ],
            providers: [
                CfwResourcesService
            ]
        });
        service = TestBed.get(CfwResourcesService);
        httpClient = TestBed.get(HttpClient);
        httpTestingController = TestBed.get(HttpTestingController);

        window['cfwDataServiceContext'] = serviceBaseUrl;
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('Should be defined', () => {
        expect(service).toBeDefined();
    });

    it('Should make an http get request to the expected URL', () => {
        service.getResources$(resourceKey).subscribe();
        const req = httpTestingController.expectOne(`${serviceBaseUrl}/${api}/${resourceKey}`);
        expect(req.request.method).toEqual('GET');

        req.flush(testResources);
    });

    it('Should return the expected data', () => {
        service.getResources$(resourceKey).subscribe((resources) => {
            expect(resources).toEqual(testResources);
        });
        const req = httpTestingController.expectOne(`${serviceBaseUrl}/${api}/${resourceKey}`);

        req.flush(testResources);
    });
});

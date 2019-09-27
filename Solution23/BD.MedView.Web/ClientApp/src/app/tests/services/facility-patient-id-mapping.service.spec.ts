import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { FacilityPatientIdMappingService } from '../../services/facility-patient-id-mapping.service';

describe('FacilityPatientIdMappingService', () => {
    const baseUrl = 'http://www.hsv-test.com';

    let service: FacilityPatientIdMappingService;
    let httpClient: HttpClient;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        window['mvdFacilityPatientIdMappingUrl'] = baseUrl;
        TestBed.configureTestingModule({
            imports: [ HttpClientTestingModule ],
            providers: [
                FacilityPatientIdMappingService
            ]
        });

        service = TestBed.get(FacilityPatientIdMappingService);
        httpClient = TestBed.get(HttpClient);
        httpTestingController = TestBed.get(HttpTestingController);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('toObservable', () => {
        it('should send a GET to mvdFacilityPatientIdMappingUrl', () => {
            service.toObservable().subscribe();

            const req = httpTestingController.expectOne(x => x.url.startsWith(baseUrl));
            expect(req.request.method).toEqual('GET');
            req.flush([]);
        });

        it('should cache result', () => {
            service.toObservable().subscribe();
            service.toObservable().subscribe();

            const reqs = httpTestingController.match(x => x.url.startsWith(baseUrl));
            expect(reqs.length).toEqual(1);
            reqs.forEach(req => req.flush([]));
        });
     });

});

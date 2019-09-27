import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfigurationService } from '../../services/configuration.service';

describe('ConfigurationService', () => {
    const expectedUrl = 'api/configuration';

    let service: ConfigurationService;
    let httpMock: HttpTestingController;

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                ConfigurationService,
            ]
        });

        service = TestBed.get(ConfigurationService);
        httpMock = TestBed.get(HttpTestingController);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('get', () => {
        it('should call the appropiate end point', () => {
            service.get().subscribe();
            const req = httpMock.expectOne(r => r.url.endsWith(expectedUrl));
            expect(req).toBeDefined();
            req.flush({});
        });

        it('should be a GET request', () => {
            service.get().subscribe();
            const req = httpMock.expectOne(r => r.url.endsWith(expectedUrl));
            expect(req.request.method).toEqual('GET');
            req.flush({});
        });

        it('should cache response', () => {
            service.get().subscribe();
            service.get().subscribe();
            const req = httpMock.expectOne(r => r.url.endsWith(expectedUrl));
            expect(req.request.method).toEqual('GET');
            req.flush({});
        });
    });
});

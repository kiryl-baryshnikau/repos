import { AutoRefreshService } from './auto-refresh.service';
import { MvdCfwConfigurationService } from '../../widgets';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { take } from 'rxjs/operators';

describe('Service: AutoRefreshService', () => {
    const dataServiceValue = 'data value';
    const dataService$ = of(dataServiceValue);

    let service: AutoRefreshService;
    let mvdCfwConfigurationServiceSpy: jasmine.SpyObj<MvdCfwConfigurationService>;
    let originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;

    beforeEach(() => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        const spy = jasmine.createSpyObj('MvdCfwConfigurationService', ['getRefreshRate']);

        TestBed.configureTestingModule({
            providers: [
                AutoRefreshService,
                { provide: MvdCfwConfigurationService, useValue: spy}
            ]
        });
        service = TestBed.get(AutoRefreshService);
        mvdCfwConfigurationServiceSpy = TestBed.get(MvdCfwConfigurationService);
    });

    afterEach(function() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    it('Should be defined', () => {
        expect(service).toBeDefined();
    });

    it('Should read refresh interval from MVD CFW configuration service', () => {
        mvdCfwConfigurationServiceSpy.getRefreshRate.and.returnValue(of(30));

        service.setAutoRefreshFor$<string>(dataService$).pipe(take(1))
        .subscribe(
            (value) => {
                expect(value).toBe(dataServiceValue);
                expect(mvdCfwConfigurationServiceSpy.getRefreshRate.calls.count()).toBe(1);
            }
        );
    });

    it('Should refresh according to configured refresh rate', (done) => {
        const expectedIterations = 3;
        const refreshRateValueInSeconds = .2;
        mvdCfwConfigurationServiceSpy.getRefreshRate.and.returnValue(of(refreshRateValueInSeconds));

        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

        const timestamps = [];
        service.setAutoRefreshFor$<string>(dataService$).pipe(
            take(expectedIterations)
        ).subscribe(
            (value) => {
                expect(value).toBe(dataServiceValue);
                timestamps.push(new Date().getTime());
            },
            (error) => console.error(error),
            () => {
                expect(timestamps.length).toBe(expectedIterations);
                validateTimestamps(timestamps, refreshRateValueInSeconds * 1000);

                done();
            }
        );
    });

    it('Should return default refresh rate on Get Refresh Rate error', (done) => {
        const expectedIterations = 3;
        const defaultRefreshRateInMilliseconds = 10;
        const timestamps = [];

        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

        service.setDefaultAutoRefreshRate(defaultRefreshRateInMilliseconds);
        mvdCfwConfigurationServiceSpy.getRefreshRate.and.returnValue(throwError(''));

        service.setAutoRefreshFor$<string>(dataService$).pipe(
            take(expectedIterations)
        ).subscribe(
            () => timestamps.push(new Date().getTime()),
            error => console.error(error),
            () => {
                validateTimestamps(timestamps, defaultRefreshRateInMilliseconds);
                done();
            }
        );
    });
});

function validateTimestamps(timestamps: any[], refreshRateValueInMilliseconds: number) {
    for (let i = timestamps.length - 1; i > 0; i--) {
        const timestamp1 = timestamps[i];
        const timestamp2 = timestamps[i - 1];
        const elapsedTime = Math.abs(timestamp2 - timestamp1);
        expect(Math.abs(elapsedTime - refreshRateValueInMilliseconds)).toBeLessThan(50);
    }
}

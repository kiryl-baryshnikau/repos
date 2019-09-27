import {DataTransformationService} from '../mvd-data-transformation-service';
import {DatePipe, DecimalPipe} from '@angular/common';
import {ResourceService} from 'container-framework';
import {DataFormatPipe} from '../../pipes/mvd-data-format.pipe';
import {MockService} from '../../shared/mock-service';
import {FacilityLookUpService} from '../../../services/facility-look-up.service';

describe('Service: DataTransformationService', () => {
    let service: DataTransformationService;
    let resourceService: ResourceService;
    let datePipe: DatePipe;
    let decimalPipe: DecimalPipe;
    let dataFormatPipe: DataFormatPipe;
    let facilityLookUpService: FacilityLookUpService;

    const item = {
        'patientId': 'Unknown',
        'patientName': 'PatientName',
        'patientCareUnit': 'patientUnit',
        'room': 'room',
        'infusion': 'Unknown',
        'infusionContainerKey': 41,
        'pcuId': 'M8015S13215657',
        'moduleId': 'M8100S13688091',
        'moduleType': 'LVP',
        'drugAmount': 0,
        'drugUnit': 'none',
        'diluentAmount': 0,
        'diluentUnit': 'ml',
        'infusionType': 'Basic',
        'totalContainerInfusedVolume': 0.3,
        'containerStartDateTime': '2015-01-13T11:55:58',
        'stopDateTime': '2015-01-13T11:56:12',
        'containerEstimatedEmptyTime': '9999-12-31T23:59:59.9999999',
        'lastKnownContainerEstimatedEmptyTime': '2017-03-22T23:25:58',
        'containerStatus': 1202,
        'hasGuardrailsWarning': false,
        'vtbi': 50,
        'profile': 'InfusionViewer',
        'facilityId': 'test',
        'facilityTimezoneId': 'Pacific Standard Time',
        'isKvo': false,
        'remainingVolume': 49.7,
        'clinicianId': '150113015540',
        'bolusRateAmount': 0,
        'bolusRateTimeUnit': 'hour',
        'bolusType': 'None',
        'rateAmount': 100,
        'rateTimeUnit': 'hour',
        'doseRateAmount': 0,
        'doseRateUnit': 'none',
        'doseRateModifierUnit': 'none',
        'doseRateTimeUnit': 'none',
        'grConcentrationLimit': 'Unchecked',
        'grBdarLimitsStatus': 'Unchecked',
        'grBolusDoseLimitsStatus': 'Unchecked',
        'grDoseLimitsStatus': 'Unchecked',
        'grDurationLimitsStatus': 'Unchecked',
        'grRateLimitsStatus': 'Unchecked',
        'lastUpdateDateTime': '2015-01-30T00:05:23.837',
        'eventDateTime': '2015-01-13T11:56:12'
    };

    beforeEach(() => {
        resourceService = new ResourceService();
        facilityLookUpService = new FacilityLookUpService(resourceService);
        resourceService.setResources(new MockService().getResources());
        datePipe = new DatePipe('en-US');
        decimalPipe = new DecimalPipe('en-US');
        dataFormatPipe = new DataFormatPipe(datePipe, decimalPipe, resourceService);
        service = new DataTransformationService(dataFormatPipe, resourceService, facilityLookUpService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });


    describe('#transformIVStatusData', () => {
        it('should be defined when passing data', () => {
            expect(service.transformIVStatusData(item)).toBeDefined();
        });

        it('should return a value of estimatedTimeTillEmpty', () => {
            const result = service.transformIVStatusData(item);
            expect(result.estimatedTimeTillEmpty).toBeDefined();
        });

        it('est. time until empty should return "Unknown"  ', () => {
            item.containerStatus = 1203;
            const result = service.transformIVStatusData(item);
            expect(result.estimatedTimeTillEmpty).toEqual(resourceService.resource('unknown'));
        });

        it('should return "Not Applicable" resources when passing none value', () => {
            const result = service.transformIVStatusData(item);
            expect(result.replenishmentStatus).toEqual(resourceService.resource('notApplicable'));
        });

        it('should return "Unknown" resources when patient name is null', () => {
            item.patientName = null;
            const result = service.transformIVStatusData(item);
            expect(result.patientName).toEqual(resourceService.resource('unknown'));
        });

        it('should return "Not Applicable" resources when passing Infusion Type of "Basic"', () => {
            item.infusionType = 'Basic';
            const result = service.transformIVStatusData(item);
            expect(result.replenishmentStatus).toEqual(resourceService.resource('notApplicable'));
        });

    });


    describe('#mapDose', () => {
        it('should return #doseRateAmount + #doseRateUnit', () => {
            const dose = {doseRateAmount: 100, doseRateUnit: 'mL'};
            const expected = dose.doseRateAmount + ' ' + dose.doseRateUnit;
            expect(service.mapDose(dose)).toEqual(expected);
        });
    });

    describe('#mapInfusionStatus', () => {
        it('should return "Not Applicable" status passing invalid infusion status', () => {
            expect(service.mapInfusionStatus(1)).toEqual(resourceService.resource('notApplicable'));
        });

        it('should return 1200 status resource', () => {
            expect(service.mapInfusionStatus(1200)).toEqual(resourceService.resource('status1200'));
        });
    });

    describe('#mapGuardrailStatus', () => {
        it('should return 0 warnings when item has not guardrails warnings', () => {
            const guardrailSt = {hasGuardrailsWarning: false};
            expect(service.mapGuardrailStatus(guardrailSt).countGRViolations).toEqual(0);
        });

        it('should return greater than 0 when exists guardrails warnings', () => {
            const guardrailSt = {hasGuardrailsWarning: true, grBdarLimitsStatus: 'AboveMaximum'};
            expect(service.mapGuardrailStatus(guardrailSt).countGRViolations).toBeGreaterThan(0);

        });

        it('should return messages when exists guardrails warnings', () => {
            const guardrailSt = { hasGuardrailsWarning: true, grBdarLimitsStatus: 'AboveMaximum' };
            let result = service.mapGuardrailStatus(guardrailSt);
            expect(result.messages.length).toBeGreaterThan(0);
        });
    });
});

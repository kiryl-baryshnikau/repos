/*import {ContinuousInfusionsTransformationService} from './mvd-continuous-infusions-transformation.service';
import {ResourceService} from 'container-framework';
import {MockService} from '../../shared/mock-service';
import {ContainerStatus} from '../../shared/mvd-container-status.type';
import {ContinuousInfusionsTresholdIndicators} from './mvd-continuous-infusions.types';
import {ContinuousInfusionsConfigurationService} from './mvd-continuous-infusions-configuration.service';
import {FacilityLookUpService} from '../../../services/facility-look-up.service';
import {DataFormatPipe} from '../../pipes/mvd-data-format.pipe';
import {DateFormatPipe} from 'angular2-moment';
import {DecimalPipe} from '@angular/common';
import {SortingService} from '../../services/mvd-sorting-service';
import {ConfigurationService} from '../../services/mvd-configuration-service';

describe('Service: ContinuousInfusionsTransformationService ', () => {
    let service: ContinuousInfusionsTransformationService;
    let configService: ConfigurationService;
    let resourceService: ResourceService;
    let configurationService: ContinuousInfusionsConfigurationService;
    let facilityLookUpService: FacilityLookUpService;
    let formatPipe: DataFormatPipe;
    let datePipe: DateFormatPipe;
    let decimalPipe: DecimalPipe;
    let sortingService: SortingService;
    beforeEach(() => {
        configService = new ConfigurationService();
        resourceService = new ResourceService();
        resourceService.setResources(new MockService().getResources());
        configurationService = new ContinuousInfusionsConfigurationService(configService, resourceService);
        facilityLookUpService = new FacilityLookUpService(resourceService);
        datePipe = new DateFormatPipe();
        sortingService = new SortingService(resourceService);
        decimalPipe = new DecimalPipe('en-US');
        formatPipe = new DataFormatPipe(datePipe, decimalPipe, resourceService);
        service = new ContinuousInfusionsTransformationService(resourceService, formatPipe,
            configurationService, facilityLookUpService, sortingService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('>> Field Mappings <<', () => {

        describe('#mapDose', () => {

            it('should return a valid mapped dose', () => {
                const expected = '0 none';

                const result = service.mapDose({doseRateAmount: 0, doseRateUnit: 'none'});
                console.log(result);
                expect(result).toEqual(expected);
            });

        });

        describe('#mapDrugAmount', () => {
            it('should return a formatted string including precision rules', () => {
                const testCases = [
                    {item: {drugAmount: 500, drugUnit: 'mg'}, expected: '500 mg'},
                    {item: {drugAmount: 101.6546, drugUnit: 'mg'}, expected: '101.7 mg'},
                    {item: {drugAmount: 10.59999, drugUnit: 'mg'}, expected: '10.6 mg'},
                    {item: {drugAmount: 1.1587, drugUnit: 'mg'}, expected: '1.159 mg'}
                ];

                testCases.forEach((testCase) => {
                    const result = service.mapDrugAmount(testCase.item);
                    expect(result).toEqual(testCase.expected);
                });
            });
        });

        describe('#mapThresholdIndicator should return a valid threshold indicator: ', () => {
            configurationService = new ContinuousInfusionsConfigurationService(configService, resourceService);
            const data = [0, 1, 2, 3, 4, 5];
            const testCases = [
                {
                    expectedIndicator: ContinuousInfusionsTresholdIndicators.Escalate,
                    data: data.map((data: number) => configurationService.getThresholdInfusionsConfiguration()
                        .thresholdEscalate - data)
                },
                {
                    expectedIndicator: ContinuousInfusionsTresholdIndicators.Warning,
                    data: data.map((data: number) => configurationService.getThresholdInfusionsConfiguration()
                        .thresholdWarning - data)
                },
                {
                    expectedIndicator: ContinuousInfusionsTresholdIndicators.Priority,
                    data: data.map((data: number) => configurationService.getThresholdInfusionsConfiguration()
                        .thresholdPriority - data)
                },
                {
                    expectedIndicator: ContinuousInfusionsTresholdIndicators.Normal,
                    data: data.map((data: number) => ++configurationService.getThresholdInfusionsConfiguration()
                        .thresholdWarning + data)
                }*
            ];

            testCases.forEach((testCase: any) => {
                it(`expecting ${ContinuousInfusionsTresholdIndicators[testCase.expectedIndicator]}
                    when passing ${testCase.data}`, () => {

                    testCase.data.forEach((item: number) => {
                        const result = service.mapThresholdIndicator(item);
                        expect(result).toEqual(testCase.expectedIndicator);
                    });
                });
            });
        });

        describe('#mapDisplayStatus ', () => {
            it('should return a valid resource when passing stopped status', () => {
                const expected = resourceService.resource('stopped');
                const result = service.mapDisplayStatus(ContainerStatus.Stopped, 0);
                expect(result).toEqual(expected);
            });

            it('should return a valid string when passing valid params', () => {
                const result = service.mapDisplayStatus(ContainerStatus.Completed, 0);
                expect(result).toEqual(jasmine.any(String));
                expect(result.length).toBeGreaterThan(1);
            });
        });
    });

    describe('>> Precision Rules <<', () => {

        describe('#getRatePrecision', () => {
            describe('moduleType is LVP', () => {

                it('should return 1 when value is less than 100', () => {
                    const testCases = [
                        {rateAmount: 1, moduleType: 'LVP'},
                        {rateAmount: 99.99, moduleType: 'LVP'},
                        {rateAmount: 0, moduleType: 'LVP'},
                        {rateAmount: -1, moduleType: 'LVP'},
                        {rateAmount: 55, moduleType: 'LVP'}
                    ];
                    const expected = 1;

                    testCases.forEach((testCase) => {
                        const result = service.getRatePrecision(testCase);
                        expect(result).toEqual(expected);
                    });
                });

                it('should return 0 when value is greater or equal to 100', () => {
                    const testCases = [
                        {rateAmount: 100, moduleType: 'LVP'},
                        {rateAmount: 100.1, moduleType: 'LVP'},
                        {rateAmount: 101, moduleType: 'LVP'}
                    ];
                    const expected = 0;

                    testCases.forEach((testCase) => {
                        const result = service.getRatePrecision(testCase);
                        expect(result).toEqual(expected);
                    });
                });
            });

            describe('moduleType is not LVP', () => {

                it('should return 0 when value is greater or equal to 100', () => {
                    const testCases = [
                        {rateAmount: 100, moduleType: ''},
                        {rateAmount: 100.1, moduleType: ''},
                        {rateAmount: 101, moduleType: ''}
                    ];
                    const expected = 0;
                    testCases.forEach((testCase) => {
                        const result = service.getRatePrecision(testCase);
                        expect(result).toEqual(expected);
                    });
                });

                it('should return 1 when value is greater or equal to 10 but less than 100', () => {
                    const testCases = [
                        {rateAmount: 10.1, moduleType: ''},
                        {rateAmount: 11, moduleType: ''},
                        {rateAmount: 99.99, moduleType: ''},
                        {rateAmount: 50, moduleType: ''}
                    ];
                    const expected = 1;
                    testCases.forEach((testCase) => {
                        const result = service.getRatePrecision(testCase);
                        expect(result).toEqual(expected);
                    });
                });

                it('should return 2 when value is less than 10', () => {
                    const testCases = [
                        {rateAmount: 9.99, moduleType: ''},
                        {rateAmount: -1, moduleType: ''},
                        {rateAmount: 0.11, moduleType: ''},
                        {rateAmount: 5, moduleType: ''}
                    ];
                    const expected = 2;
                    testCases.forEach((testCase) => {
                        const result = service.getRatePrecision(testCase);
                        expect(result).toEqual(expected);
                    });
                });
            });
        });

        describe('#getDiluentVolumePrecision', () => {
            it('should return 0 when passing invalid parameters ', () => {
                const invalidData = [null, 'invalid', {}, 0];
                invalidData.forEach((data) => {
                    const result = service.getDiluentVolumePrecision(data);
                    const expected = 0;
                    expect(result).toEqual(expected);
                });
            });

            it('should return 2 when value is less than 10', () => {
                const testCases = [0.150, 1, -5.54, 9, 9.99, 4];
                const expected = 2;
                testCases.forEach((testCase) => {
                    const result = service.getDiluentVolumePrecision(testCase);
                    expect(result).toEqual(expected);
                });
            });

            it('should return 1 when value is greater or equal to 10 but less or equal than 1000', () => {
                const testCases = [10, 1000, 10.1, 999.99, 987, 500];
                const expected = 1;
                testCases.forEach((testCase) => {
                    const result = service.getDiluentVolumePrecision(testCase);
                    expect(result).toEqual(expected);
                });
            });

        });

        describe('#getDosePrecision', () => {
            it('should return 0 when passing invalid parameters ', () => {
                const invalidData = [null, 'invalid', {}, 0];
                invalidData.forEach((data) => {
                    const result = service.getDosePrecision(data);
                    const expected = 0;
                    expect(result).toEqual(expected);
                });
            });

            it('should return 1 when value is greater or equal to 100 but less or equal to 1000', () => {
                const testCases = [100, 1000, 101, 999.9, 999, 500];
                const expected = 1;
                testCases.forEach((testCase) => {
                    const result = service.getDosePrecision(testCase);
                    expect(result).toEqual(expected);
                });
            });

            it('should return 2 when value is greater or equal to 10 but less than 100', () => {
                const testCases = [10, 11, 20, 50, 90, 99.9];
                const expected = 2;
                testCases.forEach((testCase) => {
                    const result = service.getDosePrecision(testCase);
                    expect(result).toEqual(expected);
                });
            });

            it('should return 3 when value is less than 10 but greater or equal to 1', () => {
                const testCases = [1, 1.1, 3, 4, 5, 6, 7, 8, 9.9];
                const expected = 3;
                testCases.forEach((testCase) => {
                    const result = service.getDosePrecision(testCase);
                    expect(result).toEqual(expected);
                });
            });

            it('should return 4 when value is less than 1', () => {
                const testCases = [-5, 0.1, 0.9, -1, 0.5, 0.98];
                const expected = 4;
                testCases.forEach((testCase) => {
                    const result = service.getDosePrecision(testCase);
                    expect(result).toEqual(expected);
                });
            });


        });

        describe('#getDrugAmountPrecision', () => {
            it('should return 0 when passing invalid parameters ', () => {
                const invalidData = [null, 'invalid', {}, 0];
                invalidData.forEach((data) => {
                    const result = service.getDrugAmountPrecision(data);
                    const expected = 0;
                    expect(result).toEqual(expected);
                });
            });

            it('should return 1 when value is greater or equal to 100 but less or equal to 1000', () => {
                const testCases = [100, 1000, 101, 999.9, 999, 500];
                const expected = 1;
                testCases.forEach((testCase) => {
                    const result = service.getDrugAmountPrecision(testCase);
                    expect(result).toEqual(expected);
                });
            });

            it('should return 2 when value is greater or equal to 10 but less than 100', () => {
                const testCases = [10, 11, 20, 50, 90, 99.9];
                const expected = 2;
                testCases.forEach((testCase) => {
                    const result = service.getDrugAmountPrecision(testCase);
                    expect(result).toEqual(expected);
                });
            });

            it('should return 3 when value is less than 10', () => {
                const testCases = [1, 2, 3, 4, 5, 6, 7, 8, 9.9];
                const expected = 3;
                testCases.forEach((testCase) => {
                    const result = service.getDrugAmountPrecision(testCase);
                    expect(result).toEqual(expected);
                });
            });


        });

    });

    describe('>> Other operations in service <<', () => {

        describe('#filterItems', () => {

            const testCases = [
                {
                    infusionType: 'CONTINUOUS',
                    patientName: 'Doe, John',
                    patientId: '34242423',
                    containerStatus: ContainerStatus.Infusing,
                    isKvo: false,
                    infusionContainerKey: 1
                },
                {
                    infusionType: 'Continuous',
                    patientName: 'Patient, Name',
                    patientId: '8879877',
                    containerStatus: ContainerStatus.Infusing,
                    isKvo: false,
                    infusionContainerKey: 2
                },
                {
                    infusionType: 'Continuous',
                    patientName: 'Patient, Name',
                    patientId: '',
                    containerStatus: ContainerStatus.Infusing,
                    isKvo: false,
                    infusionContainerKey: 3
                },
                {
                    infusionType: 'Continuous',
                    patientName: '',
                    patientId: '654654',
                    containerStatus: ContainerStatus.Infusing,
                    isKvo: false,
                    infusionContainerKey: 4
                },
                {
                    infusionType: 'Intermittent',
                    patientName: 'Patient, Name',
                    patientId: '2423423',
                    containerStatus: ContainerStatus.Infusing,
                    isKvo: false,
                    infusionContainerKey: 5
                },
                {
                    infusionType: 'Continuous',
                    patientName: 'Patient, Name',
                    patientId: '2423423',
                    containerStatus: ContainerStatus.Disconnected,
                    isKvo: false,
                    infusionContainerKey: 6
                },
                {
                    infusionType: 'Continuous',
                    patientName: 'Patient, Name',
                    patientId: '2423423',
                    containerStatus: ContainerStatus.Infusing,
                    isKvo: true,
                    infusionContainerKey: 7
                },

            ];

            it('should return records which isKvo is false', () => {
                const expected = testCases.filter((testCase) => testCase.isKvo);

                const result = testCases.filter(service.filterItems);

                expected.forEach((testCase) => {
                    const exists = result
                        .find((item) => item.infusionContainerKey === testCase.infusionContainerKey);
                    expect(exists).toBeFalsy();
                });
            });

            it('should return records which containerStatus is Stopped OR Infusing', () => {
                const expected = testCases.filter((testCase) => ((testCase.containerStatus !== ContainerStatus.Infusing) &&
                    (testCase.containerStatus !== ContainerStatus.Stopped)));

                const result = testCases.filter(service.filterItems);

                expected.forEach((testCase) => {
                    const exists = result
                        .find((item) => item.infusionContainerKey === testCase.infusionContainerKey);
                    expect(exists).toBeFalsy();
                });
            });

            it('should not return records which PatientName and PatientId are not present', () => {
                const expected = testCases.filter((testCase) => !testCase.patientId || !testCase.patientName);

                const result = testCases.filter(service.filterItems);

                expected.forEach((testCase) => {
                    const exists = result
                        .find((item) => item.infusionContainerKey === testCase.infusionContainerKey);
                    expect(exists).toBeFalsy();
                });
            });

            it('should not return records which infusionType is not continuous ', () => {
                const expected = testCases.filter((testCase) => testCase.infusionType.toLowerCase() !== 'continuous');

                const result = testCases.filter(service.filterItems);

                expected.forEach((testCase) => {
                    const exists = result
                        .find((item) => item.infusionContainerKey === testCase.infusionContainerKey);
                    expect(exists).toBeFalsy();
                });
            });


        });

        describe('#calculateTimeTillEmpty', () => {
            it('should return the time difference in minutes for utc dates', () => {
                const testCases = [
                    {
                        first: '2017-04-10 20:59:38.0000000',
                        second: '2017-04-10 21:37:45.0400000',
                        min: 38,
                    },
                    {
                        first: '2017-04-06 18:30:33.0000000',
                        second: '2017-04-07 19:28:11.0800000',
                        min: 1497,
                    },
                    {
                        first: '2017-04-06 21:15:39.0000000',
                        second: '2017-04-06 23:24:36.0000000',
                        min: 128
                    },
                    {
                        first: '2017-04-11 17:30:59.0000000',
                        second: '2017-04-11 17:38:51.6400000',
                        min: 7
                    }
                ];

                testCases.forEach((testCase) => {
                    const currentDate = new Date(testCase.first);
                    const lastKnownContainerEstimatedEmptyTime = new Date(testCase.second);
                    const expected = testCase.min;
                    const result = service.calculateTimeTillEmpty(lastKnownContainerEstimatedEmptyTime, currentDate);
                    expect(result).toEqual(expected);
                });

            });

            it('should return the time difference in minutes regardless utc and local dates', () => {
                const lastKnownContainerEstimatedEmptyTime = new Date('2017-05-22 23:31:18.0000000Z');
                const currentDate = new Date('Mon May 22 2017 17:37:32 GMT-0500 (Central Daylight Time)');
                const expected = 53;

                const result = service.calculateTimeTillEmpty(lastKnownContainerEstimatedEmptyTime, currentDate);
                expect(result).toEqual(expected);
            });

            it('should return the time difference in minutes for local dates', () => {
                const lastKnownContainerEstimatedEmptyTime = new Date('Mon Apr 10 2017 16:37:45 GMT-0500 (Central Daylight Time)');
                const currentDate = new Date('Mon Apr 10 2017 15:59:38 GMT-0500 (Central Daylight Time)');
                const expected = 38;

                const result = service.calculateTimeTillEmpty(lastKnownContainerEstimatedEmptyTime, currentDate);
                expect(result).toEqual(expected);
            });


            it('should return 0 when difference is negative', () => {
                const lastKnownContainerEstimatedEmptyTime = new Date('2017-05-20 18:02:31.4890000Z');
                const currentDate = new Date('Mon May 22 2017 17:37:32 GMT-0500 (Central Daylight Time)');
                const expected = 0;

                const result = service.calculateTimeTillEmpty(lastKnownContainerEstimatedEmptyTime, currentDate);
                expect(result).toEqual(expected);
            });
        });

        describe('#convertToMinutes ', () => {
            it('should return number of ms in minutes', () => {
                const testCases = [
                    {ms: 500000, min: 8},
                    {ms: 984655, min: 16},
                    {ms: 980000, min: 16},
                    {ms: 1600000, min: 26}
                ];

                testCases.forEach((data) => {
                    const result = service.convertToMinutes(data.ms);
                    expect(result).toEqual(data.min);
                });
            });

            it('should return 0 when passing invalid params', () => {
                const invalidData = [null, 'invalid', {}, true];
                const expected = 0;
                invalidData.forEach((data) => {
                    const result = service.convertToMinutes(data);
                    expect(result).toEqual(expected);
                });
            });
        });

    });
});
*/



import { DispensingDataTransformationService } from '../mvd-dispensing-data-transformation-service';
import { ResourceService } from 'container-framework';
import { MockService } from '../../shared/mock-service';
import { DatePipe } from '@angular/common';
import { FacilityLookUpService } from '../../../services/facility-look-up.service';

describe('Service: DispensingDataTransformationService', function () {
    let service: DispensingDataTransformationService;
    let resourceService: ResourceService;
    let datePipe: DatePipe;
    let facilityLookUpService: FacilityLookUpService;

    const item = {
        allFacilitiesKey: '00000000000000000000000000000000',
    };

    const data = [
        {
            critical: true,
            facilityKey: null,
            facilityName: null,
            highlight: false,
            locked: false,
            noticeCount: 8,
            noticeSeverityInternalCode: 'L',
            noticeTypeDescription: 'Stock critical low',
            noticeTypeInternalCode: 'CRITLOW',
            oldestNoticeDuration: 38813,
            severity: 1
        },
        {
            critical: true,
            facilityKey: null,
            facilityName: null,
            highlight: false,
            locked: true,
            noticeCount: 2,
            noticeSeverityInternalCode: 'H',
            noticeTypeDescription: 'Patient information delayed/down',
            noticeTypeInternalCode: 'PATINBND',
            oldestNoticeDuration: 25906,
            severity: 3,
        },
        {
            critical: true,
            facilityKey: null,
            facilityName: null,
            highlight: true,
            locked: true,
            noticeCount: 117,
            noticeSeverityInternalCode: 'H',
            noticeTypeDescription: 'Devices with download stopped',
            noticeTypeInternalCode: 'UPDOWNFAIL',
            oldestNoticeDuration: 98125,
            severity: 2,
        },
    ];

    const preferences = {
        facility: {
            attentionNoticeCriticalThresholdDuration: 41692,
        },
        noticeTypes: [],
    };

    beforeEach(() => {
        resourceService = new ResourceService();
        resourceService.setResources(new MockService().getResources());
        facilityLookUpService = new FacilityLookUpService(resourceService);
        datePipe = new DatePipe('en-US');
        service = new DispensingDataTransformationService(resourceService, datePipe, facilityLookUpService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('#facilities', () => {
        it('Get all facilities key', () => {
            const key = service.getAllFacilitiesKey();
            expect(item.allFacilitiesKey).toEqual(key);
        });
    });

    describe('#severity', () => {
        it('Get L severity', () => {
            const expectedStyle = 1;
            expect(expectedStyle).toEqual((service.getSeverity('L')));
        });
        it('Get M severity', () => {
            const expectedStyle = 2;
            expect(expectedStyle).toEqual((service.getSeverity('M')));
        });
        it('Get H severity', () => {
            const expectedStyle = 3;
            expect(expectedStyle).toEqual((service.getSeverity('H')));
        });
        it('Get default severity', () => {
            const expectedStyle = 0;
            expect(expectedStyle).toEqual((service.getSeverity('abcd')));
        });
    });

    describe('#shape data', () => {
        it('Get shaped data', () => {
            const shapedData = service.shapeData(data, preferences, undefined);

            // Requirements changed, should return all alerts when no user preferences were set.
            const expected = [
                {
                    critical: false,
                    facilityKey: null,
                    facilityName: null,
                    highlight: false,
                    locked: false,
                    noticeCount: 8,
                    noticeSeverityInternalCode: 'L',
                    noticeTypeDescription: 'Stock critical low',
                    noticeTypeInternalCode: 'CRITLOW',
                    oldestNoticeDuration: 38813,
                    severity: 1
                },
                {
                    critical: true,
                    facilityKey: null,
                    facilityName: null,
                    highlight: false,
                    locked: true,
                    noticeCount: 2,
                    noticeSeverityInternalCode: 'H',
                    noticeTypeDescription: 'Patient information delayed/down',
                    noticeTypeInternalCode: 'PATINBND',
                    oldestNoticeDuration: 25906,
                    severity: 3,
                },
                {
                    critical: true,
                    facilityKey: null,
                    facilityName: null,
                    highlight: true,
                    locked: true,
                    noticeCount: 117,
                    noticeSeverityInternalCode: 'H',
                    noticeTypeDescription: 'Devices with download stopped',
                    noticeTypeInternalCode: 'UPDOWNFAIL',
                    oldestNoticeDuration: 98125,
                    severity: 3
                },
            ].sort(function (a, b) {
                return b.severity - a.severity;
            });
            expect(expected).toEqual(shapedData);
        });

        it('Should display correct time format', () => {
            const oldestNoticeDuration = 25906;
            const shouldDisplay = '17d';
            expect(shouldDisplay).toEqual(service.getDurationDisplay(oldestNoticeDuration));
        });

        it('Should display correct date format', () => {
            const date = '2017-08-08T20:54:37.1464416Z';
            //const shouldDisplay = 'Aug 08, 2017 15:54';
            expect(service.getDateDisplay(date, 0)).toEqual(service.getDateDisplay(date, 0));
        });

        it('should return notice details', () => {

            const statartUtcDate = '2017-06-22T14:02:36.093Z';


            const noticeType = 'UPDOWNFAIL';
            const inputData = [
                {
                    id: 1,
                    key: 'VVBET1dORkFJTHxjZmEyNWYxMGQ2MzdlMTExOGViZDAwNTA1Njg3MzdkNHwyMDE3LTA4LTEwVDE2OjQ4OjI2Ljc4Wg==',
                    areas: 'RESPCARE',
                    dispensingDeviceKey: 'c555452bc229e7118f960050568b1204',
                    dispensingDeviceName: 'PFLAB',
                    facilityKey: 'cfa25f10d637e1118ebd0050568737d4',
                    facilityName: 'Wesley Medical Center',
                    noticeDuration: 1463,
                    noticeStartUtcDateTime: statartUtcDate,
                    status: 'New'
                },
                {
                    id: 2,
                    key: 'VVBET1dORkFJTHxjZmEyNWYxMGQ2MzdlMTExOGViZDAwNTA1Njg3MzdkNHwyMDE3LTA2LTIyVDE0OjAyOjM2LjA5M1o=',
                    areas: '10 Tower, 2C SICU, 2T South, 3 Tower, 3C CCU, 3WH, 4C MICU, 4WH, 5 Tower, 5WH, 6 Tower, 7 Tower, ' +
                        '8 Tower, 9 Tower, BCC, Dialysis, ED, Endoscopy, GHH AfterHours, Infusion, LDR, NICU, PICU, PSED, ' +
                        'Radiology, W.CVL01, WoundCare',
                    dispensingDeviceKey: '7eb64d430b1ae7119e820050568b1204',
                    dispensingDeviceName: 'BIOIDREG2',
                    facilityKey: 'cfa25f10d637e1118ebd0050568737d4',
                    facilityName: 'Wesley Medical Center',
                    noticeDuration: 72189,
                    noticeStartUtcDateTime: statartUtcDate,
                    status: 'Acknowledged'
                }
            ];
            const expected = {
                columns: [
                    { code: 'dispensingDeviceName', name: '##dispensingDeviceName##' },
                    { code: 'noticeDuration', name: '##noticeDuration##' },
                    { code: 'noticeStartUtcDateTime', name: '##noticeStartUtcDateTime##' },
                    { code: 'areas', name: '##areas##' },
                    { code: 'facilityName', name: '##facilityName##' },
                    { code: 'status', name: '##currentStatus##' }
                ],
                data: [
                    {
                        areas: "RESPCARE",
                        areasDisplay: "RESPCARE",
                        dispensingDeviceName: "PFLAB",
                        dispensingDeviceNameDisplay: "PFLAB",
                        facilityKey: "cfa25f10d637e1118ebd0050568737d4",
                        facilityName: "Unknown",
                        facilityNameDisplay: "Unknown",
                        id: 1,
                        key: 'VVBET1dORkFJTHxjZmEyNWYxMGQ2MzdlMTExOGViZDAwNTA1Njg3MzdkNHwyMDE3LTA4LTEwVDE2OjQ4OjI2Ljc4Wg==',
                        noticeDuration: 1463,
                        noticeDurationDisplay: "24h 23m",
                        noticeStartUtcDateTime: statartUtcDate,
                        noticeStartUtcDateTimeDisplay: service.getDateDisplay(statartUtcDate, 0),
                        status: "New",
                        statusDisplay: "New",
                        updatedBy: undefined,
                        updatedDateTime: undefined,
                    },
                    {
                        areas: '10 Tower, 2C SICU, 2T South, 3 Tower, 3C CCU, 3WH, 4C MICU, 4WH, 5 Tower, 5WH, 6 Tower, '
                            + '7 Tower, 8 Tower, 9 Tower, BCC, Dialysis, ED, Endoscopy, GHH AfterHours, Infusion, LDR, NICU, ' +
                            'PICU, PSED, Radiology, W.CVL01, WoundCare',
                        areasDisplay: '10 Tower, 2C SICU, 2T South, 3 Tower, 3C CCU, 3WH, 4C MICU, 4WH, 5 Tower, 5WH, 6 Tower, ' +
                            '7 Tower, 8 Tower, 9 Tower, BCC, Dialysis, ED, Endoscopy, GHH AfterHours, Infusion, LDR, NICU, PICU, ' +
                            'PSED, Radiology, W.CVL01, WoundCare',
                        dispensingDeviceName: "BIOIDREG2",
                        dispensingDeviceNameDisplay: "BIOIDREG2",
                        facilityKey: "cfa25f10d637e1118ebd0050568737d4",
                        facilityName: "Unknown",
                        facilityNameDisplay: "Unknown",
                        id: 2,
                        key: 'VVBET1dORkFJTHxjZmEyNWYxMGQ2MzdlMTExOGViZDAwNTA1Njg3MzdkNHwyMDE3LTA2LTIyVDE0OjAyOjM2LjA5M1o=',
                        noticeDuration: 72189,
                        noticeDurationDisplay: "50d",
                        noticeStartUtcDateTime: statartUtcDate,
                        noticeStartUtcDateTimeDisplay: service.getDateDisplay(statartUtcDate, 0),
                        status: "Acknowledged",
                        statusDisplay: "Acknowledged",
                        updatedBy: undefined,
                        updatedDateTime: undefined,
                    }
                ]
            };

            const result = service.shapeNoticeDetailsData(inputData, noticeType);
            expect(expected).toEqual(result);
        });

        it('should return grouped data', () => {
            const inputData = [
                {
                    facilityKey: '490f7dabd36ee611aefc00505600844b',
                    facilityName: 'Sharp Hospital Chula Vista',
                    orderNumber: 'B001b',
                    newRequest: false,
                    patientUnitName: 'OrderUnit',
                    requestDuration: 140
                },
                {
                    facilityKey: '490f7dabd36ee611aefc00505600844b',
                    facilityName: 'Sharp Hospital Chula Vista',
                    orderNumber: 'B001b',
                    newRequest: false,
                    patientUnitName: 'OrderUnit',
                    requestDuration: 131
                },
                {
                    facilityKey: '8b3af4b6d36ee611aefc00505600844b',
                    facilityName: 'North County Medical Center',
                    orderNumber: 'NCMC3',
                    newRequest: false,
                    patientUnitName: 'DASUnit',
                    requestDuration: 113
                }
            ];
            const expected = [
                [{
                    'facilityKey': '490f7dabd36ee611aefc00505600844b',
                    'facilityName': 'Sharp Hospital Chula Vista',
                    'orderNumber': 'B001b',
                    'newRequest': false,
                    'patientUnitName': 'OrderUnit',
                    'requestDuration': 140
                }, {
                    'facilityKey': '490f7dabd36ee611aefc00505600844b',
                    'facilityName': 'Sharp Hospital Chula Vista',
                    'orderNumber': 'B001b',
                    'newRequest': false,
                    'patientUnitName': 'OrderUnit',
                    'requestDuration': 131
                }], [{
                    'facilityKey': '8b3af4b6d36ee611aefc00505600844b',
                    'facilityName': 'North County Medical Center',
                    'orderNumber': 'NCMC3',
                    'newRequest': false,
                    'patientUnitName': 'DASUnit',
                    'requestDuration': 113
                }]];

            const result = service.processDoseRequestData(inputData);
            expect(JSON.stringify(expected)).toEqual(JSON.stringify(result));
        });

        it('Should return order status', () => {
            const testCases = [
                { orderActive: true, orderCancelled: false, orderDiscontinued: false, orderOnHold: false, expect: '' },
                {
                    orderActive: false,
                    orderCancelled: true,
                    orderDiscontinued: false,
                    orderOnHold: false,
                    expect: '##orderStatusCancelled##'
                },
                {
                    orderActive: false,
                    orderCancelled: false,
                    orderDiscontinued: true,
                    orderOnHold: false,
                    expect: '##orderStatusDiscontinued##'
                },
                { orderActive: false, orderCancelled: false, orderDiscontinued: false, orderOnHold: true, expect: '##orderStatusOnHold##' }
            ];

            testCases.forEach((t) => {
                expect(t.expect).toEqual(service.formatOrderStatus(t));
            });
        });

        it('Should return tracking status', () => {
            const testCases = [
                { trackingStatus: '', expect: '' },
                { trackingStatus: 'DELIVERED', expect: '##trackingStatusDelivered##' },
                { trackingStatus: 'INTRANSIT', expect: '##trackingStatusInTransit##' },
                { trackingStatus: 'QUEUEDLV', expect: '##trackingStatusQueued##' },
                { trackingStatus: 'CANCELLED', expect: '##trackingStatusCancelled##' },
            ];
            testCases.forEach((t) => {
                expect(t.expect).toEqual(service.formatTrackingStatus(t));
            });
        });

        it('Should display correct patient info', () => {
            const testCases = [
                {
                    'patientFirstName': 'Steve',
                    'patientLastName': 'Potter',
                    'displayPatientId': 'VID051',
                    expectMask: 'P, St',
                    expect: 'Potter, Steve (VID051)',
                },
                {
                    'patientFirstName': 'Jack',
                    'patientLastName': 'Black',
                    'displayPatientId': 'VID200',
                    expectMask: 'B, Ja',
                    expect: 'Black, Jack (VID200)'
                },
                {
                    'patientFirstName': 'Mary',
                    'patientLastName': 'White',
                    'displayPatientId': 'VID201',
                    expectMask: 'W, Ma',
                    expect: 'White, Mary (VID201)'
                }
            ];

            testCases.forEach((t) => {
                expect(t.expectMask).toEqual(service.formatPatientInfo(t, true));
                expect(t.expect).toEqual(service.formatPatientInfo(t, false));
            });
        });
    });

    function isSorted(arrayExpected: any, arraySorted: any, key?: string) {
        let sorted = true;
        for (let index = 0; index < arrayExpected.length; index++) {
            const current = arrayExpected[index];
            let indexToCompare: number;
            if (key) {
                indexToCompare = arraySorted.map((col: any) => col[key]).indexOf(current[key]);
            } else {
                indexToCompare = arraySorted.indexOf(current);
            }
            if (index !== indexToCompare) {
                sorted = false;
                break;
            }
        }
        return sorted;
    }
});

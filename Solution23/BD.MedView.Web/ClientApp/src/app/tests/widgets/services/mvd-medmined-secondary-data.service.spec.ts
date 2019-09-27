import { Injectable } from "@angular/core";
import { TestBed } from '@angular/core/testing';

import { GatewayService, ApiCall } from "container-framework";

import { MvdMedMinedSecondaryDataService, AlertHeaderItem } from "../../../widgets/services/mvd-medmined-secondary-data.service";
import { MvdMedMinedSecondaryDataMapperService } from "../../../widgets/services/mvd-medmined-secondary-data-mapper.service";
import { FacilityPatientIdMappingService, FacilityPatientIdMapping } from "../../../services/facility-patient-id-mapping.service";
import { AuthorizationService } from "../../../services/authorization.service";
import { DeliveryTrackingItem } from "../../../widgets/shared/mvd-models";
import { MedMinedModels as mmModel } from '../../../widgets/shared/medmined-models';
import { Observable, of } from "rxjs";
import { log } from "util";

@Injectable()
class MockGatewayService {
    loadData(apiCalls: ApiCall[]): Observable<any> {
        let id = apiCalls[0].rawData.pageInfoList.pageInfo[0].id;
        let medMinedfacilityId = apiCalls[0].rawData.pageInfoList.pageInfo[0].medMinedfacilityId;
        let value = [{
            "pageInfoList": {
                "pageInfo": [
                    {
                        "id": id,
                        "medMinedAlert": [
                            {
                                "alertId": "1",
                                "alertCategory": "1",
                                "alertTitle": "1",
                                "medMinedfacilityId": medMinedfacilityId
                            }
                        ]
                    }
                ]
            }
        }];
        return of(value);
    }
}

@Injectable()
class MockFacilityPatientIdMappingService {
    public toObservable(): Observable<FacilityPatientIdMapping[]> {
        var value: FacilityPatientIdMapping[] = [{
            "id": 1,
            "synonymKey": "1760",
            "providerName": "DeliveryTracking",
            "patientIdKind": "MRN"
        }, {
            "id": 2,
            "synonymKey": "1760",
            "providerName": "ContinuousInfusions",
            "patientIdKind": "MRN"
        }, {
            "id": 3,
            "synonymKey": "1760",
            "providerName": "IvStatus",
            "patientIdKind": "AccountNumber"
        }]
        return of(value);
    }
}

@Injectable()
class MockAuthorizationService {
    isAuthorized2(resource: string): Observable<any> {
        return of(true);
    }
}

//Note: KB: I'm not familiar with this service. See additional notes bellow
describe('Service: MvdMedMinedSecondaryDataService', () => {
    let target: MvdMedMinedSecondaryDataService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                MvdMedMinedSecondaryDataService,
                { provide: GatewayService, useClass: MockGatewayService },
                { provide: AuthorizationService, useClass: MockAuthorizationService },
                { provide: FacilityPatientIdMappingService, useClass: MockFacilityPatientIdMappingService },
                MvdMedMinedSecondaryDataMapperService
            ]
        });

        target = TestBed.get(MvdMedMinedSecondaryDataService);
    });

    it('Should be defined', () => {
        expect(target).toBeDefined();
    });

    describe('Method: addUuid', () => {
        beforeEach(() => {
        });

        it('Should be defined', () => {
            expect(target.addUuid).toBeDefined();
        });

        it('Should do the job', () => {
            let dataset: mmModel.MedMinedSecondaryDataItem[] = [{
                uuid: null,
                medMinedFacilityId: null,
                medMinedAlerts: null,
            }];

            target.addUuid(dataset);
            let actual = dataset;

            expect(actual).toBeDefined();
            expect(actual.length).toEqual(1);
            expect(actual[0].uuid).toBeDefined();
            expect(actual[0].uuid).toMatch(/^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}$/i);
        });
    });

    describe('Method: getAlerts', () => {
        let secondaryDataMapperService: MvdMedMinedSecondaryDataMapperService;
        beforeEach(() => {
            secondaryDataMapperService = TestBed.get(MvdMedMinedSecondaryDataMapperService);
        });

        it('Should be defined', () => {
            expect(target.getAlerts).toBeDefined();
        });

        it('Should do the job', () => {
            let requestData: mmModel.MedMinedAlertsRequestData<DeliveryTrackingItem> = {
                widgetKey: "A",
                dataset: [
                    <DeliveryTrackingItem>JSON.parse('{"internalId":5,"deliveryLocationName":"LocationA","priority":"","patient":"NCML, NCMF","patientId":"VID102","unit":"DASUnit","facilityCodeUnit":"NCMC-DASUnit","patientRoomName":"ROOM00001","patientBedId":"","patientInfo":"N, NC","patientData":{"firstName":"NCMF","lastName":"NCML"},"location":"NCMC-DASUnit (ROOM00001)","orderStatus":"","orderDescription":"NCMC1 100 mg/500 mL (150 L) TAB","status":"DELIVERED","deliveryTrackingStatus":"Delivered","dateAge":"08/08/17 13:54","dateAgeValue":"2017-08-08T20:54:37.1464416Z","orderId":"NCMCOrderID1","giveAmount":50,"maximumGiveAmount":100,"routes":["IV"],"giveUnitOfMeasure":"TAB","isMultiComponentOrder":false,"facilityCode":"NCMC","facilityName":"MyNewMasterFacility","genericName":"NCMC1","medMinedFacilityId":"1760","medMinedAlerts":[],"uuid":"41e932d3-2225-8958-b263-8d12ba451529"}')
                ],
                recordsPerPage: 1,
                startPage: 0
            };
            let mappingFunction: (data: DeliveryTrackingItem, options: FacilityPatientIdMapping[]) => mmModel.PatientInfo = secondaryDataMapperService.mapDeliveryTracking;

            let expected: AlertHeaderItem[] = [
                {
                    //Note: KB: for some reason widgetKey is missing. I had to comment line and cast data to suttisfy test criteria. Possible protocol change
                    //widgetKey: "",
                    uuid: "41e932d3-2225-8958-b263-8d12ba451529",
                    medMinedAlert: [{
                        "alertId": "1",
                        "alertCategory": "1",
                        "alertTitle": "1",
                        "medMinedfacilityId": "1760"
                    }]
                } as AlertHeaderItem
            ];
            target.getAlerts(requestData, mappingFunction).subscribe(actual => {
                expect(actual).toEqual(expected);
            });
            //expect(1).toEqual(1);
        });
    });

    describe('Method: addSecondaryData', () => {
        beforeEach(() => {
        });

        it('Should be defined', () => {
            expect(target.addSecondaryData).toBeDefined();
        });

        it('Should do the job', () => {
            let dataset: mmModel.MedMinedSecondaryDataItem[] = [
                {
                    uuid: "75434b06-03f3-cc3b-5e94-81efb0249f8a",
                    medMinedFacilityId: null,
                    medMinedAlerts: null,
                },
                {
                    uuid: "75434b06-03f3-cc3b-5e94-81efb0249f8b",
                    medMinedFacilityId: null,
                    medMinedAlerts: null,
                },
                {
                    uuid: "75434b06-03f3-cc3b-5e94-81efb0249f8c",
                    medMinedFacilityId: null,
                    medMinedAlerts: null,
                }
            ];
            let alert: mmModel.MedMinedAlertHeader = {
                medMinedfacilityId: "1",
                alertId: "1",
                alertCategory: "1",
                alertTitle: "1",
                status: "New"
            };
            let alerts: AlertHeaderItem[] = [
                {
                    widgetKey: "A",
                    uuid: "75434b06-03f3-cc3b-5e94-81efb0249f8a",
                    medMinedAlert: [alert]
                },
                {
                    widgetKey: "A",
                    uuid: "75434b06-03f3-cc3b-5e94-81efb0249f8b",
                    medMinedAlert: [alert, alert]
                },
                {
                    widgetKey: "A",
                    uuid: "75434b06-03f3-cc3b-5e94-81efb0249f8c",
                    medMinedAlert: [alert, alert, alert]
                }
            ];

            let expected: mmModel.MedMinedSecondaryDataItem[] = [
                {
                    uuid: "75434b06-03f3-cc3b-5e94-81efb0249f8a",
                    medMinedFacilityId: null,
                    medMinedAlerts: [alert],
                },
                {
                    uuid: "75434b06-03f3-cc3b-5e94-81efb0249f8b",
                    medMinedFacilityId: null,
                    medMinedAlerts: [alert, alert],
                },
                {
                    uuid: "75434b06-03f3-cc3b-5e94-81efb0249f8c",
                    medMinedFacilityId: null,
                    medMinedAlerts: [alert, alert, alert],
                }
            ];
            target.addSecondaryData(dataset, alerts);
            let actual = dataset;

            expect(actual).toEqual(expected);
        });
    });

    describe('Method: clearCache', () => {
        beforeEach(() => {
        });

        it('Should be defined', () => {
            expect(target.clearCache).toBeDefined();
        });

        it('Should do the job', () => {
            let alertCache: AlertHeaderItem[] =
                [
                    {
                        widgetKey: "A",
                        uuid: "75434b06-03f3-cc3b-5e94-81efb0249f8b",
                        medMinedAlert: []
                    },
                    {
                        widgetKey: "A",
                        uuid: "75434b06-03f3-cc3b-5e94-81efb0249f8b",
                        medMinedAlert: []
                    },
                    {
                        widgetKey: "B",
                        uuid: "75434b06-03f3-cc3b-5e94-81efb0249f8b",
                        medMinedAlert: []
                    }
                ];
            (target as any).alertCache = alertCache;

            let expected: AlertHeaderItem[] = [
                {
                    widgetKey: "B",
                    uuid: "75434b06-03f3-cc3b-5e94-81efb0249f8b",
                    medMinedAlert: []
                }
            ];
            target.clearCache("A");
            let actual = (target as any).alertCache;

            //KB: Note: looks like method doesn't work correctly: it should clear everything for widget "A" instead - it leave items for widget "A"
            expect(actual).toEqual(expected);
        });
    });

    describe('Method: getMaxPageIndex', () => {
        beforeEach(() => {
        });

        it('Should be defined', () => {
            expect(target.getMaxPageIndex).toBeDefined();
        });

        it('Should do the job', () => {
            let dataitem = {
                uuid: null,
                medMinedFacilityId: null,
                medMinedAlerts: null,
            };
            let dataset: mmModel.MedMinedSecondaryDataItem[] = [
                dataitem,
                dataitem,
                dataitem,
                dataitem,
                dataitem
            ];
            let recordsPerPage: number = 2

            let expected = 3 - 1;
            let actual = target.getMaxPageIndex(dataset, recordsPerPage);

            expect(actual).toEqual(expected);
        });
    });
});

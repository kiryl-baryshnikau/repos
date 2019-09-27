import { Injectable } from "@angular/core";
import { ResourceService } from "container-framework";
import { TestBed } from '@angular/core/testing';
import { MedminedTransformationService } from "../../../widgets/services/medmined-transformation.service";
import { DataFormatPipe } from "../../../widgets/pipes/mvd-data-format.pipe";
import { SortingService } from "../../../widgets/services/mvd-sorting-service";
import { FacilityLookUpService } from "../../../services/facility-look-up.service";
import { RolePermissionsValidatorService } from '../../../widgets';


class MockDataFormatPipe {
    transform(value: any, args: any): any {
        return value;
    }
}

@Injectable()
class MockSortingService {
    sortDataByField(field: any, order: number, sortingMethod: any, data: any[]) {
        return data;
    }
}

@Injectable()
class MockFacilityLookUpService {
    masterFacilityNameLookUp(nativeFacility: any, authorizationConfig: any, facilitySource: string): string {
        return "Unknown";
    }
}

@Injectable()
class MockRolePermissionsValidatorService {
    hasWriteAccess(nativeFacility: any, authorizationConfig: any, facilitySource: string): boolean {
        return true;
    }
}

describe('Service: MedminedTransformationService', () => {
    let medminedTransformationService: MedminedTransformationService;
    let resourceService: ResourceService;

    const resources = {
        app: {
            oldest: 'oldest',
            unknown: 'unknown',
            facility: 'facility',
            category: 'category',
            patientName: 'patientName',
            patientId: 'patientId',
            status: 'status',
            drug: 'drug',
            dose: 'dose',
            interval: 'interval',
            location: 'location',
            bed: 'bed',
            date: 'date'
        },
        common: {

        }
    };

    const summaries = [
        {
            "category": "Anticoagulant",
            "title": "Pulmonary embolism",
            "facility_id": 1760,
            "total_alerts": 12,
            "new_alerts": 2,
            "priorities": [
                {
                    "priority": "Low",
                    "new": 2,
                    "read": 2,
                    "pending": 2,
                    "documented": 2
                }
            ],
            "statuses": [],
            "ownership": "System",
            "updated_on": "2018-09-06T12:00:00-05:00",
            "subscriptionType": "basic"
        },
        {
            "category": "Antimicrobial",
            "title": "Infection marker without treatment",
            "facility_id": 1760,
            "total_alerts": 5,
            "new_alerts": 3,
            "priorities": [
                {
                    "priority": "Low",
                    "new": 2,
                    "read": 2,
                    "pending": 2,
                    "documented": 2
                }
            ],
            "statuses": [],
            "ownership": "System",
            "updated_on": "2018-09-06T12:00:00-05:00",
            "subscriptionType": "basic"
        },
        {
            "category": "Antimicrobial",
            "title": "H1N1",
            "facility_id": 1761,
            "total_alerts": 5,
            "new_alerts": 3,
            "priorities": [
                {
                    "priority": "Low",
                    "new": 2,
                    "read": 2,
                    "pending": 2,
                    "documented": 2
                }
            ],
            "statuses": [],
            "ownership": "User",
            "updated_on": "2018-09-06T12:00:00-05:00",
            "subscriptionType": "basic"
        }
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                MedminedTransformationService,
                { provide: DataFormatPipe, useClass: MockDataFormatPipe },
                { provide: SortingService, useClass: MockSortingService },
                { provide: FacilityLookUpService, useClass: MockFacilityLookUpService },
                { provide: RolePermissionsValidatorService, useClass: MockRolePermissionsValidatorService },
                ResourceService
            ]
        });

        resourceService = TestBed.get(ResourceService);
        resourceService.setResources(resources);
        medminedTransformationService = TestBed.get(MedminedTransformationService);
    });

    it('Should be defined', () => {
        expect(medminedTransformationService).toBeDefined();
    });

    describe('Method: dataSummaryTransform', () => {
        let dataSummary;

        beforeEach(() => {
            dataSummary = medminedTransformationService.dataSummaryTransform(summaries);
        })

        it('Should return empty array', () => {
            let result = medminedTransformationService.dataSummaryTransform([]);
            expect(result instanceof Array).toBeTruthy();
            expect(result.length === 0).toBeTruthy();

            result = medminedTransformationService.dataSummaryTransform(undefined);
            expect(result instanceof Array).toBeTruthy();
            expect(result.length === 0).toBeTruthy();
        });

        it('Should return array of two elements', () => {
            expect(dataSummary[0]).toBeDefined();
            expect(dataSummary[1]).toBeDefined();
        });

        it('Should return array of the two distinct categories in the data', () => {
            expect(dataSummary.find(d => d.category === 'Anticoagulant')).toBeDefined();
            expect(dataSummary.find(d => d.category === 'Antimicrobial')).toBeDefined();
        });

        it('Category should contain two elements', () => {
            let summary = dataSummary.find(d => d.category === 'Antimicrobial').summary;
            expect(summary).toBeDefined();
            expect(summary.data && summary.data.length === 2).toBeTruthy();
        });

        it('Category data items should contain one element with priority S and one with L', () => {
            let summaryElements = dataSummary.find(d => d.category === 'Antimicrobial').summary.data;
            expect(summaryElements.find(d => d.priority === 'S')).toBeDefined();
            expect(summaryElements.find(d => d.priority === 'L')).toBeDefined();
        });
    });

    describe('Method: alertsDetailsTransform', () => {
        let alertHeaders = [
            {
                "updated_on": new Date("2018-05-07T08:15:30-05:00"),
                "ownership": "User",
                "created_on": new Date("2018-05-05T08:15:30-05:00"),
                "drugs": [
                    {
                        "give_strength_volume_units": null,
                        "give_strength_volume": null,
                        "placer_order_number": null,
                        "mapped_route": "oral",
                        "give_rate_units": "ml/hr",
                        "stopped_on": new Date("2018-05-07T08:15:30-05:00"),
                        "give_strength": 50,
                        "drug": "Warfarin 5 mg Tab (Coumadin GEq)",
                        "give_per": null,
                        "route": "PO",
                        "started_on": new Date("2018-05-05T08:15:30-05:00"),
                        "give_strength_units": "mg",
                        "prescription_number": "15951978",
                        "days": 2,
                        "give_rate_amount": 1
                    }
                ],
                "patient": {
                    "bed": "101",
                    "account_number": "46561954",
                    "born_on": "1950-01-01",
                    "name": "Maxwell, Vernon",
                    "mrn": "789456",
                    "location": "ICU"
                },
                "alert_id": 100,
                "facility_id": 1760,
                "priority": "High",
                "status": "New",
                "subscription_type": "basic"
            },
            {
                "updated_on": new Date("2018-05-07T08:15:30-05:00"),
                "ownership": "User",
                "created_on": new Date("2018-05-05T08:15:30-05:00"),
                "drugs": [
                    {
                        "give_strength_volume_units": null,
                        "give_strength_volume": null,
                        "placer_order_number": null,
                        "mapped_route": "oral",
                        "give_rate_units": "ml/hr",
                        "stopped_on": new Date("2018-10-27T08:15:30-05:00"),
                        "give_strength": 500,
                        "drug": "Epinephrine 5 ml Sol",
                        "give_per": null,
                        "route": "PO",
                        "started_on": new Date("2018-10-25T09:15:30-05:00"),
                        "give_strength_units": "mg",
                        "prescription_number": "15951978",
                        "days": 2,
                        "give_rate_amount": 5
                    }
                ],
                "patient": {
                    "bed": "302",
                    "account_number": "86567354",
                    "born_on": "1950-01-01",
                    "name": "Power, Max",
                    "mrn": "789456",
                    "location": "FLOOR"
                },
                "alert_id": 101,
                "facility_id": 388,
                "priority": "Low",
                "status": "New",
                "subscription_type": "basic"
            }
        ]

        let alertsDetailsResult;

        beforeEach(() => {
            alertsDetailsResult = medminedTransformationService.alertsDetailsTransform(alertHeaders, 'Antimicrobial', { authorizationConfig: [], userPreferences: { } });
        })

        it('Should return empty array', () => {
            let result = medminedTransformationService.alertsDetailsTransform([], '', undefined);
            expect(result instanceof Array).toBeTruthy();
            expect(result.length === 0).toBeTruthy();

            result = medminedTransformationService.alertsDetailsTransform(undefined, undefined, undefined);
            expect(result instanceof Array).toBeTruthy();
            expect(result.length === 0).toBeTruthy();
        });

        it('Should contain two elements', () => {
            expect(alertsDetailsResult).toBeDefined();
            expect(alertsDetailsResult.length === 2).toBeTruthy();
        });

        it('Should contain a drug', () => {
            expect(alertsDetailsResult[0].drug && alertsDetailsResult[0].drug.length > 0).toBeTruthy();
        });

        it('Dose should be formatted', () => {
            expect(alertsDetailsResult.find(d => d.patientId === '789456').dose === '50 mg').toBeTruthy();
        });

        it('Interval should be formatted', () => {
            expect(alertsDetailsResult.find(d => d.patientId === '789456').interval === '1 ml/hr').toBeTruthy();
        });
    });


    describe('Method: getAlertsSubscriptions', () => {
        let subscriptions = [
            {
                "subscriptions": [
                    {
                        "category": "Anticoagulation",
                        "title": "High INR and Warfarin",
                        "status": "Enabled"
                    },
                    {
                        "category": "Antimicrobial",
                        "title": "Type Mismatch",
                        "status": "Enabled"
                    },
                    {
                        "category": "Antimicrobial",
                        "title": "Pathogen",
                        "status": "Enabled"
                    },
                    {
                        "category": "Anticoagulation",
                        "title": "INR and Vitamin K",
                        "status": "Disabled"
                    }
                ],
                "facility_id": "788"
            },
            {
                "subscriptions": [
                    {
                        "category": "Anticoagulation",
                        "title": "High INR and Warfarin",
                        "status": "Enabled"
                    },
                    {
                        "category": "Antimicrobial",
                        "title": "Type Mismatch",
                        "status": "Enabled"
                    },
                    {
                        "category": "Antimicrobial",
                        "title": "Pathogen",
                        "status": "Enabled"
                    },
                    {
                        "category": "Anticoagulation",
                        "title": "INR and Vitamin K",
                        "status": "Disabled"
                    }
                ],
                "facility_id": "1760"
            }
        ];

        let resultsSubscriptions;

        beforeEach(() => {
            resultsSubscriptions = medminedTransformationService.getAlertsSubscriptions(subscriptions);
        })

        it('Should return empty object', () => {
            let result = medminedTransformationService.getAlertsSubscriptions([]);
            expect(result).toBeDefined();
            expect(result.hasOwnProperty('subscribedAlerts') && result.hasOwnProperty('unsubscribedAlerts')).toBeTruthy();

            result = medminedTransformationService.getAlertsSubscriptions(undefined);
            expect(result).toBeDefined();
            expect(result.hasOwnProperty('subscribedAlerts') && result.hasOwnProperty('unsubscribedAlerts')).toBeTruthy();
        });

        it('Should return 3 alert subscribed and 1 unsubscribed', () => {
            expect(resultsSubscriptions).toBeDefined();
            expect(resultsSubscriptions.hasOwnProperty('subscribedAlerts') && resultsSubscriptions.hasOwnProperty('unsubscribedAlerts')).toBeTruthy();
            expect(resultsSubscriptions.subscribedAlerts.length === 3 && resultsSubscriptions.unsubscribedAlerts.length === 1).toBeTruthy();
        });
    });
});

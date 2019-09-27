import {MvdFacilitySelectionTransformService} from '../mvd-facility-selection-transformation.service';
import {MockService} from '../../shared/mock-service';
import {ResourceService} from 'container-framework';
import {FacilityFilter, UnitFilter} from '../../medview/configuration/medview-facility-selection/facility-selection.models';
import {TreeNode} from 'primeng/primeng';

describe('Service: MvdFacilitySelectionTransformService', function () {
    let resourceService: ResourceService;
    let service: MvdFacilitySelectionTransformService;
    const facilityMappings = [
        {
            masterId: '3',
            masterName: 'Wesley Medical Center 99',
            native: 'WMCInfusion'
        },
        {
            masterId: '15',
            masterName: 'Test facility',
            native: 'HSVFacility1',
        }
    ];

    beforeEach(() => {
        resourceService = new ResourceService();
        resourceService.setResources(new MockService().getResources());
        service = new MvdFacilitySelectionTransformService(resourceService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('Tree creation', function () {

        it('Should create tree nodes', () => {
            const facilityInfo = [
                {
                    adtFacility: 'HSVFacility1', facilityId: 'MVDSM42Srv1', units: [
                        {
                            patientCareUnit: 'SICU1', patients: [
                                {
                                    adtPatientId: 'P1',
                                    dischargeDate: null,
                                    firstName: 'P1FirstN',
                                    infusionContainerKey: 186,
                                    lastName: 'P1LastN',
                                    middleName: 'M',
                                    patientId: 'P1',
                                    patientName: 'P1LastN, P1FirstN M'
                                },
                                {
                                    adtPatientId: 'P2',
                                    dischargeDate: null,
                                    firstName: 'P2FirstN',
                                    infusionContainerKey: 214,
                                    lastName: 'P2LastN',
                                    middleName: 'M',
                                    patientId: 'P2',
                                    patientName: 'P2LastN, P2FirstN M'
                                },
                                {
                                    adtPatientId: 'RFRPt2',
                                    dischargeDate: null,
                                    firstName: 'RFRPt2FirstN',
                                    infusionContainerKey: 237,
                                    lastName: 'RFRPt2LastN',
                                    middleName: 'M',
                                    patientId: 'RFRPt2',
                                    patientName: 'RFRPt2LastN, RFRPt2FirstN M'
                                }
                            ]
                        },
                        {
                            patientCareUnit: 'ICU1', patients: [
                                {
                                    adtPatientId: 'P3',
                                    dischargeDate: null,
                                    firstName: 'P3FirstN',
                                    infusionContainerKey: 188,
                                    lastName: 'P3LastN',
                                    middleName: 'M',
                                    patientId: 'P3',
                                    patientName: 'P3LastN, P3FirstN M'
                                }
                            ]
                        }
                    ]
                },
                {
                    adtFacility: 'WMCInfusion', facilityId: 'MVDSM42Srv1', units: [
                        {
                            patientCareUnit: '', patients: [
                                {
                                    adtPatientId: 'WESDIPat4',
                                    dischargeDate: null,
                                    firstName: 'Michael',
                                    infusionContainerKey: 204,
                                    lastName: 'APatient4',
                                    middleName: 'M',
                                    patientId: 'WESDIPAT4',
                                    patientName: 'APatient4, Michael M'
                                }
                            ]
                        }
                    ]
                }
            ];
            expect(service.getTree(facilityInfo, facilityMappings)).toBeDefined();
        });
    });

    describe('Facility management', function () {
        it('Should display master facility name', () => {
            const expected = 'Wesley Medical Center 99';
            const key = 'WMCInfusion';

            expect(expected).toEqual(service.getMasterFacilityName(facilityMappings, key));
        });

        it('Should create an orphan facility', () => {
            const facilityFilter: FacilityFilter = {facilityId: 'abc', units: []};
            const expected: TreeNode = {
                children: [],
                data: {adtFacility: 'abc', facilityId: undefined, units: []},
                label: 'abc',
                leaf: true,
                type: 'orphan',
            };
            expect(expected).toEqual(service.createNewOrphanFacility(facilityFilter));
        });

        it('Should create an orphan unit', () => {
            const unitFilter: UnitFilter = {unitId: 'abc', patients: []};
            const expected: TreeNode = {
                icon: '',
                label: 'abc',
                leaf: true,
                parent: undefined,
                type: 'orphan',
                children: [],
                data: {patientCareUnit: 'abc', patients: []}
            };
            expect(expected).toEqual(service.createNewOrphanUnit(unitFilter));
        });
    });
});

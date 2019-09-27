import {FacilityManagementTransformationService} from '../mvd-facility-management-transformation.service';
import {MockService} from '../../shared/mock-service';
import {ResourceService} from 'container-framework';

describe('Service: FacilityManagementTransformationService', function () {
    let resourceService: ResourceService;
    let service: FacilityManagementTransformationService;

    beforeEach(() => {
        resourceService = new ResourceService();
        resourceService.setResources(new MockService().getResources());
        service = new FacilityManagementTransformationService(resourceService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('Should transform the facility', () => {
        const inputData = {
            children: null, id: 3, name: 'Wesley Medical Center 99', parent: null, parentId: 1, synonyms: [
                {
                    element: null,
                    elementId: 3,
                    id: 16,
                    key: 'cfa25f10d637e1118ebd0050568737d4',
                    name: 'Wesley Medical Center Dispensing Native Facility',
                    providerId: 5,
                    provider: {name: 'Dispensing'}
                },
                {
                    element: null,
                    elementId: 3,
                    id: 17,
                    key: 'WMCInfusion',
                    name: 'Wesley Medical Center Infusion Native facility',
                    providerId: 7,
                    provider: {name: 'Infusion'}
                }
            ]
        };

        const sources = [
            {checked: true, id: 5, name: 'Pyxis ES Data', value: 'Dispensing'},
            {checked: true, id: 7, name: 'Alaris Data', value: 'Infusion'}
        ];

        const expected = {
            dataSources: [
                {
                    elementId: 3,
                    facilityId: 'cfa25f10d637e1118ebd0050568737d4',
                    name: 'Wesley Medical Center Dispensing Native Facility',
                    providerId: 5,
                    source: '##provider_dispensing##',
                    sourceValue: 'Dispensing',
                    synonymId: 16,
                },
                {
                    elementId: 3,
                    facilityId: 'WMCInfusion',
                    name: 'Wesley Medical Center Infusion Native facility',
                    providerId: 7,
                    source: '##provider_infusion##',
                    sourceValue: 'Infusion',
                    synonymId: 17,
                }],
            id: 3,
            masterFacilityName: 'Wesley Medical Center 99'
        };

        expect(expected).toEqual(service.transform(inputData, sources));
    });

    it('Should display the formatted provider name', () => {
        const input = 'abc';
        const expected = '##provider_abc##';

        expect(expected).toEqual(service.getProviderDisplayName(input));
    });
});

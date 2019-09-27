import {DispensingFacilityKeyTranslatorService} from '../mvd-dispensing-facility-key-translator.service';
import {FacilityLookUpService} from '../../../services/facility-look-up.service';
import {MockService} from '../../shared/mock-service';
import {ResourceService} from 'container-framework';

describe('Service: DispensingFacilityKeyTranslatorService', function () {
    let facilityLookUpService: FacilityLookUpService;
    let resourceService: ResourceService;
    let service: DispensingFacilityKeyTranslatorService;

    beforeEach(() => {
        resourceService = new ResourceService();
        resourceService.setResources(new MockService().getResources());
        facilityLookUpService = new FacilityLookUpService(resourceService);
        service = new DispensingFacilityKeyTranslatorService(facilityLookUpService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('Should get the facilities key', () => {
        const inputData = [
            { id: '3', selected: true},
            {id: 'VeraFacility3', selected: true},
            {id: '$ecureC0reF@cility C%$#$%ID123', selected: false}
        ];

        const authConfig = [
            {
                id: '3', name: 'Wesley Medical Center 99', parentId: 1, synonyms: [
                    {
                        id: 'cfa25f10d637e1118ebd0050568737d4',
                        name: 'Wesley Medical Center Dispensing Native Facility',
                        source: 'Dispensing',
                        type: 'Facility'
                    },
                    {
                        id: 'WMCInfusion',
                        name: 'Wesley Medical Center Infusion Native facility',
                        source: 'Infusion',
                        type: 'Facility'
                    },
                    {
                        id: '3',
                        name: 'Wesley Medical Center 99',
                        source: 'BD.MedView.Facility',
                        type: 'Facility'
                    }
                ]
            },
            {
                id: '5', name: 'VeraFacility3', parentId: 1, synonyms: [
                    {
                        id: 'VeraFacility3',
                        name: 'VeraFacility3',
                        source: 'Infusion',
                        type: 'Facility'
                    },
                    {
                        id: '5',
                        name: 'VeraFacility3',
                        source: 'BD.MedView.Facility',
                        type: 'Facility'
                    }
                ]
            }
        ];
        // Now the system uses Id instead of name
        const expected = ['cfa25f10d637e1118ebd0050568737d4'];
        let results = service.translateFacilityKeys(inputData, authConfig);
        expect(expected).toEqual(results);
    });
});

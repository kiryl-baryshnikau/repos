import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';

import { ResourceService } from 'container-framework';
import {
    AttentionNoticesTransformationService
} from '../../../widgets/medview/attention-notices/shared/mvd-attention-notices-transformation.service';
import { DispensingDataTransformationService } from '../../../widgets/services/mvd-dispensing-data-transformation-service';

describe('AttentionNoticesTransformationService', () => {
    let service: AttentionNoticesTransformationService;
    let httpMock: HttpTestingController;

    let transformationServiceSpy: jasmine.SpyObj<DispensingDataTransformationService>;
    let resourceServiceSpy: jasmine.SpyObj<ResourceService>;

    beforeEach(() => {
        const _transformationServiceSpy: jasmine.SpyObj<DispensingDataTransformationService> = jasmine.createSpyObj(['getDurationDisplay']);
        const _resourceServiceSpy: jasmine.SpyObj<ResourceService> = jasmine.createSpyObj(['resource']);

        _resourceServiceSpy.resource.and.callFake(id => `#${id}`);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                AttentionNoticesTransformationService,
                { provide: DispensingDataTransformationService, useValue: _transformationServiceSpy },
                { provide: ResourceService, useValue: _resourceServiceSpy }
            ]
        });

        service = TestBed.get(AttentionNoticesTransformationService);
        httpMock = TestBed.get(HttpTestingController);
        transformationServiceSpy = TestBed.get(DispensingDataTransformationService);
        resourceServiceSpy = TestBed.get(ResourceService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('transform', () => {
        it('should return null if data is undefined', () => {
            const res = service.transform(undefined, false);
            expect(res).toBe(null);
        });

        it('should map input data to an MvdListData array', () => {
            transformationServiceSpy.getDurationDisplay.and.returnValue('durationDisplay');
            const item = {
                'facilityKey': '8b3af4b6d36ee611aefc00505600844b',
                'facilityName': null,
                'noticeTypeInternalCode': 'CRITLOW',
                'noticeTypeDescription': 'Stock critical low',
                'noticeSeverityInternalCode': 'L',
                'locked': false,
                'noticeCount': 8,
                'oldestNoticeDuration': 38813
            };
            const rawData = [item];
            const expectedTransformationData = {
                options: {displayIcons: true, showAnimations: true, showBorder: false},
                data: [{
                    key: 'CRITLOW',
                    priority: 'L',
                    counter: 8,
                    title: 'Stock critical low',
                    label: '#oldest',
                    value: 'durationDisplay',
                    blinkingRow: undefined,
                    originalItem: item,
                    critical: false
                }]
            };
            const res = service.transform(rawData, false);

            expect(res).toEqual(expectedTransformationData);
        });
    });
});

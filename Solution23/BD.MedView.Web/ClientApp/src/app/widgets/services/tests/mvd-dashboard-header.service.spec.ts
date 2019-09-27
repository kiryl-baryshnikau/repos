import { DashboardHeaderService } from '../mvd-dashboard-header.service';
import { ContextService, ResourceService, ContextConstants } from 'container-framework';
import { FacilityLookUpService } from '../../../services/facility-look-up.service';
import { TestBed } from '@angular/core/testing';
import { MvdConstants } from '../../../widgets/shared/mvd-constants';

describe('Service: DashboardHeaderService', () => {
    const appCode = 'testAppCode';
    const inputData = {
        authorizationConfig: [
            { id: 1, name: 'BD.MedView.Authorization', parentId: null, permissions: Array(2), synonyms: Array(0) },
            { id: 2, name: 'VeraFacility1', parentId: 1, permissions: Array(8), synonyms: Array(2) },
            { id: 3, name: 'Wesley Medical Center 99', parentId: 1, permissions: Array(8), synonyms: Array(3) },
            { id: 4, name: 'VeraFacility2', parentId: 1, permissions: Array(8), synonyms: Array(2) },
            { id: 5, name: 'VeraFacility3', parentId: 1, permissions: Array(8), synonyms: Array(2) },
            { id: 8, name: '$ecureC0reF@cility', parentId: 1, permissions: Array(6), synonyms: Array(1) },
            { id: 10, name: '$ecureC0reF@cility C%$#$%ID123', parentId: 1, permissions: Array(2), synonyms: Array(1) },
            { id: 11, name: 'Test Facility2', parentId: 1, permissions: Array(6), synonyms: Array(1) },
            { id: 14, name: 'MasterFacility1 edited', parentId: 1, permissions: Array(2), synonyms: Array(2) },
            { id: 15, name: 'Test facility', parentId: 1, permissions: Array(11), synonyms: Array(3) },
        ],
        userPreferences: {
            id: 1,
            maskData: true,
            sessionTimeout: 1200,
            user: 'User8',
            facilities: [
                { id: '00000000000000000000000000000000', selected: true, widgets: Array(8), units: Array(0) },
                { id: '2', selected: false, widgets: Array(5), units: Array(0) },
                { id: '3', selected: false, widgets: Array(5), units: Array(0) }
            ]
        }
    };


    let service: DashboardHeaderService;
    let contextServiceSpy: jasmine.SpyObj<ContextService>;
    let facilityLookUpServiceSpy: jasmine.SpyObj<FacilityLookUpService>;
    let resourceServiceSpy: jasmine.SpyObj<ResourceService>;

    beforeEach(() => {
        const _contextServiceSpy: jasmine.SpyObj<ContextService> = jasmine.createSpyObj(['addOrUpdate']);
        const _facilityLookUpService: jasmine.SpyObj<FacilityLookUpService> = jasmine.createSpyObj(['getFacilityName']);
        const _resourceServiceSpy: jasmine.SpyObj<ResourceService> = jasmine.createSpyObj(['resource']);

        _resourceServiceSpy.resource.and.callFake(id => `#${id}`);

        TestBed.configureTestingModule({
            providers: [
                DashboardHeaderService,
                { provide: ContextService, useValue: _contextServiceSpy },
                { provide: FacilityLookUpService, useValue: _facilityLookUpService },
                { provide: ResourceService, useValue: _resourceServiceSpy },
            ]
        });

        service = TestBed.get(DashboardHeaderService);
        contextServiceSpy = TestBed.get(ContextService);
        facilityLookUpServiceSpy = TestBed.get(FacilityLookUpService);
        resourceServiceSpy = TestBed.get(ResourceService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('cleanHeader', () => {
        it('should call ContextService.addOrUpdate method to set title to empty string', () => {
            contextServiceSpy.addOrUpdate.and.callFake(() => { });
            service.cleanHeader(appCode);
            expect(contextServiceSpy.addOrUpdate.calls.count()).toEqual(2);
            expect(contextServiceSpy.addOrUpdate).toHaveBeenCalledWith(appCode, ContextConstants.DASHBOARD_TITLE, '');
        });
        it('should call ContextService.addOrUpdate method to set tooltip to empty string', () => {
            contextServiceSpy.addOrUpdate.and.callFake(() => { });
            service.cleanHeader(appCode);
            expect(contextServiceSpy.addOrUpdate.calls.count()).toEqual(2);
            expect(contextServiceSpy.addOrUpdate).toHaveBeenCalledWith(appCode, ContextConstants.DASHBOARD_TITLE_TOOLTIP, '');
        });
    });

    describe('updateHeader', () => {
        it('should not update header if appCode is not provided', () => {
            service.updateHeader(null, {});
            expect(contextServiceSpy.addOrUpdate).toHaveBeenCalledTimes(0);
        });

        it('should not update header if preferences are not provided', () => {
            service.updateHeader(appCode, null);
            expect(contextServiceSpy.addOrUpdate).toHaveBeenCalledTimes(0);
        });

        it('should set title to "All Facilities" (localizable) if all facilities is selected', () => {
            service.updateHeader(appCode, inputData);
            expect(contextServiceSpy.addOrUpdate).toHaveBeenCalledWith(appCode, ContextConstants.DASHBOARD_TITLE, '#allFacilities');
        });

        it('should set tooltip to an empty string when all facilities is selected', () => {
            service.updateHeader(appCode, inputData);
            expect(contextServiceSpy.addOrUpdate).toHaveBeenCalledWith(appCode, ContextConstants.DASHBOARD_TITLE_TOOLTIP, '');
        });

        it('should set title to facility name when single facility is selected', () => {
            const facilities = [
                { selected: false, id: MvdConstants.ALL_FACILITIES_KEY },
                { selected: true, id: '1' },
                { selected: false, id: '2' }
            ];
            const preferences = { userPreferences: { facilities: facilities } };
            facilityLookUpServiceSpy.getFacilityName.and.returnValue('facilityName');

            service.updateHeader(appCode, preferences);
            expect(contextServiceSpy.addOrUpdate).toHaveBeenCalledWith(appCode, ContextConstants.DASHBOARD_TITLE, 'facilityName');
        });

        it('should set header tooltip to an empty string when single facility is selected', () => {
            const facilities = [
                { selected: false, id: MvdConstants.ALL_FACILITIES_KEY },
                { selected: true, id: '1' },
                { selected: false, id: '2' }
            ];
            const preferences = { userPreferences: { facilities: facilities } };
            facilityLookUpServiceSpy.getFacilityName.and.returnValue('facilityName');

            service.updateHeader(appCode, preferences);
            expect(contextServiceSpy.addOrUpdate).toHaveBeenCalledWith(appCode, ContextConstants.DASHBOARD_TITLE_TOOLTIP, '');
        });
    });
});

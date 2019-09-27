import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import * as _ from 'lodash';

import { ApplicationPortletSettingsService } from 'container-framework';
import { MvdCfwConfigurationService } from '../mvd-cfw-configuration.service';
import { of } from 'rxjs';

describe('MvdCfwConfigurationService', () => {
    const expectedAppCodes: string[] = ['MedView', 'MedViewPriorities', 'MedViewDeliveryTracking', 'MedViewIVPrep'];

    const responseSingle = [{
        'id': 1070,
        'appCode': 'MedViewDeliveryTracking',
        'widgetName': 'medViewDeliveryTracking',
        'key': 'RefreshRate',
        'value': '899',
        'defaultValue': '300'
    }];

    const responseMultiple = [
        {
            'id': 1063,
            'appCode': 'MedViewPriorities',
            'widgetName': 'medViewAttentionNotices',
            'key': 'RefreshRate',
            'value': '899',
            'defaultValue': '300'
        },
        {
            'id': 1064,
            'appCode': 'MedViewPriorities',
            'widgetName': 'mvdAttentionNoticesDetail',
            'key': 'RefreshRate',
            'value': '899',
            'defaultValue': '300'
        },
        {
            'id': 1065,
            'appCode': 'MedViewPriorities',
            'widgetName': 'medViewContinuousInfusion',
            'key': 'RefreshRate',
            'value': '899',
            'defaultValue': '300'
        },
        {
            'id': 1066,
            'appCode': 'MedViewPriorities',
            'widgetName': 'medViewContinuousInfusion',
            'key': 'RefreshRate',
            'value': '899',
            'defaultValue': '300'
        },
        {
            'id': 1067,
            'appCode': 'MedViewPriorities',
            'widgetName': 'medViewDoseRequest',
            'key': 'RefreshRate',
            'value': '899',
            'defaultValue': '300'
        },
        {
            'id': 1068,
            'appCode': 'MedViewPriorities',
            'widgetName': 'mvdDoseRequestDetailComponent',
            'key': 'RefreshRate',
            'value': '899',
            'defaultValue': '300'
        },
        {
            'id': 1072,
            'appCode': 'MedViewPriorities',
            'widgetName': 'medViewCriticalAlerts',
            'key': 'RefreshRate',
            'value': '899',
            'defaultValue': '300'
        }
    ]
    let service: MvdCfwConfigurationService;
    let httpMock: HttpTestingController;

    let applicationPortletSettingsServiceSpy: jasmine.SpyObj<ApplicationPortletSettingsService>;

    beforeEach(() => {
        const _applicationPortletSettingsServiceSpy = jasmine.createSpyObj(['getSettings', 'updateSettings']);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                MvdCfwConfigurationService,
                { provide: ApplicationPortletSettingsService, useValue: _applicationPortletSettingsServiceSpy }
            ]
        });

        service = TestBed.get(MvdCfwConfigurationService);
        httpMock = TestBed.get(HttpTestingController);
        applicationPortletSettingsServiceSpy = TestBed.get(ApplicationPortletSettingsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getRefreshRate', () => {
        it('should create a request to getSettings method per application code', () => {
            applicationPortletSettingsServiceSpy.getSettings.and.returnValue(of(responseSingle));
            service.getRefreshRate().subscribe();
            expect(applicationPortletSettingsServiceSpy.getSettings.calls.count()).toEqual(expectedAppCodes.length);
            for (let i = 0; i < expectedAppCodes.length; i++) {
                const appCode = expectedAppCodes[i];
                expect(applicationPortletSettingsServiceSpy.getSettings.calls.argsFor(i)[0]).toEqual(appCode);
            }
        });

        it('should return refresh rate value', (done) => {
            applicationPortletSettingsServiceSpy.getSettings.and.returnValue(of(responseMultiple));
            service.getRefreshRate().subscribe(value => {
                expect(value).toEqual(899);
                done();
            });
        });
    });

    describe('saveRefreshRate', () => {
        it('should create a request to updateSettings method per application code', () => {
            applicationPortletSettingsServiceSpy.updateSettings.and.returnValue(of());
            service.saveRefreshRate(10).subscribe();
            expect(applicationPortletSettingsServiceSpy.updateSettings.calls.count()).toEqual(expectedAppCodes.length);
            for (let i = 0; i < expectedAppCodes.length; i++) {
                const appCode = expectedAppCodes[i];
                expect(applicationPortletSettingsServiceSpy.updateSettings.calls.argsFor(i)[0].appCode).toEqual(appCode);
            }
        });
    });
});

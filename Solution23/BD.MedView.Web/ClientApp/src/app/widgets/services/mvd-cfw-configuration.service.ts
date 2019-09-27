import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApplicationPortletSettingsService, ApplicationPortletSettingUpdate, ApplicationPortletSetting } from 'container-framework';

@Injectable()
export class MvdCfwConfigurationService {
    private applicationCodes: string[] = [ 'MedView', 'MedViewPriorities', 'MedViewDeliveryTracking', 'MedViewIVPrep' ];
    private refreshRateSettingKey = 'RefreshRate';

    constructor(private settingsService: ApplicationPortletSettingsService) {
    }

    public getRefreshRate(): Observable<number> {
        const observableSettings$: Observable<ApplicationPortletSetting[]>[] = this.applicationCodes.map( (appCode) => {
            return this.settingsService.getSettings(appCode, '', this.refreshRateSettingKey);
        });

        return forkJoin(observableSettings$)
            .pipe(
                map((settingsResponse: ApplicationPortletSetting[][]) => {
                    return settingsResponse
                        .map(y => this.getRefreshRateFromAppPortletSettingArray(y))
                        .find(refreshRate => refreshRate != null && refreshRate !== undefined);
                })
            );
    }

    public saveRefreshRate(refreshRate: number): Observable<ApplicationPortletSetting[][]> {
        const observableSettings$: Observable<ApplicationPortletSetting[]>[] = this.applicationCodes.map( (appCode) => {
            return this.settingsService
                .updateSettings(this.getUpdateSettingRequestObj(appCode, this.refreshRateSettingKey, (refreshRate || '0').toString()));
        });

        return forkJoin(observableSettings$);
    }

    private getRefreshRateFromAppPortletSettingArray(portletSettings: ApplicationPortletSetting[]): number {
        return portletSettings
                .filter(setting => (setting.key || '').toUpperCase() === this.refreshRateSettingKey.toUpperCase())
                .map(setting => Number(setting.value))
                .find(x => x != null && x !== undefined) ;
    }

    private getUpdateSettingRequestObj(appCode: string, settingKey: string, value: string): ApplicationPortletSettingUpdate {
        const updateRequest: ApplicationPortletSettingUpdate = {
            appCode: appCode,
            settingKey: settingKey,
            value: value
        };

        return updateRequest;
    }
}

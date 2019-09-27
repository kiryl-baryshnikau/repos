import { Injectable } from '@angular/core';
import * as models from '../../../shared/mvd-models';

import { ResourceService } from 'container-framework';
import { ConfigurationService } from '../../../services/mvd-configuration-service';

@Injectable()
export class AttentionNoticesConfigurationService {
    private widgetConfigKey: string = "attentionNoticesUserSettings";

    constructor(private resourcesService: ResourceService,
        private sessionStorageService: ConfigurationService) {
    }

    getConfiguration(code: string, defaulSortColumn: string = null): any {
        let columnsConfig: models.ColumnOption[] = [];
        let userSettings = this.sessionStorageService.getConfiguration(this.widgetConfigKey);
        if (!userSettings || userSettings.internalCode !== code) {
            userSettings = {
                columns: columnsConfig,
                options: { sorting: { "field": defaulSortColumn || "noticeDuration", "order": 1 }, pagination: '' },
                filters: {},
                internalCode: code
            };
        }
        this.setUserConfiguration(userSettings);
        return userSettings;
    }

    setSortingOptions(sorting: any, code: string) {
        let userSettings = this.getConfiguration(code);
        if (userSettings) {
            userSettings.options.sorting = sorting;
            this.setUserConfiguration(userSettings);
        }
    }

    setColumnConfiguration(columns: any, code: string, defaulSortColumn: string = null) {
        let userSettings = this.getConfiguration(code, defaulSortColumn);
        if (userSettings) {
            userSettings.columns = columns;
            this.setUserConfiguration(userSettings);
        }
    }

    setUserConfiguration(value: any) {
        this.sessionStorageService.setUserConfiguration(value, this.widgetConfigKey);
    }

    setWidgetOptions(optionsConfig: any, code: string) {
        let userConfiguration = this.getConfiguration(code);
        if (userConfiguration.options) {
            userConfiguration.options.sorting = optionsConfig.sorting
                ? optionsConfig.sorting
                : userConfiguration.options.sorting;
            userConfiguration.options.pagination = optionsConfig.pagination
                ? optionsConfig.pagination
                : userConfiguration.options.pagination;
            this.setUserConfiguration(userConfiguration);
        }
    }
}

import { Injectable } from '@angular/core';
import { ResourceService } from 'container-framework';

import { ConfigurationService } from '../../services/mvd-configuration-service';
import * as models from '../../shared/mvd-models';

@Injectable()
export class ContinuousInfusionsConfigurationService {


    private widgetConfigKey = 'continuousInfusionUserSettings';

    constructor(private sessionStorageService: ConfigurationService,
        private resourcesService: ResourceService) {
    }

    getConfiguration(): { columns: models.ColumnOption[], timeFrameFilter: models.IvPrepTimeFrameFilter} {
        let userSettings = this.sessionStorageService.getConfiguration(this.widgetConfigKey);
        if (!userSettings) {
            const columnConfig = this.buildConfiguration();
            userSettings = {
                columns: columnConfig,
                timeFrameFilter: {
                    futureOptionValue: 8,
                    pastOptionValue: 8
                } as models.IvPrepTimeFrameFilter
             };
            this.setUserConfiguration(userSettings);
        }
        return userSettings;
    }

    setFilterColumnConfiguration(options: any[], userConfiguration: any) {
        if (userConfiguration) {
            options.forEach((option: any) => {
                const config = userConfiguration.columns.find((con: any) => con.field === option.field);
                if (config) {
                    config.filterOptions = option.filterOptions;
                }
            });
            this.setUserConfiguration(userConfiguration);
        }
    }

    setUserConfiguration(value: any) {
        this.sessionStorageService.setUserConfiguration(value, this.widgetConfigKey);
    }

    private buildConfiguration() {
        const columnsConfig = <models.ColumnOption[]>([
            {
                colIndex: 0,
                header: this.resourcesService.resource('facility'),
                field: 'masterFacility',
                hideOptions: { enabled: false, visible: true } as models.HideOption,
                sortOptions: { enabled: 'custom', method: 'localeSensitive' } as models.SortOption,
                filterOptions: { enabled: true, allChecked: true, criteria: [] } as models.FilterOption
            },
            {
                colIndex: 1,
                header: this.resourcesService.resource('columnDataUnit'),
                field: 'unitMasterFacility',
                hideOptions: { enabled: false, visible: true } as models.HideOption,
                sortOptions: { enabled: 'custom', method: 'localeSensitive' } as models.SortOption,
                filterOptions: { enabled: true, allChecked: true, criteria: [] } as models.FilterOption
            },
            {
                colIndex: 2,
                header: this.resourcesService.resource('infusionName'),
                field: 'infusionName',
                hideOptions: { enabled: false, visible: true } as models.HideOption,
                sortOptions: { enabled: 'custom', method: 'localeSensitive' } as models.SortOption,
                filterOptions: { enabled: true, allChecked: true, criteria: [] } as models.FilterOption
            },
            {
                colIndex: 3,
                header: this.resourcesService.resource('infusionStatus'),
                field: 'containerStatusLabel',
                hideOptions: { enabled: false, visible: true } as models.HideOption,
                sortOptions: { enabled: 'custom', method: 'localeSensitive' } as models.SortOption,
                filterOptions: { enabled: true, allChecked: true, criteria: [] } as models.FilterOption
            }
        ]);
        return columnsConfig;
    }
}

import { Injectable } from '@angular/core';
import * as models from '../../../shared/mvd-models';

import { ResourceService } from 'container-framework';
import { ConfigurationService } from '../../../services/mvd-configuration-service';

@Injectable()
export class DoseRequestDetailConfigurationService {

    private widgetConfigKey: string = "doseRequestDetailUserSettings";

    constructor(private resourcesService: ResourceService,
        private sessionStorageService: ConfigurationService) {
    }

    getConfiguration(): any {
        let columnsConfig: models.ColumnOption[] = [];
        let userSettings = this.sessionStorageService.getConfiguration(this.widgetConfigKey);
        if (!userSettings) {
            columnsConfig = this.buildConfiguration();
            userSettings = {
                columns: columnsConfig,
                options: { sorting: { field: 'newRequest', order: -1 }, pagination: '' }
            };
        }
        this.setUserConfiguration(userSettings);
        return userSettings;
    }

    setUserConfiguration(value: any) {
        this.sessionStorageService.setUserConfiguration(value, this.widgetConfigKey);
    }

    setWidgetOptions(optionsConfig: any) {
        let userConfiguration = this.getConfiguration();
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

    buildConfiguration(): models.ColumnOption[] {
        let columnsConfig = <models.ColumnOption[]>([
            {
                colIndex: 0,
                header: this.resourcesService.resource('columnNew'),
                field: 'newRequest',
                hideOptions: { enabled: false, visible: true } as models.HideOption,
                sortOptions: { enabled: 'custom', method: 'boolean' } as models.SortOption,
                filterOptions: { enabled: false, allChecked: true, criteria: [] } as models.FilterOption
            },
            {
                colIndex: 0,
                header: this.resourcesService.resource('columnOrderNumber'),
                field: 'orderNumber',
                hideOptions: { enabled: false, visible: true } as models.HideOption,
                sortOptions: { enabled: 'custom', method: 'localeSensitive' } as models.SortOption,
                filterOptions: { enabled: false, allChecked: true, criteria: [] } as models.FilterOption
            },
            {
                colIndex: 0,
                header: this.resourcesService.resource('columnDoseRequest'),
                field: 'medDisplayName',
                hideOptions: { enabled: false, visible: true } as models.HideOption,
                sortOptions: { enabled: 'custom', method: 'localeSensitive' } as models.SortOption,
                filterOptions: { enabled: false, allChecked: true, criteria: [] } as models.FilterOption
            },
            {
                colIndex: 0,
                header: this.resourcesService.resource('columnRequestedBy'),
                field: 'requestedBy',
                hideOptions: { enabled: false, visible: true } as models.HideOption,
                sortOptions: { enabled: 'custom', method: 'localeSensitive' } as models.SortOption,
                filterOptions: { enabled: false, allChecked: true, criteria: [] } as models.FilterOption
            },
            {
                colIndex: 0,
                header: this.resourcesService.resource('columnAge'),
                field: 'requestDuration',
                hideOptions: { enabled: false, visible: true } as models.HideOption,
                sortOptions: { enabled: 'custom', method: 'numeric' } as models.SortOption,
                filterOptions: { enabled: false, allChecked: true, criteria: [] } as models.FilterOption
            },
            {
                colIndex: 0,
                header: this.resourcesService.resource('columnTrackingStatus'),
                field: 'trackingStatusFormatted',
                hideOptions: { enabled: false, visible: true } as models.HideOption,
                sortOptions: { enabled: 'custom', method: 'localeSensitive' } as models.SortOption,
                filterOptions: { enabled: false, allChecked: true, criteria: [] } as models.FilterOption
            },
            {
                colIndex: 0,
                header: this.resourcesService.resource('columnLocation'),
                field: 'location',
                hideOptions: { enabled: false, visible: true } as models.HideOption,
                sortOptions: { enabled: 'custom', method: 'localeSensitive' } as models.SortOption,
                filterOptions: { enabled: false, allChecked: true, criteria: [] } as models.FilterOption
            },
            {
                colIndex: 0,
                header: this.resourcesService.resource('columnOrderStatus'),
                field: 'orderStatusFomratted',
                hideOptions: { enabled: false, visible: true } as models.HideOption,
                sortOptions: { enabled: 'custom', method: 'localeSensitive' } as models.SortOption,
                filterOptions: { enabled: false, allChecked: true, criteria: [] } as models.FilterOption
            }

        ]);
        columnsConfig.forEach((config: models.ColumnOption, i: number) => config.colIndex = ++i);
        return columnsConfig;
    }

}
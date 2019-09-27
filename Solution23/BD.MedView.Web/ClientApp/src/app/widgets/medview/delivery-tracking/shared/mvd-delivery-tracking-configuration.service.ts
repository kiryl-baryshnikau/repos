import { Injectable } from '@angular/core';
import * as models from '../../../shared/mvd-models';

import { ResourceService } from 'container-framework';

import { ConfigurationService } from '../../../services/mvd-configuration-service';
import { UserConfigurationService } from '../../../../services/user-configuration.service';
import { MvdConstants } from '../../../shared/mvd-constants';
import { SortingService } from '../../../services/mvd-sorting-service';
import { DeliveryTrackingItem } from '../../../shared/mvd-models';

@Injectable()
export class DeliveryTrackingConfigurationService {

    private widgetConfigKey = 'deliveryTrackingUserSettings';

    constructor(private resourcesService: ResourceService,
        private userConfigurationService: UserConfigurationService,
        private sessionStorageService: ConfigurationService,
        private sortingService: SortingService) {
    }

    getConfiguration(): any {
        let columnsConfig: models.ColumnOption[] = [];
        let userSettings = this.sessionStorageService.getConfiguration(this.widgetConfigKey);
        if (!userSettings) {
            columnsConfig = this.buildConfiguration();
            userSettings = {
                columns: columnsConfig,
                options: { sorting: { field: 'orderId', order: 1 }, pagination: '' },
                filters: {
                    globalSearchCriteria: '',
                    statusFilter: 'ALL'
                }
            };
        }
        this.setUserConfiguration(userSettings);
        return userSettings;
    }

    syncColmnOptions(userConfig: any): void {
        const sessionConfig = this.getConfiguration();
        if (sessionConfig &&
            sessionConfig.columns &&
            userConfig &&
            userConfig.userPreferences &&
            userConfig.userPreferences.columnOptions) {

            const optionColumns = userConfig
                .userPreferences
                .columnOptions
                .find((colOption) => colOption.widget === MvdConstants.DELIVERYTRACKING_WIDGET_KEY);

            if (optionColumns) {
                optionColumns.values.forEach((option) => {
                    const config = sessionConfig.columns.find(conf => conf.field === option.field);
                    if (config) {
                        config.colIndex = option.colIndex;
                        config.hideOptions.visible = option.visible;
                    }
                }, sessionConfig);

                sessionConfig
                    .columns
                    .sort((a, b) => this.sortingService.getSortingMethod('numeric')(a.colIndex, b.colIndex));

                this.setUserConfiguration(sessionConfig);
            }
        }
    }

    setStatusFilterCriteria(value: string) {
        const userConfiguration = this.getConfiguration();
        if (userConfiguration && userConfiguration.filters) {
            userConfiguration.filters.statusFilter = value;
        }
        this.setUserConfiguration(userConfiguration);
    }

    setUserConfiguration(value: any) {
        this.sessionStorageService.setUserConfiguration(value, this.widgetConfigKey);
    }

    setWidgetOptions(optionsConfig: any) {
        const userConfiguration = this.getConfiguration();
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

    setGlobalFilterCriteria(value: any) {
        const userConfiguration = this.getConfiguration();
        userConfiguration.filters.globalSearchCriteria = value;
        this.setUserConfiguration(userConfiguration);
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

    saveColumnOrder(options: models.ColumnOption[]): any {

        const userConfiguration = this.getConfiguration();
        if (userConfiguration && userConfiguration.columns) {

            options.forEach((option: any, index) => option.colIndex = index);

            let updatedOptions: models.ColumnOption[] = [];
            const columns = userConfiguration.columns;
            options.forEach((option, index) => {
                const config = columns.find(col => col.field === option.field);
                if (config) {
                    config.colIndex = index;
                    updatedOptions.push(config);
                }
            });

            const hidedColumns = userConfiguration.columns.filter(col => col.hideOptions.visible === false);
            updatedOptions = updatedOptions.concat(hidedColumns);
            updatedOptions.forEach((option: any, index) => option.colIndex = index);

            userConfiguration.columns = updatedOptions;
            this.setUserConfiguration(userConfiguration);
            this.preserveColumnConfiguration(updatedOptions);
        }
    }

    preserveColumnConfiguration(updatedOptions: models.ColumnOption[]): any {
        const columnOptionConfig = this.mapColumnOptionConfig(updatedOptions);
        this.userConfigurationService
            .updateColumnOptions$(columnOptionConfig)
            .subscribe(
                (response) => console.log('DeliveryTrackingComponent: ColumnOptions Preserved ...'),
                (error) => console.log('DeliveryTrackingComponent: Error on ColumnOptions preservation:', error)
            );

    }

    private mapColumnOptionConfig(updatedOptions: models.ColumnOption[]): models.ColumnOptionSetting {
        const values: models.ColumnOptionValue[] = updatedOptions.map((item: models.ColumnOption) => {
            const newConfig: models.ColumnOptionValue = {
                colIndex: item.colIndex,
                field: item.field,
                visible: item.hideOptions.visible
            };
            return newConfig;
        });

        const config: models.ColumnOptionSetting = {
            widget: MvdConstants.DELIVERYTRACKING_WIDGET_KEY,
            values: values
        };

        return config;
    }

    getStatusesOptions(data: DeliveryTrackingItem[]): models.SelectableItem[] {
        const statusesCount = this.getStatusesCount(data);
        return <models.SelectableItem[]>([
            {
                value: 'ALL',
                label: `${this.resourcesService.resource('deliveryTrackingStatusAll')} (${statusesCount.TOTAL})`,
                selected: true
            },
            {
                value: 'QUEUEDLV',
                label: `${this.resourcesService.resource('deliveryTrackingStatusQueued')} (${statusesCount.QUEUEDLV})`,
                selected: false
            },
            {
                value: 'INTRANSIT',
                label: `${this.resourcesService.resource('deliveryTrackingStatusInTransit')} (${statusesCount.INTRANSIT})`,
                selected: false
            },
            {
                value: 'DELIVERED',
                label: `${this.resourcesService.resource('deliveryTrackingStatusDelivered')} (${statusesCount.DELIVERED})`,
                selected: false
            },
            {
                value: 'CANCELLED',
                label: `${this.resourcesService.resource('deliveryTrackingStatusCancelled')} (${statusesCount.CANCELLED})`,
                selected: false
            }

        ]);
    }

    getStatusesCount(data: any[]) {
        const statusesSumamry = {
            QUEUEDLV: 0,
            INTRANSIT: 0,
            DELIVERED: 0,
            CANCELLED: 0,
            TOTAL: 0
        };
        data.forEach((element: any) => {
            if (element.status) {
                statusesSumamry[element.status] += 1;
            }
        });
        statusesSumamry.TOTAL = data.length;
        return statusesSumamry;
    }

    buildConfiguration(): models.ColumnOption[] {
        const columnsConfig = <models.ColumnOption[]>([
            {
                colIndex: 0,
                header: this.resourcesService.resource('columnPriority'),
                field: 'priority',
                hideOptions: { enabled: false, visible: true } as models.HideOption,
                sortOptions: { enabled: 'custom', method: 'boolean' } as models.SortOption,
                filterOptions: { enabled: true, allChecked: true, criteria: [] } as models.FilterOption
            },
            {
                colIndex: 0,
                header: this.resourcesService.resource('columnPatient'),
                field: 'patientInfo',
                hideOptions: { enabled: false, visible: true } as models.HideOption,
                sortOptions: { enabled: 'custom', method: 'localeSensitive' } as models.SortOption,
                filterOptions: { enabled: false, allChecked: true, criteria: [] } as models.FilterOption
            },
            {
                colIndex: 0,
                header: this.resourcesService.resource('columnFacility'),
                field: 'facilityName',
                hideOptions: { enabled: false, visible: true } as models.HideOption,
                sortOptions: { enabled: 'custom', method: 'localeSensitive' } as models.SortOption,
                filterOptions: { enabled: false, allChecked: true, criteria: [] } as models.FilterOption
            },
            {
                colIndex: 0,
                header: this.resourcesService.resource('columnDataUnit'),
                field: 'location',
                hideOptions: { enabled: false, visible: true } as models.HideOption,
                sortOptions: { enabled: 'custom', method: 'localeSensitive' } as models.SortOption,
                filterOptions: { enabled: false, allChecked: true, criteria: [] } as models.FilterOption
            },
            {
                colIndex: 0,
                header: this.resourcesService.resource('columnDataUnit'),
                field: 'facilityCodeUnit',
                hideOptions: { enabled: true, visible: false } as models.HideOption,
                sortOptions: { enabled: 'custom', method: 'localeSensitive' } as models.SortOption,
                filterOptions: { enabled: true, allChecked: true, criteria: [] } as models.FilterOption
            },
            {
                colIndex: 0,
                header: this.resourcesService.resource('columnOrderId'),
                field: 'orderId',
                hideOptions: { enabled: false, visible: true } as models.HideOption,
                sortOptions: { enabled: 'custom', method: 'numeric' } as models.SortOption,
                filterOptions: { enabled: false, allChecked: true, criteria: [] } as models.FilterOption
            },
            {
                colIndex: 0,
                header: this.resourcesService.resource('columnOrderStatus'),
                field: 'orderStatus',
                hideOptions: { enabled: false, visible: true } as models.HideOption,
                sortOptions: { enabled: 'custom', method: 'localeSensitive' } as models.SortOption,
                filterOptions: { enabled: false, allChecked: true, criteria: [] } as models.FilterOption
            },
            {
                colIndex: 0,
                header: this.resourcesService.resource('columnItem'),
                field: 'orderDescription',
                hideOptions: { enabled: false, visible: true } as models.HideOption,
                sortOptions: { enabled: 'custom', method: 'localeSensitive' } as models.SortOption,
                filterOptions: { enabled: false, allChecked: true, criteria: [] } as models.FilterOption
            },
            {
                colIndex: 0,
                header: this.resourcesService.resource('columnStatus'),
                field: 'deliveryTrackingStatus',
                hideOptions: { enabled: false, visible: true } as models.HideOption,
                sortOptions: { enabled: 'custom', method: 'localeSensitive' } as models.SortOption,
                filterOptions: { enabled: false, allChecked: true, criteria: [] } as models.FilterOption
            },
            {
                colIndex: 0,
                header: this.resourcesService.resource('columnDeliveryLocation'),
                field: 'deliveryLocationName',
                hideOptions: { enabled: false, visible: true } as models.HideOption,
                sortOptions: { enabled: 'custom', method: 'localeSensitive' } as models.SortOption,
                filterOptions: { enabled: false, allChecked: true, criteria: [] } as models.FilterOption
            },
            {
                colIndex: 0,
                header: this.resourcesService.resource('columnDateAge'),
                field: 'dateAgeValue',
                hideOptions: { enabled: false, visible: true } as models.HideOption,
                sortOptions: { enabled: 'custom', method: 'dateAge' } as models.SortOption,
                filterOptions: { enabled: false, allChecked: true, criteria: [] } as models.FilterOption
            },
            {
                colIndex: 0,
                header: this.resourcesService.resource('columnMulti'),
                field: 'isMultiComponentOrder',
                hideOptions: { enabled: false, visible: true } as models.HideOption,
                sortOptions: { enabled: 'custom', method: 'boolean' } as models.SortOption,
                filterOptions: { enabled: false, allChecked: true, criteria: [] } as models.FilterOption
            }
        ]);
        columnsConfig.forEach((config: models.ColumnOption, i: number) => config.colIndex = ++i);
        return columnsConfig;
    }
}

import { Injectable } from '@angular/core';

import { ResourceService } from 'container-framework';

import { ConfigurationService } from './mvd-configuration-service';
import { PersistentConfigurationService } from './mvd-persistent-configuration.service';
import { UserConfigurationService } from '../../services/user-configuration.service';
import { ColumnOptionSetting, ColumnOption, ColumnOptionValue } from '../shared/mvd-models';
import { MvdConstants } from '../shared/mvd-constants';
import * as _ from 'lodash';

@Injectable()
export class DataConfigurationService {

    private widgetConfigKey = 'userSettings';
    private highPriorityColumn = 'highPriority';
    private filters: any = window['infusionStatusFilters'];

    constructor(private resources: ResourceService,
        private persistentConfigurationService: PersistentConfigurationService,
        private configurationService: ConfigurationService,
        private userConfigurationService: UserConfigurationService) {

    }

    setCurrentUser(user: string) {
        this.persistentConfigurationService.setUser(user);
    }

    saveColumnsOrder(event: any): void {
        const configuration = this.getUserConfiguration();
        const userConfiguration = configuration.userSettings || '';
        if (configuration && userConfiguration && event) {

            console.log(event, userConfiguration);
            this.synchColumnOrder(event.dragIndex || 0, event.dropIndex || 0, event.columns || [], userConfiguration.columns || []);
            this.setUserConfiguration(userConfiguration);
            const columnSettings = this.parseToColumnSetting(userConfiguration.columns, MvdConstants.IVSTATUS_WIDGET_KEY);
            this.persistColumnOptions(columnSettings);
        }
    }

    private synchColumnOrder(dragIndex: number, dropIndex: number, sourceColumns: ColumnOption[], targetColumns: ColumnOption[]) {
        if (!sourceColumns.length || !targetColumns.length) {
            return;
        }
        const isMovingToRigth = (dragIndex - dropIndex) < 0;
        const sourceDragItem = sourceColumns[dropIndex];
        const sourceDropItem = dropIndex === 0 || !isMovingToRigth ?
            sourceColumns[dropIndex + 1] :
            sourceColumns[dropIndex - 1];

        if (!sourceDragItem || !sourceDropItem) {
            return;
        }

        const targetDragIndex = _.findIndex(targetColumns, (item) => item.field === sourceDragItem.field);
        const targetDropIndex = _.findIndex(targetColumns, (item) => item.field === sourceDropItem.field);

        if (targetDragIndex < 0 || targetDropIndex < 0) {
            return;
        }

        const targetItem = _.cloneDeep(targetColumns[targetDragIndex]);

        _.remove(targetColumns, (col) => col.field === targetItem.field);
        targetColumns.splice(targetDropIndex, 0, targetItem);
        targetColumns.forEach((targetCol, index) => targetCol.colIndex = index);
    }

    setIsInitialConfigurationSetting(isInitialConfiguration: boolean) {
        const configuration = this.configurationService.getConfiguration(this.widgetConfigKey);
        if (configuration) {
            configuration.isInitialConfiguration = isInitialConfiguration;
            this.setUserConfiguration(configuration);
        }
        return configuration;
    }

    setUnknownFilterConfig(value: boolean) {
        const configuration = this.configurationService.getConfiguration(this.widgetConfigKey);
        if (configuration) {
            configuration.filters.api.allowUnknown = value;
            this.setUserConfiguration(configuration);
        }
    }

    setUserConfiguration(value: any) {
        this.configurationService.setUserConfiguration(value, this.widgetConfigKey);
    }

    getFiltersConfiguration() {
        return this.configurationService.getConfiguration(this.widgetConfigKey).filters || {};
    }

    setWidgetOptions(optionsConfig: any) {
        const userConfiguration = this.getUserConfiguration();
        if (userConfiguration.userSettings.options) {
            userConfiguration.userSettings.options.sorting = optionsConfig.sorting
                ? optionsConfig.sorting
                : userConfiguration.userSettings.options.sorting;
            userConfiguration.userSettings.options.pagination = optionsConfig.pagination
                ? optionsConfig.pagination
                : userConfiguration.userSettings.options.pagination;
            this.setUserConfiguration(userConfiguration.userSettings);
        }
    }

    setFiltersConfiguration(filterConfig: any) {
        const userConfiguration = this.getUserConfiguration().userSettings;
        if (userConfiguration.filters) {
            userConfiguration.filters = filterConfig;
            this.setUserConfiguration(userConfiguration);
        }
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

    setHideConfiguration(options: any) {
        const userConfiguration = this.getUserConfiguration().userSettings;
        if (userConfiguration) {
            options.forEach((option: any) => {
                const config = userConfiguration.columns.find((con: any) => con.field === option.field);
                if (config.hideOptions) {
                    config.hideOptions = option.hideOptions;
                }
            });
            this.setUserConfiguration(userConfiguration);
        }
    }

    setDefaultSort(value: boolean) {
        const userConfiguration = this.getUserConfiguration().userSettings;
        userConfiguration.options.defaultSort = value;
        this.setUserConfiguration(userConfiguration);
    }

    setGlobalFilterCriteria(value: any) {
        const userConfiguration = this.getUserConfiguration().userSettings;
        userConfiguration.filters.globalSearchCriteria = value;
        this.setUserConfiguration(userConfiguration);
    }

    setHighPriorityItem(value: number, checked: boolean) {
        const highPriorityInfo = this.persistentConfigurationService.getPersistentConfiguration();
        if (highPriorityInfo) {
            const index = highPriorityInfo.highPriorityItems.indexOf(value, 0);
            if (checked) {
                if (index < 0) {
                    highPriorityInfo.highPriorityItems.push(value);
                }
            } else {
                if (index > -1) {
                    highPriorityInfo.highPriorityItems.splice(index, 1);
                }
            }
            this.persistentConfigurationService.setPersistentConfiguration(highPriorityInfo);
        }
    }

    verifyFirstTimeLoad() {
        const persistentConfiguration = this.persistentConfigurationService.getPersistentConfiguration();
        const localConfig = this.configurationService.getConfiguration(this.widgetConfigKey);
        if (persistentConfiguration.isFirstTimeLoad || !localConfig) {
            persistentConfiguration.isFirstTimeLoad = false;
            this.persistentConfigurationService.setPersistentConfiguration(persistentConfiguration);
        }
    }

    getShowHideOptions(): ColumnOption[] {
        const currentConfiguration = this.getUserConfiguration();
        const columns = currentConfiguration.userSettings.columns as ColumnOption[] || [];
        if (!columns || !columns.length) {
            return [];
        }
        _.remove(columns, (c: any) => c.field === 'medMinedAlerts');
        return _.sortBy(columns, 'colIndex');
    }

    getUserConfiguration() {
        let localConfig = this.configurationService.getConfiguration(this.widgetConfigKey);
        const persistentConfig = this.persistentConfigurationService.getPersistentConfiguration();

        if (!localConfig) {
            const columnsConfiguration: any[] = this.getDefaultColumnsOptions(persistentConfig);
            localConfig = {
                isInitialConfiguration: true,
                options: { sorting: '', pagination: '', defaultSort: false },
                filters: {
                    api: this.filters,
                    dateOptionSelected: '',
                    selectedCurrentDate: '',
                    globalSearchCriteria: ''
                },
                columns: columnsConfiguration
            };
            this.setUserConfiguration(localConfig);
        }

        return {
            userSettings: localConfig,
            highPriorityItems: persistentConfig.highPriorityItems
        };
    }

    private getDefaultColumnsOptions(persistentConfig: any): any[] {
        const columnsConfiguration = [
            {
                header: this.resources.resource('patientId'),
                field: 'patientId',
                hideOptions: { enabled: false, visible: true },
                sortOptions: { enabled: 'custom', method: 'alphabetical' },
                filterOptions: { enabled: true, allChecked: true, criteria: [] }
            },
            {
                header: this.resources.resource('patientName'),
                field: 'patientName',
                hideOptions: { enabled: false, visible: true },
                sortOptions: { enabled: 'custom', method: 'alphabetical' },
                filterOptions: { enabled: true, allChecked: true, criteria: [] }
            },
            {
                header: this.resources.resource('facility'),
                field: 'masterFacility',
                hideOptions: { enabled: true, visible: false },
                sortOptions: { enabled: 'custom', method: 'alphabetical' },
                filterOptions: { enabled: true, allChecked: true, criteria: [] }
            },
            {
                header: this.resources.resource('unit'),
                useAlternativeHeader: true,
                alternativeHeader: this.resources.resource('unitRoom'),
                field: 'unit',
                hideOptions: { enabled: true, visible: true },
                sortOptions: { enabled: 'custom', method: 'alphabetical', sortingField: 'unitRoom' },
                filterOptions: { enabled: true, allChecked: true, criteria: [] }
            },
            {
                header: this.resources.resource('infusionName'),
                field: 'infusionName',
                hideOptions: { enabled: false, visible: true },
                sortOptions: { enabled: 'custom', method: 'alphabetical' },
                filterOptions: { enabled: true, allChecked: true, criteria: [] }
            },
            {
                header: this.resources.resource('drugAmountDiluentVolume'),
                field: 'drugAmountDiluentVolume',
                hideOptions: { enabled: true, visible: true },
                sortOptions: { enabled: false, method: 'alphabetical' },
                filterOptions: { enabled: false, allChecked: true, criteria: [] }
            },
            {
                header: this.resources.resource('dose'),
                field: 'dose',
                hideOptions: { enabled: true, visible: true },
                sortOptions: { enabled: false, method: 'alphabetical' },
                filterOptions: { enabled: false, allChecked: true, criteria: [] }
            },
            {
                header: this.resources.resource('rate'),
                field: 'rate',
                hideOptions: { enabled: true, visible: true },
                sortOptions: { enabled: 'custom', method: 'numericString' },
                filterOptions: { enabled: false, allChecked: true, criteria: [] }
            },
            {
                header: this.resources.resource('startDateTime'),
                field: 'startDateTime',
                hideOptions: { enabled: true, visible: true },
                sortOptions: { enabled: 'custom', method: 'date' },
                filterOptions: { enabled: false, allChecked: true, criteria: [] }
            },
            {
                header: this.resources.resource('estimatedTimeTillEmpty'),
                field: 'estimatedTimeTillEmpty',
                hideOptions: { enabled: true, visible: true },
                sortOptions: { enabled: 'custom', method: 'timeString', default: true },
                filterOptions: { enabled: false, allChecked: true, criteria: [] }
            },
            {
                header: this.resources.resource('estimatedVolumeRemaining'),
                field: 'estimatedVolumeRemaining',
                hideOptions: { enabled: true, visible: false },
                sortOptions: { enabled: 'custom', method: 'numericString' },
                filterOptions: { enabled: false, allChecked: true, criteria: [] }
            },
            {
                header: this.resources.resource('infusionStatus'),
                field: 'infusionStatus',
                hideOptions: { enabled: true, visible: true },
                sortOptions: { enabled: 'custom', method: 'alphabetical' },
                filterOptions: { enabled: true, allChecked: true, criteria: [] }
            },
            {
                header: this.resources.resource('replenishmentStatus'),
                field: 'replenishmentStatus',
                hideOptions: { enabled: true, visible: true },
                sortOptions: { enabled: 'custom', method: 'alphabetical' },
                filterOptions: { enabled: false, allChecked: true, criteria: [] }
            },
            {
                header: this.resources.resource('lastUpdate'),
                field: 'lastUpdate',
                hideOptions: { enabled: true, visible: false },
                sortOptions: { enabled: 'custom', method: 'date' },
                filterOptions: { enabled: false, allChecked: true, criteria: [] }
            },
            {
                header: this.resources.resource('highPriority'),
                field: 'highPriority',
                hideOptions: { enabled: true, visible: (persistentConfig && persistentConfig.highPriorityItems.length > 0) },
                sortOptions: { enabled: false, method: 'boolean' },
                filterOptions: { enabled: false, allChecked: true, criteria: [] }
            },
            {
                header: this.resources.resource('guardrailStatus'),
                field: 'guardrailStatus',
                hideOptions: { enabled: true, visible: true },
                sortOptions: { enabled: 'custom', method: 'numericGuardrailViolations' },
                filterOptions: { enabled: true, allChecked: true, criteria: [] }
            },
            {
                header: this.resources.resource('infusionType'),
                field: 'infusionType',
                hideOptions: { enabled: true, visible: false },
                sortOptions: { enabled: 'custom', method: 'alphabetical' },
                filterOptions: { enabled: true, allChecked: true, criteria: [] }
            },
            {
                header: this.resources.resource('vtbi'),
                field: 'vtbi',
                hideOptions: { enabled: true, visible: false },
                sortOptions: { enabled: 'custom', method: 'numericString' },
                filterOptions: { enabled: false, allChecked: true, criteria: [] }
            },
            {
                header: this.resources.resource('cumulativeVolumeInfused'),
                field: 'cumulativeVolumeInfused',
                hideOptions: { enabled: true, visible: false },
                sortOptions: { enabled: 'custom', method: 'numericString' },
                filterOptions: { enabled: false, allChecked: true, criteria: [] }
            },
            {
                header: this.resources.resource('clinicianID'),
                field: 'clinicianId',
                hideOptions: { enabled: true, visible: false },
                sortOptions: { enabled: 'custom', method: 'alphabetical' },
                filterOptions: { enabled: true, allChecked: true, criteria: [] }
            }
        ];
        columnsConfiguration.forEach((config: any, i: any) => {
            config.colIndex = ++i;
        });
        return columnsConfiguration;
    }

    parseToColumnSetting(columns: ColumnOption[], widget: string): ColumnOptionSetting {
        if (columns && columns.length) {
            const values: ColumnOptionValue[] = columns.map((item: ColumnOption) => {
                const newConfig: ColumnOptionValue = {
                    colIndex: item.colIndex,
                    field: item.field,
                    visible: item.hideOptions.visible
                };
                return newConfig;
            });
            const config: ColumnOptionSetting = {
                widget: widget,
                values: values
            };

            return config;
        }
        return;
    }

    persistColumnOptions(config: ColumnOptionSetting) {
        this.userConfigurationService.updateColumnOptions$(config)
            .subscribe((response) => console.log('ColumnOptions persisted ...'),
                (error) => console.log('ColumnOptions Error ...', error));
    }

}

import { Injectable} from '@angular/core';
import * as Mvdmodels from '../../shared/mvd-models';
import { ResourceService } from 'container-framework';
import { ConfigurationService } from '../../services/mvd-configuration-service';
import {UserConfigurationService} from '../../../services/user-configuration.service';
import {MvdConstants} from '../../shared/mvd-constants';
import * as _ from 'lodash';
import { SortingService } from '../../services/mvd-sorting-service';
import { ColumnOption } from '../../shared/mvd-models';

@Injectable()
export class IvPrepConfigurationService {

    private widgetConfigKey = 'ivPrepUserSettings';

    constructor(private resourceService: ResourceService,
        private configurationService: ConfigurationService,
        private userConfigurationService: UserConfigurationService,
        private sortingService: SortingService
        ) {
    }

    getConfiguration(deliveryTrackingEnabled: boolean): Mvdmodels.IvPrepConfigModel {
        let config;
        const sessionSettings = this.configurationService.getConfiguration(this.widgetConfigKey);
        if (sessionSettings) {
            config = sessionSettings;
        } else {
            const columns = this.getColumnsConfiguration();
            const hourFrameFilter = this.getDefaultHourFrameFilter();
            config = {
                columns,
                hourFrameFilter: hourFrameFilter,
                options: {
                    sort: { field: 'priority', order: 1 },
                    pagination: { first: 0, rows: 15 },
                    defaultSort: false,
                    globalSearchCriteria: ''
                }
            };
        }

        config.columns = config.columns.map(c => {
            if (c.hideOptions.isDeliveryColumn) {
                c.hideOptions.hide = !deliveryTrackingEnabled;
                c.hideOptions.visible = deliveryTrackingEnabled;
            }
            return c;
        });

        if (!config.hasOwnProperty('hourFrameFilter')) {
            config.hourFrameFilter = this.getDefaultHourFrameFilter();
        }

        this.configurationService.setUserConfiguration(config, this.widgetConfigKey);

        return config;
    }

    getDefaultHourFrameFilter(): any {
        return -12;
    }

    setUserConfiguration(value: any) {
        this.configurationService.setUserConfiguration(value, this.widgetConfigKey);
    }

    savePagination(value: any, deliveryTrackingEnabled: boolean) {
        const config = this.getConfiguration(deliveryTrackingEnabled);
        config.options.pagination = value;
        this.setUserConfiguration(config);
    }

    setGlobalSearchCriteria(value: any, deliveryTrackingEnabled: boolean) {
        const config = this.getConfiguration(deliveryTrackingEnabled);
        config.options.globalSearchCriteria = value;
        this.setUserConfiguration(config);
    }

    getShowHideOptions(deliveryMode: boolean): ColumnOption[] {
        const currentConfiguration = this.getConfiguration(deliveryMode);
        const columns = currentConfiguration.columns as ColumnOption[] || [];
        if (!columns || !columns.length) {
            return [];
        }
        return _.sortBy(currentConfiguration.columns, 'colIndex');
    }

    setHideConfiguration(columnOptions: Mvdmodels.ColumnOption[], deliveryTrackingEnabled: boolean) {
        const userConfiguration = this.getConfiguration(deliveryTrackingEnabled);
        if (userConfiguration) {
            columnOptions.forEach((option: Mvdmodels.ColumnOption) => {
                const config =
                    userConfiguration.columns.find((con: Mvdmodels.ColumnOption) => con.field === option.field);
                if (config.hideOptions) {
                    config.hideOptions = option.hideOptions;
                }
            });
            this.setUserConfiguration(userConfiguration);
        }
    }

    saveColumnOptionsReordering(
        event: { dragIndex: number; dropIndex: number; columns: Mvdmodels.ColumnOption[]; },
        deliveryTrackingEnabled: boolean
    ) {
        const userConfiguration = this.getConfiguration(deliveryTrackingEnabled);

        if (!userConfiguration || !event || !event.columns || !event.columns.length) { return; }

        const viewColumns = event.columns as Mvdmodels.ColumnOption[];
        const dropIndex = event.dropIndex;

        const columnField = viewColumns[dropIndex].field;
        const currentIndex = userConfiguration.columns.findIndex(c => c.field === columnField);
        if (currentIndex < 0) {
            console.error(`Drag&Drop error: Unable to find column ${columnField} in current configuration`);
            return;
        }

        const droppedColumnInConfiguration = userConfiguration.columns[currentIndex];
        userConfiguration.columns.splice(currentIndex, 1);
        const newIndex = this.getDroppedColumnIndex(dropIndex, userConfiguration);
        userConfiguration.columns.splice(newIndex, 0, droppedColumnInConfiguration);

        for (let i = 0; i < userConfiguration.columns.length; i++) {
            userConfiguration.columns[i].colIndex = i;
        }

        this.setUserConfiguration(userConfiguration);
        const columnSettings = this.parseToColumnSetting(userConfiguration.columns, MvdConstants.IVPREP_WIDGET_KEY);
        this.persistColumnOptions(columnSettings);
    }

    private getDroppedColumnIndex(dropIndex: number, userConfiguration: Mvdmodels.IvPrepConfigModel): number {
        let i = 0;
        let newIndex = 0;
        while (i < dropIndex && newIndex < userConfiguration.columns.length) {
            if (userConfiguration.columns[newIndex].hideOptions.visible) { i ++; }
            newIndex++;
        }
        return newIndex;
    }

    parseToColumnSetting(columns: Mvdmodels.ColumnOption[], widget: string): Mvdmodels.ColumnOptionSetting {
        if (columns && columns.length) {
            const values: Mvdmodels.ColumnOptionValue[] = columns.map((item: Mvdmodels.ColumnOption) => {
                const newConfig: Mvdmodels.ColumnOptionValue = {
                    colIndex: item.colIndex,
                    field: item.field,
                    visible: item.hideOptions.visible
                };
                return newConfig;
            });
            const config: Mvdmodels.ColumnOptionSetting =
            {
                widget: widget,
                values: values
            };

            return config;
        }
        return;
    }

    synchColumnOptions(options: Mvdmodels.ColumnOptionSetting[], deliveryMode: boolean) {
        const sessionConfig = this.getConfiguration(deliveryMode);
        if (options && options.length && sessionConfig) {
            const ivPrepColumnOptions = options.find(option => option.widget === MvdConstants.IVPREP_WIDGET_KEY);
            if (ivPrepColumnOptions) {
                ivPrepColumnOptions.values.forEach((col) => {
                    const config = sessionConfig.columns.find(conf => conf.field === col.field);
                    if (config) {
                        config.colIndex = col.colIndex;
                        config.hideOptions.visible = col.visible;
                    }
                }, sessionConfig);

                sessionConfig
                    .columns
                    .sort((a, b) => this.sortingService.getSortingMethod('numeric')(a.colIndex, b.colIndex));

                this.setUserConfiguration(sessionConfig);
            }
        }
    }

    saveTimeFrameFilterConfig(timeFrameFilter: Mvdmodels.TimeFrameFilter, deliveryTrackingEnabled: boolean) {
        const config = this.getConfiguration(deliveryTrackingEnabled);
        if (config.timeFrameFilter) {
            config.timeFrameFilter = timeFrameFilter;
            this.setUserConfiguration(config);
        }
    }

    saveHourFrameFilterConfig(hourFrameFilter: number, deliveryTrackingEnabled: boolean) {
        const config = this.getConfiguration(deliveryTrackingEnabled);
        if (config.hourFrameFilter) {
            config.hourFrameFilter = hourFrameFilter;
            this.setUserConfiguration(config);
        }
    }

    setFilterColumnConfiguration(options: any[], deliveryTrackingEnabled: boolean) {
        const configuration = this.getConfiguration(deliveryTrackingEnabled);
        if (configuration) {
            options.forEach((option: any) => {
                const columnOption = this.getColumnOption(configuration, option.field);
                if (columnOption) {
                    columnOption.filterOptions = option.filterOptions;
                }
            });
            this.setUserConfiguration(configuration);
        }
    }

    getColumnOption(config: Mvdmodels.IvPrepConfigModel, fieldName): Mvdmodels.ColumnOption {
        const columns = config && config.columns;
        if (columns) {
            return columns.find((c: any) => c.field === fieldName) as Mvdmodels.ColumnOption;
        }
    }

    getColumnFilterOptions(config: Mvdmodels.IvPrepConfigModel, fieldName: string): Mvdmodels.FilterOption {
        const columnOption = this.getColumnOption(config, fieldName);
        if (columnOption) {
            return columnOption && columnOption.filterOptions;
        }
    }

    getColumnCriteria(config: Mvdmodels.IvPrepConfigModel, fieldName: string): Mvdmodels.FilterCriteria[] {
        const filterOptions = this.getColumnFilterOptions(config, fieldName);
        if (filterOptions) {
            return filterOptions && filterOptions.criteria;
        }
    }

    persistColumnOptions(config: Mvdmodels.ColumnOptionSetting) {
        this.userConfigurationService.updateColumnOptions$(config)
            .subscribe((response) => console.log('ColumnOptions persisted ...'),
                       (error) => console.log('ColumnOptions Error ...', error));
    }

    updateWidgetSettings$(setting: Mvdmodels.IvPrepModels.IvPrepGeneralSettings) {
        const widgetSetting = {
            id: MvdConstants.IVPREP_WIDGET_KEY,
            configuration: setting
         } as Mvdmodels.GeneralSetting;
        return this.userConfigurationService.updateGeneralSettings$(widgetSetting);
    }

    private getColumnsConfiguration(): Mvdmodels.ColumnOption[] {

        const columnsConfig = <Mvdmodels.ColumnOption[]>([
            {
                colIndex: 0,
                header: this.resourceService.resource('statusColumn'),
                field: 'status',
                hideOptions: { enabled: false, visible: true } as Mvdmodels.HideOption,
                sortOptions: { enabled: 'false', method: 'localeSensitive' } as Mvdmodels.SortOption,
                filterOptions: { enabled: false, allChecked: true, criteria: [] } as Mvdmodels.FilterOption,
            },
            {
                colIndex: 0,
                header: this.resourceService.resource('statusColumn'),
                field: 'statusDisplayName',
                hideOptions: { enabled: false, visible: false, hide: true } as Mvdmodels.HideOption,
                sortOptions: { enabled: 'custom', method: 'localeSensitive' } as Mvdmodels.SortOption,
                filterOptions: { enabled: false, allChecked: true, criteria: [] } as Mvdmodels.FilterOption,
            },
            {
                colIndex: 0,
                header: this.resourceService.resource('isOnHoldColumn'),
                field: 'isOnHold',
                hideOptions: { enabled: true, visible: false} as Mvdmodels.HideOption,
                sortOptions: { enabled: 'custom', method: 'localeSensitive' } as Mvdmodels.SortOption,
                filterOptions: { enabled: false, allChecked: true, criteria: [] } as Mvdmodels.FilterOption,
                sortFieldName: 'blocked'
            },
            {
                colIndex: 0,
                header: this.resourceService.resource('priorityColumn'),
                field: 'priority',
                hideOptions: { enabled: false, visible: true } as Mvdmodels.HideOption,
                sortOptions: { enabled: 'custom', method: 'localeSensitive', default: true } as Mvdmodels.SortOption,
                filterOptions: { enabled: false, allChecked: true, criteria: [] } as Mvdmodels.FilterOption,
                sortFieldName: 'priority'
            },
            {
                colIndex: 0,
                header: this.resourceService.resource('priorityColumn'),
                field: 'priorityDisplayName',
                hideOptions: { enabled: false, visible: false, hide: true } as Mvdmodels.HideOption,
                sortOptions: { enabled: 'custom', method: 'localeSensitive', default: true } as Mvdmodels.SortOption,
                filterOptions: { enabled: true, allChecked: true, criteria: [], order: 5 } as Mvdmodels.FilterOption,
               sortFieldName: 'priority'
            },
            {
                colIndex: 0,
                header: this.resourceService.resource('patientNameColumn'),
                field: 'patientName',
                hideOptions: { enabled: false, visible: true } as Mvdmodels.HideOption,
                sortOptions: { enabled: 'custom', method: 'localeSensitive' } as Mvdmodels.SortOption,
                filterOptions: { enabled: false, allChecked: true, criteria: [] } as Mvdmodels.FilterOption,
                sortFieldName: 'patientName'
            },
            {
                colIndex: 0,
                header: this.resourceService.resource('patientIdColumn'),
                field: 'patientNumber',
                hideOptions: { enabled: false, visible: true } as Mvdmodels.HideOption,
                sortOptions: { enabled: 'custom', method: 'localeSensitive' } as Mvdmodels.SortOption,
                filterOptions: { enabled: false, allChecked: true, criteria: [] } as Mvdmodels.FilterOption,
                sortFieldName: 'patientNumber'
            },
            {
                colIndex: 0,
                header: this.resourceService.resource('medicationColumn'),
                field: 'medication',
                hideOptions: { enabled: false, visible: true } as Mvdmodels.HideOption,
                sortOptions: { enabled: 'custom', method: 'localeSensitive' } as Mvdmodels.SortOption,
                filterOptions: { enabled: false, allChecked: true, criteria: [] } as Mvdmodels.FilterOption,
                sortFieldName: 'drugs'
            },
            {
                colIndex: 0,
                header: this.resourceService.resource('orderNumberColumn'),
                field: 'orderNumber',
                hideOptions: { enabled: true, visible: false } as Mvdmodels.HideOption,
                sortOptions: { enabled: 'custom', method: 'localeSensitive' } as Mvdmodels.SortOption,
                filterOptions: { enabled: false, allChecked: true, criteria: [] } as Mvdmodels.FilterOption,
                sortFieldName: 'orderNumber'
            },
            {
                colIndex: 0,
                header: this.resourceService.resource('doseMedNumberColumn'),
                field: 'doseMedNumber',
                hideOptions: { enabled: true, visible: true } as Mvdmodels.HideOption,
                sortOptions: { enabled: 'custom', method: 'localeSensitive' } as Mvdmodels.SortOption,
                filterOptions: { enabled: false, allChecked: true, criteria: [] } as Mvdmodels.FilterOption,
                sortFieldName: 'doseId',
            },
            {
                colIndex: 0,
                header: this.resourceService.resource('prepSiteColumn'),
                field: 'prepSite',
                hideOptions: { enabled: true, visible: true } as Mvdmodels.HideOption,
                sortOptions: { enabled: 'custom', method: 'localeSensitive' } as Mvdmodels.SortOption,
                filterOptions: { enabled: true, allChecked: true, criteria: [], order: 1 } as Mvdmodels.FilterOption,
                sortFieldName: 'prepSite'
            },
            {
                colIndex: 0,
                header: this.resourceService.resource('dateTimeNeededColumn'),
                field: 'dateTimeNeeded',
                hideOptions: { enabled: true, visible: true } as Mvdmodels.HideOption,
                sortOptions: { enabled: 'custom', method: 'localeSensitive' } as Mvdmodels.SortOption,
                filterOptions: { enabled: false, allChecked: true, criteria: [] } as Mvdmodels.FilterOption,
                sortFieldName: 'admDate'
            },
            {
                colIndex: 0,
                header: this.resourceService.resource('facilityColumn'),
                field: 'masterFacility',
                hideOptions: { enabled: true, visible: true } as Mvdmodels.HideOption,
                sortOptions: { enabled: 'false', method: 'localeSensitive' } as Mvdmodels.SortOption,
                filterOptions: { enabled: true, allChecked: true, criteria: [], order: 2 } as Mvdmodels.FilterOption,
                sortFieldName: 'facility'
            },
            {
                colIndex: 0,
                header: this.resourceService.resource('unitColumn'),
                field: 'unit',
                hideOptions: { enabled: true, visible: true } as Mvdmodels.HideOption,
                sortOptions: { enabled: 'custom', method: 'localeSensitive' } as Mvdmodels.SortOption,
                filterOptions: { enabled: true, allChecked: true, criteria: [], order: 3 } as Mvdmodels.FilterOption,
                sortFieldName: 'unit'
            },
            {
                colIndex: 0,
                header: this.resourceService.resource('unitColumn'),
                field: 'unitId',
                hideOptions: { enabled: false, visible: false, hide: true } as Mvdmodels.HideOption,
                sortOptions: { enabled: 'custom', method: 'localeSensitive' } as Mvdmodels.SortOption,
                filterOptions: { enabled: false, allChecked: true, criteria: [] } as Mvdmodels.FilterOption,
                sortFieldName: 'unit'
            },
            {
                colIndex: 0,
                header: this.resourceService.resource('deliveryStatusColumn'),
                field: 'deliveryStatus',
                hideOptions: { enabled: true, visible: true, hide: true, isDeliveryColumn: true } as Mvdmodels.
                    HideOption,
                sortOptions: { enabled: 'custom', method: 'localeSensitive' } as Mvdmodels.SortOption,
                filterOptions: { enabled: false, allChecked: true, criteria: [] } as Mvdmodels.FilterOption,
            },
            {
                colIndex: 0,
                header: this.resourceService.resource('locationColumn'),
                field: 'location',
                hideOptions: { enabled: true, visible: true, hide: true, isDeliveryColumn: true } as Mvdmodels.
                    HideOption,
                sortOptions: { enabled: 'custom', method: 'localeSensitive' } as Mvdmodels.SortOption,
                filterOptions: { enabled: false, allChecked: true, criteria: [] } as Mvdmodels.FilterOption
            },
            {
                colIndex: 0,
                header: this.resourceService.resource('deliveryDateTimeColumn'),
                field: 'deliveryDateTime',
                hideOptions: { enabled: true, visible: true, hide: true, isDeliveryColumn: true } as Mvdmodels.
                    HideOption,
                sortOptions: { enabled: 'custom', method: 'localeSensitive' } as Mvdmodels.SortOption,
                filterOptions: { enabled: false, allChecked: true, criteria: [] } as Mvdmodels.FilterOption
            },
            {
                colIndex: 0,
                header: this.resourceService.resource('finalContainerType'),
                field: 'finalContainerType',
                hideOptions: { enabled: false, visible: false, hide: true, isDeliveryColumn: false } as Mvdmodels.HideOption,
                sortOptions: { enabled: 'custom', method: 'localeSensitive' } as Mvdmodels.SortOption,
                filterOptions: { enabled: true, allChecked: true, criteria: [], order: 4 } as Mvdmodels.FilterOption
            }
        ]);
        columnsConfig.forEach((config: Mvdmodels.ColumnOption, i: number) => config.colIndex = i++);

        return columnsConfig;
    }
}

import { Injectable } from '@angular/core';

import { ResourceService } from 'container-framework';
import * as _ from 'lodash';

import { UserConfigurationService } from '../../../services/user-configuration.service';
import { ConfigurationService } from '../../services/mvd-configuration-service';
import { SortingService } from '../../services/mvd-sorting-service';
import { MvdConstants } from '../../shared/mvd-constants';
import { ColumnOption, ColumnOptionSetting, ColumnOptionValue } from '../../shared/mvd-models';
import { MedMinedModels } from '../../shared/medmined-models';

@Injectable()
export class ClinicalOverviewConfigurationService {

    widgetConfigKey = 'clinicalOverViewSettings';

    constructor(private resourceService: ResourceService
        , private userConfigurationService: UserConfigurationService
        , private sessionConfigurationService: ConfigurationService
        , private sortingService: SortingService) { }


    getConfiguration(): any {
        const currentOptions = this.getSessionConfiguration();
        return currentOptions;
    }

    getColumnsConfiguration(): ColumnOption[] {
        const currentOptions = this.getSessionConfiguration();
        const columns = currentOptions.columns || [];
        return columns;
    }

    getExpandedAlertsIds(): string[] {
        const currentOptions = this.getSessionConfiguration();
        const expandedAlertsIds = currentOptions.expandedAlertsIds || [];
        return expandedAlertsIds;
    }

    getExpandedCategories(): string[] {
        const currentOptions = this.getSessionConfiguration();
        return currentOptions.expandedCategories;
    }

    saveExpandedCategories(categories: string[]): void {
        const currentOptions = this.getSessionConfiguration();
        currentOptions.expandedCategories = categories.filter(c => c);
        this.sessionConfigurationService.setUserConfiguration(currentOptions, this.widgetConfigKey);
    }

    getFiltersConfiguration(): ColumnOption[] {
        const currentOptions = this.getSessionConfiguration();
        const columns = currentOptions.filters || [];
        return columns;
    }

    getShowHideOptions(): ColumnOption[] {

        const currentConfiguration = this.getSessionConfiguration();
        const columns = currentConfiguration.columns as ColumnOption[] || [];
        if (!columns || !columns.length) {
            return [];
        }
        return _.sortBy(currentConfiguration.columns, 'colIndex');
    }

    synchronizeColumns(columnOptions: ColumnOptionSetting[]): void {
        if (!columnOptions.length) {
            return;
        }

        const clinicalOverViewSettings = columnOptions.find(c => c.widget === MvdConstants.CLINICALOVERVIEW_WIDGET_KEY);
        if (!clinicalOverViewSettings) {
            return;
        }
        const currentOptions = this.getSessionConfiguration();
        const columns = currentOptions.columns || [];
        const synchedColumns = this.synchColumnOptions(clinicalOverViewSettings, columns);
        currentOptions.columns = synchedColumns;
        this.sessionConfigurationService.setUserConfiguration(currentOptions, this.widgetConfigKey);
    }

    synchShowHideOptions(selectedColumn: ColumnOption): void {

        const configuration = this.getSessionConfiguration();
        const columnOptions = configuration.columns as ColumnOption[];
        if (!selectedColumn ||
            !columnOptions.length ||
            !selectedColumn.hideOptions.enabled) {
            console.error('ClinicalOverviewConfigurationService > synchShowHideOptions: Invalid show/hide settings');
            return;
        }

        const targetColumnItem = columnOptions.find(c => c.field === selectedColumn.field);
        if (!targetColumnItem) {
            console.error('ClinicalOverviewConfigurationService > synchShowHideOptions: Show/hide setting not found');
            return;
        }
        targetColumnItem.hideOptions.visible = selectedColumn.hideOptions.visible;

        this.setHideConfiguration(columnOptions);
    }

    private setHideConfiguration(columnOptions: ColumnOption[]): any {
        const userConfiguration = this.getSessionConfiguration();
        if (userConfiguration) {
            columnOptions.forEach((option: any) => {
                const config = userConfiguration.columns.find((con: any) => con.field === option.field);
                if (config.hideOptions) {
                    config.hideOptions = option.hideOptions;
                }
            });
            this.sessionConfigurationService.setUserConfiguration(userConfiguration, this.widgetConfigKey);
        }
    }

    persistShowHideOptions(event: any): any {
        const columnOptions = this.parseToColumnSetting(event, MvdConstants.CLINICALOVERVIEW_WIDGET_KEY);
        this.persistColumnOptions(columnOptions);
    }

    saveColumnOrder(options: {
        columns: ColumnOption[];
        dragIndex: number;
        dropIndex: number
    }): void {

        const configuration = this.getSessionConfiguration();
        const userConfiguration = configuration || '';
        if (configuration && userConfiguration && options) {
            this.synchColumnOrder(options.dragIndex || 0
                , options.dropIndex || 0
                , options.columns || [], userConfiguration.columns || []);
            this.sessionConfigurationService.setUserConfiguration(userConfiguration, this.widgetConfigKey);

            const columnSettings = this.parseToColumnSetting(userConfiguration.columns, MvdConstants.CLINICALOVERVIEW_WIDGET_KEY);
            this.persistColumnOptions(columnSettings);
        }
    }

    ensureDefaults(): void {
        const sessionConfig = this.sessionConfigurationService.getConfiguration(this.widgetConfigKey);
        if (sessionConfig) {
            return;
        }
        const defaults = this.getSessionConfiguration();
        this.sessionConfigurationService.setUserConfiguration(defaults, this.widgetConfigKey);
    }

    getDataFiltersConfiguration(): ColumnOption[] {
        return [
            {
                colIndex: 1,
                field: 'masterFacility',
                header: this.resourceService.resource('facility'),
                hideOptions: {
                    enabled: false, visible: false
                },
                filterOptions: {
                    enabled: true, allChecked: true, criteria: []
                },
                sortOptions: {
                    enabled: 'custom', default: false, method: 'alphabetical'
                }
            },
            {
                colIndex: 2,
                field: 'units',
                subProperty: 'location',
                header: this.resourceService.resource('location'),
                hideOptions: {
                    enabled: false, visible: false
                },
                filterOptions: {
                    enabled: true, allChecked: true, criteria: []
                },
                sortOptions: {
                    enabled: 'custom', default: false, method: 'alphabetical'
                }
            },
            {
                colIndex: 3,
                field: 'category',
                header: this.resourceService.resource('alertCategory'),
                hideOptions: {
                    enabled: false, visible: false
                },
                filterOptions: {
                    enabled: true, allChecked: true, criteria: []
                },
                sortOptions: {
                    enabled: 'custom', default: false, method: 'alphabetical'
                }
            },
            {
                colIndex: 4,
                field: 'title',
                header: this.resourceService.resource('alertType'),
                hideOptions: {
                    enabled: false, visible: false
                },
                filterOptions: {
                    enabled: true, allChecked: true, criteria: []
                },
                sortOptions: {
                    enabled: 'custom', default: false, method: 'alphabetical'
                }
            },
            {
                colIndex: 5,
                field: 'priorities',
                subProperty: 'priority',
                header: this.resourceService.resource('priority'),
                hideOptions: {
                    enabled: false, visible: false
                },
                filterOptions: {
                    enabled: true, allChecked: true, criteria: []
                },
                sortOptions: {
                    enabled: 'custom', default: false, method: 'alphabetical'
                }
            }
        ];
    }

    setUserConfiguration(config) {
        this.sessionConfigurationService.setUserConfiguration(config, this.widgetConfigKey);
    }

    private synchColumnOrder(dragIndex: number
        , dropIndex: number
        , sourceColumns: ColumnOption[]
        , targetColumns: ColumnOption[]) {

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

    private parseToColumnSetting(columns: ColumnOption[], widget: string): ColumnOptionSetting {
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

    private persistColumnOptions(config: ColumnOptionSetting) {
        this.userConfigurationService.updateColumnOptions$(config)
            .subscribe((response) => console.log('ColumnOptions persisted ...'),
                (error) => console.log('ColumnOptions Error ...', error));
    }

    private synchColumnOptions(clinicalOverViewSettings: ColumnOptionSetting
        , defaultOptions: ColumnOption[]): ColumnOption[] {

        if (clinicalOverViewSettings && clinicalOverViewSettings.values) {
            clinicalOverViewSettings.values.forEach((item: ColumnOptionValue) => {
                const column = defaultOptions.find(col => col.field === item.field);
                if (column) {
                    column.colIndex = item.colIndex;
                    column.hideOptions.visible = item.visible;
                }
            });
            defaultOptions
                .sort((a, b) => this.sortingService.getSortingMethod('numeric')(a.colIndex, b.colIndex));
        }
        return defaultOptions;

    }


    private getSessionConfiguration(): MedMinedModels.SessionConfiguration {
        const sessionConfig = this.sessionConfigurationService.getConfiguration(this.widgetConfigKey);
        if (sessionConfig) {
            return sessionConfig;
        }
        const defaultColumnOptions = this.getDefaultColumnsConfiguration();
        const defaultSessionConfig = {
            options: { sorting: '', pagination: { first: 0, rows: 15 }, defaultSort: false },
            columns: defaultColumnOptions,
            filters: this.getDataFiltersConfiguration(),
            expandedAlertsIds: [],
            expandedCategories: null,
            globalSearchCriteria: undefined
        };
        return defaultSessionConfig;
    }

    private getDefaultColumnsConfiguration() {
        const columns: ColumnOption[] = [
            {
                colIndex: 0,
                field: 'patientName',
                header: this.resourceService.resource('patientName'),
                hideOptions: {
                    enabled: false, visible: true
                },
                filterOptions: {
                    enabled: false, allChecked: true, criteria: []
                },
                sortOptions: {
                    enabled: 'custom', default: false, method: 'localeSensitive'
                }
            },
            {
                colIndex: 1,
                field: 'patientId',
                header: this.resourceService.resource('patientId'),
                hideOptions: {
                    enabled: false, visible: true
                },
                filterOptions: {
                    enabled: false, allChecked: true, criteria: []
                },
                sortOptions: {
                    enabled: 'custom', default: false, method: 'localeSensitive'
                }
            },
            {
                colIndex: 2,
                field: 'status',
                header: this.resourceService.resource('status'),
                hideOptions: {
                    enabled: false, visible: true
                },
                filterOptions: {
                    enabled: false, allChecked: true, criteria: []
                },
                sortOptions: {
                    enabled: 'custom', default: false, method: 'localeSensitive'
                }
            },
            {
                colIndex: 3,
                field: 'drug',
                header: this.resourceService.resource('drug'),
                hideOptions: {
                    enabled: false, visible: true
                },
                filterOptions: {
                    enabled: false, allChecked: true, criteria: []
                },
                sortOptions: {
                    enabled: 'custom', default: false, method: 'localeSensitive'
                }
            },
            {
                colIndex: 4,
                field: 'dose',
                header: this.resourceService.resource('dose'),
                hideOptions: {
                    enabled: true, visible: true
                },
                filterOptions: {
                    enabled: false, allChecked: true, criteria: []
                },
                sortOptions: {
                    enabled: 'custom', default: false, method: 'localeSensitive'
                }
            },
            {
                colIndex: 5,
                field: 'orderid',
                header: this.resourceService.resource('orderid'),
                hideOptions: {
                    enabled: true, visible: false
                },
                filterOptions: {
                    enabled: false, allChecked: true, criteria: []
                },
                sortOptions: {
                    enabled: 'custom', default: false, method: 'localeSensitive'
                }
            },
            {
                colIndex: 6,
                field: 'interval',
                header: this.resourceService.resource('interval'),
                hideOptions: {
                    enabled: true, visible: false
                },
                filterOptions: {
                    enabled: false, allChecked: true, criteria: []
                },
                sortOptions: {
                    enabled: 'custom', default: false, method: 'localeSensitive'
                }
            },
            {
                colIndex: 7,
                field: 'location',
                header: this.resourceService.resource('location'),
                hideOptions: {
                    enabled: true, visible: true
                },
                filterOptions: {
                    enabled: true, allChecked: true, criteria: []
                },
                sortOptions: {
                    enabled: 'custom', default: false, method: 'localeSensitive'
                }
            },
            {
                colIndex: 8,
                field: 'bed',
                header: this.resourceService.resource('bed'),
                hideOptions: {
                    enabled: true, visible: true
                },
                filterOptions: {
                    enabled: false, allChecked: true, criteria: []
                },
                sortOptions: {
                    enabled: 'custom', default: false, method: 'localeSensitive'
                }
            },
            {
                colIndex: 9,
                field: 'date',
                header: this.resourceService.resource('date'),
                hideOptions: {
                    enabled: true, visible: false
                },
                filterOptions: {
                    enabled: false, allChecked: true, criteria: []
                },
                sortOptions: {
                    enabled: 'custom', default: false, method: 'date'
                }
            },
            {
                colIndex: 10,
                field: 'priority',
                header: this.resourceService.resource('priority'),
                hideOptions: {
                    enabled: true, visible: true
                },
                filterOptions: {
                    enabled: false, allChecked: true, criteria: []
                },
                sortOptions: {
                    enabled: 'custom', default: false, method: 'priority'
                }
            }
        ];
        return columns;

    }
}

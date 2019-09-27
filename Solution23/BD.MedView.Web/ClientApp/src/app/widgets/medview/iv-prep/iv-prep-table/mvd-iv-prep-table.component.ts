import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter, ViewChild, OnDestroy, ViewChildren, ElementRef } from '@angular/core';

import { IvPrepConfigurationService } from '../mvd-iv-prep-configuration.service';
import { IvPrepModels } from '../../../shared/mvd-models';
import * as models from '../../../shared/mvd-models';
import { ResourceService } from 'container-framework';
import { Table } from 'primeng/table';
import { SortingService } from '../../../services/mvd-sorting-service';
import { IvPrepDlgService } from '../iv-prep-confirm-dlg/iv-prep-dlg.service';
import { Subscription, Subject, timer } from 'rxjs';
import { debounce, take } from 'rxjs/operators';
import {MvdConstants} from '../../../shared/mvd-constants';
import { MedMinedModels } from '../../../shared/medmined-models';

@Component({
    selector: 'mvd-iv-prep-table',
    templateUrl: './mvd-iv-prep-table.component.html',
    styleUrls: ['./mvd-iv-prep-table.component.scss']
})
export class IvPrepTableComponent implements OnInit, OnChanges, OnDestroy {


    @Input() deliveryMode = false;
    @Input() data: IvPrepModels.IvPrepViewModel[] = [];
    @Input() templateData: IvPrepModels.IvPrepViewModel[] = [];
    @Input() totalRecords: number;
    @Input() loading: boolean;
    @Input() isMedminedEnabled = false;

    @Output() onPriorityChange = new EventEmitter<any>();
    @Output() onHoldChange = new EventEmitter<any>();
    @Output() onLazyLoad = new EventEmitter<any>();
    @Output() onColumnReorder = new EventEmitter<any>();
    @Output() onPatientsIconAlertClick = new EventEmitter<MedMinedModels.MedMinedAlertHeader[]>();

    @ViewChild('ivPrepTable') ivPrepTable: Table;

    private toggleSubscription: Subscription;
    private toggleColumn$: Subject<any> = new Subject<any>();

    resources: any;
    cols: models.ColumnOption[] = [];
    isFirstDataLoad = true;
    rows = 15;

    priorityOptions: any[] = [];

    constructor(private resourceService: ResourceService,
        private configurationService: IvPrepConfigurationService,
        private confirmDlgService: IvPrepDlgService) {
    }

    ngOnInit() {
        this.toggleSubscription = this.onToogleColumnSubs();

        this.resources = this.getResources();
        this.priorityOptions = this.getPriorityOptions();
        const config = this.configurationService.getConfiguration(this.deliveryMode);
        this.setConfig(config);
    }

    onToogleColumnSubs() {
        return this.toggleColumn$.pipe(
            debounce(() => timer(500)))
            .subscribe((event: any) => {
                const columnOptions = this.configurationService
                    .parseToColumnSetting(event.columns, MvdConstants.IVPREP_WIDGET_KEY);
                this.configurationService.persistColumnOptions(columnOptions);
            });
    }



    ngOnDestroy(): void {
        this.toggleSubscription.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.hasOwnProperty('deliveryMode')) {
            const config = this.configurationService.getConfiguration(this.deliveryMode);
            this.setConfig(config);
        }

        if (changes.hasOwnProperty('data') && this.data) {
            this.templateData = [...this.data];
            setTimeout(() => { this.adjustMultilineLineHeight(); }, 0);
        }
    }

    getResources(): any {
        return {
            yes: this.resourceService.resource('yes')
            , no: this.resourceService.resource('no')
            , cancel: this.resourceService.resource('cancel')
            , placeOnHold: this.resourceService.resource('placeOnHold')
            , removeHold: this.resourceService.resource('removeHold')
            , placeOnholdConfirmMessage: this.resourceService.resource('placeOnholdConfirmMessage')
            , removeHoldConfirmMessage: this.resourceService.resource('removeHoldConfirmMessage')
            , changePriority: this.resourceService.resource('changePriority')
            , changePriorityNormalToStat: this.resourceService.resource('changePriorityNormalToStat')
            , changePriorityStatToNormal: this.resourceService.resource('changePriorityStatToNormal')
            , normal: this.resourceService.resource('normal')
            , stat: this.resourceService.resource('stat')
            , unknown: this.resourceService.resource('unknown')
            , noRecordsFound: this.resourceService.resource('noRecordsFound')

        };
    }

    getPriorityOptions() {
        return [
            { label: this.resources.normal, value: false },
            { label: this.resources.stat, value: true }
        ];
    }

    setConfig(config) {
        if (config) {
            this.cols = config.columns.filter((c) => c.hideOptions.visible);
            if (config.options.pagination) {
                this.rows = config.options.pagination.rows;
            }
        }
    }

    priorityChange(event: any, doseId: any) {
        const newValue = event.value;
        const originalValue = !event.value;

        let dose = this.data.find((item) => item.doseId === doseId);
        let patientName: string = this.resources.unknown;
        let infusionName: string = this.resources.unknown;
        let dlgMessage = newValue
            ? this.resources.changePriorityNormalToStat
            : this.resources.changePriorityStatToNormal;
        if (dose) {
            patientName = dose.patientName || this.resources.unknown;
            infusionName = dose.medication || this.resources.unknown;
        }
        const dlgTitle = this.resources.changePriority;
        dlgMessage = dlgMessage.replace('{{#PatientName}}', patientName).replace('{{#InfusionName}}', infusionName);

        this.confirmDlgService.openConfirmModal(dlgTitle, dlgMessage, this.resources.yes, this.resources.cancel);
        this.confirmDlgService.dlgClosed.pipe(take(1)).subscribe((confirmed: boolean) => {
            dose = this.templateData.find((item) => item.doseId === doseId);
            if (confirmed) {
                if (dose) {
                    dose.doseViewStatus = this.iconStatus(dose);
                }
                this.onPriorityChange.emit({ value: newValue, doseId: doseId });
            } else {
                if (dose) {
                    dose.priority = originalValue;
                    dose.doseViewStatus = this.iconStatus(dose);
                }
            }
        });
    }

    toggleColumn(event: any) {
        if (event.selectedColumn.length > 0 && event.columnOptions) {
            const currentConfig = this.configurationService.getConfiguration(this.deliveryMode);
            const columns = currentConfig.columns;

            this.applyColumnConfiguration(event.selectedColumn[0], columns);
            const config = this.configurationService.getConfiguration(this.deliveryMode);
            this.setConfig(config);
            this.toggleColumn$.next(config);
        }

    }

    onPatientAlertsIcon(alerts) {
        this.onPatientsIconAlertClick.emit(alerts);
    }

    private applyColumnConfiguration(
        selectedColumn: models.ColumnOption
        , columnConfig: models.ColumnOption[]): any {

        if (!selectedColumn.hideOptions.enabled) {
            return;
        }

        const currentColumnItem = columnConfig.find(c => c.field === selectedColumn.field);
        if (!currentColumnItem) {
            console.error('IVStatusComponent > applyColumnConfiguration: Column not found in configuration');
        }

        currentColumnItem.hideOptions.visible = selectedColumn.hideOptions.visible;

        this.cols = this.initializeVisibleColumns(columnConfig);
        this.configurationService.setHideConfiguration(columnConfig, this.deliveryMode);
    }

    private initializeVisibleColumns(initialConfiguration: any[]): any[] {
        return initialConfiguration
            .filter((col) => col.hideOptions.visible)
            .map((col) => col);
    }

    setIconStatus(dose: IvPrepModels.IvPrepViewModel) {
        if (dose) {
            dose.doseViewStatus = this.iconStatus(dose);
        }
    }

    private iconStatus(dose) {
        let status;
        if (dose.cancelled) {
            status = 'CANCELED';
        } else if (dose.isOnHold) {
            status = dose.priority ? 'ONHOLDSTAT' : 'ONHOLD';
        } else {
            status = dose.priority ? 'STAT' : 'Normal';
        }
        return status;
    }

    setHoldStatus(dose: IvPrepModels.IvPrepViewModel, status: boolean) {
        dose.isOnHold = status;
        dose.isOnHoldView = status;
        dose.doseViewStatus = this.iconStatus(dose);
    }

    holdChange(state: boolean, doseId: any) {
        const newValue = state;
        const originalValue = !state;

        let dose = this.data.find((item) => item.doseId === doseId);
        let patientName: string = this.resources.unknown;
        let infusionName: string = this.resources.unknown;
        let dlgMessage = newValue
            ? this.resources.placeOnholdConfirmMessage
            : this.resources.removeHoldConfirmMessage;
        if (dose) {
            patientName = dose.patientName || this.resources.unknown;
            infusionName = dose.medication || this.resources.unknown;
        }
        dlgMessage = dlgMessage.replace('{{#PatientName}}', patientName).replace('{{#InfusionName}}', infusionName);
        const dlgTitle = newValue ? this.resources.placeOnHold : this.resources.removeHold;

        this.confirmDlgService.openConfirmModal(dlgTitle, dlgMessage, this.resources.yes, this.resources.cancel);
        this.confirmDlgService.dlgClosed.pipe(take(1)).subscribe((confirmed: boolean) => {
            dose = this.data.find((item) => item.doseId === doseId);
            if (confirmed) {
                if (dose) {
                    this.onHoldChange.emit({ state: newValue, doseId: doseId });
                }
            } else {
                if (dose) {
                    dose.isOnHold = originalValue;
                    dose.isOnHoldView = originalValue;
                }
            }
        });
    }

    isHoldEnabled(dose: IvPrepModels.IvPrepViewModel) {
        return (dose.status === 'QUEUEDPREP' || dose.status === 'READYPREP') && !dose.cancelled && !dose.isHoldDisabled;
    }

    onSort(event) {
        console.log(event);
        const configuration = this.configurationService.getConfiguration(this.deliveryMode);
        if (configuration) {
            configuration.options.sort = event;
            this.configurationService.setUserConfiguration(configuration);
        }
    }

    onPage(event) {
        const configuration = this.configurationService.getConfiguration(this.deliveryMode);
        configuration.options.pagination = event;
        this.configurationService.setUserConfiguration(configuration);
    }

    onLazyLoadData(event) {
        const configuration = this.configurationService.getConfiguration(this.deliveryMode);
        event.fieldName = this.getSortableFieldName(event.sortField, configuration.columns);
        this.onLazyLoad.emit(event);
    }

    getSortableFieldName(field: string, configuration: models.ColumnOption[]): string {
        let defaultField = 'doseId';
        if (configuration.length && field) {
            const columnConfig = configuration.find((item) => item.field === field);
            if (columnConfig && columnConfig.sortFieldName) {
                defaultField = columnConfig.sortFieldName;
            }
        }
        return defaultField;
    }

    paginateTable(event) {
        const metadata = this.ivPrepTable.createLazyLoadMetadata();
        if (metadata.first !== event.first || metadata.rows !== event.rows) {
            metadata.first = event.first;
            metadata.rows = event.rows;
            this.ivPrepTable.onPageChange(event);
        }
    }

    onColReorder(event) {
        this.onColumnReorder.emit(event);
    }

    setSort(order: number, field: string) {
        this.ivPrepTable.sortOrder = order;
        this.ivPrepTable.sortField = field;
    }

    private adjustMultilineLineHeight() {
        const multiLineCellContent = Array.from(document.querySelectorAll(
            '.ivPrepTable .ui-table .ui-table-tbody > tr > td > div.multi-line-cell'));
        const elements = multiLineCellContent.forEach((e: any) => {
            if (e.children && e.children.length === 1) {
                // Adjust size for correct position of tooltips in single line 'Patient Name' column
                if (e.classList.contains('patientNameCell')) {
                    e.style.display = 'inline-block';
                    e.style.width = 'auto';
                }

                e.children[0].style.lineHeight = '40px';
                e.children[0].style.width = null;
            }
        });
    }
}

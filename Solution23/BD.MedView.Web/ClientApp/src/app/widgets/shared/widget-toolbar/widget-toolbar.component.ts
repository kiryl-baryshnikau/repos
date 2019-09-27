import { Component, Input, OnInit, OnDestroy, ViewChild, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import {
    CfwWidgetToolbarService, EventBusService, CfwToolbarItem, ResourceService,
    CfwToolbarItemState, CfwToolbarItemStateChange
} from 'container-framework';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { DataFormatPipe } from '../../pipes/mvd-data-format.pipe';
import { MultipleValueFilterComponent } from '../multi-value-filter-new/mvd-column-multiple-value-new.component';
import { DateRangePicker } from '../../shared/filters/mvd-date-range-picker.component';
import { HoursFrameFilterComponent } from '../hours-frame-filter/mvd-hours-frame-filter.component';
import * as _ from 'lodash';
import { IvPrepTimeFrameFilter } from '../mvd-models';

@Component({
    selector: 'mvd-widget-toolbar',
    templateUrl: './widget-toolbar.component.html',
    styleUrls: ['./widget-toolbar.component.scss']
})
export class WidgetToolbarComponent implements OnInit, OnDestroy, OnChanges {
    @ViewChild('multiValueFilter') multiValueFilter: MultipleValueFilterComponent;


    @Input() appCode: string;
    @Input() widgetId: string;

    @Input() showRemove = true;
    @Input() showColumnSelector = true;
    @Input() showExportTable = true;
    @Input() showSetTimeframe = true;
    @Input() showDataFilter = true;
    @Input() showRefresh = true;

    @Input() showSettings = false;
    @Input() showIvPrepTimeFrameFilter = false;
    @Input() setTimeFrameDisabled = false;
    @Input() setIvPrepTimeFrameDisabled = false;
    @Input() dataFilterDisabled = false;
    @Input() useHoursFrameFilter = false;
    @Input() hourValue;
    @Input() ivPrepHourFilterValue: IvPrepTimeFrameFilter;
    @Input() wideMultipleValueBoxes = false;

    // Data filters
    @Output() initDataFilters: EventEmitter<any> = new EventEmitter();
    @Output() applyDataFiltersClicked: EventEmitter<any> = new EventEmitter();
    @Output() resetDataFiltersClicked: EventEmitter<any> = new EventEmitter();
    @Output() cancelDataFiltersClicked: EventEmitter<any> = new EventEmitter();
    @Output() widgetSettingsClicked: EventEmitter<void> = new EventEmitter<void>();

    @Output() dataFilterOpened: EventEmitter<void> = new EventEmitter<void>();
    @Output() dataFilterClosed: EventEmitter<void> = new EventEmitter<void>();

    // Export functionality
    @Output() exportButtonClicked: EventEmitter<any> = new EventEmitter();

    assetsUrl = './dist/assets/images/';

    isTimeFilterVisible = false;
    isColumnSelectorVisible = false;
    isExportPanelVisible = false;
    isDataFilterVisible = false;
    isIvPrepTimeFilterVisible = false;

    hoursOptions = [-8, -12, -24, 2, 4, 8];
    ivPrepFilterFutureHourOptions = [];
    ivPrepFilterPastHourOptions = [];

    // Column selector
    @Input() tableColumns: any[];
    @Output() toggleColumn = new EventEmitter();

    // Date options
    @Output() dateFilterDateChange = new EventEmitter();
    @Output() dateFilterPanelOpened = new EventEmitter();
    @Output() ivPrepDateFilterPanelOpened = new EventEmitter();
    @Output() ivPrepDateFilterDateChange = new EventEmitter();
    @ViewChild(DateRangePicker) dateRangeFilter: DateRangePicker;
    @ViewChild(HoursFrameFilterComponent) hourFrameFilter: HoursFrameFilterComponent;

    private toolbarSubscription: Subscription;
    private cfwToolbarItemClicked: string;

    private refreshButtonId = 'refreshButton';
    private removeButtonId = 'removeButton';
    private timeFilterButtonId = 'clockFilterButton';
    private ivPrepTimeFilterButtonId = 'ivPrepClockFilterButton';
    private columnSelectorButtonId = 'columnSelectorButton';
    private dataFilterButtonId = 'dataFilterButton';
    private exportButtonId = 'exportButton';
    private settingsButtonId = 'settingsButton';

    resources = {
        refreshWidget: this.resourceService.resource('refreshWidget')
        , remove: this.resourceService.resource('remove')
        , filterInfusions: this.resourceService.resource('filterInfusions')
        , setTimeframe: this.resourceService.resource('setTimeframe')
        , exportTable: this.resourceService.resource('exportTable')
        , showHideColumns: this.resourceService.resource('showHideColumns')
        , displayLast24Hours: this.resourceService.resource('displayLast24Hours')
        , displayLast12Hours: this.resourceService.resource('displayLast12Hours')
        , displayLast8Hours: this.resourceService.resource('displayLast8Hours')
        , showSettings: this.resourceService.resource('showSettings')
    };

    constructor(
        private readonly resourceService: ResourceService,
        private eventBus: EventBusService,
        private readonly cfwWidgetToolbarService: CfwWidgetToolbarService,
        private dataFormatPipe: DataFormatPipe) {
    }

    ngOnInit(): void {
        this.setUpToolbar();
        this.toolbarSubscription = this.toolbarState$().subscribe(state => this.onToolbarButtonClicked(state.data as CfwToolbarItem));
        this.initializeFilterOptions();
    }

    ngOnDestroy(): void {
        this.toolbarSubscription.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['setTimeFrameDisabled']) {
            setTimeout(() => {
                this.disableButton(this.timeFilterButtonId, changes['setTimeFrameDisabled'].currentValue);
            }, 0);
        }
        if (changes['dataFilterDisabled']) {
            setTimeout(() => {
                this.disableButton(this.dataFilterButtonId, changes['dataFilterDisabled'].currentValue);
            }, 0);
        }
        if (changes['setIvPrepTimeFrameDisabled']) {
            setTimeout(() => {
                this.disableButton(this.ivPrepTimeFilterButtonId, changes['setIvPrepTimeFrameDisabled'].currentValue);
            }, 0);
        }
    }

    private initializeFilterOptions(): void {
        for (let i = 1; i <= 12; i++) {
            this.ivPrepFilterFutureHourOptions.push(i);
        }
        this.ivPrepFilterPastHourOptions = _.cloneDeep(this.ivPrepFilterFutureHourOptions);
    }

    private disableButton(id: string, isDisabled: boolean) {
        const stateChangeInfo = {
            appCode: this.appCode,
            widgetId: this.widgetId,
            id: id,
            newState: isDisabled ? CfwToolbarItemState.Disabled : CfwToolbarItemState.Default
        } as CfwToolbarItemStateChange;
        this.cfwWidgetToolbarService.updateState(stateChangeInfo);
    }

    private setUpToolbar() {
        const items: CfwToolbarItem[] = [];
        if (this.showRemove) {
            items.push({
                id: this.removeButtonId, tooltipText: this.resources.remove,
                imageDefaultUrl: this.assetsUrl + 'trash-can.png',
                imageDisabledUrl: this.assetsUrl + 'trash-can.disabled.png'
            });
        }
        if (this.showColumnSelector) {
            items.push({
                id: this.columnSelectorButtonId, tooltipText: this.resources.showHideColumns,
                imageDefaultUrl: this.assetsUrl + 'column-selector.png',
                imageDisabledUrl: this.assetsUrl + 'column-selector.disabled.png'
            });
        }
        if (this.showSetTimeframe) {
            items.push({
                id: this.timeFilterButtonId, tooltipText: this.resources.setTimeframe,
                imageDefaultUrl: this.assetsUrl + 'clock.png',
                imageDisabledUrl: this.assetsUrl + 'clock.disabled.png',
                state: this.setTimeFrameDisabled ? CfwToolbarItemState.Disabled : CfwToolbarItemState.Default
            });
        }
        if (this.showIvPrepTimeFrameFilter) {
            items.push({
                id: this.ivPrepTimeFilterButtonId, tooltipText: this.resources.setTimeframe,
                imageDefaultUrl: this.assetsUrl + 'clock.png',
                imageDisabledUrl: this.assetsUrl + 'clock.disabled.png',
                state: this.setIvPrepTimeFrameDisabled ? CfwToolbarItemState.Disabled : CfwToolbarItemState.Default
            });
        }
        if (this.showDataFilter) {
            items.push({
                id: this.dataFilterButtonId, tooltipText: this.resources.filterInfusions,
                imageDefaultUrl: this.assetsUrl + 'filter.png',
                imageDisabledUrl: this.assetsUrl + 'filter.disabled.png',
                state: this.dataFilterDisabled ? CfwToolbarItemState.Disabled : CfwToolbarItemState.Default
            });
        }
        if (this.showExportTable) {
            items.push({
                id: this.exportButtonId, tooltipText: this.resources.exportTable,
                imageDefaultUrl: this.assetsUrl + 'export.png',
                imageDisabledUrl: this.assetsUrl + 'export.disabled.png'
            });
        }
        if (this.showSettings) {
            items.push({
                id: this.settingsButtonId,
                tooltipText: this.resources.showSettings,
                imageDefaultUrl: this.assetsUrl + 'settings.png',
                imageDisabledUrl: this.assetsUrl + 'settings.disabled.png'
            });
        }
        if (this.showRefresh) {
            items.push({
                id: this.refreshButtonId, tooltipText: this.resources.refreshWidget,
                imageDefaultUrl: this.assetsUrl + 'refresh.png',
                imageDisabledUrl: this.assetsUrl + 'refresh.disabled.png'
            });
        }

        this.cfwWidgetToolbarService.setItems(this.appCode, this.widgetId, items);
        this.cfwToolbarItemClicked = this.eventBus.subscribeCfwToolbarItemClicked(this.appCode, this.widgetId);
    }

    private onToolbarButtonClicked(toolbarItem: CfwToolbarItem) {
        console.log('WidgetToolbarComponent.onToolbarButtonClicked()', toolbarItem);
        if (toolbarItem.id === this.refreshButtonId) {
            this.closeAllFilterPanels();
            this.eventBus.emitRequestManualRefresh(this.appCode, this.widgetId);
        } else if (toolbarItem.id === this.removeButtonId) {
            this.closeAllFilterPanels();
            this.eventBus.emitRemovePortlet(this.appCode, this.widgetId);
        } else if (toolbarItem.id === this.timeFilterButtonId) {
            this.onTimeframeFilterButtonClick();
        } else if (toolbarItem.id === this.columnSelectorButtonId) {
            this.onColumnSelectorButtonClick();
        } else if (toolbarItem.id === this.exportButtonId) {
            this.onExportButtonClick();
        } else if (toolbarItem.id === this.dataFilterButtonId) {
            this.onDataFilterButtonClick();
        } else if (toolbarItem.id === this.settingsButtonId) {
            this.closeAllFilterPanels();
            this.settingsClicked();
        } else if (toolbarItem.id === this.ivPrepTimeFilterButtonId) {
            this.onIvPrepTimeframeFilterButtonClick();
        }
    }

    toolbarState$() {
        return this.eventBus.eventBusState$.pipe(
            filter(({ target }) => target === this.cfwToolbarItemClicked)
        );
    }

    onSelectedColumnsChange(selectedColumns: string[]) {
        console.log('WidgetToolbarComponent.onSelectedColumnsChange()', selectedColumns);
    }

    public get isSlidePanelVisible(): boolean {
        return this.isColumnSelectorVisible || this.isTimeFilterVisible ||
               this.isExportPanelVisible || this.isDataFilterVisible ||
               this.isIvPrepTimeFilterVisible;
    }

    private onTimeframeFilterButtonClick() {
        if (this.isSlidePanelVisible && !this.isTimeFilterVisible) { this.closeAllFilterPanels(); }

        if (!this.isTimeFilterVisible) { this.dateFilterPanelOpened.emit(); }
        this.isTimeFilterVisible = !this.isSlidePanelVisible;

        const buttonState = this.isSlidePanelVisible ? CfwToolbarItemState.Pressed : CfwToolbarItemState.Default;
        this.updateButtonState(this.timeFilterButtonId, buttonState);
    }

    private onIvPrepTimeframeFilterButtonClick() {
        if (this.isSlidePanelVisible && !this.isIvPrepTimeFilterVisible) { this.closeAllFilterPanels(); }

        if (!this.isIvPrepTimeFilterVisible) { this.ivPrepDateFilterPanelOpened.emit(); }
        this.isIvPrepTimeFilterVisible = !this.isSlidePanelVisible;

        const buttonState = this.isSlidePanelVisible ? CfwToolbarItemState.Pressed : CfwToolbarItemState.Default;
        this.updateButtonState(this.ivPrepTimeFilterButtonId, buttonState);
    }

    private onColumnSelectorButtonClick() {
        if (this.isSlidePanelVisible && !this.isColumnSelectorVisible) { this.closeAllFilterPanels(); }

        this.isColumnSelectorVisible = !this.isSlidePanelVisible;

        const buttonState = this.isSlidePanelVisible ? CfwToolbarItemState.Pressed : CfwToolbarItemState.Default;
        this.updateButtonState(this.columnSelectorButtonId, buttonState);
    }

    private closeAllFilterPanels() {
        this.isColumnSelectorVisible = false;
        this.isTimeFilterVisible = false;
        this.isExportPanelVisible = false;
        this.isDataFilterVisible = false;
        this.isIvPrepTimeFilterVisible = false;

        this.cfwWidgetToolbarService.getItems$(this.appCode, this.widgetId)
            .subscribe((items) => {
                items.forEach((item) => {
                    if (item.state
                        && item.state.toString() !== CfwToolbarItemState.Disabled.toString()
                        && item.state.toString() !== CfwToolbarItemState.Default.toString()
                    ) {
                        this.updateButtonState(item.id, CfwToolbarItemState.Default);
                    }
                });
            });
    }

    private updateButtonState(id: string, state: CfwToolbarItemState) {
        const buttonState: CfwToolbarItemStateChange = {
            appCode: this.appCode,
            widgetId: this.widgetId,
            id: id,
            newState: state
        };

        this.cfwWidgetToolbarService.updateState(buttonState);
    }

    private onExportButtonClick() {
        if (this.isSlidePanelVisible && !this.isExportPanelVisible) { this.closeAllFilterPanels(); }

        this.isExportPanelVisible = !this.isExportPanelVisible;
    }

    onExportPanelExport(event: any[]) {
        this.isExportPanelVisible = false;
        this.exportButtonClicked.emit(event);
    }

    onExportPanelCancel() {
        this.isExportPanelVisible = false;
    }

    private onDataFilterButtonClick() {
        if (this.isSlidePanelVisible && !this.isDataFilterVisible) { this.closeAllFilterPanels(); }

        this.isDataFilterVisible = !this.isDataFilterVisible;
        if (this.isDataFilterVisible) {
            this.dataFilterOpened.emit();
        } else {
            this.dataFilterClosed.emit();
        }
    }

    dataFiltersApplyClicked(event: any[]) {
        this.isDataFilterVisible = false;
        this.applyDataFiltersClicked.emit(event);
    }

    dataFiltersCancelClicked() {
        this.isDataFilterVisible = false;
        this.cancelDataFiltersClicked.emit(event);
    }

    onMultiValueFiltersInit(event: any[]) {
        this.initDataFilters.emit(event);
    }

    dataFiltersResetClicked(event: any[]) {
        this.isDataFilterVisible = false;
        this.resetDataFiltersClicked.emit(event);
    }

    timeFilterApplyClicked(event: any) {
        this.dateFilterDateChange.emit(event);
        this.isTimeFilterVisible = false;
    }

    timeFilterCancelClicked() {
        this.isTimeFilterVisible = false;
    }

    ivPrepTimeFilterApplyClicked(event: any) {
        this.ivPrepDateFilterDateChange.emit(event);
        this.isIvPrepTimeFilterVisible = false;
    }

    ivPrepTimeFilterCancelClicked() {
        this.isIvPrepTimeFilterVisible = false;
    }

    settingsClicked() {
        this.widgetSettingsClicked.emit();
    }
}

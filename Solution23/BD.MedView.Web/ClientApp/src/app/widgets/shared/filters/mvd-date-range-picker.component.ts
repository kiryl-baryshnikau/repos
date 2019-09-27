import { Component, Output, EventEmitter } from '@angular/core';

import { ResourceService } from 'container-framework';

import { DataFormatPipe } from '../../pipes/mvd-data-format.pipe';

import * as moment from 'moment';

@Component({
    moduleId: module.id,
    selector: 'mvd-date-range-picker',
    templateUrl: 'mvd-date-range-picker.component.html',
    styleUrls: [`./mvd-widget-filters.scss`]
})
export class DateRangePicker {

    @Output() dateChanged = new EventEmitter();
    @Output() applyClicked: EventEmitter<any> = new EventEmitter();
    @Output() cancelClicked: EventEmitter<void> = new EventEmitter();

    resources: any;

    currentDateValue = 'currentDate';
    dateRangeValue = 'dateRange';

    dateOptionSelected: string;

    currentDateOptions: any[];
    defaultCurrentDate = 24;
    selectedCurrentDate: number;

    startDateOptions: any[];
    stopDateOptions: any[];

    isModified = false;

    startDateId: number;
    stopDateId: number;

    constructor(private resourceService: ResourceService,
        private dataFormatPipe: DataFormatPipe) {
        this.resources = this.getResources();

        this.currentDateOptions = this.generateCurrentDateOptions();
        this.startDateOptions = this.generateStartDateOptions();

        setTimeout(() => {
            this.dateOptionSelected = this.currentDateValue;
            this.selectedCurrentDate = this.defaultCurrentDate;
        }, 0);
    }

    onCurrentDateSelected() {
        this.isModified = true;
    }

    onStartDateSelected(dateId: any) {
        const currentDate: Date = new Date();
        const startDate = this.getDateByOptionId(this.startDateOptions, dateId);
        this.stopDateOptions = this.generateEndDateOptions(startDate, currentDate);
        this.stopDateId = undefined;

        this.isModified = true;
    }

    onStopDateSelected(dateId: any) {
        this.isModified = true;
    }

    initializeFilters(filters: any, emitDateChange = true) {
        // Fixes issue when user refreshes the browser the date range's current selection is not displaying
        if (filters.api.startDate && filters.dateOptionSelected && filters.dateOptionSelected === this.dateRangeValue) {
            this.dateOptionSelected = this.dateRangeValue;
            this.startDateOptions = this.generateStartDateOptions();

            const filterStartDate = new Date(filters.api.startDate);

            if (this.startDateOptions &&
                (filterStartDate.getTime() - this.startDateOptions[0].dateValue.getTime() >= 0) &&
                (filterStartDate.getTime() - this.startDateOptions[this.startDateOptions.length - 1].dateValue.getTime() <= 0)
            ) {
                this.startDateId = this.getIdByOptionDate(this.startDateOptions, filters.api.startDate);
                if (filters.api.stopDate) {
                    const current: Date = new Date();
                    const filterEndDate = new Date(filters.api.stopDate);

                    const startDate = this.getDateByOptionId(this.startDateOptions, this.startDateId);
                    this.stopDateOptions = this.generateEndDateOptions(startDate, current);

                    const firstStopDateOption = this.stopDateOptions[0].dateValue;
                    const lastStopDateOption = this.stopDateOptions[this.stopDateOptions.length - 1].dateValue;
                    if (this.stopDateOptions && (filterEndDate.getTime() - firstStopDateOption.getTime() >= 0) &&
                        (filterEndDate.getTime() - lastStopDateOption.getTime() <= 0)) {
                        this.stopDateId = this.getIdByOptionDate(this.stopDateOptions, filters.api.stopDate);
                    }
                } else {
                    this.stopDateId = undefined;
                }
            } else {
                this.startDateId = undefined;
                this.stopDateId = undefined;
            }

        }
        if (filters.dateOptionSelected === this.currentDateValue && this.currentDateOptions.length) {
            this.dateOptionSelected = this.currentDateValue;
            this.selectedCurrentDate = filters.selectedCurrentDate;
        }
        if (emitDateChange) {
            this.dateChanged.emit(this.buildDateOutput(filters));
        }
        this.isModified = false;
    }

    isValid(): boolean {
        if (this.dateOptionSelected !== this.currentDateValue && this.dateOptionSelected !== this.dateRangeValue) { return false; }
        if (this.dateOptionSelected === this.currentDateValue) {
            return this.selectedCurrentDate != null && this.selectedCurrentDate !== undefined;
        }
        if (this.dateOptionSelected === this.dateRangeValue) {
            return this.startDateId &&
                this.stopDateId &&
                this.getDateByOptionId(this.startDateOptions, this.startDateId) <=
                this.getDateByOptionId(this.stopDateOptions, this.stopDateId);
        }

        return false;
    }

    buildDateOutput(filters?: any): any {
        let startDate: Date;
        let stopDate: Date;

        const globalSearchCriteria = filters ? filters.globalSearchCriteria : '';
        if (filters) {
            this.dateOptionSelected = filters.dateOptionSelected ? filters.dateOptionSelected : this.dateOptionSelected;
            this.selectedCurrentDate = filters.selectedCurrentDate ? filters.selectedCurrentDate : this.selectedCurrentDate;
            this.startDateId = filters.api.startDate ? this.getIdByOptionDate(this.startDateOptions, filters.api.startDate) : undefined;
            this.stopDateId = filters.api.stopDate ? this.getIdByOptionDate(this.stopDateOptions, filters.api.stopDate) : undefined;
        }

        if (this.dateOptionSelected === this.currentDateValue && this.selectedCurrentDate) {
            startDate = new Date();
            startDate.setHours(startDate.getHours() - this.selectedCurrentDate);
            this.startDateId = undefined;
            this.stopDateId = undefined;
            return {
                startDate: startDate,
                stopDate: new Date(),
                isValid: true,
                dateOptionSelected: this.dateOptionSelected,
                selectedCurrentDate: this.selectedCurrentDate,
                globalSearchCriteria: globalSearchCriteria
            };
        }

        startDate = this.getDateByOptionId(this.startDateOptions, this.startDateId);
        stopDate = this.getDateByOptionId(this.stopDateOptions, this.stopDateId);
        if (this.dateOptionSelected === this.dateRangeValue && this.startDateId && this.stopDateId && startDate < stopDate) {
            this.cleanCurrentDateOptions();
            return {
                startDate: startDate,
                stopDate: stopDate,
                isValid: true,
                dateOptionSelected: this.dateOptionSelected,
                globalSearchCriteria: globalSearchCriteria
            };
        }
        return { isValid: false, error: this.resources.invalidDateRangeError };
    }

    generateCurrentDateOptions(): any[] {
        return [
            { label: this.resources.displayLast24Hrs, value: 24 },
            { label: this.resources.displayLast12Hrs, value: 12 },
            { label: this.resources.displayLast8Hrs, value: 8 }
        ];
    }

    generateStartDateOptions(): any[] {
        const date1 = new Date();
        date1.setHours(0, 0, 0, 0);
        date1.setHours(date1.getHours() - 48);

        const date2 = new Date();
        date2.setHours(0, 0, 0, 0);
        date2.setHours(date2.getHours() - 24);

        const date3 = new Date();
        date3.setHours(0, 0, 0, 0);
        return [
            { label: this.dataFormatPipe.transform(date1, 'date'), value: 1, dateValue: date1 },
            { label: this.dataFormatPipe.transform(date2, 'date'), value: 2, dateValue: date2 },
            { label: this.dataFormatPipe.transform(date3, 'date'), value: 3, dateValue: date3 }
        ];

    }

    generateEndDateOptions(startDate: Date, currentDate: Date): any[] {
        const endDateOptions: any[] = [];
        const duration = moment.duration(moment(currentDate).diff(moment(startDate)));
        const days = Math.floor(duration.asDays());
        let counter = days;

        for (let i = 0; i <= days; i++) {
            const dateOption = new Date();
            dateOption.setDate(dateOption.getDate() - counter);
            dateOption.setHours(23, 59, 0, 0);
            endDateOptions.push({ label: this.dataFormatPipe.transform(dateOption, 'date'), value: i + 1, dateValue: dateOption });
            --counter;
        }
        return endDateOptions;
    }

    getResources() {
        return {
            displayLast24Hrs: this.resourceService.resource('displayLast24Hrs'),
            displayLast12Hrs: this.resourceService.resource('displayLast12Hrs'),
            displayLast8Hrs: this.resourceService.resource('displayLast8Hrs'),
            specificDateRange: this.resourceService.resource('specificDateRange'),
            current: this.resourceService.resource('current'),
            invalidDateRangeError: this.resourceService.resource('invalidDateRangeError'),
            start: this.resourceService.resource('start'),
            end: this.resourceService.resource('end'),
            to: this.resourceService.resource('to'),
            setTimeframe: this.resourceService.resource('setTimeframe'),
            cancel: this.resourceService.resource('cancel'),
            apply: this.resourceService.resource('apply')
        };
    }

    cleanDateRangeOptions(event: any) {
        this.isModified = true;

        this.startDateId = undefined;
        this.stopDateId = undefined;

        this.dateOptionSelected = this.currentDateValue;
        this.selectedCurrentDate = this.defaultCurrentDate;
    }

    cleanCurrentDateOptions() {
        this.isModified = true;
        this.selectedCurrentDate = this.defaultCurrentDate;
    }

    getLongestDateRangeOptions() {
        const params: any = {};
        const startDates = this.generateStartDateOptions();
        if (startDates.length) {
            params.startDate = startDates[0].dateValue;
            const currentDate = new Date();
            const endDates = this.generateEndDateOptions(params.startDate, currentDate);
            if (endDates.length) {
                params.stopDate = endDates[endDates.length - 1].dateValue;
            }
        }
        return params;
    }

    createStartDateRange() {
        this.startDateOptions = this.generateStartDateOptions();
        if (this.startDateId) {
            const firstStartDateOption = this.startDateOptions[0].dateValue;
            const lastStartDateOption = this.startDateOptions[this.startDateOptions.length - 1].dateValue;
            const startDate = this.getDateByOptionId(this.startDateOptions, this.startDateId);
            if ((startDate.getTime() - firstStartDateOption.getTime() < 0) ||
                (startDate.getTime() - lastStartDateOption.getTime() > 0)
            ) {
                this.startDateId = this.startDateOptions[0].value;
                this.stopDateOptions =
                    this.generateEndDateOptions(this.getDateByOptionId(this.startDateOptions, this.startDateId), new Date());
                this.stopDateId = undefined;
            }
        }
    }

    onCancel() {
        this.cancelClicked.emit();
    }
    onSave() {
        this.applyClicked.emit(this.buildDateOutput());
    }

    private getDateByOptionId(options: any[], id: number): Date {
        if (!options) { return undefined; }

        const option = options.find(o => o.value === id);
        if (option) {
            return option.dateValue;
        } else {
            return undefined;
        }
    }

    private getIdByOptionDate(options: any[], dateValue: Date): number {
        if (!options) { return undefined; }

        const option = options.find(o => moment(o.dateValue).isSame(dateValue, 'minute'));
        if (option) {
            return option.value;
        } else {
            return undefined;
        }
    }
}


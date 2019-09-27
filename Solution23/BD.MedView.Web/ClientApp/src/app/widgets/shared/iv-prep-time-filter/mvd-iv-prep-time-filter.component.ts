import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { ResourceService } from 'container-framework';
import { IvPrepTimeFrameFilter } from '../mvd-models';

@Component({
    selector: 'mvd-iv-prep-time-filter',
    templateUrl: './mvd-iv-prep-time-filter.component.html',
    styleUrls: ['./mvd-iv-prep-time-filter.component.scss']
})
export class IvPrepTimeFilterComponent implements OnInit, OnChanges {

    @Output() ivPrepTimeFilterApplyClicked: EventEmitter<IvPrepTimeFrameFilter> = new EventEmitter();
    @Output() ivPrepTimeFilterCancelClicked: EventEmitter<void> = new EventEmitter<void>();

    @Input() value: IvPrepTimeFrameFilter;
    @Input() pastOptions: number[] = [];
    @Input() futureOptions: number[] = [];

    resources: any;
    defaults = {
        pastHours: 8,
        futureHours: 8
    };

    pastHourSelected;
    futureHourSelected;
    isModified = false;

    constructor(private resourcesService: ResourceService) {
        this.resources = this.getResources();
        this.setDefaults();
    }

    ngOnInit() {
    }

    setDefaults(): void {
        this.pastHourSelected = this.defaults.pastHours;
        this.futureHourSelected = this.defaults.futureHours;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.hasOwnProperty('pastOptions') && this.pastOptions.length) {
            this.pastOptions = this.generatePastOptions(this.pastOptions);
        }
        if (changes.hasOwnProperty('futureOptions') && this.futureOptions.length) {
            this.futureOptions = this.generateFutureOptions(this.futureOptions);
        }
        if (changes.hasOwnProperty('value') && this.value) {
            this.setOptions(this.value);
        }
    }

    setOptions(value: IvPrepTimeFrameFilter) {
        this.value = value;
        this.futureHourSelected = value.futureOptionValue;
        this.pastHourSelected = value.pastOptionValue;
        this.isModified = false;
    }

    pastDropdownChange(event) {
        this.isModified = true;
    }

    futureDropdownChange(event) {
        this.isModified = true;
    }

    onCancel() {
        this.ivPrepTimeFilterCancelClicked.emit();
    }

    onSave() {
        this.ivPrepTimeFilterApplyClicked.emit(this.buildDateOutput());
    }

    private buildDateOutput(): IvPrepTimeFrameFilter {
        return {
            futureOptionValue: this.futureHourSelected,
            pastOptionValue: this.pastHourSelected
        } as IvPrepTimeFrameFilter;
    }

    private generatePastOptions(hourOptions: number[]): any[] {

        if (!hourOptions.length) {
            return [];
        }

        const pastOptions = hourOptions.map((option) => {
            const hourOption = Math.abs(option);
            const label = hourOption > 1 ?
                        (this.resources.hoursAgoTemplateString || '').replace('{{value}}', hourOption) :
                        (this.resources.hoursAgoTemplateStringSingular || '').replace('{{value}}', hourOption);
            return { label, value: option };
        });
        return pastOptions;
    }

    private generateFutureOptions(hourOptions: number[]): any[] {

        if (!hourOptions.length) {
            return [];
        }

        const futureOptions = hourOptions.map((option) => {
            const hourOption = Math.abs(option);
            const label = hourOption > 1 ?
                    (this.resources.hoursInFutreTemplateString || '').replace('{{value}}', hourOption) :
                    (this.resources.hoursInFutreTemplateStringSingular || '').replace('{{value}}', hourOption);
            return { label, value: option };
        });
        return futureOptions;
    }

    private getResources() {

        return {
            setTimeframe: this.resourcesService.resource('setTimeframe')
            , excludeIvPrepDosesThat: this.resourcesService.resource('excludeIvPrepDosesThat')
            , wereCompleted: this.resourcesService.resource('wereCompleted')
            , areQueuedMoreThan: this.resourcesService.resource('areQueuedMoreThan')
            , hoursInFutreTemplateString: this.resourcesService.resource('hoursInFutreTemplateString')
            , hoursAgoTemplateString: this.resourcesService.resource('hoursAgoTemplateString')
            , hoursInFutreTemplateStringSingular: this.resourcesService.resource('hoursInFutreTemplateStringSingular')
            , hoursAgoTemplateStringSingular: this.resourcesService.resource('hoursAgoTemplateStringSingular')
            , cancel: this.resourcesService.resource('cancel')
            , apply: this.resourcesService.resource('apply')
        };

    }
}

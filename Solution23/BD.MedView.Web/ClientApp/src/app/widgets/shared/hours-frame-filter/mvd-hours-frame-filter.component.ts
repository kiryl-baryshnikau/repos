import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { ResourceService } from 'container-framework';
import { SimpleChanges } from '@angular/core';

@Component({
    selector: 'mvd-hours-frame-filter',
    templateUrl: './mvd-hours-frame-filter.component.html',
    styleUrls: ['./mvd-hours-frame-filter.component.scss']
})
export class HoursFrameFilterComponent implements OnInit, OnChanges {

    @Output() applyClicked: EventEmitter<any> = new EventEmitter();
    @Output() cancelClicked: EventEmitter<void> = new EventEmitter<void>();

    @Input() options: number[] = [];
    @Input() value; 

    resources: any;
    pastOptions: number[] = [];
    futureOptions: number[] = [];

    defaults = {
        hourOption: -1,
        pastHours: -12,
        futureHours: 8
    };

    hourOptionSelected;
    pastHourSelected;
    futureHourSelected;
    isModified = false; 

    constructor(private resourcesService: ResourceService) {
        this.resources = this.getResources();
        this.setDefaults(); 
    }

    ngOnInit() {
    }

    setDefaults(): any {
        this.hourOptionSelected = this.defaults.hourOption;
        this.pastHourSelected = this.defaults.pastHours;
        this.futureHourSelected = this.defaults.futureHours; 
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.hasOwnProperty('options') && this.options.length) {
            this.pastOptions = this.generatePastOptions(this.options);
            this.futureOptions = this.generateFutureOptions(this.options);
        }

        if (changes.hasOwnProperty('value') && this.value) {
            this.setOptions(this.value);
        }
    }

    setOptions(value: number) {
        this.value = value; 
        this.hourOptionSelected = value > 0 ? 1 : -1;
        if (this.hourOptionSelected > 0) {
            this.futureHourSelected = value;
        } else {
            this.pastHourSelected = value;
        }
        this.isModified = false;
    }


    pastRadioButtonClick(event) {
        this.futureHourSelected = this.defaults.futureHours;
        this.isModified = true;
    }

    futureRadioButtonClick(event) {
        this.pastHourSelected = this.defaults.pastHours;
        this.isModified = true;
    }

    pastDropdownChange(event) {
        this.isModified = true;
    }

    futureDropdownChange(event) {
        this.isModified = true;
    }

    onCancel() {
        this.cancelClicked.emit();
    }

    onSave() {
        this.applyClicked.emit(this.buildDateOutput());
    }

    private buildDateOutput(): any {
        if (this.hourOptionSelected > 0) {
            return this.futureHourSelected; 
        }
        return this.pastHourSelected; 
    }

    private generatePastOptions(hourOptions: number[]): any[] {

        if (!hourOptions.length) {
            return [];
        }

        const options = hourOptions.filter(item => item < 0);
        const pastOptions = options.map((option) => {
            const label = (this.resources.displayLastHoursTemplate || '').replace('{#value}', Math.abs(option));
            return { label, value: option };
        });
        return pastOptions;
    }

    private generateFutureOptions(hourOptions: number[]): any[] {

        if (!hourOptions.length) {
            return [];
        }

        const options = hourOptions.filter(item => item > 0);
        const futureOptions = options.map((option) => {
            const label = (this.resources.displayNextHoursTemplate || '').replace('{#value}', Math.abs(option));
            return { label, value: option };
        });
        return futureOptions;
    }

    private getResources() {

        return {
            setTimeframe: this.resourcesService.resource('setTimeframe')
            , past: this.resourcesService.resource('past')
            , future: this.resourcesService.resource('future')
            , displayLastHoursTemplate: this.resourcesService.resource('displayLastHoursTemplate')
            , displayNextHoursTemplate: this.resourcesService.resource('displayNextHoursTemplate')
            , cancel: this.resourcesService.resource('cancel')
            , apply: this.resourcesService.resource('apply')
        };

    }

}

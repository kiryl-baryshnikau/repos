import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';

import * as moment from 'moment';

import { ResourceService } from 'container-framework';

import { MvdConstants } from '../shared/mvd-constants';

@Pipe({
    name: 'dataformat'
})
export class DataFormatPipe implements PipeTransform {

    private defaults = {
        numericFormat: '1.0-3',
        fullFormat: '',
        dateFormat: this.resourceService.resource('dateFormat'),
        timeFormat: this.resourceService.resource('timeFormat')
    };

    constructor(private datePipe: DatePipe, private decimalPipe: DecimalPipe, private resourceService: ResourceService) {
        this.defaults.fullFormat = `${this.defaults.dateFormat} ${this.defaults.timeFormat}`;

        console.log(`>>>>> DataFormatPipe: fullFormat:  ${this.defaults.fullFormat}`);
    }

    transform(value: any, args: any): any {
        let format = '';
        let parsedFloat = 0;
        let pipeArgs = this.buildPipeArguments(args);
        let dataType = pipeArgs[0].toLowerCase();

        switch (dataType) {
            case MvdConstants.PIPE_TYPES_DECIMAL:
            case MvdConstants.PIPE_TYPES_NUMBER:
                parsedFloat = !isNaN(parseFloat(value)) ? parseFloat(value) : 0;
                format = pipeArgs.length > 1 ? pipeArgs[1] : this.defaults.numericFormat;
                return this.decimalPipe.transform(parsedFloat, format);
            case MvdConstants.PIPE_TYPES_DATE:
            case MvdConstants.PIPE_TYPES_DATETIME:
                format = dataType === 'date'
                    ? this.defaults.dateFormat
                    : this.defaults.fullFormat;
                let date = Date.parse(value);
                let newDate = '';
                if (!isNaN(date)) {
                    if (pipeArgs.length > 1) {
                        format = '';
                        for (var j = 1; j < pipeArgs.length; j++) {
                            format += pipeArgs[j];
                        }
                    }
                    newDate = this.datePipe.transform(date, format);
                }
                return newDate;
            case MvdConstants.PIPE_TYPES_TIME:
                if (!isNaN(value)) {
                    if (value > 0) {
                        return this.getHoursMinDiff(value);
                    }
                    return `0 ${this.resourceService.resource('abbreviationMinutes')}`;
                }
                return value;
            case MvdConstants.PIPE_TYPES_LOCALTIME:
                format = this.defaults.fullFormat;
                const localDate = moment.utc(value).local();
                return this.datePipe.transform(localDate, format);
            case MvdConstants.PIPE_TYPES_TEXT:
            default:
                return value;
        }
    }

    private getHoursMinDiff(miliseconds: number): string {
        let seconds: number = Math.floor(miliseconds / 1000);
        if (seconds < 60) {
            return `0 ${this.resourceService.resource('abbreviationMinutes')}`;
        }

        let mins: number = Math.floor(seconds / 60);
        let hours: number = 0;
        let stringhours: string = "0";
        if (mins > 60) {
            hours = Math.floor(mins / 60);
            mins -= (hours * 60);
            stringhours = hours.toString();
        }
        else if (mins == 60) {
            stringhours = "1";
            mins = 0;
        }
        return (stringhours !== "0" ? `${stringhours} ${this.resourceService.resource('abbreviationHours')}` : '') +
            (mins > 0 ? ` ${mins} ${this.resourceService.resource('abbreviationMinutes')}` : '');
    }

    private buildPipeArguments(args: any) {
        let pipeArgs = args.split(':');
        for (var i = 0; i < pipeArgs.length; i++) {
            pipeArgs[i] = pipeArgs[i].trim(' ');
        }
        return pipeArgs;
    }
}

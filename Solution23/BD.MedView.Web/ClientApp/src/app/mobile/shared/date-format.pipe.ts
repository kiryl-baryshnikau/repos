import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ResourceService } from 'container-framework';
import { MvdConstants } from '../../widgets';

@Pipe({
    name: 'dateformat'
})
export class DateFormatPipe implements PipeTransform {

    private defaults = {
        fullFormat: '',
        dateFormat: this.resourceService.resource('dateFormat'),
        timeFormat: this.resourceService.resource('timeFormat')
    };
    constructor(private datePipe: DatePipe,
        private resourceService: ResourceService) {

        this.defaults.fullFormat = `${this.defaults.dateFormat} ${this.defaults.timeFormat}`;
    }

    transform(value: any, args?: any): any {

        const pipeArgs = this.buildPipeArguments(args);
        const dataType = pipeArgs[0].toLowerCase();

        switch (dataType) {
            case MvdConstants.PIPE_TYPES_TIME:
                return this.datePipe.transform(value, this.defaults.timeFormat);
            case MvdConstants.PIPE_TYPES_DATE:
            case MvdConstants.PIPE_TYPES_DATETIME:
                let format = dataType === 'date'
                    ? this.defaults.dateFormat
                    : this.defaults.fullFormat;
                const date = Date.parse(value);
                let newDate = '';
                if (!isNaN(date)) {
                    if (pipeArgs.length > 1) {
                        format = '';
                        for (let j = 1; j < pipeArgs.length; j++) {
                            format += pipeArgs[j];
                        }
                    }
                    newDate = this.datePipe.transform(date, format);
                }
                return newDate;
            default:
                return value;
        }


    }

    private buildPipeArguments(args: any) {
        const pipeArgs = args.split(':');
        for (let i = 0; i < pipeArgs.length; i++) {
            pipeArgs[i] = pipeArgs[i].trim(' ');
        }
        return pipeArgs;
    }

}

import {SortingService} from '../services/mvd-sorting-service';
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'sortingPipe'
})
/*
*   Sorting service available via pipe
*/
export class SortingPipe implements PipeTransform {

    constructor(private sortingService: SortingService) {
    }

    transform (data: any[], field: any, order: number, sortingMethod: any): any[] {

        if (data === null) {
            return data;
        }

        return this.sortingService.sortData(field, order, sortingMethod, data);
    }
}



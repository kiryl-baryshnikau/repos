import { Pipe, PipeTransform } from '@angular/core';
/*
 * Example:
 *   {{ facilityList | arraySearch: facilityName:'name' }}
 *  
*/
@Pipe({ name: 'arraySearch' })
export class ArraySearchPipe implements PipeTransform {
    transform<T>(array: Array<T>, filterValue: string, filterField: string): Array<T> {

        filterValue = (filterValue || '').toLowerCase();

        if (!array || !array.length) {
            return array;
        }

        if (filterField) {
            return array.filter(arrayItem => this.filterExpression(arrayItem[filterField], filterValue));
        }

        return array.filter(arrayItem => this.filterExpression(arrayItem, filterValue));
    }

    private filterExpression(arrayItem, filterValue): boolean {
        return (arrayItem || '').toLowerCase().indexOf(filterValue) >= 0;
    }
}

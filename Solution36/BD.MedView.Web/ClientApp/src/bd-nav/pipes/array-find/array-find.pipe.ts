import { Pipe, PipeTransform } from '@angular/core';
/*
 * Example:
 *   {{ facilityList | arrayFind: facilityName:'name' }}
 *  
*/
@Pipe({ name: 'arrayFind' })
export class ArrayFindPipe implements PipeTransform {
    transform<T,K>(array: Array<T>, filterValue: T|K, filterField: string): Array<T> {

        if (!array || !array.length) {
            return array;
        }

        if (filterField) {
            return array.filter(arrayItem => arrayItem[filterField] == filterValue);
        }

        return array.filter(arrayItem => arrayItem == filterValue);
    }
}

import { Pipe, PipeTransform } from '@angular/core';
/*
 * Example:
 *   {{ facilityList | arrayCount }}
 *  
*/
@Pipe({ name: 'arrayCount' })
export class ArrayCountPipe implements PipeTransform {
    transform<T>(array: Array<T>): number {
        return (array || []).length;
    }
}

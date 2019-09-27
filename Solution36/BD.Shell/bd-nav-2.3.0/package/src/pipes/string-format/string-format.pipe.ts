import { Pipe, PipeTransform } from '@angular/core';
/*
 * Example:
 *   {{ "Hello $0!" | stringFormat: 'world' }}
 *
 *   output will be:
 *
 *   Hello world!
 *  
*/
@Pipe({ name: 'stringFormat' })
export class StringFormatPipe implements PipeTransform {
    transform(format: string, ...args: any[]) {
        format = format || '';
        args = args || [];

        if (args.length) {
            args.forEach((arg, index) => format = format.replace(new RegExp('arg' + index, 'g'), arg));
        }

        return format;
    }
}

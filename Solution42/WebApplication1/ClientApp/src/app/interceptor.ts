import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpResponse, HttpErrorResponse, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from "rxjs/operators";

@Injectable()
export class Interceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(tap(event => {
            if (event instanceof HttpResponse) {
                const resp: HttpResponse<any> = event;

                // Mutate the body, replace ASP.NET Dates with actual local Date objects.
                let body: {} = resp.body;
                this.recurseBody(body);
            }
        }));
    }

    private parseDate(value) {
        const reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
        const reMsAjax = /^\/Date\((d|-|.*)\)[\/|\\]$/;
        if (typeof value === 'string') {
            let a = reISO.exec(value);
            if (a)
                return new Date(value);
            a = reMsAjax.exec(value);
            if (a) {
                var b = a[1].split(/[-+,.]/);
                return new Date(b[0] ? +b[0] : 0 - +b[1]);
            }
        }
        return value;
    }

    private recurseBody(body: {}) {
        if (!body) {
            return;
        }

        for (let key in body) {
            if (body.hasOwnProperty(key)) {
                let element = body[key];
                if (typeof element === 'object') {
                    this.recurseBody(element);
                } else if (typeof element === 'string') {
                    // Check for a MS-format Date with optional TZ offset.
                    //const matched = /\/Date\(([-]?\d{1,15})([\+-][01][0-3][0-5][0-9])?\)\//.exec(element);
                    //if (matched) {
                    //    let tzOffsetMs = 0;
                    //    const tz = matched[2] || '';
                    //    if (tz) {
                    //        const hours = parseInt(tz.substr(0, tz.length - 2), 10);
                    //        const mins = parseInt(tz.substr(tz.length - 2, 2), 10);
                    //        const tzOffsetMins = mins + hours * 60;
                    //        tzOffsetMs = tzOffsetMins * 60 * 1000;
                    //    }

                    //    // Create a UTC Date object.
                    //    const date = new Date(+matched[1] + tzOffsetMs);
                    //    // Get the timezone offset for the local time (in minutes) and convert to ms.
                    //    const tzOffset = date.getTimezoneOffset() * 60 * 1000;

                    //    // Create a local date by using the offset
                    //    const localDate = new Date(date.getTime() + tzOffset);

                    //    console.log('convert ' + element + ' to ' + date + ' offset ' + date.getTimezoneOffset() + ' local = ' + localDate);

                    //    // Set the local date.
                    //    body[key] = localDate;
                    //}
                    body[key] = this.parseDate(element);
                }
            }
        }
    }
}

import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { MvdCfwConfigurationService } from '../../widgets';
import { publishReplay, refCount, catchError, switchMap, repeatWhen, delay, map, retry, tap } from 'rxjs/operators';


@Injectable()
export class AutoRefreshService {

    private autoRefresh$: Observable<number>;
    private defaultRefreshRateInMilliseconds = 300000; // 5 minutes

    constructor(private cfwConfigurationService: MvdCfwConfigurationService) {
    }

    setDefaultAutoRefreshRate(milliseconds: number) {
        this.defaultRefreshRateInMilliseconds = milliseconds;
    }

    setAutoRefreshFor$<T>(observable$: Observable<T>): Observable<T> {
        return this.refreshRate$().pipe(
            switchMap((refreshRate) => observable$.pipe(
                tap(() => console.log(refreshRate, new Date().toTimeString())),
                repeatWhen((complete) => complete.pipe(delay(refreshRate))),
                catchError((error) => {
                    return throwError(error);
                })
            )),
            retry()
        );
    }

    private refreshRate$() {
        if (!this.autoRefresh$) {
            this.autoRefresh$ = this.cfwConfigurationService.getRefreshRate().pipe(
                map(this.secondsToMilliseconds),
                catchError(() => {
                    this.autoRefresh$ = undefined;
                    return of(this.defaultRefreshRateInMilliseconds);
                }),
                publishReplay(1),
                refCount()
            );
        }
        return this.autoRefresh$;
    }

    private secondsToMilliseconds(refreshRate) {
        return refreshRate * 1000;
    }
}

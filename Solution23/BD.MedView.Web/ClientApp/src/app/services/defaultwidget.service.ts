import { Injectable } from '@angular/core';

import { Observable, ReplaySubject } from 'rxjs';

@Injectable()
export class DefaultWidgetService {
    private defaultWidgetName$: ReplaySubject<string> = new ReplaySubject(1);

    getDefaultWidgetName$(): Observable<string> {
        return this.defaultWidgetName$.asObservable();
    }

    setDefaultWidget(widget: string) {
        this.defaultWidgetName$.next(widget);
    }
}

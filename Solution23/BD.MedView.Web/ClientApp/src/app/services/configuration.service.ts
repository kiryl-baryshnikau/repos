import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map, publishReplay, refCount } from 'rxjs/operators';

import * as model from 'bd-nav/models';

@Injectable()
export class ConfigurationService {
    private url = 'api/configuration';
    private configuration$: Observable<model.Configuration>;

    constructor(private http: HttpClient) {
    }

    get(): Observable<model.Configuration> {
        if (!this.configuration$) {
            this.configuration$ = this.http
                .get(this.url)
                .pipe(
                    map(this.extractConfiguration),
                    publishReplay(1),
                    refCount()
                );
        }

        return this.configuration$;
    }

    private extractConfiguration(response: any): model.Configuration {
        return response as model.Configuration;
    }
}

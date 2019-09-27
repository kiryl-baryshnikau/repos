import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { IdmUser } from '../model/models';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    observe: 'response' as 'response'
};

@Injectable()
export class IdmUsersApi {
    constructor(private http: HttpClient) {
    }

    getUser(name: string): Observable<Array<IdmUser>> {
        const idmGetUserUrl = window['idmGetUserUrl'];
        const path = `${idmGetUserUrl}?userQuery=${name}`;
        return this.http
            .get(path, httpOptions)
            .pipe(
                map((response: HttpResponse<any>) => {
                    if (response && response.status === 204) {
                        return undefined;
                    }
                    return response.body.data;
                })
            );
    }

    getUserByName(name: string): Observable<any> {
        const idmGetUserByNameUrl = window['idmGetUserByNameUrl'];
        const path = `${idmGetUserByNameUrl}?userQuery=${name}`;
        return this.http
            .get(path, httpOptions)
            .pipe(
                map((response: HttpResponse<any>) => {
                    if ((response && response.status === 204) || !response.body.data.length) {
                        return undefined;
                    }
                    return response.body.data[0];
                })
            );
    }
}

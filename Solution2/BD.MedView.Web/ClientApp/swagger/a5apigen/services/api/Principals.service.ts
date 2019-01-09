import { Inject, Injectable, Optional } from '@angular/core';
import { HttpParams, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, pipe, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
    import {
        Principal,
    } from 'models';

import { BaseService, } from '../base/base.service';
import { HttpService, } from '../http/http.service';

/**
* Created with angular4-swagger-client-generator.
*/
@Injectable()
export class PrincipalsService extends BaseService {

constructor(private http: HttpService ) {
super();
}

    /**
    * Method Principals
    * @return Full HTTP response as Observable
    */
    public Principals(): Observable<HttpResponse<Principal[]>> {
    const uri = `/api/Principals`;

    const params = {};
    const headers = {};
    const paramsBody = {};
    return this.http.request('get', uri, params, paramsBody, headers)
    .pipe(map(this.http.unserializeResponse), catchError(this.http.handleError));
    }

    /**
    * Method Principals
    * @param principal
    * @return Full HTTP response as Observable
    */
    public Principals(principal: Principal, ): Observable<HttpResponse<Principal>> {
    const uri = `/api/Principals`;

    const params = {};
    const headers = {};
    const paramsBody = {};
    paramsBody['principal'] = principal;
    return this.http.request('post', uri, params, paramsBody, headers)
    .pipe(map(this.http.unserializeResponse), catchError(this.http.handleError));
    }

    /**
    * Method byId
    * @param id
    * @return Full HTTP response as Observable
    */
    public byId(id: number, ): Observable<HttpResponse<Principal>> {
    const uri = `/api/Principals/${id}`;

    const params = {};
    const headers = {};
    const paramsBody = {};
    return this.http.request('get', uri, params, paramsBody, headers)
    .pipe(map(this.http.unserializeResponse), catchError(this.http.handleError));
    }

    /**
    * Method byId
    * @param id
    * @param principal
    * @return Full HTTP response as Observable
    */
    public byId(id: number, principal: Principal, ): Observable<HttpResponse<any>> {
    const uri = `/api/Principals/${id}`;

    const params = {};
    const headers = {};
    const paramsBody = {};
    paramsBody['principal'] = principal;
    return this.http.request('put', uri, params, paramsBody, headers)
    .pipe(map(this.http.unserializeResponse), catchError(this.http.handleError));
    }

    /**
    * Method byId
    * @param id
    * @return Full HTTP response as Observable
    */
    public byId(id: number, ): Observable<HttpResponse<Principal>> {
    const uri = `/api/Principals/${id}`;

    const params = {};
    const headers = {};
    const paramsBody = {};
    return this.http.request('delete', uri, params, paramsBody, headers)
    .pipe(map(this.http.unserializeResponse), catchError(this.http.handleError));
    }

}

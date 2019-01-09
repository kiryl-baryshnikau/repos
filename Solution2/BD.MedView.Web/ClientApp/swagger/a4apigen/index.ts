import { Inject, Injectable, Optional } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
//import { Observable } from 'rxjs/Observable';
import { Observable } from 'rxjs';

import {
  Principal
} from './models';

/**
* Created with angular-swagger-client-generator.
*/
@Injectable()
export class ApiClientService {

  private domain = 'http://localhost:11177';

  constructor(private http: HttpClient, @Optional() @Inject('domain') domain: string ) {
    if (domain) {
      this.domain = domain;
    }
  }

  /**
  * Method Principals_GetPrincipals
  * @return Full HTTP response as Observable
  */
  public Principals_GetPrincipals(): Observable<Principal[]> {
    let uri = `/api/Principals`;
    let headers = new HttpHeaders();
    let params = new HttpParams();
    return this.sendRequest<Principal[]>('get', uri, headers, params, null);
  }

  /**
  * Method Principals_PostPrincipal
  * @param principal 
  * @return Full HTTP response as Observable
  */
  public Principals_PostPrincipal(principal: Principal): Observable<Principal> {
    let uri = `/api/Principals`;
    let headers = new HttpHeaders();
    let params = new HttpParams();
    return this.sendRequest<Principal>('post', uri, headers, params, JSON.stringify(principal));
  }

  /**
  * Method Principals_GetPrincipal
  * @param id 
  * @return Full HTTP response as Observable
  */
  public Principals_GetPrincipal(id: number): Observable<Principal> {
    let uri = `/api/Principals/${id}`;
    let headers = new HttpHeaders();
    let params = new HttpParams();
    return this.sendRequest<Principal>('get', uri, headers, params, null);
  }

  /**
  * Method Principals_PutPrincipal
  * @param id 
  * @param principal 
  * @return Full HTTP response as Observable
  */
  public Principals_PutPrincipal(id: number, principal: Principal): Observable<any> {
    let uri = `/api/Principals/${id}`;
    let headers = new HttpHeaders();
    let params = new HttpParams();
    return this.sendRequest<any>('put', uri, headers, params, JSON.stringify(principal));
  }

  /**
  * Method Principals_DeletePrincipal
  * @param id 
  * @return Full HTTP response as Observable
  */
  public Principals_DeletePrincipal(id: number): Observable<Principal> {
    let uri = `/api/Principals/${id}`;
    let headers = new HttpHeaders();
    let params = new HttpParams();
    return this.sendRequest<Principal>('delete', uri, headers, params, null);
  }

  private sendRequest<T>(method: string, uri: string, headers: HttpHeaders, params: HttpParams, body: any): Observable<T> {
    if (method === 'get') {
      return this.http.get<T>(this.domain + uri, { headers: headers.set('Accept', 'application/json'), params: params });
    } else if (method === 'put') {
      return this.http.put<T>(this.domain + uri, body, { headers: headers.set('Content-Type', 'application/json'), params: params });
    } else if (method === 'post') {
      return this.http.post<T>(this.domain + uri, body, { headers: headers.set('Content-Type', 'application/json'), params: params });
    } else if (method === 'delete') {
      return this.http.delete<T>(this.domain + uri, { headers: headers, params: params });
    } else {
      console.error('Unsupported request: ' + method);
      return Observable.throw('Unsupported request: ' + method);
    }
  }
}

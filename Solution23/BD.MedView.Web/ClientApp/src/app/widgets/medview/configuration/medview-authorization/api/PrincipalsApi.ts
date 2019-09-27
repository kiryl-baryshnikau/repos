import { Inject, Injectable, Optional } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Principal } from '../model/models';
import { BASE_PATH } from '../variables';
import { Configuration } from '../configuration';


@Injectable()
export class PrincipalsApi {

    protected basePath = window['mvdUserAuthorizationBaseUrl'];

    public configuration: Configuration = new Configuration();

    constructor(protected http: HttpClient, @Optional() @Inject(BASE_PATH) basePath: string, @Optional() configuration: Configuration) {
        if (basePath) {
            this.basePath = basePath;
        }
        if (configuration) {
            this.configuration = configuration;
        }
    }

    /**
     *
     * @param id
     */
    public principalsDeletePrincipal(id: number, extraHttpRequestParams?: any): Observable<Principal> {
        return this.principalsDeletePrincipalWithHttpInfo(id, extraHttpRequestParams)
            .pipe(
                map((response: any) => {
                    if (response && response.status === 204) {
                        return undefined;
                    }
                    else {
                        return response.body || {};
                    }
                })
            );
    }

    /**
     *
     * @param id
     * @param $Expand The references to be expanded. (e.g. $expand&#x3D;Roles)
     * @param $Select Specifies a subset of properties to return. (e.g. $select&#x3D;Name)
     */
    public principalsGetPrincipal(id: number, $Expand?: string, $Select?: string, extraHttpRequestParams?: any): Observable<Principal> {
        return this.principalsGetPrincipalWithHttpInfo(id, $Expand, $Select, extraHttpRequestParams)
            .pipe(
                map((response: any) => {
                    if (response && response.status === 204) {
                        return undefined;
                    }
                    return response.body || {};
                })
            );
    }

    /**
     *
     * @param $Expand The references to be expanded. (e.g. $expand&#x3D;Roles)
     * @param $Top The max number of records. (e.g. $top&#x3D;10)
     * @param $Skip The number of records to skip. (e.g. $skip&#x3D;5)
     * @param $Filter A function that must evaluate to true for a record to be returned. (e.g. $filter&#x3D;CustomerName eq &#39;bob&#39;)
     * @param $Select Specifies a subset of properties to return. (e.g. $select&#x3D;Name)
     * @param $Orderby Determines what values are used to order a collection of records. (e.g. $orderby&#x3D;Address1_Country,Address1_City desc)
     */
    public principalsGetPrincipals($Expand?: string, $Top?: string, $Skip?: string, $Filter?: string, $Select?: string, $Orderby?: string, extraHttpRequestParams?: any): Observable<Array<Principal>> {
        return this.principalsGetPrincipalsWithHttpInfo($Expand, $Top, $Skip, $Filter, $Select, $Orderby, extraHttpRequestParams).pipe(
            map((response: any) => {
                if (response && response.status === 204) {
                    return undefined;
                }
                return response.body || {};
            })
        );
    }

    /**
     *
     * @param value
     */
    public principalsPostPrincipal(value: Principal, extraHttpRequestParams?: any): Observable<Principal> {
        return this.principalsPostPrincipalWithHttpInfo(value, extraHttpRequestParams).pipe(
            map((response: any) => {
                if (response && response.status === 204) {
                    return undefined;
                }
                return response.body || {};
            })
        );
    }

    /**
     *
     * @param id
     * @param value
     */
    public principalsPutPrincipal(id: number, value: Principal, extraHttpRequestParams?: any): Observable<{}> {
        return this.principalsPutPrincipalWithHttpInfo(id, value, extraHttpRequestParams).pipe(
            map((response: any) => {
                if (response && response.status === 204) {
                    return undefined;
                }
                return response.body || {};
            })
        );
    }


    /**
     *
     *
     * @param id
     */
    public principalsDeletePrincipalWithHttpInfo(id: number, extraHttpRequestParams?: any): Observable<any> {
        const path = this.basePath + '/api/Principals/${id}'
            .replace('${' + 'id' + '}', String(id));

        let headers = new HttpHeaders({ 'Content-Type': 'application/json' }); // https://github.com/angular/angular/issues/6845

        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling principalsDeletePrincipal.');
        }

        let requestOptions = {
            headers: headers,
            observe: 'response' as 'response',
            withCredentials: this.configuration.withCredentials
        };

        // https://github.com/swagger-api/swagger-codegen/issues/4037
        if (extraHttpRequestParams) {
            requestOptions = (<any>Object).assign(requestOptions, extraHttpRequestParams);
        }

        return this.http.delete(path, requestOptions);
    }

    /**
     *
     *
     * @param id
     * @param $Expand The references to be expanded. (e.g. $expand&#x3D;Roles)
     * @param $Select Specifies a subset of properties to return. (e.g. $select&#x3D;Name)
     */
    public principalsGetPrincipalWithHttpInfo(id: number, $Expand?: string, $Select?: string, extraHttpRequestParams?: any): Observable<any> {
        const path = this.basePath + '/api/Principals/${id}'
            .replace('${' + 'id' + '}', String(id));

        let queryParameters = new HttpParams();
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' }); // https://github.com/angular/angular/issues/6845

        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling principalsGetPrincipal.');
        }

        if ($Expand !== undefined) {
            queryParameters.set('$expand', <any>$Expand);
        }

        if ($Select !== undefined) {
            queryParameters.set('$select', <any>$Select);
        }

        let requestOptions = {
            headers: headers,
            observe: 'response' as 'response',
            params: queryParameters,
            withCredentials: this.configuration.withCredentials
        };
        // https://github.com/swagger-api/swagger-codegen/issues/4037
        if (extraHttpRequestParams) {
            requestOptions = (<any>Object).assign(requestOptions, extraHttpRequestParams);
        }

        return this.http.get(path, requestOptions);
    }

    /**
     *
     *
     * @param $Expand The references to be expanded. (e.g. $expand&#x3D;Roles)
     * @param $Top The max number of records. (e.g. $top&#x3D;10)
     * @param $Skip The number of records to skip. (e.g. $skip&#x3D;5)
     * @param $Filter A function that must evaluate to true for a record to be returned. (e.g. $filter&#x3D;CustomerName eq &#39;bob&#39;)
     * @param $Select Specifies a subset of properties to return. (e.g. $select&#x3D;Name)
     * @param $Orderby Determines what values are used to order a collection of records. (e.g. $orderby&#x3D;Address1_Country,Address1_City desc)
     */
    public principalsGetPrincipalsWithHttpInfo($Expand?: string, $Top?: string, $Skip?: string, $Filter?: string, $Select?: string, $Orderby?: string, extraHttpRequestParams?: any): Observable<any> {
        const path = this.basePath + '/api/Principals';

        let queryParameters = new HttpParams();
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' }); // https://github.com/angular/angular/issues/6845
        if ($Expand !== undefined) {
            queryParameters.set('$expand', <any>$Expand);
        }

        if ($Top !== undefined) {
            queryParameters.set('$top', <any>$Top);
        }

        if ($Skip !== undefined) {
            queryParameters.set('$skip', <any>$Skip);
        }

        if ($Filter !== undefined) {
            queryParameters.set('$filter', <any>$Filter);
        }

        if ($Select !== undefined) {
            queryParameters.set('$select', <any>$Select);
        }

        if ($Orderby !== undefined) {
            queryParameters.set('$orderby', <any>$Orderby);
        }

        let requestOptions = {
            headers: headers,
            observe: 'response' as 'response',
            params: queryParameters,
            withCredentials: this.configuration.withCredentials
        };
        // https://github.com/swagger-api/swagger-codegen/issues/4037
        if (extraHttpRequestParams) {
            requestOptions = (<any>Object).assign(requestOptions, extraHttpRequestParams);
        }

        return this.http.get(path, requestOptions);
    }

    /**
     *
     *
     * @param value
     */
    public principalsPostPrincipalWithHttpInfo(value: Principal, extraHttpRequestParams?: any): Observable<any> {
        const path = this.basePath + '/api/Principals';

        let headers = new HttpHeaders({ 'Content-Type': 'application/json' }); // https://github.com/angular/angular/issues/6845
        if (value === null || value === undefined) {
            throw new Error('Required parameter value was null or undefined when calling principalsPostPrincipal.');
        }


        let requestOptions = {
            headers: headers,
            observe: 'response' as 'response',
            withCredentials: this.configuration.withCredentials
        };
        // https://github.com/swagger-api/swagger-codegen/issues/4037
        if (extraHttpRequestParams) {
            requestOptions = (<any>Object).assign(requestOptions, extraHttpRequestParams);
        }

        return this.http.post(path, value == null ? '' : JSON.stringify(value), requestOptions);
    }

    /**
     *
     *
     * @param id
     * @param value
     */
    public principalsPutPrincipalWithHttpInfo(id: number, value: Principal, extraHttpRequestParams?: any): Observable<any> {
        //ToDo: Solve circular referency in JSON.stringify(value: Principal)
        const path = this.basePath + '/api/Principals/${id}'
            .replace('${' + 'id' + '}', String(id));

        let headers = new HttpHeaders({ 'Content-Type': 'application/json' }); // https://github.com/angular/angular/issues/6845

        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling principalsPutPrincipal.');
        }

        if (value === null || value === undefined) {
            throw new Error('Required parameter value was null or undefined when calling principalsPutPrincipal.');
        }

        let requestOptions = {
            headers: headers,
            observe: 'response' as 'response',
            withCredentials: this.configuration.withCredentials
        };
        // https://github.com/swagger-api/swagger-codegen/issues/4037
        if (extraHttpRequestParams) {
            requestOptions = (<any>Object).assign(requestOptions, extraHttpRequestParams);
        }
        return this.http.put(path, value == null ? '' : JSON.stringify(value), requestOptions);
    }
}

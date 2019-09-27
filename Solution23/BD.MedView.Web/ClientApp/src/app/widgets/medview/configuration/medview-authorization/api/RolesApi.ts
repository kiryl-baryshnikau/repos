import { Inject, Injectable, Optional } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpRequest, HttpResponse } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Role } from '../model/models';
import { BASE_PATH, COLLECTION_FORMATS } from '../variables';
import { Configuration } from '../configuration';

@Injectable()
export class RolesApi {

    protected basePath = window['mvdUserAuthorizationBaseUrl'];
    //public defaultHeaders: HttpHeaders = new HttpHeaders();
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
    public rolesDeleteRole(id: number, extraHttpRequestParams?: any): Observable<Role> {
        return this.rolesDeleteRoleWithHttpInfo(id, extraHttpRequestParams).pipe(
            map((response: any) => {
                if (response && response.status === 204) {
                    return undefined;
                } else {
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
    public rolesGetRole(id: number, $Expand?: string, $Select?: string, extraHttpRequestParams?: any): Observable<Role> {
        return this.rolesGetRoleWithHttpInfo(id, $Expand, $Select, extraHttpRequestParams)
            .pipe(
                map((response: any) => {
                    if (response && response.status === 204) {
                        return undefined;
                    } else {
                        return response.body || {};
                    }
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
    public rolesGetRoles($Expand?: string, $Top?: string, $Skip?: string, $Filter?: string, $Select?: string, $Orderby?: string, extraHttpRequestParams?: any): Observable<Array<Role>> {
        return this.rolesGetRolesWithHttpInfo($Expand, $Top, $Skip, $Filter, $Select, $Orderby, extraHttpRequestParams)
            .pipe(
                map((response: any) => {
                    if (response && response.status === 204) {
                        return undefined;
                    } else {
                        return response.body || {};
                    }
                })
            );
    }

    /**
     *
     * @param value
     */
    public rolesPostRole(value: Role, extraHttpRequestParams?: any): Observable<Role> {
        return this.rolesPostRoleWithHttpInfo(value, extraHttpRequestParams)
            .pipe(
                map((response: any) => {
                    if (response && response.status === 204) {
                        return undefined;
                    } else {
                        return response.body || {};
                    }
                })
            );
    }

    /**
     *
     * @param id
     * @param value
     */
    public rolesPutRole(id: number, value: Role, extraHttpRequestParams?: any): Observable<{}> {
        return this.rolesPutRoleWithHttpInfo(id, value, extraHttpRequestParams)
            .pipe(
                map((response: any) => {
                    if (response && response.status === 204) {
                        return undefined;
                    } else {
                        return response.body || {};
                    }
                })
            );
    }

    /**
     *
     *
     * @param id
     */
    public rolesDeleteRoleWithHttpInfo(id: number, extraHttpRequestParams?: any): Observable<any> {
        const path = this.basePath + '/api/Roles/${id}'
            .replace('${' + 'id' + '}', String(id));

        let queryParameters = new URLSearchParams();
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' }); // https://github.com/angular/angular/issues/6845
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling rolesDeleteRole.');
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
        return this.http.delete(path, requestOptions)

        //return this.http.request(requestOptions);
    }

    /**
     *
     *
     * @param id
     * @param $Expand The references to be expanded. (e.g. $expand&#x3D;Roles)
     * @param $Select Specifies a subset of properties to return. (e.g. $select&#x3D;Name)
     */
    public rolesGetRoleWithHttpInfo(id: number, $Expand?: string, $Select?: string, extraHttpRequestParams?: any): Observable<any> {
        const path = this.basePath + '/api/Roles/${id}'
            .replace('${' + 'id' + '}', String(id));

        let queryParameters = new HttpParams();
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' }); // https://github.com/angular/angular/issues/6845
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling rolesGetRole.');
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
    public rolesGetRolesWithHttpInfo($Expand?: string, $Top?: string, $Skip?: string, $Filter?: string, $Select?: string, $Orderby?: string, extraHttpRequestParams?: any): Observable<any> {
        const path = this.basePath + '/api/Roles';

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

        // to determine the Content-Type header
        let consumes: string[] = [
        ];

        // to determine the Accept header
        let produces: string[] = [
            'application/json',
            'text/json',
            'application/xml',
            'text/xml'
        ];

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
    public rolesPostRoleWithHttpInfo(value: Role, extraHttpRequestParams?: any): Observable<any> {
        const path = this.basePath + '/api/Roles';

        let queryParameters = new HttpParams();
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' }); // https://github.com/angular/angular/issues/6845
        // verify required parameter 'value' is not null or undefined
        if (value === null || value === undefined) {
            throw new Error('Required parameter value was null or undefined when calling rolesPostRole.');
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

        return this.http.post(path, value, requestOptions);
    }

    /**
     *
     *
     * @param id
     * @param value
     */
    public rolesPutRoleWithHttpInfo(id: number, value: Role, extraHttpRequestParams?: any): Observable<any> {
        const path = this.basePath + '/api/Roles/${id}'
            .replace('${' + 'id' + '}', String(id));

        let queryParameters = new HttpParams();
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' }); // https://github.com/angular/angular/issues/6845
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling rolesPutRole.');
        }
        // verify required parameter 'value' is not null or undefined
        if (value === null || value === undefined) {
            throw new Error('Required parameter value was null or undefined when calling rolesPutRole.');
        }


        headers.set('Content-Type', 'application/json');

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

        return this.http.put(path, value, requestOptions);
    }

}

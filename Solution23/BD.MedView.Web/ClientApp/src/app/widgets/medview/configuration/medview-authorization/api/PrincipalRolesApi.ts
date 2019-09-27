import { Inject, Injectable, Optional } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { BASE_PATH } from '../variables';
import { Configuration } from '../configuration';
import { UserConfigurationService } from '../../../../../services/user-configuration.service';

@Injectable()
export class PrincipalRolesApi {

    protected basePath = window['mvdUserAuthorizationBaseUrl'];
    public configuration: Configuration = new Configuration();

    constructor(protected http: HttpClient,
        @Optional() @Inject(BASE_PATH) basePath: string,
        @Optional() configuration: Configuration,
        private userConfigurationService: UserConfigurationService) {

        if (basePath) {
            this.basePath = basePath;
        }
        if (configuration) {
            this.configuration = configuration;
        }
    }

    principalRolesDeletePrincipalRole(id: number, link: number): Observable<{}> {
        return this.principalRolesDeletePrincipalRoleWithHttpInfo(id, link)
            .pipe(
                map((response: any) => {
                    if (response && response.status === 204) {
                        return undefined;
                    }
                    return response.body || {};
                }),
                tap(() => this.userConfigurationService.clearUserPreferencesCache())
            );
    }

    principalRolesPutPrincipalRole(id: number, link: number): Observable<{}> {
        return this.principalRolesPutPrincipalRoleWithHttpInfo(id, link)
            .pipe(
                map((response: any) => {
                    if (response && response.status === 204) {
                        return undefined;
                    }
                    return response.body || {};
                }),
                tap(() => this.userConfigurationService.clearUserPreferencesCache())
            );
    }

    private principalRolesDeletePrincipalRoleWithHttpInfo(id: number, link: number): Observable<any> {
        const path = this.basePath + '/api/PrincipalRoles/remove/${id}'
            .replace('${' + 'id' + '}', String(id));

        if (id === null || id === undefined || link === null || link === undefined) {
            throw new Error('Required parameter id || link was null or undefined when calling principalRolesDeletePrincipalRole.');
        }

        const httpOptions = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            observe: 'response' as 'response',
            withCredentials: this.configuration.withCredentials
        };
        return this.http.post(path, link, httpOptions).pipe(
            tap(() => this.userConfigurationService.clearUserPreferencesCache())
        );
    }

    private principalRolesPutPrincipalRoleWithHttpInfo(id: number, link: number): Observable<any> {
        const path = this.basePath + '/api/PrincipalRoles/add/${id}'
            .replace('${' + 'id' + '}', String(id));

        if (id === null || id === undefined || link === null || link === undefined) {
            throw new Error('Required parameters id || link was null or undefined when calling principalRolesPutPrincipalRole.');
        }

        const httpOptions = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            observe: 'response' as 'response',
            withCredentials: this.configuration.withCredentials
        };
        return this.http.post(path, link, httpOptions).pipe(
            tap(() => this.userConfigurationService.clearUserPreferencesCache())
        );
    }
}

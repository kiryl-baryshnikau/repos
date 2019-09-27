import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { IvPrepModels } from '../shared/mvd-models';
import * as _ from 'lodash';

const stateMappingsApi = 'api/StateMappingConfiguration';
const providerStatesApi = 'api/ProviderStates';
const urlKeyName = 'mvdUserAuthorizationBaseUrl';
const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

@Injectable()
export class StateMappingConfigurationService {

    private baseUrl = window[urlKeyName];

    constructor(private http: HttpClient) {
    }

    getConfiguration(): Observable<IvPrepModels.StateMapping[]> {

        const getConfiguration = `${this.baseUrl || window[urlKeyName]}/${stateMappingsApi}`;

        return this.http
            .get(getConfiguration)
            .pipe(
                map((res: HttpResponse<any>) => this.extractData(res, [])),
                catchError(this.handleError)
            );
    }

    getProviderStates(): Observable<IvPrepModels.ProviderState[]> {
        const providerStates = `${this.baseUrl || window[urlKeyName]}/${providerStatesApi}`;

        return this.http
            .get(providerStates)
            .pipe(
                map((res: HttpResponse<any>) => this.extractData(res, [])),
                catchError(this.handleError)
            );
    }

    updateUserStatesMappings(states: IvPrepModels.ProviderStateRequest[]): Observable<void> {
        const synchProviderStates = `${this.baseUrl || window[urlKeyName]}/${providerStatesApi}`;

        return this.http
            .put(synchProviderStates, states, httpOptions)
            .pipe(
                map((res: HttpResponse<any>) => this.extractData(res, [])),
                catchError(this.handleError)
            );
    }

    synchProviderStates(states: IvPrepModels.ProviderState[]): Observable<void> {

        const synchProviderStates = `${this.baseUrl || window[urlKeyName]}/${providerStatesApi}/Synch`;

        return this.http
            .put(synchProviderStates, states, httpOptions)
            .pipe(
                map((res: HttpResponse<any>) => this.extractData(res, [])),
                catchError(this.handleError)
            );
    }

    synchDeletedStates(states: IvPrepModels.ProviderState[]): Observable<void> {

        const synchDeletedStates = `${this.baseUrl || window[urlKeyName]}/${providerStatesApi}/SynchDeleted`;

        return this.http
            .post(synchDeletedStates, states, httpOptions)
            .pipe(
                map((res: HttpResponse<any>) => this.extractData(res, [])),
                catchError(this.handleError)
            );
    }

    ensureProviderStates(): Observable<void> {
        const ensureProviderStates = `${this.baseUrl || window[urlKeyName]}/${providerStatesApi}/Ensure`;

        return this.http
            .post(ensureProviderStates, null, httpOptions)
            .pipe(
                map((res: HttpResponse<any>) => this.extractData(res, [])),
                catchError(this.handleError)
            );
    }

    getUnMappedStates(userStates: IvPrepModels.StateMapping[], doseStates: IvPrepModels.DoseStatesResponse) {

        const currentStateIds = _.flatMap(userStates, (state) => state.providerStates.map(p => p.stateId));
        const customStates = doseStates.DoseStates
            .filter(state => !state.StandardId && !currentStateIds.some((id) => state.Id === id));
        return customStates;

    }

    private extractData(response: HttpResponse<any>, defaultValue: Array<any> | {} = {}) {
        if (response && response.status) {
            return response.status === 204 ? undefined : response.body;
        }
        return response || defaultValue;
    }

    private handleError(error: any) {
        console.warn(error || 'Server error');
        return throwError(error || 'Server error');
    }

}

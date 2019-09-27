import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, take, tap } from 'rxjs/operators';
import { UserConfigurationService } from '../../services/user-configuration.service';

const baseUrlName = 'mvdUserAuthorizationBaseUrl';
const facilityApi = 'api/facilities/';
const providerApi = 'api/providers/';
const sourcesApi = 'api/sources/';
const synonymsApi = 'api/synonyms/';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    observe: 'response' as 'response'
};

@Injectable()
export class FacilityManagementService {
    private baseUrl = window[baseUrlName];
    private facilityManagementUrl = this.preProcessUrl(window[baseUrlName]) + facilityApi;
    private sourcesEnabledUrl = this.preProcessUrl(window[baseUrlName]) + providerApi;
    private sourcesSupporedUrl = this.preProcessUrl(window[baseUrlName]) + sourcesApi;
    private synonymsApiUrl = this.preProcessUrl(window[baseUrlName]) + synonymsApi;

    constructor(private http: HttpClient, private userConfigurationService: UserConfigurationService) {
        console.log('FacilityManagementService::baseUrl: ' + window[baseUrlName]);
        console.log('FacilityManagementService::baseUrl: ' + this.baseUrl);

        console.log('FacilityManagementService::facilityManagementUrl: ' + this.facilityManagementUrl);
        console.log('FacilityManagementService::sourcesEnabledUrl:     ' + this.sourcesEnabledUrl);
        console.log('FacilityManagementService::sourcesSupporedUrl:        ' + this.sourcesSupporedUrl);
        console.log('FacilityManagementService::synonymsApiUrl:        ' + this.synonymsApiUrl);
    }

    getSupportedDataSources(): Observable<any> {
        this.sourcesSupporedUrl = this.sourcesSupporedUrl || this.preProcessUrl(window[baseUrlName]) + sourcesApi;
        console.log('FacilityManagementService::sourcesSupporedUrl: ' + this.sourcesSupporedUrl);

        return this.http
            .get(this.sourcesSupporedUrl)
            .pipe(
                map((res: HttpResponse<any>) => this.extractData(res, [])),
                catchError(this.handleError)
            );
    }

    getEnabledDataSources(): Observable<any> {
        this.sourcesEnabledUrl = this.sourcesEnabledUrl || this.preProcessUrl(window[baseUrlName]) + providerApi;
        console.log('FacilityManagementService::sourcesEnabledUrl: ' + this.sourcesEnabledUrl);

        return this.http
            .get(this.sourcesEnabledUrl)
            .pipe(
                map((res: HttpResponse<any>) => this.extractData(res, [])),
                take(1),
                catchError(this.handleError)
             );
    }

    disabledDataSource(id: number) {
        this.sourcesEnabledUrl = this.sourcesEnabledUrl || this.preProcessUrl(window[baseUrlName]) + providerApi;

        return this.http
            .delete(this.sourcesEnabledUrl + id)
            .pipe(
                map(this.extractData),
                catchError(this.handleError),
                tap(() => this.userConfigurationService.clearUserPreferencesCache())
            );
    }

    enabledDataSource(value: any) {
        this.sourcesEnabledUrl = this.sourcesEnabledUrl || this.preProcessUrl(window[baseUrlName]) + providerApi;

        return this.http
            .post(this.sourcesEnabledUrl, value == null ? '' : JSON.stringify(value), httpOptions)
            .pipe(
                map(this.extractData),
                catchError(this.handleError),
                tap(() => this.userConfigurationService.clearUserPreferencesCache())
            );
    }

    getMasterFacilities(): Observable<any> {
        this.facilityManagementUrl = this.facilityManagementUrl || this.preProcessUrl(window[baseUrlName]) + facilityApi;
        console.log('FacilityManagementService::facilityManagementUrl: ' + this.facilityManagementUrl);

        return this.http
            .get(this.facilityManagementUrl)
            .pipe(map((res: HttpResponse<any>) => this.extractData(res, [])));
    }

    getMasterFacility(id: number): Observable<any> {
        this.facilityManagementUrl = this.facilityManagementUrl || this.preProcessUrl(window[baseUrlName]) + facilityApi;

        return this.http
            .get(this.facilityManagementUrl + id)
            .pipe(map(this.extractData));
    }

    updateMasterFacility(id: number, value: any) {
        this.facilityManagementUrl = this.facilityManagementUrl || this.preProcessUrl(window[baseUrlName]) + facilityApi;

        return this.http
            .put(this.facilityManagementUrl + id, value == null ? '' : JSON.stringify(value), httpOptions)
            .pipe(
                map(this.extractData),
                catchError(this.handleError),
                tap(() => this.userConfigurationService.clearUserPreferencesCache())
            );
    }

    deleteMasterFacility(id: number) {
        this.facilityManagementUrl = this.facilityManagementUrl || this.preProcessUrl(window[baseUrlName]) + facilityApi;

        return this.http
            .delete(this.facilityManagementUrl + id)
            .pipe(
                map(this.extractData),
                catchError(this.handleError),
                tap(() => this.userConfigurationService.clearUserPreferencesCache())
            );
    }

    createMasterFacility(value: any) {
        this.facilityManagementUrl = this.facilityManagementUrl || this.preProcessUrl(window[baseUrlName]) + facilityApi;

        return this.http
            .post(this.facilityManagementUrl, value == null ? '' : JSON.stringify(value), httpOptions)
            .pipe(
                map(this.extractData),
                catchError(this.handleError),
                tap(() => this.userConfigurationService.clearUserPreferencesCache())
            );
    }

    createFacilityMapping(value: any) {
        this.synonymsApiUrl = this.synonymsApiUrl || this.preProcessUrl(window[baseUrlName]) + synonymsApi;

        return this.http
            .post(this.synonymsApiUrl, value == null ? '' : JSON.stringify(value), httpOptions)
            .pipe(
                map(this.extractData),
                catchError(this.handleError),
                tap(() => this.userConfigurationService.clearUserPreferencesCache())
            );
    }

    updateFacilityMapping(id: number, value: any) {
        this.synonymsApiUrl = this.synonymsApiUrl || this.preProcessUrl(window[baseUrlName]) + synonymsApi;

        return this.http
            .put(this.synonymsApiUrl + id, value == null ? '' : JSON.stringify(value), httpOptions)
            .pipe(
                map(this.extractData),
                catchError(this.handleError),
                tap(() => this.userConfigurationService.clearUserPreferencesCache())
            );
    }

    deleteFacilityMapping(id: number) {
        this.synonymsApiUrl = this.synonymsApiUrl || this.preProcessUrl(window[baseUrlName]) + synonymsApi;

        return this.http
            .delete(this.synonymsApiUrl + id)
            .pipe(
                map((res: HttpResponse<any>) => this.extractData(res)),
                catchError(this.handleError),
                tap(() => this.userConfigurationService.clearUserPreferencesCache())
            );
    }

    private preProcessUrl(url: any): string {
        url = url || '';
        return url.lastIndexOf('/') == url.length - 1 ? url : url + '/';
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

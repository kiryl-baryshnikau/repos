import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { SortingService } from '../../../services/mvd-sorting-service';
import { BdMedViewServicesClient } from '../../../../services/bd-medview-services-client';
import { InfusionGlobalPreference, InfusionGlobalSetting } from '../../../../services/bd-medview-configuration-entities';

@Injectable()
export class SystemAdminConfigurationService {
    constructor(
        private sortingService: SortingService,
        private bdMedViewServicesClient: BdMedViewServicesClient) {
    }

    public transformInfusionData(inputData: any, infusionsToNeverShow: any[]) {
        let data = [];
        if (inputData) {
            let infusions = inputData.reduce((arrayResume, item) => {
                if (!infusionsToNeverShow || !infusionsToNeverShow.some(a => (a.value.name || '').toUpperCase() === (item.name || '').toUpperCase())) {
                    if (arrayResume.indexOf(item.name) === -1) {
                        arrayResume.push(item.name);
                    }
                }
                return arrayResume;
            }, []);
            data = this.sortingService.sortArray(infusions).map(a => (
                {
                    label: a,
                    value: a
                }
            ));
        }
        return data;
    }

    public transformInfusionsToNeverShow(infusionsToExclude: any[]) {
        let data = [];
        if (infusionsToExclude) {
            return this.sortingService.sortDataByField("label", 1, "alphabetical", infusionsToExclude.map(item => {
                return {
                    label: item.name,
                    value: { name: item.name, addedByUser: item.addedByUser }
                }
            }));
        }
        return data;
    }

    getSystemAdminPreferences(): Observable<InfusionGlobalPreference> {
        return this.bdMedViewServicesClient.staticPropertyGet<InfusionGlobalPreference>('GlobalPreferences', 'Infusion')
            .pipe(
                map(this.extractData),
                catchError((error) => throwError(error))
            );
    }

    getGlobalPreferences(): Observable<InfusionGlobalPreference> {
        return this.bdMedViewServicesClient.staticPropertyGet<InfusionGlobalPreference>('GlobalPreferences', 'Infusion')
            .pipe(
                map(this.extractData),
                catchError((error) => {
                    if (error.status === 404) {
                        return this.getDefaultSystemAlarisSetting();
                    }
                    else {
                        return throwError(error);
                    }
                })
            );
    }

    getDefaultSystemAlarisSetting(): Observable<InfusionGlobalPreference> {
        return this.bdMedViewServicesClient.staticMethodCall<InfusionGlobalPreference>('GlobalPreferences', 'Default', { name: "Infusion" })
            .pipe(
                map(this.extractData),
                catchError(error => throwError(error))
            );
    }

    public saveSystemSettings(settings: InfusionGlobalPreference, isUpdate: boolean): Observable<any> {
        return this.bdMedViewServicesClient.staticPropertySet<InfusionGlobalPreference>('GlobalPreferences', 'Infusion', this.substractData(settings))
            .pipe(catchError(this.handleError));
    };

    private extractData(value: InfusionGlobalPreference): InfusionGlobalPreference {
        if (!(value)) { return {} as InfusionGlobalPreference; }
        let entity: InfusionGlobalPreference = value;
        return entity;
    }

    private substractData(value: InfusionGlobalPreference): InfusionGlobalPreference {
        if (!(value)) { return {} as InfusionGlobalPreference; }
        let entity: InfusionGlobalPreference = value;
        return entity;
    }


    private handleError(error: HttpErrorResponse | any) {
        let errMsg: string;
        if (error instanceof HttpErrorResponse) {
            let body: any = '';
            try {
                body = error || '';
            }
            catch (e) {
                body = "Unknown format of error message. ";
            }

            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        }
        else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg, error);
        return throwError(errMsg);
    }
}

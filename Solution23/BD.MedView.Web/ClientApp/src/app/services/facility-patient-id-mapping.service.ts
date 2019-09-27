import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable()
export class FacilityPatientIdMappingService {
    private url = window['mvdFacilityPatientIdMappingUrl'];
    private subject$: ReplaySubject<FacilityPatientIdMapping[]> = null;

    constructor(private http: HttpClient) {
    }

    public toObservable(): Observable<FacilityPatientIdMapping[]> {
        if (this.subject$ == null) {
            this.subject$ = new ReplaySubject(1);
            this.http.get<FacilityPatientIdMapping[]>(this.url).subscribe((values) => {
                this.subject$.next(values);
            });
        }
        return this.subject$;
    }
}

export interface FacilityPatientIdMapping {
    id: number;
    synonymKey: string;
    providerName: string;
    patientIdKind: string;
}

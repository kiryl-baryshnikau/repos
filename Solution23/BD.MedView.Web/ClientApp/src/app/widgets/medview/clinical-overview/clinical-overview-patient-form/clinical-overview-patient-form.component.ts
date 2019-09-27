import { Component, OnInit, Output, Input, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { MvdMedMinedDataService } from '../../../services/mvd-medmined-data.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Component({
    selector: 'clinical-overview-patient-form',
    templateUrl: './clinical-overview-patient-form.component.html',
    styleUrls: ['./clinical-overview-patient-form.component.scss']
})
export class ClinicalOverviewPatientFormComponent implements OnInit {
    @ViewChild('iframe') iframe: ElementRef;

    @Output() onCloseDialog = new EventEmitter();

    @Input() patientData$: Observable<any>;

    patientId: number;
    patientUrl: string = '';

    constructor(
        private dataService: MvdMedMinedDataService,
        private http: HttpClient) {
    }

    ngOnInit() {
        this.patientUrl = 'http://localhost/PatientDummyPortal/patient';
        this.get(this.patientUrl)
            .subscribe(blob => {
                this.iframe.nativeElement.src = blob;
            },
            error => {
                this.iframe.nativeElement.src = error;
            }
        );
    }

    onSubmit() {
    }

    cancelPatientForm() {
        this.onCloseDialog.emit();
    }

    get(url: string): Observable<any> {
        let headers = new HttpHeaders();
        headers.append('AUTH-TOKEN', 'SomeToken123');

        return new Observable((observer: Subscriber<any>) => {
            let objectUrl: string = null;

            this.http
                .get(url, { headers: headers, responseType: 'blob' })
                .subscribe(m => {
                    objectUrl = URL.createObjectURL(m);
                    observer.next(objectUrl);
                });

            return () => {
                if (objectUrl) {
                    URL.revokeObjectURL(objectUrl);
                    objectUrl = null;
                }
            };
        });
    }
}

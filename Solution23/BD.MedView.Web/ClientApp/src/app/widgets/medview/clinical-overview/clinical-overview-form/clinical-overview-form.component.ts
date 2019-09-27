import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { delay, take } from 'rxjs/operators';
import { ResourceService } from 'container-framework';

@Component({
    selector: 'clinical-overview-form',
    templateUrl: './clinical-overview-form.component.html',
    styleUrls: ['./clinical-overview-form.component.scss']
})
export class ClinicalOverviewFormComponent implements OnInit {

    @ViewChild('iframe') iframe: ElementRef;

    @Output() onCloseDialog = new EventEmitter();

    patientData$: Observable<any>;
    documentationData$: Observable<any>;
    patientId: number;
    patientUrl: '';
    resources;
    loadingData = true;
    error = false;


    constructor(private resourceService: ResourceService) {
    }

    ngOnInit() {
        this.resources = this.getResources();
    }

    showDocumentationInfo() {
        this.error = false;
        this.documentationData$.pipe(take(1))
            .subscribe(
                blobResponse => this.renderBlob(blobResponse)
                , (e: any) => this.renderBlob(e.error)
            );
    }

    showPatientInfo() {
        this.loadingData = true;
        this.error = false;
        this.patientData$.pipe(take(1))
            .subscribe(blobResponse =>
                            this.renderBlob(blobResponse)
                , (e: any) => this.renderBlob(e.error));
    }

    private renderBlob(blob: Blob) {
        const reader = new FileReader();
        if (!(blob instanceof Blob)) {
            this.loadingData = false;
            this.error = true;
            console.log(blob);
            return;
        }
        reader.readAsText(blob);
        reader.onerror = (errorEvt) => {
            this.loadingData = false;
            this.error = true;
            console.error(errorEvt);
        };
        reader.onloadend = (loadedEvt: any) => {
            const html = loadedEvt.currentTarget.result;
            this.renderHtmlToIframe(html);
            this.loadingData = false;
        };
    }

    private renderHtmlToIframe(html: string) {
        this.iframe.nativeElement.contentWindow.document.open();
        this.iframe.nativeElement.contentWindow.document.write(html);
        this.iframe.nativeElement.contentWindow.document.close();
    }
    private getResources(): any {
        return {
            unableToRetrieveData: this.resourceService.resource('unableToRetrieveData')
        };

    }

    closeFormDialog() {
        this.onCloseDialog.emit();
    }
}

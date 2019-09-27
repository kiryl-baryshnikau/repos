import { Component, TemplateRef, ViewChild, ElementRef, OnInit, EventEmitter, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { ResourceService } from 'container-framework'

@Component({
    selector: 'mvd-warning-dialog',
    templateUrl: './mvd-warning-dialog.component.html',
    styleUrls: ['./mvd-warning-dialog.component.scss']
})
export class WarningDialogComponent implements OnInit {

    @ViewChild('yesButton') yesButton: ElementRef;
    @Output() dlgClosed = new EventEmitter<boolean>();

    modalRef: BsModalRef;
    resources: any;

    constructor(private resourceService: ResourceService) {

    }

    ngOnInit() {
        this.resources = this.getResources(); 
        setTimeout(() => { this.yesButton.nativeElement.focus(); }, 0);
    }

    confirm(): void {
        this.modalRef.hide();
        this.dlgClosed.emit(true);
    }

    decline(): void {
        this.modalRef.hide();
        this.dlgClosed.emit(false);
    }

    private getResources() {
        return {
            header: this.resourceService.resource('includePatientsWithNoPatientId'),
            cancelLabel: this.resourceService.resource('cancelDialogLabel'),
            yesLabel: this.resourceService.resource('yesDialogLabel'),
            message: this.resourceService.resource('unknownPatientsWarningMessage'),
            caution: this.resourceService.resource('caution'),
        };
    }
}


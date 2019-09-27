import { Component, TemplateRef, ViewChild, ElementRef, OnInit, EventEmitter, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
    selector: 'mvd-iv-prep-confirm-content-dlg',
    templateUrl: 'iv-prep-confirm-content.component.html',
    styleUrls: ['iv-prep-confirm-content.component.scss']
})
export class IvPrepConfirmDlgContentComponent implements OnInit {
    @ViewChild('yesButton') yesButton: ElementRef;
    @Output() dlgClosed = new EventEmitter<boolean>();

    modalRef: BsModalRef;

    message: string;
    header: string;
    cancelLabel: string;
    yesLabel: string;

    ngOnInit() {
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
}

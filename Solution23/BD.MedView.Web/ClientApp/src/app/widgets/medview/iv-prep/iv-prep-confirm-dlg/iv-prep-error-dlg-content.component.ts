import { Component, TemplateRef, ViewChild, Output, EventEmitter, ElementRef, OnInit } from '@angular/core';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { take } from 'rxjs/operators';

@Component({
    selector: 'mvd-iv-prep-error-dlg-content',
    templateUrl: 'iv-prep-error-dlg-content.component.html',
    styleUrls: ['iv-prep-error-dlg-content.component.scss']
})
export class IvPrepErrorDlgContentComponent implements OnInit {
    @ViewChild('okButton') okButton: ElementRef;
    @Output() dlgClosed = new EventEmitter();
    modalRef: BsModalRef;

    header: string;
    message: string;
    okLabel: string;

    ngOnInit() {
        setTimeout(() => { this.okButton.nativeElement.focus(); }, 0);
    }

    okClicked() {
        this.modalRef.hide();
        this.dlgClosed.emit();
    }
}

import { Component, TemplateRef, ViewChild, Output, EventEmitter, ElementRef, Injectable } from '@angular/core';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { IvPrepConfirmDlgContentComponent } from './iv-prep-confirm-content.component';
import { IvPrepErrorDlgContentComponent } from './iv-prep-error-dlg-content.component';
import { take } from 'rxjs/operators';

@Injectable()
export class IvPrepDlgService {
    @Output() dlgClosed = new EventEmitter<boolean>();

    public isConfirmModalOpen = false;

    private modalRef: BsModalRef;
    private modalOptions: ModalOptions = {
        class: 'modal-md',
        keyboard: false,
        ignoreBackdropClick: true,
        animated: true,
        focus: true
    };

    constructor(private modalService: BsModalService) { }

    openConfirmModal(header: string, message: string, yesLabel: string, cancelLabel: string) {
        const initialState = { header, message, yesLabel, cancelLabel };
        this.modalOptions.initialState = initialState;
        this.modalRef = this.modalService.show(IvPrepConfirmDlgContentComponent, this.modalOptions);
        this.isConfirmModalOpen = true;
        this.modalRef.content.modalRef = this.modalRef;
        this.modalRef.content.dlgClosed.pipe(take(1)).subscribe(reason => {
            this.isConfirmModalOpen = false;
            this.dlgClosed.emit(reason);
        });
    }

    closeConfirmModal() {
        if (!this.isConfirmModalOpen) { return; }

        this.modalRef.hide();
        this.dlgClosed.emit(false);
    }

    openErrorModal(header: string, message: string, okLabel: string) {
        const initialState = { header, message, okLabel };
        this.modalOptions.initialState = initialState;
        this.modalRef = this.modalService.show(IvPrepErrorDlgContentComponent, this.modalOptions);
        this.modalRef.content.modalRef = this.modalRef;
        this.modalRef.content.dlgClosed.pipe(take(1)).subscribe(() => this.dlgClosed.emit(true));
    }
}

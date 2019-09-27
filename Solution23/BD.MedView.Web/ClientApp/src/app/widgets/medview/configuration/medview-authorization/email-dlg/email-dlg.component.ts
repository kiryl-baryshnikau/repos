import { Component, TemplateRef, ViewChild, ElementRef, OnInit, EventEmitter, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';

@Component({
    selector: 'email-dlg',
    templateUrl: 'email-dlg.component.html',
    styleUrls: ['email-dlg.component.scss']
})
export class EmailDlgComponent implements OnInit {
    @ViewChild('yesButton') yesButton: ElementRef;
    @Output() dlgConfirm = new EventEmitter<any>();
    @Output() dlgCancel= new EventEmitter<any>();

    newPrimaryEmail = new FormControl('', Validators.email);
    //modalRef: BsModalRef;

    message: string;
    header: string;
    cancelLabel: string;
    yesLabel: string;

    ngOnInit() {
        setTimeout(() => { this.yesButton.nativeElement.focus(); }, 0);
    }

    confirm(): void {
        //this.modalRef.hide();
        this.dlgConfirm.emit({confirm: true, email: this.newPrimaryEmail.value});
    }

    decline(): void {
        //this.modalRef.hide();
        this.dlgCancel.emit();
    }
}

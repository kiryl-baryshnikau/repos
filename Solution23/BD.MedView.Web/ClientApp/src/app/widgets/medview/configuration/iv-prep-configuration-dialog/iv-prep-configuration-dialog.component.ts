import { Component, OnInit, ViewChild } from '@angular/core';

import { ElementRef } from '@angular/core';
import { Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { ResourceService } from 'container-framework';

@Component({
    selector: 'iv-prep-configuration-dialog',
    templateUrl: './iv-prep-configuration-dialog.component.html',
    styleUrls: ['./iv-prep-configuration-dialog.component.scss']
})
export class IvPrepConfigurationDialogComponent implements OnInit {

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

    private getResources() {
        return {
            unMappedStates: this.resourceService.resource('unMappedStates'),
            ok: this.resourceService.resource('ok'),
            unMappedStatesWarningDialogMessage: this.resourceService.resource('unMappedStatesWarningDialogMessage')
        };
    }
}

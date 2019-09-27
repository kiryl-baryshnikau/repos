import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgForm, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

import * as models from '../../../shared/mvd-models';

@Component({
    selector: 'mvd-facilitymgmt-modal',
    templateUrl: './mvd-facilitymgmt-modal.component.html',
    styleUrls: ['./mvd-facilitymgmt-modal.component.scss']
})
export class MvdFacilitymgmtModalComponent {

    formOptions: models.ModalFormValues;
    @Output() onCancelEmit = new EventEmitter();
    @Output() onSave = new EventEmitter();
    @Output() onDelete = new EventEmitter();

    questions: models.FormField[];
    formGroup: FormGroup;
    _builder: FormBuilder;

    constructor() {
        this.formGroup = null;
        this._builder = new FormBuilder();
        this.formGroup = this._builder.group({});
    }

    displayForm(formOptions: any) {
        //this.initializeForm();
        this.formOptions = formOptions;
        if (this.formOptions) {
            this.questions = this.formOptions.questions;
            this.questions.forEach((question) => {
                this.formGroup.addControl(question.fieldName,
                    new FormControl(question.value || '', (question.required) ? Validators.required : null));
            });
        }
    }

    emitSaveAction() {
        if (this.formGroup.valid) {
            this.onSave.emit({
                id: this.formOptions.id,
                values: this.formOptions.questions
            });
        }
    }

    emitCancelAction() {
        this.onCancelEmit.emit({
            id: this.formOptions.id
        });
    }

    emitDeleteAction() {
        this.onDelete.emit({
            id: this.formOptions.id
        });
    }
}

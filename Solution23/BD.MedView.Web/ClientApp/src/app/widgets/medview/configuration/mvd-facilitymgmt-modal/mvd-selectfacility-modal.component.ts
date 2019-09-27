import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { NgForm, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

import { SelectItem } from 'primeng/api';

import * as models from '../../../shared/mvd-models';
import { Observable, Subscription } from 'rxjs';


@Component({
    selector: 'mvd-selectfacility-modal',
    templateUrl: './mvd-selectfacility-modal.component.html',
    styleUrls: ['./mvd-facilitymgmt-modal.component.scss']
})
export class SelectFacilityModalComponent implements OnInit, OnDestroy {
    @Input('formOptions')
    formOptions$: Observable<models.ModalFormValues>;

    @Input('sourceFacilities')
    sourceFacilities$: Observable<SelectItem[]>;

    @Output() onCancelEmit = new EventEmitter();
    @Output() onSave = new EventEmitter();
    @Output() onDelete = new EventEmitter();

    formGroup: FormGroup;
    _builder: FormBuilder;
    selectedFacility: any;

    private formOptionsSubscription: Subscription;
    private controlFacilityName: string;

    readonly fieldLabelConst = 'label';
    readonly ascOrderConst = 1;
    readonly sortingMethodConst = 'alphabetical';

    constructor() {
        this.formGroup = null;
        this._builder = new FormBuilder();
        this.formGroup = this._builder.group({});


    }

    ngOnInit() {
        this.formOptionsSubscription = this.formOptions$
            .subscribe((formOptions) => {
                this.displayForm(formOptions);
            });
    }

    ngOnDestroy() {
        this.formOptionsSubscription.unsubscribe();
    }

    private displayForm(formOptions: models.ModalFormValues) {
        if (formOptions) {


            this.controlFacilityName = formOptions.questions[0].fieldName;
            this.formGroup.addControl("providerId", new FormControl(formOptions.id));
            this.formGroup.addControl(formOptions.questions[0].fieldName,
                new FormControl(formOptions.questions[0].value || '', (formOptions.questions[0].required) ? Validators.required : null));
            this.selectedFacility = formOptions.questions[0].value;
        }
    }

    emitSaveAction() {
        if (this.formGroup.valid) {
            this.onSave.emit({
                id: this.formGroup.get("providerId").value,
                values: this.formGroup.get(this.controlFacilityName).value
            });
        }
    }

    emitCancelAction() {
        this.onCancelEmit.emit({
            id: this.formGroup.get("providerId").value
        });
    }

    emitDeleteAction() {
        this.onDelete.emit({
            id: this.formGroup.get("providerId").value
        });
    }
}

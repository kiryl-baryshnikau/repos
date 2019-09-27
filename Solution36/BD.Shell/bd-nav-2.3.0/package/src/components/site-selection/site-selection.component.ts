import { Component, Output, ViewChild, Input, EventEmitter, OnChanges, OnInit, SimpleChanges, ElementRef } from '@angular/core';
import * as model from '../../models';
import { LocaleService } from '../../services/locale.service/locale.service';

@Component({
    selector: 'site-selection',
    templateUrl: './site-selection.component.html',
    styleUrls: ['./site-selection.component.scss'],
    host: { role: 'dialog', tabindex: '-1', 'class': 'bdshell--override bdshell--site-selection' }
})

export class SiteSelectionComponent implements OnChanges {

    @Input() idnList: model.Idn[] = [];
    @Input() facilityList: model.Facility[] = [];
    @Input() selectedIdn: model.Idn;
    @Input() selectedFacility: model.Facility;
    @Input() localeKeys: { [localeKey: string]: string } = {};
    @Input() selectionRequired: boolean;
    idnListOpened: boolean;
    facilityListOpened: boolean;

    highlightedIdn: model.Idn;
    highlightedFacility: model.Facility;

    @Output() selectedIdnChange = new EventEmitter<model.Idn>();
    @Output() selectedFacilityChange = new EventEmitter<model.Facility>();
    @Output() highlightedIdnChange = new EventEmitter<model.Idn>();
    @Output() highlightedFacilityChange = new EventEmitter<model.Facility>();
    @ViewChild('backdrop') private backdrop: ElementRef;
    @ViewChild('siteSelectionModalPopup') private siteSelectionModalPopup: ElementRef;

    displaySiteSelectionDialogFlag: boolean = false;

    constructor(private localeService: LocaleService, private elementRef: ElementRef) {
        this.localeService.getComponentsLocale().subscribe(locales => { this.localeKeys = locales; this.setDefaultLocales() });
        this.setDefaultLocales();
    }

    ngOnInit() {
        var bdContainer = document.getElementsByTagName('bd-nav')[0];
        bdContainer.appendChild(this.siteSelectionModalPopup.nativeElement);
        bdContainer.appendChild(this.backdrop.nativeElement);

        if (this.idnList.length == 1 && this.facilityList.length == 1) {
            this.selectedIdn = this.idnList[0];
            this.selectedFacility = this.facilityList[0];
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        var localeChangesObject = changes['localeKeys'];
        var facilityListChanged = changes['facilityList'];
        var displaySiteSelectionDialogFlagChanged = changes['displaySiteSelectionDialogFlag'];

        if (displaySiteSelectionDialogFlagChanged) {
            if (displaySiteSelectionDialogFlagChanged.currentValue) {
                this.setDisplaySiteSelectionDialogFlag(displaySiteSelectionDialogFlagChanged.currentValue);
            }
        }

        if (facilityListChanged && !facilityListChanged.firstChange) {
            var facilityList = facilityListChanged.currentValue;
            this.applyFacilityListRules(facilityList);
        }

        if (localeChangesObject) {
            this.setDefaultLocales();
        }
    }

    scrollingState(visible: boolean) {
        if (visible) {
            document.body.style.msOverflowStyle = "scrollbar";
            document.body.style.overflow = 'auto';
        }
        else {
            document.body.style.msOverflowStyle = "";
            document.body.style.overflow = 'hidden';
        }
    }

    save() {
        this.displaySiteSelectionDialogFlag = false;

        if (this.selectedIdn != this.highlightedIdn) {
            this.selectedIdn = this.highlightedIdn;
            this.selectedIdnChange.emit(this.selectedIdn);
        }

        if (this.selectedFacility != this.highlightedFacility) {
            this.selectedFacility = this.highlightedFacility;
            this.selectedFacilityChange.emit(this.selectedFacility);
        }
    }

    cancel() {
        this.displaySiteSelectionDialogFlag = false;

        if (this.selectedIdn) {
            this.selectedIdnChange.emit(this.selectedIdn);
            this.highlightedIdnChange.emit(this.selectedIdn);
        }
    }

    selectedIdnChanged(value: number) {
        this.idnListOpened = false;
        this.highlightedFacility = null;

        let localSelectedIdn = this.idnList.filter((idn: model.Idn) => idn.id == value);

        if (localSelectedIdn.length) {
            this.highlightedIdn = localSelectedIdn[0];
            this.highlightedIdnChange.emit(this.highlightedIdn);
        }
    }

    selectedFacilityChanged(value: number) {
        this.facilityListOpened = false;
        let localSelectedfacility = this.facilityList.filter((facility: model.Facility) => facility.id == value);
        if (localSelectedfacility.length) {
            this.highlightedFacility = localSelectedfacility[0];
            this.highlightedFacilityChange.emit(this.highlightedFacility);
        }
    }
    
    setDisplaySiteSelectionDialogFlag(flag: boolean) {
        this.displaySiteSelectionDialogFlag = flag;

        if (flag) {
            if (this.selectedIdn) {
                this.highlightedIdn = this.selectedIdn;
            }
            else if (this.idnList.length == 1) {
                this.highlightedIdn = this.idnList[0];
                this.highlightedIdnChange.emit(this.highlightedIdn);
            }

            if (this.selectedFacility) {
                this.highlightedFacility = this.selectedFacility;
            }

            this.applyFacilityListRules(this.facilityList);
        }
    }

    private applyFacilityListRules(facilityList: model.Facility[], persistSelection: boolean = false) {
        if (!this.idnList.length && facilityList.length > 0) {
            throw 'Set the "facilityList" after setting "selectedIdn"';
        }

        if ((this.selectedIdn || this.highlightedIdn) && facilityList.length == 1) {

            if (this.selectedFacility != facilityList[0]) {
                this.highlightedFacility = facilityList[0];

                if (persistSelection) {
                    this.selectedFacility = this.highlightedFacility;
                    this.selectedFacilityChange.emit(this.selectedFacility);
                }

                this.highlightedFacilityChange.emit(this.highlightedFacility);
            }
        }
    }

    private setDefaultLocales() {
        this.localeKeys['BD-UI-SiteSelection-IDN'] = this.localeKeys['BD-UI-SiteSelection-IDN'] || 'IDN';
        this.localeKeys['BD-UI-SiteSelection-Facility'] = this.localeKeys['BD-UI-SiteSelection-Facility'] || 'Facility';
        this.localeKeys['BD-UI-SiteSelection-ChangeSelection'] = this.localeKeys['BD-UI-SiteSelection-ChangeSelection'] || 'Change';
        this.localeKeys['BD-UI-SiteSelection-Cancel'] = this.localeKeys['BD-UI-SiteSelection-Cancel'] || 'Cancel';
        this.localeKeys['BD-UI-SiteSelection-SelectIdnFacility'] = this.localeKeys['BD-UI-SiteSelection-SelectIdnFacility'] || 'Select IDN/Facility';
        this.localeKeys['BD-UI-SiteSelection-NoFacilityMessage'] = this.localeKeys['BD-UI-SiteSelection-NoFacilityMessage'] || 'The IDN selected has no associated facility.';
        this.localeKeys['BD-UI-SiteSelection-PopupTitle'] = this.localeKeys['BD-UI-SiteSelection-PopupTitle'] || 'Site and Facility Selection';
        this.localeKeys['BD-UI-SiteSelection-Close'] = this.localeKeys['BD-UI-SiteSelection-Close'] || 'Close';
        this.localeKeys['BD-UI-SiteSelection-Save'] = this.localeKeys['BD-UI-SiteSelection-Save'] || 'Save';
        this.localeKeys['BD-UI-SiteSelection-SelectOption'] = this.localeKeys['BD-UI-SiteSelection-SelectOption'] || 'Select an option';
        this.localeKeys['BD-UI-SiteSelection-SelectIdnFacilityMessage'] = this.localeKeys['BD-UI-SiteSelection-SelectIdnFacilityMessage'] || 'Select the Integrated Delivery Network (IDN) and Facility you wish to view.';
    }
}

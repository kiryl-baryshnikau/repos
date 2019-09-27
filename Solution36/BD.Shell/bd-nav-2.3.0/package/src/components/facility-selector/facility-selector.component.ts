import {
    Component, Input, Output, OnInit,
    EventEmitter, ElementRef, OnChanges,
    SimpleChanges, ViewChild
}                                                           from '@angular/core';
import { LocaleService }                                    from '../../services/locale.service/locale.service'
import * as model                                           from '../../models';

@Component({
    selector: 'facility-selector',
    templateUrl: './facility-selector.component.html',
    styleUrls: ['./facility-selector.component.scss'],
    host: { role: 'dialog', tabindex: '-1', 'class': 'bdshell--site-selection--facility-selector fade modal' }
})
export class FacilitySelectorComponent implements OnInit, OnChanges {

    @Input() facilitySelectorDescriptionMessage: string = '';
    @Input() idnList: model.Idn[] = [];
    @Input() facilityList: model.Facility[] = [];
    @Input() selectedIdn: model.Idn = null;
    @Input() selectedFacility: model.Facility = null;
    @Output() selectedFacilityChange = new EventEmitter<model.Facility>();
    @Input() filteredFacilityList: model.Facility[] = [];
    @Output() filteredFacilityListChange = new EventEmitter<model.Facility[]>();
    @Input() localeKeys: { [localeKey: string]: string } = {};

    // control states
    @Input() isFacilityDropdownVisible: boolean = false;
    @Output() isFacilityDropdownVisibleChange = new EventEmitter<boolean>();
    @Input() facilitySelectorPopupOpened: boolean = false;
    @Output() facilitySelectorPopupOpenedChange = new EventEmitter<boolean>();

    @ViewChild('backdrop') private backdrop: ElementRef;

    allFacilitiesSelectedByFacilitySelector: boolean = false;
    facilityNameFilterString: string = '';
    facilityNameSearchInput: string = '';


    constructor(private elementRef: ElementRef, private localeService: LocaleService) {
        this.localeService.getComponentsLocale().subscribe(locales => this.localeKeys = locales);
        this.setDefaultLocales();
    }

    ngOnInit() {
        window.document.body.appendChild(this.elementRef.nativeElement);
        window.document.body.appendChild(this.backdrop.nativeElement); // TODO: Remove from body on ngDestroy() if not implicitely removed
    }

    ngOnChanges(changes: SimpleChanges): void {
        var facilitySelectorPopupOpenenedValueChanged = changes['facilitySelectorPopupOpened'];
        var filteredFacilityListChanges = changes['filteredFacilityList'];
        var localeChanges = changes['localeKeys'];


        if (localeChanges) {
            this.setDefaultLocales();
        }

        if (filteredFacilityListChanges) {
            if (filteredFacilityListChanges.currentValue.length > 0) {
                // select the first facility in the facility list by default
                this.selectedFacility = filteredFacilityListChanges.currentValue[0];
            }
        }

        if (facilitySelectorPopupOpenenedValueChanged) {
            this.raiseFacilitySelectorPopupDisplayChanged(facilitySelectorPopupOpenenedValueChanged.currentValue);

            if (facilitySelectorPopupOpenenedValueChanged.currentValue == true) {
                this.facilityNameFilterString = '';
                this.elementRef.nativeElement.classList.add('d-block');
                this.elementRef.nativeElement.classList.add('show');
            }
            else {
                this.elementRef.nativeElement.classList.remove('d-block');
                this.elementRef.nativeElement.classList.remove('show');
            }
        }
    }

    hideFacilitySelectorPopup() {
        this.facilityList.forEach(facility => facility['filtered'] = false);
        this.filteredFacilityList.forEach(facility => facility['filtered'] = true);

        this.raiseFacilitySelectorPopupDisplayChanged(false);
    }

    toggleAllFacilitiesFilterFlag(flag: boolean) {
        this.allFacilitiesSelectedByFacilitySelector = flag;

        for (var i = 0; i < this.facilityList.length; i++) {
            this.facilityList[i]["filtered"] = flag;
        }
    }

    toggleFacilityFilterFlag(facility: model.Facility, flag: boolean) {
        facility["filtered"] = flag;
        this.filteredFacilitiesCount();
    }

    filteredFacilitiesCount(): number {
        var searchedFacilityList = this.facilityList.filter(f => (f.name || '').indexOf(this.facilityNameFilterString) >= 0);
        var filteredFacilitiesLength = searchedFacilityList.filter(f => f["filtered"]).length;


        if (filteredFacilitiesLength == searchedFacilityList.length) {
            this.allFacilitiesSelectedByFacilitySelector = true;
        }
        else {
            this.allFacilitiesSelectedByFacilitySelector = false;
        }

        return filteredFacilitiesLength;
    }

    setFilteredFacilityList() {
        var filteredFacilityList = this.facilityList.filter(f => f["filtered"] && (f.name || '').indexOf(this.facilityNameFilterString) >= 0);

        if (filteredFacilityList.length) {
            this.filteredFacilityList = filteredFacilityList;
            this.filteredFacilityListChange.emit(filteredFacilityList);

            this.selectedFacility = this.filteredFacilityList[0];
            this.selectedFacilityChange.emit(this.selectedFacility);

            this.notifyAndCloseFacilitySelectorPopup();
        }
    }

    setSelectedFacility(facility: model.Facility) {
        this.selectedFacility = facility;
        this.selectedFacilityChange.emit(facility);

        this.filteredFacilityList = this.facilityList.slice(0);

        this.filteredFacilityList.forEach(facility => facility["filtered"] = true);
        this.notifyAndCloseFacilitySelectorPopup();
    }

    isDisplaySelectedFacilitiesButtonDisabled(): boolean {
        this.facilityNameSearchInput = this.facilityNameFilterString.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        var facilityNameFilterExp = new RegExp(this.facilityNameSearchInput, 'i');
        return this.facilityList.every(facility => facility.name.search(facilityNameFilterExp) < 0 || !facility['filtered']);
    }

    // private methods
    private notifyAndCloseFacilitySelectorPopup() {
        // This method will notify that filteredFacilityList has been changed and close the popup
        this.filteredFacilityListChange.emit(this.filteredFacilityList);

        this.isFacilityDropdownVisible = true;
        this.isFacilityDropdownVisibleChange.emit(true);

        this.hideFacilitySelectorPopup();
    }

    private raiseFacilitySelectorPopupDisplayChanged(displayFlag: boolean) {
        this.facilitySelectorPopupOpenedChange.emit(displayFlag);        
    }

    private setDefaultLocales() {
        this.localeKeys['BD-UI-SiteSelection-FacilityListForIdnFormat'] = this.localeKeys['BD-UI-SiteSelection-FacilityListForIdnFormat'] || 'Facility list for arg0';
        this.localeKeys['BD-UI-SiteSelection-Close'] = this.localeKeys['BD-UI-SiteSelection-Close'] || 'Close';
        this.localeKeys['BD-UI-SiteSelection-FacilityFilterCountFormat'] = this.localeKeys['BD-UI-SiteSelection-SelectOption'] || 'arg0 of arg1 facilities selected';
        this.localeKeys['BD-UI-SiteSelection-SearchFacility'] = this.localeKeys['BD-UI-SiteSelection-SearchFacility'] || 'Search Facility';

        this.localeKeys['BD-UI-SiteSelection-NoDataFound'] = this.localeKeys['BD-UI-SiteSelection-NoDataFound'] || 'No data found!';
        this.localeKeys['BD-UI-SiteSelection-NoFacilitySearchFormat'] = this.localeKeys['BD-UI-SiteSelection-NoFacilitySearchFormat'] || 'The string used "arg0" did not return any results.';
        this.localeKeys['BD-UI-SiteSelection-FacilityName'] = this.localeKeys['BD-UI-SiteSelection-FacilityName'] || 'Facility name';

        this.localeKeys['BD-UI-SiteSelection-Cancel'] = this.localeKeys['BD-UI-SiteSelection-Cancel'] || 'Cancel';
        this.localeKeys['BD-UI-SiteSelection-DisplaySelectedFacilities'] = this.localeKeys['BD-UI-SiteSelection-DisplaySelectedFacilities'] || 'Display selected';
    }
}

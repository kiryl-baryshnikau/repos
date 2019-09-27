import {
    Component, OnChanges, SimpleChanges,
    Input, Output, EventEmitter
} from '@angular/core';
import { LocaleService } from '../../services/locale.service/locale.service';
import * as model from '../../models';

@Component({
    selector: 'site-selection-extended',
    templateUrl: './site-selection-extended.component.html',
    styleUrls: ['./site-selection-extended.component.scss'],
    host: { 'class': 'bdshell--site-selection-extended bdshell-override position-fixed' },
})
export class SiteSelectionExtendedComponent implements OnChanges {

    // properties
    @Input() idnList: model.Idn[] = [];
    @Input() facilityList: model.Facility[] = [];
    @Input() selectedIdn: model.Idn = null;
    @Output() selectedIdnChange = new EventEmitter<model.Idn>();
    @Input() selectedFacility: model.Facility = null;
    @Output() selectedFacilityChange = new EventEmitter<model.Facility>();
    @Input() filteredFacilityList: model.Facility[] = [];
    @Output() filteredFacilityListChange = new EventEmitter<model.Facility[]>();
    @Input() facilitySelectorDescriptionMessage: string;
    @Input() localeKeys: { [localeKey: string]: string } = {};

    // control states
    @Input() isFacilityDropdownVisible: boolean = false;
    @Output() isFacilityDropdownVisibleChange = new EventEmitter<boolean>();
    @Input() facilitySelectorPopupOpened: boolean = false;
    @Output() facilitySelectorPopupOpenedChange = new EventEmitter<boolean>();

    isIdnDropdownOpened: boolean = false;
    isFacilityDropdownOpened: boolean = false;
    facilityDropdownSearchString: string = '';
    idnDropdownSearchString: string = '';

    constructor(private localeService: LocaleService) {
        this.localeService.getComponentsLocale().subscribe(locales => this.localeKeys = locales);
        this.setDefaultLocales();
    }

    ngOnChanges(changes: SimpleChanges): void {
        var idnListChanges = changes['idnList'];
        var facilityListChanges = changes['facilityList'];
        var isFacilityDropdownOpenedChanges = changes['isFacilityDropdownOpened'];
        var isIdnDropdownOpenedChanges = changes['isIdnDropdownOpened'];
        var localeChanges = changes['localeKeys'];


        if (localeChanges) {
            this.setDefaultLocales();
        }

        if (idnListChanges) {
            if (idnListChanges.currentValue.length == 1) {
                // if user has access to only one IDN, select it by default
                this.selectedIdn = idnListChanges.currentValue[0];
            }
        }

        if (facilityListChanges) {
            this.filteredFacilityList = facilityListChanges.currentValue;
            this.filteredFacilityList.forEach(facility => facility["filtered"] = true);
        }

        if (isFacilityDropdownOpenedChanges) {
            this.facilityDropdownSearchString = '';
        }

        if (isIdnDropdownOpenedChanges) {
            this.idnDropdownSearchString = '';
        }
    }

    onSelectedIdnChanged(idn: model.Idn) {
        this.isIdnDropdownOpened = false;
        this.selectedFacility = null;
        this.selectedIdnChange.emit(idn);
        this.idnDropdownSearchString = '';
    }

    onSelectedFacilityChanged(facility: model.Facility) {
        this.isFacilityDropdownOpened = false;
        this.selectedFacilityChange.emit(facility);
        this.facilityDropdownSearchString = '';
    }

    // private methods

    private setDefaultLocales() {
        this.localeKeys['BD-UI-SiteSelection-SelectIdn'] = this.localeKeys['BD-UI-SiteSelection-SelectIdn'] || 'Select IDN';
        this.localeKeys['BD-UI-SiteSelection-SelectFacility'] = this.localeKeys['BD-UI-SiteSelection-SelectFacility'] || 'Select Facility';
        this.localeKeys['BD-UI-SiteSelection-SearchIdn'] = this.localeKeys['BD-UI-SiteSelection-SearchIdn'] || 'Search IDN';
        this.localeKeys['BD-UI-SiteSelection-SearchFacility'] = this.localeKeys['BD-UI-SiteSelection-SearchFacility'] || 'Search Facility';
    }
}

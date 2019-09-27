import { MedMinedModels as mmModel} from '../shared/medmined-models';

export interface DeliveryTrackingItem extends mmModel.MedMinedSecondaryDataItem {
    internalId: number;
    deliveryLocationName: string;
    priority: string;
    patient: string;
    patientId: string;
    unit: string;
    facilityCodeUnit: string;
    patientRoomName: string;
    patientBedId: string;
    patientInfo: string;
    patientData: DeliveryTrackingPatientData;
    location: string;
    orderStatus: string;
    orderDescription: string;
    status: string;
    deliveryTrackingStatus: string;
    dateAge: string;
    dateAgeValue: Date | number;
    orderId: string;
    giveAmount: number;
    maximumGiveAmount: number;
    routes: string[];
    giveUnitOfMeasure: string;
    isMultiComponentOrder: boolean;
    facilityCode: string;
    facilityName: string;
    genericName?: string;
}

export interface IvStatusItem extends mmModel.MedMinedSecondaryDataItem {
    infusionContainerKey: number;
    patientId: string;
    patientIdUnmasked: string;
    patientName: string;
    patientFirstName: string;
    patientLastName: string;
    facility: string;
    masterFacility: string;
    unitRoom: string;
    unit: string;
    infusionName: string;
    drugAmountDiluentVolume: string;
    drugAmountDiluentVolumeDetail: string;
    dose: string;
    doseDetail: string;
    rate: string;
    rateDetail: string;
    startDateTime: string;
    estimatedTimeTillEmpty: string;
    estimatedTimeTillEmptyCounter?: string;
    estimatedVolumeRemaining: string;
    infusionStatus: string;
    replenishmentStatus: string;
    lastUpdate: string;
    highPriority: boolean;
    guardrailStatus: any;
    infusionType: string;
    vtbi: string;
    vtbiDetail: string;
    cumulativeVolumeInfused: string;
    clinicianId: string;
    unmaskedPatientName: string;
    accountNumber: string;
    gender: string;
    admitDate: string;
    dischargeDate: string;
    floor: string;
    bed: string;
    room: string;
    adtPatientId: string;
    dateOfBirth: string;
    moduleModelNumber: string;
    moduleSerialNumber: string;
    pcuModelNumber: string;
    pcuSerialNumber: string;
    physician: string;
    placerOrderId?: string;
    drugAmount: string;
    drugUnit: string;
}

export interface ContinuousInfusionItem extends mmModel.MedMinedSecondaryDataItem {
    patientId: string;
    firstName: string;
    lastName: string;
    placerOrderId: string;
    infusionName: string;
    drugAmount: string;
    drugUnit: string;
}

export interface DeliveryTrackingPatientData {
    firstName: string;
    lastName: string;
}

export interface TimeFrameFilter {
    dateOptionSelected: string;
    selectedCurrentDate?: number;
    api?: {
        startDate?: Date;
        stopDate?: Date;
    };
}

export interface IvPrepTimeFrameFilter {
    pastOptionValue: number;
    futureOptionValue: number;
}

export interface IvPrepConfigModel {
    columns: ColumnOption[];
    timeFrameFilter: TimeFrameFilter;
    hourFrameFilter?: number;
    options: {
        sort: any;
        pagination: { first: number, rows: number };
        defaultSort: boolean;
        globalSearchCriteria: string;
    };
}
export interface ColumnOption {
    header: string;
    field: string;
    colIndex: number;
    hideOptions: HideOption;
    sortOptions: SortOption;
    filterOptions: FilterOption;
    isFrozen?: boolean;
    sortFieldName?: string;
    subProperty?: string;
}

export interface HideOption {
    enabled: boolean;
    visible: boolean;
    hide?: boolean;
    isDeliveryColumn?: boolean;
}

export interface SortOption {
    enabled: string;
    method: string;
    default?: boolean;
}

export interface FilterOption {
    enabled: boolean;
    allChecked: boolean;
    hasWidgetSettings?: boolean;
    criteria: FilterCriteria[];
    order?: number;
}

export interface FilterCriteria {
    state: boolean;
    value: string;
}

export interface SelectableItem {
    value: string;
    label: string;
    selected: boolean;
}
export interface OptionsListPriorities {
    showAnimations: boolean;
    displayIcons: boolean;
    showBorder?: boolean;
}
export interface MvdListData {
    data: Array<MvdListElement>;
    options?: OptionsListPriorities;
}
export interface MvdListElement {
    key: string;
    priority: string;
    counter: any;
    title: string;
    label: string;
    value: string;
    blinkingRow?: boolean;
    originalItem?: any;
    critical?: boolean;
    facilityKeys?: string[];
    priorityText?: string;
}
export class ModalFormValues {
    id: any;
    titleForm: string;
    subTitleForm?: string;
    editForm: boolean;
    actionsFormsLabels: ActionsFormsLabels;
    questions: FormField[];
}

export class FormField {
    label: string;
    fieldName: string;
    required: boolean;
    value?: any;
}

export class ActionsFormsLabels {
    saveOptionLabel: string;
    cancelOptionLabel: string;
    deleteOptionLabel?: string;
}

export class SystemAdminSettings {
    refreshRate: number;
}

export class FacilityInfo {
    adtFacility: string;
    facilityId: string;
    units: UnitInfo[];
}

export class UnitInfo {
    patientCareUnit: string;
    patients: PatientInfo[];
}

export class PatientInfo {
    infusionContainerKey: number;
    patientName: string;
    firstName: string;
    lastName: string;
    middleName: string;
    patientId: string;
    adtPatientId: string;
    dischargeDate: string;
}

export interface ColumnOptionSetting {
    widget: string;
    values: ColumnOptionValue[];
}

export interface GeneralSetting {
    id: string;
    configuration: any;
}

export interface ColumnOptionValue {
    colIndex: number;
    field: string;
    visible: boolean;
}

export declare module IvPrepModels {

    export interface Patient {
        PatientNumber: string;
        Name: string;
    }

    export interface Drug {
        PrimaryActiveSubstance: string;
        FinalUnit: string;
        FinalAmount: number;
    }

    export interface Dose {
        DoseId: string;
        StateId: string;
        Urgent: boolean;
        Blocked: boolean;
        Cancelled: boolean;
        Patient: Patient;
        Drugs: Drug[];
        OrderNumber?: any;
        Prepsite: string;
        AdminDateTime: Date;
        FacilityAbbr: string;
        UnitDesignation: string;
        FinalContainerType: string;
        DispenseId: string;
        VisitNumber: string;
    }

    export interface DoseState {
        StateId: string;
        TotalDoseCount: number;
        UrgentDoseCount: number;
    }

    export interface IvPrepState {
        Id: string;
        Designation: string;
        Abbreviation: string;
        StandardId: number;
    }

    export interface DoseStatesResponse {
        DoseStates: IvPrepState[];
    }

    export interface DoseSummary {
        TotalDoses: number;
        DoseStates: DoseState[];
    }

    export interface DosesResponse {
        Doses: Dose[];
        DoseSummary: DoseSummary;
    }

    export interface FacilitiesResponse {
        Facilities: {
            Id: string;
            Designation: string;
            Abbreviation: string;
        }[];
    }

    export interface UnitsResponse {
        Units: {
            Id: string;
            FacilityId: string;
            Designation: string;
        }[];
    }

    export interface PrepSitesResponse {
        Prepsites: PrepSite[];
    }

    export interface PrioritiesResponse {
        Priorities: Priority[];
    }

    export interface Priority {
        Id: string;
        Value: boolean;
    }

    export interface ContainerTypesResponse {
        ContainerTypes: ContainerType[];
    }

    export interface ContainerType {
        Id: string;
        Value: string;
    }

    export interface PrepSite {
        Id: string;
        Designation: string;
        Abbreviation: string;
    }

    export interface IvPrepViewModel extends mmModel.MedMinedSecondaryDataItem {
        doseId: string;
        patientName: string;
        patientNumber: string;
        isOnHold: boolean;
        isOnHoldView: boolean;
        priority: boolean;
        status: IvPrepModels.IvPrepStatuses;
        statusDisplayName: string;
        medication: string;
        orderNumber: string;
        dateTimeNeeded: Date;
        facilityName: string;
        masterFacility: string;
        unit: string;
        unitId: string;
        prepSite: string;
        doseMedNumber;
        cancelled: boolean;
        doseViewStatus: string;
        finalContainerType: string;
        isHoldDisabled?: boolean;
        isPriorityChangeDisabled?: boolean;
        priorityDisplayName?: string;
        sourceDoseItem: Dose;
    }

    export interface ProviderState {
        id: number;
        designation: string;
        standardId: number;
        stateId: string;
    }

    export interface StateMapping {
        id: number;
        type: string;
        name: string;
        providerStates: ProviderState[];
    }

    export interface ProviderStateRequest {
        id: number;
        designation?: string;
        standardId?: number;
        stateId: string;
        widgetStates: StateMapping[];
    }

    export type IvPrepStatuses = 'QUEUEDPREP' | 'READYPREP' | 'INPREP' | 'READYCHECK' | 'READYDELIVERY' | 'DELIVERY' | 'UNMAPPED' | 'ALL';

    export interface ApiConfig {
        TimeZoneOffset: string;
    }

    export interface StatesMappingViewModel {
        providerStateId: number;
        widgetStateId: number;
        designation: string;
        designationDisplayName: string;
        tooltipText: string;
        stateId: string;
        standardId: number;
        ivPrepStatus: IvPrepStatuses;
    }

    export interface UnitSetting {
        facilityId: string;
        facilityName: string;
        unitId: string;
        unitName: string;
    }

    export interface IvPrepGeneralSettings {
        unitsSettings?: UnitSetting[];
        prepSiteSettings?: PrepSiteSetting[];
    }

    export interface PrepSiteSetting {
        prepSiteId: string;
        prepSiteAbbr: string;
    }

    export interface FacilityViewModel {
        masterFacilityName: string;
        nativeFacilityKey: string;
    }

    export interface Unit {
        Id: string;
        FacilityId: string;
        Designation: string;
    }
}

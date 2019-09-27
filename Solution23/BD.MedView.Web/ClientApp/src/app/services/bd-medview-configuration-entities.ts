export interface ColumnOption {
    widget: string;
    values: ColumnOptionValue[];
}

export interface ColumnOptionValue {
    colIndex: number;
    field: string;
    visible: boolean;
}

export interface Facility {
    id: string;
    selected: boolean;
    widgets: Widget[];
    units: string[];
}

export interface FacilityFilter {
    facilityId: string
    units: UnitFilter[];
}

export interface FacilityPatientIdMapping {
    id: number;
    synonymKey: string;
    providerName: string;
    patientIdKind: string;
}

export interface Filters {
    facilityFilters: FacilityFilter[]
}

export interface GeneralSetting {
    id: string;
    configuration: any;
}

export interface GlobalPreference {
    id: number;
    name: string;
    type: string;
    version: string;
}

export interface InfusionGlobalPreference extends GlobalPreference {
    containerTolerance: number;
    excludedInfusions: InfusionGlobalSetting[];
    preserveRecords: number;
    priorityThreshold: number;
    warningThreshold: number;
    urgentThreshold: number;
    refreshRate: number;
    orderServiceVariance: number | null;
}

export interface InfusionGlobalSetting {
    name: string;
    addedByUser: boolean;
}

export interface MigrateRequest {
    oldPrincipalName: string;
    newPrincipalName: string;
    appCodes: string[];
}

export interface PatientFilter {
    patientId: string;
    patientName: string;
}

export enum PatientIdKind {
    MRN = 'MRN',
    VisitNumber = 'VisitNumber',
    AccountNumber = 'AccountNumber',
    EncounterNumber = 'EncounterNumber'
}

export interface PatientIdKindFhirServiceMapping {
    id: number;
    patientIdKind: string
    fhirServiceValue: string;
}

export interface ProviderState {
    id: number;
    designation: string;
    stateId: string;
    standardId: number | null;
    widgetStates: WidgetState[];
}

export interface UnitFilter {
    unitId: string;
    patients: PatientFilter[];
}

export interface UserPreference {
    id: number;
    user: string;
    sessionTimeout: number;
    maskData: boolean;

    facilities: Facility[];
    generalSettings: GeneralSetting[];
    filters: Filters;
    columnOptions: ColumnOption[];
}

export interface Widget {
    id: string;
    enabled: boolean;
    default: boolean;
    configuration: any;
    route: string;
}

export interface WidgetState {
    id: number;
    type: string;
    name: string;
    providerStates: ProviderState[];
}

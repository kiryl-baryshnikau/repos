export class FacilityFilterConfiguration {
    facilityMappings: FacilityMapping[];
    facilityFilters: FacilityFilter[];
}

export class FacilityFilter {
    facilityId: string;
    units: UnitFilter[];
}

export class UnitFilter {
    unitId: string;
    patients: PatientFilter[];
}

export class PatientFilter {
    patientId: string;
    patientName: string;
}

export class FacilityMapping {
    native: string;
    masterId: string;
    masterName: string;
}

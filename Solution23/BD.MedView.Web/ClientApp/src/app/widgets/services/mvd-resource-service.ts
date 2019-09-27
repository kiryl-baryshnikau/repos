import { Injectable } from '@angular/core';

@Injectable()
export class _ResourceService_ {
    private resources: { app: {}, common: {} } = {
        app: {
            patientId: 'Patient ID',
            patientName: 'Patient Name',
            unitRoom: 'Unit/Room',
            infusionName: 'Infusion Name',
            drugAmountDiluentVolume: 'Drug Amt/Diluent Vol',
            dose: 'Dose',
            rate: 'Rate',
            startDateTime: 'Start Date/Time',
            estimatedTimeTillEmpty: 'Time Until Empty (est.)',
            estimatedVolumeRemaining: 'Volume Remaining (est.)',
            infusionStatus: 'Infusion Status',
            infusionType: 'Infusion Type',
            replenishmentStatus: 'Replenishment Status',
            guardrailStatus: 'Guardrail Status',
            lastUpdate: 'Last Update',
            facility: 'Facility',
            highPriority: 'High Priority',
            cumulativeVolumeInfused: 'Cumulative Volume Infused',
            vtbi: 'VTBI',
            clinicianID: 'Clinician ID',
            notApplicable: 'N/A',
            unknown: 'Unknown',
            completed: '-0-',
            status1200: 'Completed',
            status1201: 'Disconnected',
            status1202: 'Infusing',
            status1203: 'Stopped',
            status1204: 'End',
            status1205: 'Created',
            guardrailStatusNormal: 'Normal',
            mlAbbreviation: 'mL',
            showHideColumns: 'Show / Hide Columns',
            filterAllColumns: 'Filter All Columns',
            abbreviationDays: 'd',
            abbreviationHours: 'h',
            abbreviationMinutes: 'm',
            dateFormat: 'MMM DD, Y',
            timeFormat: 'HH:mm'
        },
        common: {
        }
    };

    setResources(resources: any): void {
        this.resources = resources;
    }

    resource(id: string = '???'): string {
        return this.resources.app[id] || this.resources.common[id] || '##' + id + '##';
    }
}

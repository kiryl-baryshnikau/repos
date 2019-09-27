import { Injectable } from '@angular/core';
import * as model from 'bd-nav/models';

@Injectable()
export class SiteSelectionService {
    getFacilityList():model.Facility[] {
        return [
            { "id": 1, "name": "Facility1", "idnId": 1 },
            { "id": 2, "name": "Facility2", "idnId": 2 },
            { "id": 3, "name": "Facility3", "idnId": 3 }
        ];
    }

    getIdnList(): model.Idn[] {
        return [
            { "id": 1, "name": "IDN1" },
            { "id": 2, "name": "IDN2" },
            { "id": 3, "name": "IDN3" },
            { "id": 4, "name": "IDN4" }
        ];
    }
}

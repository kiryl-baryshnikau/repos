import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { AppState } from '..';
import { Store } from '@ngrx/store';
import { MvdMedMinedDataService } from '../../services/mvd-medmined-data.service';


@Injectable()
export class ClinicalDashboardEffects {

    constructor(private actions$: Actions,
        private store: Store<AppState>,
        private dataService: MvdMedMinedDataService
    ) {
        
    }
}

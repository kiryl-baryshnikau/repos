import { ActionReducer, ActionReducerMap, MetaReducer,  } from "@ngrx/store";
import { environment } from "../../../environments/environment.prod";
import { storeFreeze } from 'ngrx-store-freeze'
import { clinicalDashboardReducer } from "./clinical-dashboard/clinical-dashboard.reducers";

export interface AppState {

}

export const reducers: ActionReducerMap<AppState> = {
    clinicalDashboard: clinicalDashboardReducer
}

export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [storeFreeze] : []; 

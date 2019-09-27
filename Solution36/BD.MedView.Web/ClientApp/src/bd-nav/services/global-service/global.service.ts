import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import * as model from '../../models';

@Injectable()
export class GlobalService {
    // Observables
    private configurationSetting$: ReplaySubject<model.Configuration> = new ReplaySubject(1);
    private userInfoViewModel$: ReplaySubject<model.UserInfoViewModel> = new ReplaySubject(1);
    private bdShellLoaded$: ReplaySubject<boolean> = new ReplaySubject(1);
    private dependentServices: model.BdShellServices[] = [];
    private dependentServicesExecuted: model.BdShellServices[] = [];

    // Configuration
    getConfiguration(): Observable<model.Configuration> {
        return this.configurationSetting$;
    }
    setConfiguration(configuration: model.Configuration) {
        this.configurationSetting$.next(configuration);
    }

    // UserInfoViewModel
    getUserInfoViewModel(): Observable<model.UserInfoViewModel> {
        return this.userInfoViewModel$;
    }
    setUserInfoViewModel(userInfo: model.UserInfoViewModel) {
        this.userInfoViewModel$.next(userInfo);
    }

    // BDShell loaded subscriptions
    bdShellLoaded(): Observable<boolean> {
        // consuming application will call this method
        return this.bdShellLoaded$.asObservable();
    }

    bdShellDependentServices(dependentServices: model.BdShellServices[]) {
        // consuming application will call this method
        this.dependentServices = dependentServices;

        if (this.dependentServices.indexOf(model.BdShellServices.ApplicationConfigService) < 0) {
            this.dependentServices.push(model.BdShellServices.ApplicationConfigService);
        }
    }

    bdshellServiceExecuted(dependentService: model.BdShellServices) {
        // this method will be called inside BDShell services only
        if (this.dependentServicesExecuted.indexOf(dependentService) < 0) {
            if (this.dependentServices.indexOf(dependentService) > -1) {
                this.dependentServicesExecuted.push(dependentService);
                this.bdShellLoaded$.next(this.dependentServices.length == this.dependentServicesExecuted.length);
            }
        }
    }
}

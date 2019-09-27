import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response, ResponseOptions } from '@angular/http';
import { Observable, ReplaySubject ,  from } from 'rxjs';
import { map, concatMap, tap, publishReplay, refCount } from 'rxjs/operators';
import { SessionStorage } from '../../components/web-storage/web-storage';
import { GlobalService } from '../global-service/global.service';
import { ShellHttpService } from '../shell-http-service/shell-http.service';
import * as model from '../../models';


@Injectable()
export class UserService {
    @SessionStorage()
    private userInfoViewModelCache: { [applicationCode: string]: model.UserInfoViewModel } = {};
    private userinfoviewmodel$: Observable<model.UserInfoViewModel>;

    constructor(private shellHttpService: ShellHttpService, private globalService: GlobalService) {
    }

    get(): Observable<model.UserInfoViewModel> {

        if (!this.userinfoviewmodel$) {
            this.userinfoviewmodel$ =
                this.globalService
                    .getConfiguration().pipe(concatMap((config) => {
                        let cachedUserInfo = this.userInfoViewModelCache[config.application];

                        if (cachedUserInfo) {
                            return from([cachedUserInfo]).pipe(
                                tap(userServiceExecuted => this.globalService.bdshellServiceExecuted(model.BdShellServices.UserInfoService))
                            );
                        }

                        return this.shellHttpService.get(config.bdShellServiceUrl + config.userInfoUrl + config.application).pipe(
                            tap(response => {
                                this.userInfoViewModelCache[config.application] = <model.UserInfoViewModel>response;
                            }),
                            tap(userServiceExecuted => this.globalService.bdshellServiceExecuted(model.BdShellServices.UserInfoService)));
                    })).pipe(
                        map(res => <model.UserInfoViewModel>res),
                        publishReplay(1),
                        refCount());
        }

        return this.userinfoviewmodel$;
    }

    clearCache() {
        this.globalService.getConfiguration().subscribe(config => {
            this.userInfoViewModelCache[config.application] = null;
            delete this.userInfoViewModelCache[config.application];
        });
    }

    private extractUserInfo(response: Response, index: number): model.UserInfoViewModel {
        return response.json();
    }
}

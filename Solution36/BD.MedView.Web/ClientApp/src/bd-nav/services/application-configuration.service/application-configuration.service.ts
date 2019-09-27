import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, from } from 'rxjs';
import { map, concatMap, publishReplay, tap, refCount } from 'rxjs/Operators';

import { Http, Response, ResponseOptions } from '@angular/http';
import { SessionStorage } from '../../components/web-storage/web-storage';
import { GlobalService } from '../global-service/global.service';
import { ShellHttpService } from '../shell-http-service/shell-http.service';
import * as model from '../../models';

@Injectable()
export class ApplicationConfigurationService {

    @SessionStorage()
    private applicationConfigurationsCache: { [applicationCode: string]: { [key: string]: string } } = {};
    private applicationConfigurationsLoaded$ = new ReplaySubject<boolean>(1);
    private applicationConfigurations: { [index: string]: string } = {};
    private applicationConfigurations$ = new ReplaySubject<{ [index: string]: string }>(1);

    constructor(private shellHttpService: ShellHttpService, private globalService: GlobalService) {
        this.globalService.getConfiguration().pipe(
            concatMap((config: any) => {
                var cachedConfigurations = this.applicationConfigurationsCache[config.application];
                if (cachedConfigurations) {
                    return from([cachedConfigurations]).pipe(
                        tap(appServiceExecuted => this.globalService.bdshellServiceExecuted(model.BdShellServices.ApplicationConfigService))
                    );
                }

                return this.shellHttpService
                    .get(config.bdShellServiceUrl + config.applicationConfigurationUrl + config.application).pipe(
                        tap(response => {
                            this.applicationConfigurationsCache[config.application] = <{ [key: string]: string }>response;
                        }),
                        tap(appServiceExecuted => this.globalService.bdshellServiceExecuted(model.BdShellServices.ApplicationConfigService)));
            }),
            map(res => <{ [key: string]: string }>res),
            publishReplay(1),
            refCount())
            .subscribe(applicationConfigurations => {
                this.applicationConfigurations = applicationConfigurations;
                this.applicationConfigurationsLoaded$.next(true);
                this.applicationConfigurations$.next(applicationConfigurations);
            });
    }

    get(): Observable<{ [appllicationConfigurationKey: string]: string }> {
        return this.applicationConfigurations$;
    }

    modify(alterFunction: (applicationConfigurations: { [index: string]: string }) => void): void {
        this.applicationConfigurationsLoaded$.subscribe(loaded => {
            alterFunction(this.applicationConfigurations);
            this.applicationConfigurations$.next(this.applicationConfigurations);
        });
    }

    clearCache() {
        this.applicationConfigurationsCache = {};
    }

    private extractApplicationConfigurations(response: Response, index: number): { [applicationConfigurationKey: string]: string } {
        return response.json();
    }
}

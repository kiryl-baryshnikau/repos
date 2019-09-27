import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable, from } from 'rxjs';
import { map, concatMap, tap, publishReplay, refCount } from 'rxjs/Operators';

import { SessionStorage } from '../../components/web-storage/web-storage';
import { GlobalService } from '../global-service/global.service';
import { ShellHttpService } from '../shell-http-service/shell-http.service';
import * as model from '../../models';

@Injectable()
export class LocaleService {
    @SessionStorage()
    private localeKeysForResourceTypes: { [resourceTypeName: string]: { [localeKey: string]: string } } = {};
    private $bdShellUIComponentsLocaleRequest: Observable<{ [localeKey: string]: string }>;
    private $resourceTypeLocaleRequest: { [localeKey: string]: Observable<{ [localeKey: string]: string }> } = {};

    @SessionStorage()
    private shellComponentLocaleKeys: { [index: string]: string } = {};


    constructor(private shellHttpService: ShellHttpService, private globalService: GlobalService) {

    }

    getComponentsLocale(): Observable<{ [localeKey: string]: string }> {
        if (!Object.keys(this.shellComponentLocaleKeys).length) {
            if (!this.$bdShellUIComponentsLocaleRequest) {
                this.$bdShellUIComponentsLocaleRequest = this.globalService.getConfiguration().pipe(
                    concatMap((config: any) => this.shellHttpService.get(config.bdShellServiceUrl + config.localeServiceUrl + config.localeResourceTypeName)),
                    map(res => <{ [localeKey: string]: string }>res),
                    tap((componentLocales: any) => this.shellComponentLocaleKeys = componentLocales),
                    tap(BdShellElements => this.globalService.bdshellServiceExecuted(model.BdShellServices.BdShellUIElementsLocaleService)),
                    publishReplay(1),
                    refCount());
            }

            return this.$bdShellUIComponentsLocaleRequest;
        }

        return from([this.shellComponentLocaleKeys]);
    }

    get(resourceTypeName: string): Observable<{ [localeKey: string]: string }> {
        var localeKeys = this.localeKeysForResourceTypes[resourceTypeName];

        if (!localeKeys || !Object.keys(localeKeys)) {
            if (!this.$resourceTypeLocaleRequest[resourceTypeName]) {
                this.$resourceTypeLocaleRequest[resourceTypeName] = this.globalService.getConfiguration().pipe(
                    concatMap((config: any) => this.shellHttpService.get(config.bdShellServiceUrl + config.localeServiceUrl + resourceTypeName)),
                    map(res => <{ [localeKey: string]: string }> res),
                    publishReplay(1),
                    refCount(),
                    tap((localeKeys: any) => this.localeKeysForResourceTypes[resourceTypeName] = localeKeys),
                    tap(resourceTypesExecuted => this.globalService.bdshellServiceExecuted(model.BdShellServices.BdShellResourceTypes)));
            }

            return this.$resourceTypeLocaleRequest[resourceTypeName];
        }

        return from([localeKeys]);
    }

    clearCache() {
        this.localeKeysForResourceTypes = {};
        this.shellComponentLocaleKeys = {};
    }


    private extractLocales(response: Response, index: number): { [id: string]: string } {
          return response.json();
    }
}

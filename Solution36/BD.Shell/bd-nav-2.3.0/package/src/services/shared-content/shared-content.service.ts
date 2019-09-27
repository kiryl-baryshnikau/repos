import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';
import { map, concatMap, tap, publishReplay } from 'rxjs/operators';
import { Headers, RequestOptions } from '@angular/http';
import { GlobalService } from '../global-service/global.service';
import { ShellHttpService } from '../shell-http-service/shell-http.service';
import * as model from '../../models';

@Injectable()
export class SharedContentService {
    configuration: model.Configuration;
    constructor(private globalService: GlobalService, private shellHttpService: ShellHttpService) { }

    set<T>(key: string, value: any): Observable<boolean> {

        let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
        let options = new RequestOptions({ headers: headers });
        let data = { key: key, value: JSON.stringify(value) };

        return this.globalService.getConfiguration().pipe(
            concatMap(config => {
                data["application"] = config.application;
                return this.shellHttpService.post(config.bdShellServiceUrl + config.sharedContentUrl, data)
            }),
            map(response => <boolean>response)
        );
    }

    get<T>(key: string): Observable<T> {

        return this.globalService.getConfiguration().pipe(
            concatMap((config: model.Configuration) => this.shellHttpService.get(config.bdShellServiceUrl + config.sharedContentUrl + '?key=' + key)),
            map(this.extractSharedContent));
    }

    getAll(): Observable<{ key: string, value: any }[]> {

        return this.globalService.getConfiguration().pipe(
            concatMap((config: model.Configuration) => this.shellHttpService.get(config.bdShellServiceUrl + config.sharedContentUrl)),
            map(this.extractSharedContents));
    }

    clear(): Observable<number> {
        return this.globalService.getConfiguration().pipe(
            concatMap((config:any) => this.shellHttpService.delete(config.bdShellServiceUrl + config.sharedContentUrl)),
            map(response => <number>response));
    }

    private extractSharedContents(response: Response, index: number): any[] {
        return response.json() || {};
    }

    private extractSharedContent(response: Response, index: number): any {
        var json = response.json() || {};

        try {
            json = json ? JSON.parse(json) : null;
        }
        catch (e) {
            json = null;
        }

        return json;
    }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class ResourcesService {

    private api = 'api/resources';

    constructor(private http: HttpClient) {
    }

    getResources(resourceId) {
        return this.getData(resourceId);
    }

    getResourcesFromContext(resourceId, dataServiceContext: string) {
        return this.getData(resourceId, dataServiceContext);
    }

    mapResource(resources: any, id: string = '???'): string {
        if (resources && resources.app) {
            return resources.app[id] || resources.common[id] || '##' + id + '##';
        } else {
            return '';
        }
    }

    private buildUrl(resourceId: string, dataServiceContext?: string): string {
        const context = dataServiceContext ? dataServiceContext : window['cfwDataServiceContext'];
        const uri = this.preProcessUrl(context + this.api + '/' + resourceId);
        return uri;
    }

    private extractData(res: any): Observable<any> {
        return res || {};
    }

    private handleError(error: any) {
        console.warn(error);

        return of({});
    }

    private getData(resourceId, dataServiceContext?: string): Observable<any> {
        return this.http.get(this.buildUrl(resourceId, dataServiceContext))
            .pipe(
                map((response: any) => this.extractData(response)),
                catchError(this.handleError)
            );
    }

    private preProcessUrl(url: any): string {
        url = url || '';
        return url.lastIndexOf('/') === url.length - 1 ? url : url + '/';
    }
}

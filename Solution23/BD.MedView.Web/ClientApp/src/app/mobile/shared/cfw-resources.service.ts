import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class CfwResourcesService {

    private api = 'api/resources';

    constructor(private httpClient: HttpClient) { }

    getResources$(resourceKey: string) {

        const base = window['cfwDataServiceContext'];
        const url = `${base}/${this.api}/${resourceKey}`;

        return this.httpClient.get(url);
    }
}

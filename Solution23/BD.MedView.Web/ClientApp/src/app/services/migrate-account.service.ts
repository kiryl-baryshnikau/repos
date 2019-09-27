import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class MigrateAccountService {
    private api = 'api/gateway';

    constructor(private http: HttpClient) {
    }

    processAuthorizedUserInfo() {
        const dispensingUrl = this.preProcessUrl(window['cfwDataServiceContext']) + this.api;

        //console.log(`@@@@@@ processAuthorizedUserInfo url: ${dispensingUrl}`);

        return this.http
                    .post(dispensingUrl, { api: 'AuthorizationRoot'})
					.pipe(
						map(result => result || { body: [] }),
						catchError(err => of({ body: [] } as any))
					);
    }

	private preProcessUrl(url: any): string {
        url = url || '';
        return url.lastIndexOf('/') == url.length - 1 ? url : url + '/';
    }
}

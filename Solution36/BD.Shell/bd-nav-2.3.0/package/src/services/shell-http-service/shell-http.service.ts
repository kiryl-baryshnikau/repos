import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthenticationService } from '../authentication/authentication.service';
import { Observable } from 'rxjs';

@Injectable()
export class ShellHttpService {

    private static headers: { [key: string]: string } = {'X-API-Version': '2'}

    constructor(private http: HttpClient, private authenticationSerivce: AuthenticationService) {
    }

    get(url: string): Observable<Object> {
        let options = this.appendHeaders();
        return this.http.get(url, options);
    }


    post(url: string, data: any): Observable<Object> {
        let options = this.appendHeaders();
        options.headers.set('Content-Type', 'application/json; charset=utf-8');
        return this.http.post(url, data, options);
    }

    delete(url: string): Observable<Object> {
        let options = this.appendHeaders();
        return this.http.delete(url, options)
    }

    appendHeaders() {
        var headersData = {};

        if (this.authenticationSerivce.accessToken && this.authenticationSerivce.accessToken.accessToken) {
            headersData['Authorization'] = `Bearer ${this.authenticationSerivce.accessToken.accessToken}`;
        }

        for (var header in ShellHttpService.headers) {
            headersData[header] = ShellHttpService.headers[header];
        }

        return { headers: new HttpHeaders(headersData) };
    }

    setHeader(key: string, value: string) {
        ShellHttpService.headers[key] = value;
    }
}

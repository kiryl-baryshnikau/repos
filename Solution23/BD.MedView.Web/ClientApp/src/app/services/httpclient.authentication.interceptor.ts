import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthenticationService } from 'bd-nav/core';
import * as model from 'bd-nav/models';

@Injectable()
export class HttpClientAuthenticationInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        //console.log(`HttpClient.Authentication.Interceptor - ${req.url}`);

        let authReq: HttpRequest<any> = req;

        let token = this.authenticationService.accessToken;

        if (token && token.accessToken) {
            //console.log("HttpClient.Authentication.Interceptor - process token");

            authReq = req.clone({
                setHeaders: {'Authorization': `Bearer ${token.accessToken}`}
            });
        }

        return next.handle(authReq);
    }
}

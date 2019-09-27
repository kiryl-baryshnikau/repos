import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { GlobalService, AuthenticationService } from 'bd-nav/core';
import * as models from 'bd-nav/models';

@Injectable()
export class AuthenticationAdapter implements models.IAuthenticationAdapter {

    private refreshTokenTimeout: any;
    private accessToken$: ReplaySubject<models.AccessToken> = new ReplaySubject(1);

    constructor(private http: HttpClient, private globalService: GlobalService, private authenticationService: AuthenticationService) {
        this.init();
    }

    // public methods
    authorize(noTokenRequired?: boolean) {

        this.globalService.getConfiguration().subscribe(configuration => {

            this.http.get(configuration.isAuthenticatedUrl + '?rnd' + new Date().getTime()).subscribe(response => {
                if (response) {
                    if (noTokenRequired) {
                        this.authenticationService.setAuthenticationStatus(true);
                    }
                    else {
                        this.requestAccessToken();
                    }
                }
                else {
                    location.href = configuration.processAuthenticationUrl;
                }
            });
        });
    }

    // private methods
    private init(): void {
        this.accessToken$.subscribe(token => {

            this.authenticationService.accessToken = token;
            this.authenticationService.setAuthenticationStatus(true);
            this.watchTokenExpiry();
        });
    }

    private requestAccessToken(): Observable<models.AccessToken> {

        this.globalService.getConfiguration().subscribe(configuration => {

            this.http.get<models.AccessToken>(configuration.accessTokenUrl).subscribe(response => {
                this.accessToken$.next(response);
            });
        });

        return this.accessToken$;
    }

    private watchTokenExpiry() {

        clearTimeout(this.refreshTokenTimeout);

        if (this.authenticationService.accessToken != null) {
            if (!this.authenticationService.accessToken.isError) {
                var refreshTokenExpiryTime = this.authenticationService.accessToken.expiresIn - new Date().getTime();

                if (refreshTokenExpiryTime <= 0) {

                    this.clearPreviousBuffers();
                    this.authorize(true);
                }
                else {
                    this.refreshTokenTimeout = setTimeout(() => { this.requestAccessToken() }, refreshTokenExpiryTime);
                }
            }
            else {
                // TODO: should redirect to identity server instead of logoutUrl
                this.globalService.getConfiguration().subscribe(configuration => location.href = configuration['logOutUrl']);
            }
        }
    }

    private clearPreviousBuffers() {
        this.authenticationService.setAuthenticationStatus(false);
        this.accessToken$.next(null);
    }
}

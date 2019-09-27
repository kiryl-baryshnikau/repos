import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import * as models from '../../models';

@Injectable()
export class AuthenticationService {

    private authorize$: ReplaySubject<boolean> = new ReplaySubject(1);
    accessToken: models.AccessToken;

    // public methods
    getAuthenticationStatus(): Observable<boolean> {
        return this.authorize$;
    }

    setAuthenticationStatus(isAuthorized: boolean) {
        this.authorize$.next(isAuthorized);
    }
}

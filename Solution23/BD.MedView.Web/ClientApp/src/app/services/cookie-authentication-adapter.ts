import { Injectable }                                           from '@angular/core';
import { AuthenticationService }                                from 'bd-nav/core';
import * as models                                              from 'bd-nav/models';

@Injectable()
export class AuthenticationAdapter implements models.IAuthenticationAdapter {

    constructor(private authenticationService: AuthenticationService) {
    }

    authorize() {
        // after forms authentication process
        this.authenticationService.setAuthenticationStatus(true);
    }
}

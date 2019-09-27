import { Injectable } from '@angular/core';

import { AuthenticationService } from 'bd-nav/core';
import { ConfigurationService } from './configuration.service';
import { User } from './user';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private _user: User = null;

    constructor(private authenticationService: AuthenticationService, private configurationService: ConfigurationService) { }

    get user(): User {
        if (!this._user) {
            const userInfo = <any>this.authenticationService.accessToken;

            if (userInfo && userInfo.loginName) {
                const hashingEnabled = this.configurationService.hashingEnabled;
                const fullName = userInfo.lastName ?
                    userInfo.lastName + (userInfo.firstName ? ', ' + userInfo.firstName : '')
                    :
                    userInfo.loginName;

                const email = userInfo.email || userInfo.loginName;

                console.log(`>>>>> UserService: hashingEnabled     ${hashingEnabled}`);
                console.log(`>>>>> UserService: userInfo.email     ${userInfo.email}`);
                console.log(`>>>>> UserService: userInfo.loginName ${userInfo.loginName}`);
                console.log(`>>>>> UserService: userInfo.lastName  ${userInfo.lastName}`);
                console.log(`>>>>> UserService: userInfo.firstName ${userInfo.firstName}`);
                console.log(`>>>>> UserService: userInfo.fullName  ${fullName}`);

                this._user = this.createUser(userInfo.loginName, fullName, email, hashingEnabled);
            }
        }
   
        return this._user || new User('1', 'Desktop Mode Client', 'desktop-mode.client@bd.com', true);
    }

    private createUser(loginName: string, fullName: string, email: string, hashingEnabled: boolean): User {
        return new User(
            hashingEnabled ? this.hash(loginName) : loginName,
            hashingEnabled ? this.hash(fullName) : fullName,
            hashingEnabled ? this.hash(email) : email,
            true);
    }

    public hash(s) {
        return (s || '').split('').reduce(function (a, b) { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
    }
}

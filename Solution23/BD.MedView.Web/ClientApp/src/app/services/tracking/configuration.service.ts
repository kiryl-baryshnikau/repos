import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ConfigurationService {
    private _trackingEnabled = (typeof (window['trackingEnabled']) == "undefined") ? true : window['trackingEnabled'];
    private _hashingEnabled = (typeof (window['hashingEnabled']) == "undefined") ? false : window['hashingEnabled'];
    private _accountId = '5';
    private _account = 'Company';
    private _applicationName = window['applicationName'] || 'HSV';
    private _applicationVersion = window['applicationVersion'] || '';
    private _localeName = window['localeName'] || '';

    get trackingEnabled() { return this._trackingEnabled; }
    get hashingEnabled() { return this._hashingEnabled; }
    get accountId() { return this._accountId; }
    get account() { return this._account; }
    get applicationName() { return this._applicationName; }
    get applicationVersion() { return this._applicationVersion; }
    get localeName() { return this._localeName; }

    constructor() {
        console.log('Tracking ConfigurationService: trackingEnabled = ' + this.trackingEnabled);
    }
}

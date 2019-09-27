import { Injectable } from "@angular/core";

@Injectable()
export class ConfigurationService {

    setUserConfiguration(value: any, columnConfigKey) {
        this.setConfiguration(columnConfigKey, value);
    }

    getConfiguration(columnConfigKey: string) {
        return this.verifySessionStorageSupport() ? JSON.parse(sessionStorage.getItem(columnConfigKey)) : null;
    }

    clearUserSettings(): any {
        if (this.verifySessionStorageSupport()) {
            sessionStorage.clear();
        }
    }

    private setConfiguration(key: any, value: any) {
        if (this.verifySessionStorageSupport()) {
            sessionStorage.setItem(key, JSON.stringify(value));
        }
    }

    private verifySessionStorageSupport(): boolean {
        return (('sessionStorage' in window) &&
            window.sessionStorage !== null &&
            typeof (Storage) !== 'undefined');
    }
}
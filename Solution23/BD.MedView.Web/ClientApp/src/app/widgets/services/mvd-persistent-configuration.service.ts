import { Injectable } from "@angular/core";

@Injectable()
export class PersistentConfigurationService {

    private persistentConfigurationKey: string = "highPriority";
    private currentUser: string;

    constructor() {

    }

    setUser(user: string) {
        this.currentUser = user;
    }

    getPersistentConfiguration() {

        let persistentConfiguration: Array<any> = JSON.parse(localStorage.getItem(this.persistentConfigurationKey)) || new Array<any>();

        let filterConfig = persistentConfiguration.filter((a: any) => a.userKey === this.currentUser);

        let userConfig: any;
        if (filterConfig.length > 0) {
            userConfig = filterConfig[0];
        }
        else {
            userConfig = {
                userKey: this.currentUser,
                highPriorityItems: [],
                isFirstTimeLoad: true
            };
        }

        return userConfig;
    }

    setPersistentConfiguration(value: any) {
        let persistentConfiguration: Array<any> = JSON.parse(localStorage.getItem(this.persistentConfigurationKey)) || new Array<any>();

        let index = persistentConfiguration.findIndex((a: any) => a.userKey === this.currentUser);
        
        if (index > -1) {
            persistentConfiguration.splice(index, 1);
        }
        persistentConfiguration.push(value);
        
        localStorage.setItem(this.persistentConfigurationKey, JSON.stringify(persistentConfiguration));
    }

    
}
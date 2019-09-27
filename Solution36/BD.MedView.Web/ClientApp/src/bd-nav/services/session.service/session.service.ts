import { Injectable } from '@angular/core';
import { Observable, fromEvent, Subscription } from 'rxjs';
import { filter, debounceTime } from 'rxjs/operators';
import { ApplicationConfigurationService } from '../application-configuration.service/application-configuration.service';
import { ShellHttpService } from '../shell-http-service/shell-http.service';

@Injectable()
export class SessionService {

    static readonly TimerEventKey: string = 'timer-event';
    static readonly SignoutEventKey: string = 'logout-event';
    private readonly storageEvents = fromEvent<StorageEvent>(window, 'storage');
    private readonly storageId = new Date().getTime().toString();
    private trashSubscriptions = new Subscription();

    constructor(private applicationConfigurationService: ApplicationConfigurationService, private shellHttpService: ShellHttpService) {
    }

    notifySignout() {
        localStorage.setItem(SessionService.SignoutEventKey, this.createEventString());
    }

    notifyActivity() {
        localStorage.setItem(SessionService.TimerEventKey, this.createEventString());
    }

    listenSignout(): Observable<StorageEvent> {
        return this.storageEvents
            .pipe(filter(event => event.key === SessionService.SignoutEventKey && this.filterEventString(event.newValue)));
    }

    listenActivity(): Observable<StorageEvent> {
        return this.storageEvents
            .pipe(filter(event => event.key === SessionService.TimerEventKey && this.filterEventString(event.newValue)))
            .pipe(debounceTime(500));
    }

    refreshSession() {
        this.trashSubscriptions.unsubscribe();
        this.trashSubscriptions =
            this.applicationConfigurationService.get()
                .subscribe(configs => this.shellHttpService.get(configs["applicationSessionResetUrl"]).subscribe());
    }

    private createEventString(): string {
        return new Date().getTime().toString() + '.' + this.storageId;
    }

    private filterEventString(eventString: string): boolean {
        return eventString.indexOf(this.storageId) < 0;
    }
}

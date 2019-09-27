import { Component, ViewChild, Input, Output, ElementRef, OnChanges, OnInit, SimpleChanges, EventEmitter, HostBinding } from '@angular/core';
import { Observable} from 'rxjs';
import { auditTime, tap } from 'rxjs/operators';
import { GlobalService } from '../../services/global-service/global.service';
import { SharedContentService } from '../../services/shared-content/shared-content.service';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import * as model from '../../models';
import { LocaleService } from '../../services/locale.service/locale.service';
import { ApplicationConfigurationService } from '../../services/application-configuration.service/application-configuration.service';
import { DomActivityService } from '../../services/dom-activity.service/dom-activity.service';
import { SessionService } from '../../services/session.service/session.service';
import { UserInfoActionService } from '../../services/user-info-action-service/user-info-action.service';
import { fail } from 'assert';

@Component({
    selector: 'auto-logout',
    templateUrl: './auto-logout.component.html',
    styleUrls: ['./auto-logout.component.scss'],
    host: { role: 'dialog', tabindex: '-1', 'class': 'bdshell--auto-logout fade modal' }
})
export class AutoLogoutComponent implements OnChanges, OnInit {
    idleState = 'Not started.';
    countdown: number;
    minutes: number;
    timedOut = false;
    hide = true;
    @Input() localeKeys: { [localeKey: string]: string } = {};
    @Input() applicationConfigurations: { [applicationConfigurationKey: string]: string } = {};
    @Output() beforeLogout = new EventEmitter<model.AutoLogoutEvent>();
    @Output() onTimeoutReset = new EventEmitter();
    @ViewChild('backdrop') private backdrop: ElementRef;

    autoLogoutSettingSubscribed = false;
    displayAutoLogoutDialogFlag = false;

    constructor
        (
        private globalService: GlobalService,
        private authenticationService: AuthenticationService,
        private sharedContentService: SharedContentService,
        private localeService: LocaleService,
        private applicationConfigurationService: ApplicationConfigurationService,
        private domActivityService: DomActivityService,
        private userInfoActionService: UserInfoActionService,
        private sessionService: SessionService,
        private elementRef: ElementRef
        ) {
        this.watchInactivityAfterAuthentication();
        this.localeService.getComponentsLocale().subscribe(locales => this.localeKeys = locales);
        this.setLocaleValues();
    }

    ngOnChanges(changes: SimpleChanges): void {
        var localeChangesObject = changes['localeKeys'];
        var applicationConfigChanges = changes['applicationConfigurations'];


        if (localeChangesObject) {
            this.setLocaleValues();
        }
        if (applicationConfigChanges) {
            this.setDefaultValuesIfEmpty();
        }
    }

    ngOnInit() {
        const bdContainer = document.getElementsByTagName('bd-nav')[0];
        bdContainer.appendChild(this.elementRef.nativeElement);
        bdContainer.appendChild(this.backdrop.nativeElement);  // TODO: Remove from body on ngDestroy() if not implicitely removed
        this.sessionService.listenActivity().subscribe(interrupt => this.onActivityFromOtherTab());
        this.sessionService.listenSignout().subscribe(signout => this.logout());
    }

    scrollingState(visible: boolean) {
        if (visible) {
            document.body.style.msOverflowStyle = "scrollbar";
            document.body.style.overflow = 'auto';
        }
        else {
            document.body.style.msOverflowStyle = "";
            document.body.style.overflow = 'hidden';
        }
    }

    setLogoutSettings() {
        if (Number(this.applicationConfigurations['autoLogoutTime'])) {
            this.domActivityService.init(+this.applicationConfigurations['autoLogoutWarningTime'], +this.applicationConfigurations['autoLogoutTime']);

            this.reset(false);
        }
    }

    reset(refresh: boolean = false) {
        this.domActivityService.reset();
        this.idleState = 'Started.';
        this.timedOut = false;
        if (refresh) {
            location.reload();
        }
    }

    hideChildModal() {
        this.displayAutoLogoutDialogFlag = false;
        this.elementRef.nativeElement.classList.remove('d-block');
        this.elementRef.nativeElement.classList.remove('show');
        this.reset();
        this.sessionService.refreshSession();
        this.onTimeoutReset.emit();
    }

    // private methods
    private watchInactivityAfterAuthentication() {
        let authenticationStatus$ = this.authenticationService.getAuthenticationStatus();
        let configuration$ = this.globalService.getConfiguration();
        let logoutUrlSet = false;

        this.domActivityService.idleStart()
            .subscribe(() => {
                this.idleState = this.localeKeys['BD-UI-AutoLogOut-LogoutWarningMessage'];
                this.displayAutoLogoutDialogFlag = true;
                this.elementRef.nativeElement.classList.add('d-block');
                this.elementRef.nativeElement.classList.add('show');
            });

        this.domActivityService.idleCountdown()
            .subscribe((countdown: any) => {
                this.countdown = countdown;
                this.minutes = Math.floor(countdown / 60);
            });

        configuration$.subscribe(configuration => {
            if (!logoutUrlSet) {
                this.domActivityService.idleEnd()
                    .subscribe(() => {
                        this.logout();
                    });

                this.domActivityService.interrupts().pipe(
                    tap(() => this.sessionService.notifyActivity()),
                    auditTime(10000)
                ).subscribe(interrupt => this.sessionService.refreshSession());
            }

            authenticationStatus$.subscribe(authenticated => {
                if (authenticated && !this.autoLogoutSettingSubscribed) {
                    this.applicationConfigurationService.get().subscribe(configs => this.setDefaultValuesIfEmpty(configs));
                    this.autoLogoutSettingSubscribed = true;
                }
                else {
                    // this.idle.stop();
                }
            });
        });
    }

    private logout() {
        this.idleState = this.localeKeys['BD-UI-AutoLogOut-TimeoutText'];
        this.timedOut = true;
        var autoLogoutEvent = <model.AutoLogoutEvent>{ logoutUrl: this.applicationConfigurations["logOutUrl"] };
        this.beforeLogout.emit(autoLogoutEvent);

        if (!autoLogoutEvent.handled) {
            this.userInfoActionService.getAction('signOut').apply({}, [<model.DrillDownItem>{ url: autoLogoutEvent.logoutUrl }]);
        }
    }

    private onActivityFromOtherTab() {
        if (this.displayAutoLogoutDialogFlag) {
            this.hideChildModal();
        }
        else {
            this.reset();
        }
    }

    private setLocaleValues() {
        this.localeKeys['BD-UI-AutoLogOut-ResetText'] = this.localeKeys['BD-UI-AutoLogOut-ResetText'] || 'Reset';
        this.localeKeys['BD-UI-AutoLogOut-Title'] = this.localeKeys['BD-UI-SiteSelection-Title'] || 'Session Timeout!';
        this.localeKeys['BD-UI-AutoLogOut-LogoutWarningMessage'] = this.localeKeys['BD-UI-AutoLogOut-LogoutWarningMessage'] || 'Your session is about to expire';
        this.localeKeys['BD-UI-AutoLogOut-TimeoutText'] = this.localeKeys['BD-UI-AutoLogOut-TimeoutText'] || 'Timed out';
    }

    private setDefaultValuesIfEmpty(applicationConfigurations?: { [applicationConfigurationKey: string]: string }) {
        if (applicationConfigurations) this.applicationConfigurations = applicationConfigurations;

        this.applicationConfigurations['autoLogoutTime'] = this.applicationConfigurations['autoLogoutTime'] || '20';
        this.applicationConfigurations['autoLogoutWarningTime'] = this.applicationConfigurations['autoLogoutWarningTime'] || '5';

        this.setLogoutSettings();
    }
}

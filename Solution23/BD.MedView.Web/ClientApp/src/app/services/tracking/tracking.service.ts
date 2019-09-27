import { Injectable } from '@angular/core';

import { User } from './user';
import { UserService } from './user.service';
import { ConfigurationService } from './configuration.service';

@Injectable({
  providedIn: 'root'
})
export class TrackingService {
  userIq: any;
  user: User;

  constructor(private userService: UserService, private configurationService: ConfigurationService) { }

  init() {
    console.log('*** TrackingService.init');
    this.userIq = window['_uiq'];
  }

  start() {
    console.log('*** TrackingService.start');

    if (!this.configurationService.trackingEnabled) {
       console.log('*** TrackingService.Start - tracking OFF');
       return;
    }

    this.user = this.userService.user;

    if (!this.user.track) {
      console.log('*** TrackingService.Start - user tracking OFF');
      return;
    }

    console.log('*** TrackingService.Start - tracking ON');

    if (this.userIq) {
      this.userIq.push([
        'identify',
        this.user.email,
        {
          user_name: this.user.name,
          user_email: this.user.email,
          user_language: this.configurationService.localeName,
          account_id: this.configurationService.accountId,
          account_name: this.configurationService.account,
          app_name: this.configurationService.applicationName,
          app_version: this.configurationService.applicationVersion
        }
      ]);

      this.userIq.push(['startTracker']);
    }
  }

  pause() {
    if (this.userIq) {
      this.userIq.push(['setDoNotTrack', true]);
    }
  }

  resume() {
    if (this.userIq) {
      this.userIq.push(['setDoNotTrack', false]);
    }
  }

  pauseDelivery() {
    if (this.userIq) {
      this.userIq.push(['setDoNotDeliver', true]);
    }
  }

  resumeDelivery() {
    if (this.userIq) {
      this.userIq.push(['setDoNotDeliver', false]);
    }
  }
}

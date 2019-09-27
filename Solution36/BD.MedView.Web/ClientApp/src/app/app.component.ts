//import { Component } from '@angular/core';

//@Component({
//  selector: 'app-root',
//  templateUrl: './app.component.html',
//  styleUrls: ['./app.component.css']
//})
//export class AppComponent {
//  title = 'app';
//}

import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { LocalStorageService, GlobalService, TopMenuComponent, UserInfoActionService, MenuService } from '../bd-nav/core';
import * as model from '../bd-nav/models';
import { Observable, ReplaySubject, of } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [LocalStorageService]
})
export class AppComponent implements OnInit {
  private resourceId = 'MedViewCore'; // Use configuration resources to store app
  private resource$: ReplaySubject<object> = new ReplaySubject(1);

  activeTopMenu: model.MenuItem = <model.MenuItem>{};
  SubMenuItems: model.SubMenuItem[];
  autoLogoutEnabled = false;
  configIconTitle: Observable<string> = of('configIconTitle');
  aboutIconTitle: Observable<string> = of('aboutIconTitle');
  isMobile = false;

  @ViewChild(TopMenuComponent) topMenuComponent: TopMenuComponent;

  constructor(
    private router: Router,
    private globalService: GlobalService,
    private menuService: MenuService,
    private userInfoActionService: UserInfoActionService
  ) {
    router.events.subscribe(e => {
      if (this.topMenuComponent) {
        this.topMenuComponent.activeTopMenu = <model.MenuItem>{};
        this.topMenuComponent.highlightedTopMenu = <model.MenuItem>{};
      }
    });
  }

  ngOnInit() {
    this.globalService.bdShellLoaded().subscribe(
      config => {
        this.autoLogoutEnabled = false;
      }
    );
  }

  beforeLogout(event: any) {
    event.handled = true;
  }

  onConfigureIconClick() {
    this.router.navigate(['/Configuration']);
  }
}

import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { MenuService, GlobalService } from 'bd-nav/core';


@Component({
    selector: 'mvd-config-icon',
    templateUrl: './config-icon.component.html',
    styleUrls: ['./config-icon.component.scss']
})
export class ConfigIconComponent {
    @Input()
    configIconTitle: Observable<string>;

    constructor(private router: Router,
        private globalService: GlobalService,
        private menuService: MenuService) {
    }

    onConfigureIconClick() {
        this.globalService.getConfiguration().subscribe(config => {
            this.menuService.allActiveTopMenu[config.application] = undefined;
            localStorage.removeItem("/allActiveTopMenu");
            this.router.navigate(['/Configuration']);
        });
    }
}

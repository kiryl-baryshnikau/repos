import { Component }                            from '@angular/core';
import { MenuService } from 'bd-nav/core';
@Component({
    template: `<div>
                    <h3>Page not found</h3>
                    <hr />
                    <h4>{{title}}</h4>
                </div>`
})
export class PageNotFoundComponent {

    title: string;

    constructor(menuService: MenuService) {
        menuService.getActiveMenu().subscribe(menu => this.title = menu.displayName);
    }
}

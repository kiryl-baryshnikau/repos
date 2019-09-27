import { Component, OnInit, Input }             from '@angular/core';
import * as models                              from '../../models';
import { MenuService }                          from '../../services/menu-service/menu.service';
import { MenuState }                            from '../../enums/menu-state.enum';

@Component({
    selector: '[sidebar-nested-menu]',
    templateUrl: './sidebar-nested-menu.component.html',
    styleUrls: ['./sidebar-nested-menu.component.scss']
})
export class SidebarNestedMenuComponent implements OnInit {
    constructor(private menuService: MenuService) {
    }

    ngOnInit(): void {
        this.menuService.getHighlightedSideMenu()
            .subscribe(activeSideMenu => this.highlightedSideMenu = activeSideMenu);
    }

    @Input() configuration: models.SideMenuItem;
    @Input() highlightedSideMenu: models.SideMenuItem;

    updateSelectedItem(item: models.SideMenuItem) {
        if (item.isDisabled || item.state == MenuState.Disable || item.state == MenuState.Hidden) return;
        this.menuService.setActiveSideMenu(item);
    }
}

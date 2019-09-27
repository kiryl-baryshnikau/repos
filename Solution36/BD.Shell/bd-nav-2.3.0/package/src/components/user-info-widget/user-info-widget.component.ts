import { Component, Input, Output, OnInit } from '@angular/core'
import { GlobalService } from '../../services/global-service/global.service';
import { UserInfoActionService } from '../../services/user-info-action-service/user-info-action.service';
import * as model from '../../models';

@Component({
    selector: 'user-info-widget',
    templateUrl: './user-info-widget.component.html',
    styleUrls: ['./user-info-widget.component.scss'],
    host: { "class": "separator-left" }
})
export class UserInfoWidgetComponent {
    user: model.UserInfoViewModel = <model.UserInfoViewModel>{
        userInfo: <model.UserInfo>{}
    };

    dropdownOpen: boolean;
    toggle: boolean = false;

    constructor(private globalService: GlobalService, private userInfoActionService: UserInfoActionService) {
        this.globalService.getUserInfoViewModel().subscribe(userInfo => {
            this.user = userInfo;
        });
    }
    onToggle() {
        return this.toggle = !this.toggle;
    }
    
    onDrilldownItemClick(item: model.DrillDownItem) {
        if (item.action) {
            let action = this.userInfoActionService.getAction(item.action);
            action(item);
        }
        else if (item.url) {
            window.location.href = item.url;
        }
    }
}

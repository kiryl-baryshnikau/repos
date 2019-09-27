import { Injectable } from '@angular/core';
import * as model from '../../models';
import { SharedContentService } from '../shared-content/shared-content.service';
import { catchError } from 'rxjs/operators';
import { SessionService } from '../session.service/session.service';
import { of } from 'rxjs';


@Injectable()
export class UserInfoActionService {
    // Private fields
    private static instance: UserInfoActionService;
    private actions: { [key: string]: (drilldownItem: model.DrillDownItem) => void } = {};
    private signOutDone: boolean;

    private static readonly DECORATORS = {
        // NOTE: Decorators are used, so that the required functionality could not be overriden by consuming applicaiton while using method setAction()
        'signOut': function (drilldownItem: model.DrillDownItem) {
            var $this = UserInfoActionService.instance;
            if (!$this.signOutDone) {
                sessionStorage.clear();
                $this.signOutDone = true;
                $this.signoutService.notifySignout();
                $this.sharedContentService.clear()
                    .pipe(catchError(err => of(0)))
                    .subscribe(response => $this.actions['signOut'].apply($this, [drilldownItem]));
            }
        }
    };

    // Constructor
    constructor(private sharedContentService: SharedContentService, private signoutService: SessionService) {
        UserInfoActionService.instance = this;
        this.actions['signOut'] = function (drilldownItem: model.DrillDownItem) {
            location.href = drilldownItem.url;
        }
    }

    // Public methods
    getAction(actionName: string): (drilldownItem: model.DrillDownItem) => void {
        return UserInfoActionService.DECORATORS[actionName] || this.actions[actionName];
    }

    setAction(actionName: string, action: (drilldownItem: model.DrillDownItem) => void) {
        this.actions[actionName] = action;
    }
}

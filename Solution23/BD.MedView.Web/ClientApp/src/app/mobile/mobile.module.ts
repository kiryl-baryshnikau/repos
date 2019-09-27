import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MobileRoutingModule } from './mobile-routing.module';
import { UnauthorizedMobileComponent } from './unauthorized/unauthorized-mobile.component';
import { AttentionNoticesMobileComponent } from './attention-notices/attention-notices-mobile.component';
import { AttentionNoticesDataService } from './attention-notices/attention-notices-data.service';
import { CollapseModule } from 'ngx-bootstrap/collapse';

import { NoticesListComponent } from './attention-notices/notices-list/notices-list.component';
import { NoticeDetailComponent } from './attention-notices/notice-detail/notice-detail.component';
import { CfwResourcesService } from './shared/cfw-resources.service';
import { AutoRefreshService } from './shared/auto-refresh.service';
import { DateFormatPipe } from './shared/date-format.pipe';
import { SortItemComponent } from './shared/sort-item-component/sort-item.component';
import { AttentionNoticesMobileConfiguratonService } from './attention-notices/attention-notices-configuration.service';

@NgModule({
  declarations: [
    AttentionNoticesMobileComponent,
    UnauthorizedMobileComponent,
    NoticesListComponent,
    NoticeDetailComponent,
    DateFormatPipe,
    SortItemComponent
  ],
  imports: [
    CommonModule,
    MobileRoutingModule,
    CollapseModule
  ],
  providers: [
    AttentionNoticesDataService,
    CfwResourcesService,
    AutoRefreshService,
    DateFormatPipe,
    AttentionNoticesMobileConfiguratonService
  ]
})
export class MobileModule { }

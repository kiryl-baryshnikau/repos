import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AttentionNoticesMobileComponent } from './attention-notices/attention-notices-mobile.component';
import { AuthenticationGuard } from 'bd-nav/core';
import { AuthorizationGuard } from '../services/authorization-guard';
import { UnauthorizedMobileComponent } from './unauthorized/unauthorized-mobile.component';
import { ResourcesResolverService } from './shared/resources-resolver.service';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'AttentionNotices',
        canActivate: [AuthenticationGuard, AuthorizationGuard]
    },
    {
        path: 'AttentionNotices',
        component: AttentionNoticesMobileComponent,
        canActivate: [AuthenticationGuard, AuthorizationGuard],
        resolve: { message: ResourcesResolverService }
    },
    {
        path: 'Unauthorized',
        component: UnauthorizedMobileComponent,
        canActivate: [AuthenticationGuard, AuthorizationGuard],
        resolve: { message: ResourcesResolverService }
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [ResourcesResolverService]
})
export class MobileRoutingModule { }

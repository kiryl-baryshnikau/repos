import { Component }                            from '@angular/core'

@Component({
    selector: 'topbar',
    templateUrl: './topbar.component.html',
    styleUrls: ['./topbar.component.scss'],
    host: { 'class': 'bdshell--topbar bdshell--override navbar fixed-top bg-primary py-0 pr-0' }
})
export class TopbarComponent {
}

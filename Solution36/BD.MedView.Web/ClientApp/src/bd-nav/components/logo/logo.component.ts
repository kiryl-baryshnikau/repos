import { Component, Input, ElementRef } from '@angular/core';
import { ApplicationConfigurationService } from '../../services/application-configuration.service/application-configuration.service';
import { LocaleService } from '../../services/locale.service/locale.service';
import { MenuService } from '../../services/menu-service/menu.service';

@Component({
    selector: 'logo',
    templateUrl: './logo.component.html',
    styleUrls: ['./logo.component.scss']
})
export class LogoComponent {
    @Input() tooltip: string;
    @Input() brandName: string;
    @Input() moduleName: string;
    @Input() productName: string;
    isSidebarVisible: boolean = false;

    // TODO: Remove static properties
    static tooltip: string;
    static applicationName: string;

    constructor(private localeService: LocaleService, private applicationConfigurationService: ApplicationConfigurationService, private elementRef: ElementRef, menuService: MenuService) {
        this.applicationConfigurationService.get().subscribe(applicationConfigurations => {
            let applicationLocale = applicationConfigurations['applicationLocale'];
            let applicationResourceBrandName = applicationConfigurations['brandName'];
            let applicationResourceProductName = applicationConfigurations['productName'];
            let applicationResourceModuleName = applicationConfigurations['moduleName'];

            let setDefaultValues = () => {
                this.brandName = applicationResourceBrandName;
                this.productName = applicationResourceProductName;
                this.moduleName = applicationResourceModuleName;

                this.elementRef.nativeElement.title = 'BD ' + this.getBrandName() + ' ' + this.getProductModuleName();
            };

            if (applicationLocale) {
                this.localeService.get(applicationLocale).subscribe(localeConfigurations => {
                    this.brandName = applicationResourceBrandName ? localeConfigurations[applicationResourceBrandName] || applicationResourceBrandName : null;
                    this.productName = localeConfigurations[applicationResourceProductName] || applicationResourceProductName;
                    this.moduleName = localeConfigurations[applicationResourceModuleName] || applicationResourceModuleName;
                }, e => setDefaultValues())
            }
            else {
                setDefaultValues();
            }

            menuService.getSidebarVisibility().subscribe(visibility => this.isSidebarVisible = visibility);
        });
    }


    getProductModuleName(): string {
        var retProductModuleName = "";
        if (this.productName) {
            retProductModuleName += this.productName;
        }
        if (this.moduleName) {
            retProductModuleName += ' | ' + this.moduleName;
        }
        return retProductModuleName;
    }

    getBrandName(): string {
        if (this.brandName) {
            return this.brandName;
        }
        return "";
    }
}

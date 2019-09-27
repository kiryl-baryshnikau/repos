import { Injectable } from '@angular/core';

// register logo component
export const LogoComponents: string[] = [
];

// register components to be loaded in top right
export const TopComponents: string[] = [
];

// register all the components to be loaded dynamically (including TopComponents)
export const Widgets = {
};

@Injectable()
export class MedViewComponentService {
    getComponent(widgetName: string): any {
        return Widgets[widgetName];
    };
}

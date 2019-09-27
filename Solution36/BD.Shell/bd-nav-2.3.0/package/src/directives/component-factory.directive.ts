import {
    Component,
    OnInit,
    ComponentFactoryResolver,
    ViewChild,
    Input,
    ViewContainerRef
} from '@angular/core';
import { ComponentService } from '../services/component.service/component.service';

@Component({
    selector: '[component-factory]',
    template: ''
})
export class ComponentFactoryDirective implements OnInit {
    @Input()
    componentName: string;
    @Input()
    model: any;

    constructor(
        public viewContainerRef: ViewContainerRef,
        private componentService: ComponentService,
        private readonly componentFactoryResolver: ComponentFactoryResolver) {
    }

    ngOnInit() {
        if (this.componentName && this.componentName !== '') {
            this.showComponent(this.componentName);
        }
    }

    showComponent(componentName: string): void {
        this.componentService
            .onRegistrationComplete()
            .subscribe(done => {
                const componentFactory =
                    this.componentFactoryResolver
                        .resolveComponentFactory(this.componentService.getDynamicComponent(componentName));

                this.viewContainerRef.clear();

                const componentRef = this.viewContainerRef.createComponent(componentFactory);

                // set model in the component
                if (this.model) {
                    const component = componentRef.instance as any;
                    component.model = this.model;
                }
            });
    }
}

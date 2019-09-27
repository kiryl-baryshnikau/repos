/*import {DataConfigurationService} from '../mvd-data-configuration.service';
import {ResourceService} from 'container-framework';
import {MockService} from '../../shared/mock-service';
import {PersistentConfigurationService} from '../mvd-persistent-configuration.service';
import {ConfigurationService} from '../mvd-configuration-service';

describe('Service: DataConfigurationService', () => {
    let service: DataConfigurationService;
    let resource: ResourceService;
    let persistent: PersistentConfigurationService;
    let config: ConfigurationService;

    beforeEach(() => {
        resource = new ResourceService();
        resource.setResources(new MockService().getResources());
        persistent = new PersistentConfigurationService();
        config = new ConfigurationService();
        service = new DataConfigurationService(resource, persistent, config);
        spyOn(service, 'setCurrentUser');
        spyOn(service, 'setUserConfiguration');
        spyOn(service, 'setWidgetOptions');
        spyOn(service, 'setFiltersConfiguration');
        spyOn(service, 'setFilterColumnConfiguration');
        spyOn(service, 'setHideConfiguration');
        spyOn(service, 'setGlobalFilterCriteria');
        spyOn(service, 'setHighPriorityItem');
        spyOn(service, 'verifyFirstTimeLoad');
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('Should set the current user', () => {
        service.setCurrentUser('user9');
        expect(service.setCurrentUser).not.toThrow();
    });

    it('Should get user configuration', () => {
        expect(service.getUserConfiguration()).toEqual(jasmine.any(Object));
    });

    it('Should set the user configuration', () => {
        service.setUserConfiguration({config: 'customConfig'});
        expect(service.setUserConfiguration).not.toThrow();
    });

    it('Should set the widget options', () => {
        service.setWidgetOptions({opt: 'customOpt'});
        expect(service.setWidgetOptions).not.toThrow();
    });

    it('Should set the filter configurations', () => {
        service.setFiltersConfiguration({opt: 'customOpt'});
        expect(service.setFiltersConfiguration).not.toThrow();
    });

    it('Should set the filter column configurations', () => {
        service.setFilterColumnConfiguration([], {opt: 'customOpt'});
        expect(service.setFilterColumnConfiguration).not.toThrow();
    });

    it('Should set hide configuration', () => {
        service.setHideConfiguration({opt: 'customOpt'});
        expect(service.setHideConfiguration).not.toThrow();
    });

    it('Should set the global filter criteria', () => {
        service.setGlobalFilterCriteria({opt: 'customOpt'});
        expect(service.setGlobalFilterCriteria).not.toThrow();
    });

    it('Should set the high priority item', () => {
        service.setHighPriorityItem(1, true);
        expect(service.setHighPriorityItem).not.toThrow();
    });

    it('Should verify First Time Load', () => {
        service.verifyFirstTimeLoad();
        expect(service.verifyFirstTimeLoad).not.toThrow();
    });
});*/

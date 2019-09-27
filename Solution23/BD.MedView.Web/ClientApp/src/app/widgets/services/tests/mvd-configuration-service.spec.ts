import {ConfigurationService} from '../mvd-configuration-service';

describe('Service: ConfigurationService', () => {
    let service: ConfigurationService;

    beforeEach(() => {
        service = new ConfigurationService();
    });

    it('Should be defined', () => {
        expect(service).toBeDefined();
    });

    it('Data should be null', () => {
        expect(service.getConfiguration('abc')).toBeNull();
    });

    it('Should store config data', () => {
        service.setUserConfiguration('abc', 'theKey');
        expect(service.getConfiguration('theKey')).toEqual('abc');
    });
});

import { _ResourceService_ } from './mvd-resource-service'
import { Injectable } from '@angular/core';

describe('Service: ResourceService', () => {
    let service: _ResourceService_;
    beforeEach(() => {
        service = new _ResourceService_();

    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('#resources should set resources property', () => {
        let expected = 'testResource';
        let newResources = { app: { testResource: expected}, common: {} };
        service.setResources(newResources);
        expect(service.resource('testResource')).toEqual(expected);
    });

    it('#resources should return string when not found', () => {
        let expected = "##???##";
        expect(service.resource()).toEqual(expected);
    });

    it('#resources should return same id when not found', () => {
        let expected = "##testresource##";
        expect(service.resource('testresource')).toEqual(expected);
    });
});

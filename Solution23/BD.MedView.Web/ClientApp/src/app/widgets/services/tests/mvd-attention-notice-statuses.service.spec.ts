import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { AttentionNoticeStatusesService, AttentionNoticeStatus } from '../mvd-attention-notice-statuses.service';
import { BdMedViewServicesClient } from '../../../services/bd-medview-services-client';

describe('AttentionNoticeStatusesService', () => {
    let service: AttentionNoticeStatusesService;
    let httpMock: HttpTestingController;
    let bdMedViewServicesClientSpy: jasmine.SpyObj<BdMedViewServicesClient>;

    const collectionName = 'AttentionNoticeStatuses';

    beforeEach(() => {
        bdMedViewServicesClientSpy = jasmine.createSpyObj(['staticMethodCall', 'create', 'read', 'update', 'delete']);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                AttentionNoticeStatusesService,
                { provide: BdMedViewServicesClient, useValue: bdMedViewServicesClientSpy }
            ]
        });

        service = TestBed.get(AttentionNoticeStatusesService);
        httpMock = TestBed.get(HttpTestingController);
    });

    describe('select', () => {
        it('should call bd medview services with AttentionNoticeStatuses collection name', () => {
            bdMedViewServicesClientSpy.staticMethodCall.and.returnValue(of([]));

            service.select(null, null).subscribe();

            const args = bdMedViewServicesClientSpy.staticMethodCall.calls.first().args;
            expect(args[0]).toEqual(collectionName);
        });

        it('should call bd medview services with List method', () => {
            bdMedViewServicesClientSpy.staticMethodCall.and.returnValue(of([]));

            service.select(null, null).subscribe();

            const args = bdMedViewServicesClientSpy.staticMethodCall.calls.first().args;
            expect(args[1]).toEqual('List');
        });

        describe('Expand', () => {
            it('should call bd medview services with comma separated expand string when expand parameter is provided', () => {
                const expand = ['value1', 'value2'];
                bdMedViewServicesClientSpy.staticMethodCall.and.returnValue(of([]));

                service.select(expand, null).subscribe();

                const args = bdMedViewServicesClientSpy.staticMethodCall.calls.first().args;
                expect(args[2]).toBeDefined();
                expect(args[2].expand).toEqual(expand.join(','));
            });

            it('should call bd medview services without expand string when expand parameter is null', () => {
                bdMedViewServicesClientSpy.staticMethodCall.and.returnValue(of([]));

                service.select(null, null).subscribe();

                const args = bdMedViewServicesClientSpy.staticMethodCall.calls.first().args;
                expect(args[2]).toBeDefined();
                expect(args[2].expand).toBeUndefined();
            });

            it('should call bd medview services without expand string when expand parameter is empty array', () => {
                bdMedViewServicesClientSpy.staticMethodCall.and.returnValue(of([]));

                service.select([], null).subscribe();

                const args = bdMedViewServicesClientSpy.staticMethodCall.calls.first().args;
                expect(args[2]).toBeDefined();
                expect(args[2].expand).toBeUndefined();
            });
        });

        describe('Filter', () => {

            it('should call bd medview services with comma separated filter string when filter parameter is provided', () => {
                const filter = ['filter1', 'filter2'];
                bdMedViewServicesClientSpy.staticMethodCall.and.returnValue(of([]));

                service.select(null, filter).subscribe();

                const args = bdMedViewServicesClientSpy.staticMethodCall.calls.first().args;
                expect(args[2]).toBeDefined();
                expect(args[2].filter).toEqual(filter.join(','));
            });

            it('should call bd medview services without filter string when filter parameter is null', () => {
                bdMedViewServicesClientSpy.staticMethodCall.and.returnValue(of([]));

                service.select(null, null).subscribe();

                const args = bdMedViewServicesClientSpy.staticMethodCall.calls.first().args;
                expect(args[2]).toBeDefined();
                expect(args[2].filter).toBeUndefined();
            });

            it('should call bd medview services without filter string when filter parameter is empty array', () => {
                bdMedViewServicesClientSpy.staticMethodCall.and.returnValue(of([]));

                service.select(null, []).subscribe();

                const args = bdMedViewServicesClientSpy.staticMethodCall.calls.first().args;
                expect(args[2]).toBeDefined();
                expect(args[2].filter).toBeUndefined();
            });
        });
    });

    describe('create', () => {
        it('should call create method on BDMedViewServices', () => {
            const status = { id: 0,
                key: 'testKey',
                facilityId: 100,
                status: 'testStatus'
            } as AttentionNoticeStatus;

            bdMedViewServicesClientSpy.create.and.returnValue(of([]));

            service.create(status).subscribe();

            expect(bdMedViewServicesClientSpy.create.calls.count()).toEqual(1);
        });

        it('should pass Attention Notice collection name to BDMedViewServices', () => {
            const status = { id: 0,
                key: 'testKey',
                facilityId: 100,
                status: 'testStatus'
            } as AttentionNoticeStatus;

            bdMedViewServicesClientSpy.create.and.returnValue(of([]));

            service.create(status).subscribe();

            const args = bdMedViewServicesClientSpy.create.calls.first().args;
            expect(args[0]).toBeDefined();
            expect(args[0]).toEqual(collectionName);
        });

        it('should pass Attention Notice Status as a parameter to BDMedViewServices', () => {
            const status = { id: 0,
                key: 'testKey',
                facilityId: 100,
                status: 'testStatus'
            } as AttentionNoticeStatus;

            bdMedViewServicesClientSpy.create.and.returnValue(of([]));

            service.create(status).subscribe();

            const args = bdMedViewServicesClientSpy.create.calls.first().args;
            expect(args[1]).toBeDefined();
            expect(args[1]).toEqual(status);
        });
    });

    describe('read', () => {
        it('should call read method on BDMedViewServices', () => {
            bdMedViewServicesClientSpy.read.and.returnValue(of([]));

            service.read(0).subscribe();

            expect(bdMedViewServicesClientSpy.read.calls.count()).toEqual(1);
        });

        it('should call read method on BDMedViewServices with the appropiate Attention Notices collection name', () => {
            bdMedViewServicesClientSpy.read.and.returnValue(of([]));

            service.read(0).subscribe();

            const args = bdMedViewServicesClientSpy.read.calls.first().args;
            expect(args[0]).toBeDefined();
            expect(args[0]).toEqual(collectionName);
        });

        it('should accept id parameter as number', () => {
            const id = 100;
            bdMedViewServicesClientSpy.read.and.returnValue(of([]));

            service.read(id).subscribe();

            const args = bdMedViewServicesClientSpy.read.calls.first().args;
            expect(args[1]).toBeDefined();
            expect(args[1]).toBe(id);
        });

        it('should accept id parameter as string', () => {
            const id = '100';
            bdMedViewServicesClientSpy.read.and.returnValue(of([]));

            service.read(id).subscribe();

            const args = bdMedViewServicesClientSpy.read.calls.first().args;
            expect(args[1]).toBeDefined();
            expect(args[1]).toBe(id);
        });
    });

    describe('update', () => {
        const updatedStatus = { id: 0,
            key: 'testKey',
            facilityId: 100,
            status: 'testStatus'
        } as AttentionNoticeStatus;

        it('should call update method on BDMedViewServices', () => {
            bdMedViewServicesClientSpy.update.and.returnValue(of([]));

            service.update(0, updatedStatus).subscribe();

            expect(bdMedViewServicesClientSpy.update.calls.count()).toEqual(1);
        });

        it('should call update method on BDMedViewServices with the appropiate Attention Notices collection name', () => {
            bdMedViewServicesClientSpy.update.and.returnValue(of([]));

            service.update(0, updatedStatus).subscribe();

            const args = bdMedViewServicesClientSpy.update.calls.first().args;
            expect(args[0]).toBeDefined();
            expect(args[0]).toEqual(collectionName);
        });

        it('should accept id parameter as number', () => {
            const id = 100;
            bdMedViewServicesClientSpy.update.and.returnValue(of([]));

            service.update(id, updatedStatus).subscribe();

            const args = bdMedViewServicesClientSpy.update.calls.first().args;
            expect(args[1]).toBeDefined();
            expect(args[1]).toBe(id);
        });

        it('should accept id parameter as string', () => {
            const id = '100';
            bdMedViewServicesClientSpy.update.and.returnValue(of([]));

            service.update(id, updatedStatus).subscribe();

            const args = bdMedViewServicesClientSpy.update.calls.first().args;
            expect(args[1]).toBeDefined();
            expect(args[1]).toBe(id);
        });

        it('should call BDMedviewServices with the updated attention notices status', () => {
            const id = '100';
            bdMedViewServicesClientSpy.update.and.returnValue(of([]));

            service.update(id, updatedStatus).subscribe();

            const args = bdMedViewServicesClientSpy.update.calls.first().args;
            expect(args[2]).toBeDefined();
            expect(args[2]).toBe(updatedStatus);
        });
    });

    describe('delete', () => {
        it('should call bd medview services with AttentionNoticeStatuses collection name', () => {
            bdMedViewServicesClientSpy.delete.and.returnValue(of([]));

            service.delete(0).subscribe();

            const args = bdMedViewServicesClientSpy.delete.calls.first().args;
            expect(args[0]).toEqual(collectionName);
        });

        it('should accept id parameter as number', () => {
            const id = 100;
            bdMedViewServicesClientSpy.delete.and.returnValue(of([]));

            service.delete(id).subscribe();

            const args = bdMedViewServicesClientSpy.delete.calls.first().args;
            expect(args[1]).toBeDefined();
            expect(args[1]).toBe(id);
        });

        it('should accept id parameter as string', () => {
            const id = '100';
            bdMedViewServicesClientSpy.delete.and.returnValue(of([]));

            service.delete(id).subscribe();

            const args = bdMedViewServicesClientSpy.delete.calls.first().args;
            expect(args[1]).toBeDefined();
            expect(args[1]).toBe(id);
        });
    });
});

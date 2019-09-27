import {SortingPipe} from './mvd-sorting.pipe';
import {SortingService} from '../services/mvd-sorting-service';
import { TestBed } from '@angular/core/testing';

describe('Pipe: SortingPipe', () => {

    let sortingServiceSpy: jasmine.SpyObj<SortingService>;
    let pipe: SortingPipe;

    const resources = {
        app: {
            completed: 'completed',
            unknown: 'unknown',
            notApplicable: 'notApplicable'
        },
        common: {

        }
    };

    beforeEach(() => {
        const _sortingService = jasmine.createSpyObj(['sortData']);
        TestBed.configureTestingModule({
            providers: [
                SortingPipe,
                { provide: SortingService, useValue: _sortingService },
            ]
        });

        pipe = TestBed.get(SortingPipe);
        sortingServiceSpy = TestBed.get(SortingService);
    }),
    it('should be defined', () =>  {
        expect(pipe).toBeDefined();
    });

    describe('transform', () => {
        it('should return null when data is null', () => {
            const res = pipe.transform(null, {}, 0, '');
            expect(res).toBeNull();
        });

        it('should call SortingService.sortData() method', () => {
            sortingServiceSpy.sortData.and.callFake((field, order, sortingMehtod, data) => []);
            pipe.transform([], '', 0, '');
            expect(sortingServiceSpy.sortData).toHaveBeenCalledTimes(1);
        });
    });
});

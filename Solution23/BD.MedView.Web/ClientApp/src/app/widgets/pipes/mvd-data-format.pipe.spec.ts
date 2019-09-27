import { DecimalPipe, DatePipe } from '@angular/common';

import { ResourceService } from 'container-framework';

import { DataFormatPipe } from '../pipes/mvd-data-format.pipe';
import { MockService } from '../shared/mock-service';

describe('Pipe: DataFormatPipe ', () => {

    let resourceService: ResourceService;
    let datePipe: DatePipe;
    let decimalPipe: DecimalPipe;
    let dataFormatPipe: DataFormatPipe;

    beforeEach(() => {
        resourceService = new ResourceService();
        resourceService.setResources(new MockService().getResources());
        datePipe = new DatePipe('en-US');
        decimalPipe = new DecimalPipe('en-US');
        dataFormatPipe = new DataFormatPipe(datePipe, decimalPipe, resourceService);
    });

    it('should be defined', () => {
        expect(dataFormatPipe).toBeDefined();
    });

    describe('#transform to numeric format', () => {

        testCase([10, -5, 0], (value: any) => {
            it('should be defined passing valid value ', () => {
                expect(dataFormatPipe.transform(value, 'number')).toBeDefined();
            });

            it('should return numeric numbers passing valid value ', () => {
                const result = dataFormatPipe.transform(value, 'number');
                expect(parseFloat(result)).toEqual(jasmine.any(Number));
            });

            it('should not add decimals to passed value ', () => {
                const result = dataFormatPipe.transform(value, 'number');
                expect(result.indexOf('.')).toEqual(-1);
            });
        });
    });

    describe('#transform to decimal format with defined arguments', () => {

        testCase([0.155, 343.0033343, 1132434.3333, .003], (value: any) => {
            it('should be defined passing valid value ', () => {
                expect(dataFormatPipe.transform(value, 'decimal:1.1-2')).toBeDefined();
            });

            it('should return decimal numbers passing valid value ', () => {
                const result = dataFormatPipe.transform(value, 'decimal:1.1-2');
                expect(parseFloat(result)).toEqual(jasmine.any(Number));
            });

            it('should format value with decimal arguments', () => {
                const minIntegersExpected = 2;
                const minDecimalsExpected = 1;
                const maxIntegersExpected = 2;

                const result = dataFormatPipe
                    .transform(value, `decimal:${minIntegersExpected}.${minDecimalsExpected}-${maxIntegersExpected}`);

                const decimalIndex = result.indexOf('.');
                const decimalsCount = result.substr(decimalIndex + 1, result.length).length;
                const integersCount = result.substring(0, decimalIndex).length;

                expect(decimalIndex).toBeGreaterThan(-1);
                expect(decimalsCount >= minDecimalsExpected).toBeTruthy();
                expect(decimalsCount <= maxIntegersExpected).toBeTruthy();
                expect(integersCount >= minIntegersExpected).toBeTruthy();
            });
        });
    });

    describe('#transform to text format', () => {

        testCase(['MVD', 'InfusionViewer', 'Widget Status'], (value: any) => {
            it('should be defined passing valid values ', () => {
                expect(dataFormatPipe.transform(value, 'text')).toBeDefined();
            });

            it('should return same passed value', () => {
                expect(dataFormatPipe.transform(value, 'text')).toEqual(jasmine.any(String));
                expect(dataFormatPipe.transform(value, 'text')).toEqual(value);
            });
        });
    });

    describe('#transform to date format', () => {
        describe('when passing valid values', () => {
            testCase(['2015-01-30T00:05:23.837', '2017-03-22T23:25:58', '9999-12-31T23:59:59.9999999'], (value: any) => {
                it('should be defined', () => {
                    expect(dataFormatPipe.transform(value, 'date')).toBeDefined();
                });

                it('should return valid date from passed value', () => {
                    const result = dataFormatPipe.transform(value, 'date');
                    const date = new Date(result);
                    expect(date).toEqual(jasmine.any(Date));
                });

                testCase(['medium', 'short', 'fullDate'], (format: any) => {
                    it('should return valid date from passed value with  defined argument format', () => {
                        const result = dataFormatPipe.transform(value, format);
                        const date = new Date(result);
                        expect(date).toEqual(jasmine.any(Date));
                    });
                });

            });
        });

    });

    describe('#transform time until empty', () => {
        const negative = -79880;
        const mins20 = 20 * 60 * 1000;
        const hour1 = 60 * 60 * 1000;
        const hour120min = 80 * 60 * 1000;
        const lessthan1min = 30 * 1000;
        it('should return same value', () => {
            const result = dataFormatPipe.transform('Unknown', 'time');
            expect(result).toEqual('Unknown');
        });
        it('should return 0 min', () => {
            const result = dataFormatPipe.transform(negative, 'time');
            expect(result).toEqual(`0 ${resourceService.resource('abbreviationMinutes')}`);
        });
        it('should return only mins, no hours', () => {
            const result = dataFormatPipe.transform(mins20, 'time');
            expect(result.indexOf(resourceService.resource('abbreviationHours'))).toEqual(-1);
        });
        it('should return only hours, no mins', () => {
            const result = dataFormatPipe.transform(hour1, 'time');
            expect(result.indexOf(resourceService.resource('abbreviationMinutes'))).toEqual(-1);
        });
        it('should return mins and hours', () => {
            const result = dataFormatPipe.transform(hour120min, 'time');
            expect(
                result.indexOf(resourceService.resource('abbreviationHours')) > 0 &&
                result.indexOf(resourceService.resource('abbreviationMinutes')) > 0
            ).toBeTruthy();
        });
        it('should return 0 min', () => {
            const result = dataFormatPipe.transform(lessthan1min, 'time');
            expect(result).toEqual(`0 ${resourceService.resource('abbreviationMinutes')}`);
        });

    });

    function testCase(values: Array<any>, func: any) {
        for (let i = 0, count = values.length; i < count; i++) {
            if (Object.prototype.toString.call(values[i]) !== '[object Array]') {
                values[i] = [values[i]];
            }
            func.apply(this, values[i]);
        }
    }
});


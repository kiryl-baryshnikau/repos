import { SortingService } from './mvd-sorting-service';
import { ContextConstants, ContextService, EventBusService, GatewayService, ResourceService } from 'container-framework';
import { MockService } from '../shared/mock-service';

describe('Service: SortingService', () => {
    let sortingService: SortingService;
    let resourceService: ResourceService;

    beforeEach(() => {
        resourceService = new ResourceService();
        resourceService.setResources(new MockService().getResources());
        sortingService = new SortingService(resourceService);
    });

    it("Should be defined", () => {
        expect(sortingService).toBeDefined();
    });

    describe("#sortDataByField", () => {
        resourceService = new ResourceService();
        resourceService.setResources(new MockService().getResources());

        let expected = [
            {
                "infusionContainerKey": 342692,
                "patientName": "Doe, John",
                "patientId": "M8015S14353407",
                "startDateTime": "2017-04-11T17:38:51.64",
                "estimatedTimeTillEmpty": resourceService.resource('completed'),
                "guardrailStatus": { countGRViolations: 0, messages: [] },
                "highPriority": false
            },
            {
                "infusionContainerKey": 342782,
                "patientName": "Doe, John",
                "patientId": "M8015S14353487",
                "startDateTime": "2017-04-12T17:38:51.64",
                "estimatedTimeTillEmpty": resourceService.resource('unknown'),
                "guardrailStatus": { countGRViolations: 1, messages: ["mensaje 1"] },
                "highPriority": false
            },
            {
                "infusionContainerKey": 342785,
                "patientName": "Doe, John",
                "patientId": "M8015S14353497",
                "startDateTime": "2017-04-12T19:38:51.64",
                "estimatedTimeTillEmpty": resourceService.resource('unknown'),
                "guardrailStatus": { countGRViolations: 2, messages: ["mensaje 1", "mensaje 2"] },
                "highPriority": false
            }
        ];

        let data = shuffle(expected.map(a => a));

        describe("timeString order", () => {
            it("should be sorting as expected by field estimatedTimeTillEmpty", () => {
                sortingService.sortDataByField("estimatedTimeTillEmpty", 1, "timeString", data);
                expect(areSorted(expected, data, "infusionContainerKey")).toBeTruthy();
            });

            it("should be sorting as expected by field estimatedTimeTillEmpty and a high priority item checked", () => {
                data.push({
                    "infusionContainerKey": 342795,
                    "patientName": "Doe, John",
                    "patientId": "M8015S14353497",
                    "startDateTime": "2017-04-12T19:38:51.64",
                    "estimatedTimeTillEmpty": resourceService.resource('unknown'),
                    "guardrailStatus": { countGRViolations: 2, messages: ["mensaje 1", "mensaje 2"] },
                    "highPriority": true
                });

                expected.unshift({
                    "infusionContainerKey": 342795,
                    "patientName": "Doe, John",
                    "patientId": "M8015S14353497",
                    "startDateTime": "2017-04-12T19:38:51.64",
                    "estimatedTimeTillEmpty": resourceService.resource('unknown'),
                    "guardrailStatus": { countGRViolations: 2, messages: ["mensaje 1", "mensaje 2"] },
                    "highPriority": true
                });

                sortingService.sortDataByField("estimatedTimeTillEmpty", 1, "timeString", data);
                expect(areSorted(expected, data, "infusionContainerKey")).toBeTruthy();
            });
        });
    });

    function shuffle(array: any) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    function areSorted(arrayexpected: any, arraysorted: any, key?: string) {
        let aresorted = true;
        for (var index = 0; index < arrayexpected.length; index++) {
            let current = arrayexpected[index];
            let indexToCompare: number;
            if (key) {
                indexToCompare = arraysorted.map((col: any) => col[key]).indexOf(current[key]);
            }
            else {
                indexToCompare = arraysorted.indexOf(current);
            }
            if (index !== indexToCompare) {
                aresorted = false;
                break;
            }
        }
        return aresorted;
    }
 });
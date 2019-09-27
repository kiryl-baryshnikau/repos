import { Injectable } from "@angular/core";
import { GatewayService, ApiCall, ApiCallParam } from "container-framework";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class BdMedViewServicesClient {
    constructor(private dataService: GatewayService) {
    }

    batch(): Batch {
        return new Batch(this.dataService);
    }

    list<T>(collection: string, expand?: string, filter?: string, ordery?: string, take?: number, skip?: number): Observable<T[]> {
        return this.batch()
            .list(collection, expand, filter, ordery, take, skip)
            .execute()
            .pipe(map(results => results[0].asEntitySet<T>()));
    }

    create<T>(collection: string, value: T): Observable<T> {
        return this.batch()
            .create(collection, value)
            .execute()
            .pipe(map(results => results[0].asEntity<T>()));
    }

    read<T>(collection: string, id: number | string, expand?: string): Observable<T> {
        return this.batch()
            .read(collection, id)
            .execute()
            .pipe(map(results => results[0].asEntity<T>()));
    }

    update<T>(collection: string, id: number | string, value: T): Observable<any> {
        return this.batch()
            .update(collection, id, value)
            .execute()
            .pipe(map(results => results[0].asRaw<any>()));
    }

    delete(collection: string, id: number | string): Observable<any> {
        return this.batch()
            .delete(collection, id)
            .execute()
            .pipe(map(results => results[0].asRaw<any>()));
    }

    link(collection: string, id: number | string, entity: string, link: number | string): Observable<any> {
        return this.batch()
            .link(collection, id, entity, link)
            .execute()
            .pipe(map(results => results[0].asRaw<any>()));
    }

    unlink(collection: string, id: number | string, entity: string, link: number | string): Observable<any> {
        return this.batch()
            .unlink(collection, id, entity, link)
            .execute()
            .pipe(map(results => results[0].asRaw<any>()));
    }

    count(collection: string, filter?: string): Observable<number> {
        return this.batch()
            .count(collection, filter)
            .execute()
            .pipe(map(results => results[0].asRaw<number>()));
    }

    staticMethodCall<T>(collection: string, method: string, args: any): Observable<T> {
        return this.batch()
            .staticMethodCall(collection, method, args)
            .execute()
            .pipe(map(results => results[0].asRaw<T>()));
    }

    staticPropertyGet<T>(collection: string, property: string): Observable<T> {
        return this.batch()
            .staticPropertyGet(collection, property)
            .execute()
            .pipe(map(results => results[0].asRaw<T>()));
    }

    staticPropertySet<T>(collection: string, property: string, value: T): Observable<any>  {
        return this.batch()
            .staticPropertySet(collection, property, value)
            .execute()
            .pipe(map(results => results[0].asRaw<any>()));
    }

    instanceMethodCall<T>(collection: string, id: number | string, method: string, args: any): Observable<T> {
        return this.batch()
            .instanceMethodCall(collection, id, method, args)
            .execute()
            .pipe(map(results => results[0].asRaw<T>()));
    }

    instancePropertyGet<T>(collection: string, id: number | string, property: string): Observable<T> {
        return this.batch()
            .instancePropertyGet(collection, id, property)
            .execute()
            .pipe(map(results => results[0].asRaw<T>()));
    }

    instancePropertySet<T>(collection: string, id: number | string, property: string, value: T): Observable<any> {
        return this.batch()
            .instancePropertySet(collection, id, property, value)
            .execute()
            .pipe(map(results => results[0].asRaw<any>()));
    }

}

export class Batch {
    private apiCalls: ApiCall[] = [];

    constructor(private dataService: GatewayService) {
    }

    private createApiCall(route: string, pathParams?: Map<string, string>, queryParams?: Map<string, string>, rawData?: any): ApiCall {
        let apiCall = new ApiCall();

        //fill route name
        apiCall.api = route;

        //fill route params
        if (pathParams !== undefined) {
            apiCall.pathParams = [];
            pathParams.forEach((value: any, key: string) => {
                if (value) {
                    let apiCallParam = new ApiCallParam();
                    apiCallParam.name = key;
                    apiCallParam.value = value.toString();
                    apiCall.pathParams.push(apiCallParam);
                }
            });
        }

        //fill query params
        if (queryParams !== undefined) {
            apiCall.queryParams = [];
            queryParams.forEach((value: any, key: string) => {
                if (value) {
                    let apiCallParam = new ApiCallParam();
                    apiCallParam.name = key;
                    apiCallParam.value = value.toString();
                    apiCall.queryParams.push(apiCallParam);
                }
            });
        }

        //fill body
        if (rawData !== undefined) {
            apiCall.rawData = rawData;
        }

        return apiCall;
    }

    execute(): Observable<BatchResult[]> {
        return this.dataService
            .loadData(this.apiCalls)
            .pipe(map(results => results.map(result => new BatchResult(result))));
    }

    list(collection: string, expand?: string, filter?: string, ordery?: string, take?: number, skip?: number): Batch {
        let pathParams = new Map<string, any>([
            ['collection', collection]
        ]);
        let queryParams = new Map<string, any>([
            ['expand', expand],
            ['filter', filter],
            ['ordery', ordery],
            ['take', take],
            ['skip', skip]
        ]);
        let apiCall: ApiCall = this.createApiCall('bd.medview.services.list', pathParams, queryParams, undefined);
        this.apiCalls.push(apiCall);
        return this;
    }

    create(collection: string, value: any): Batch {
        let pathParams = new Map<string, any>([
            ['collection', collection]
        ]);
        let apiCall: ApiCall = this.createApiCall('bd.medview.services.create', pathParams, undefined, value);
        this.apiCalls.push(apiCall);
        return this;
    }

    read(collection: string, id: number | string, expand?: string): Batch {
        let pathParams = new Map<string, any>([
            ['collection', collection],
            ['id', id]
        ]);
        let queryParams = new Map<string, any>([
            ['expand', expand]
        ]);
        let apiCall: ApiCall = this.createApiCall('bd.medview.services.read', pathParams, queryParams, undefined);
        this.apiCalls.push(apiCall);
        return this;
    }

    update(collection: string, id: number | string, value: any): Batch {
        let pathParams = new Map<string, any>([
            ['collection', collection],
            ['id', id]
        ]);
        let apiCall: ApiCall = this.createApiCall('bd.medview.services.update', pathParams, undefined, value);
        this.apiCalls.push(apiCall);
        return this;
    }

    delete(collection: string, id: number | string): Batch {
        let pathParams = new Map<string, any>([
            ['collection', collection],
            ['id', id]
        ]);
        let apiCall: ApiCall = this.createApiCall('bd.medview.services.delete', pathParams, undefined, undefined);
        this.apiCalls.push(apiCall);
        return this;
    }

    link(collection: string, id: number | string, entity: string, link: number | string): Batch {
        let pathParams = new Map<string, any>([
            ['collection', collection],
            ['id', id],
            ['entity', entity],
            ['link', link]
        ]);
        let apiCall: ApiCall = this.createApiCall('bd.medview.services.link', pathParams, undefined, undefined);
        this.apiCalls.push(apiCall);
        return this;
    }

    unlink(collection: string, id: number | string, entity: string, link: number | string): Batch {
        let pathParams = new Map<string, any>([
            ['collection', collection],
            ['id', id],
            ['entity', entity],
            ['link', link]
        ]);
        let apiCall: ApiCall = this.createApiCall('bd.medview.services.unlink', pathParams, undefined, undefined);
        this.apiCalls.push(apiCall);
        return this;
    }

    count(collection: string, filter?: string): Batch {
        let pathParams = new Map<string, any>([
            ['collection', collection]
        ]);
        let queryParams = new Map<string, any>([
            ['filter', filter]
        ]);
        let apiCall: ApiCall = this.createApiCall('bd.medview.services.count', pathParams, queryParams, undefined);
        this.apiCalls.push(apiCall);
        return this;
    }

    staticMethodCall(collection: string, method: string, args: any): Batch {
        let pathParams = new Map<string, any>([
            ['collection', collection],
            ['method', method]
        ]);
        let apiCall: ApiCall = this.createApiCall('bd.medview.services.staticmethodcall', pathParams, undefined, args);
        this.apiCalls.push(apiCall);
        return this;
    }

    staticPropertyGet(collection: string, property: string): Batch {
        let pathParams = new Map<string, any>([
            ['collection', collection],
            ['property', property]
        ]);
        let apiCall: ApiCall = this.createApiCall('bd.medview.services.staticpropertyget', pathParams, undefined, undefined);
        this.apiCalls.push(apiCall);
        return this;
    }

    staticPropertySet(collection: string, property: string, value: any): Batch {
        let pathParams = new Map<string, any>([
            ['collection', collection],
            ['property', property]
        ]);
        let apiCall: ApiCall = this.createApiCall('bd.medview.services.staticpropertyset', pathParams, undefined, value);
        this.apiCalls.push(apiCall);
        return this;
    }

    instanceMethodCall(collection: string, id: number | string, method: string, args: any): Batch {
        let pathParams = new Map<string, any>([
            ['collection', collection],
            ['id', id],
            ['method', method]
        ]);
        let apiCall: ApiCall = this.createApiCall('bd.medview.services.staticmethodcall', pathParams, undefined, args);
        this.apiCalls.push(apiCall);
        return this;
    }

    instancePropertyGet(collection: string, id: number | string, property: string): Batch {
        let pathParams = new Map<string, any>([
            ['collection', collection],
            ['id', id],
            ['property', property]
        ]);
        let apiCall: ApiCall = this.createApiCall('bd.medview.services.staticpropertyget', pathParams, undefined, undefined);
        this.apiCalls.push(apiCall);
        return this;
    }

    instancePropertySet(collection: string, id: number | string, property: string, value: any): Batch {
        let pathParams = new Map<string, any>([
            ['collection', collection],
            ['id', id],
            ['property', property]
        ]);
        let apiCall: ApiCall = this.createApiCall('bd.medview.services.staticpropertyset', pathParams, undefined, value);
        this.apiCalls.push(apiCall);
        return this;
    }
}

export class BatchResult {
    constructor(private value: any) { }

    asEntitySet<T>(): T[] {
        return this.value as T[];
    }

    asEntity<T>() {
        return this.value as T;
    }

    asRaw<T>() {
        return this.value as T;
    }
}

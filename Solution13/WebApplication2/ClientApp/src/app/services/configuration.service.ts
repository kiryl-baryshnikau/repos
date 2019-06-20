import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable, ReplaySubject } from 'rxjs';

export interface Configuration {
  authorizationUrl: string;
  directoryUrl: string;
  preferenceUrl: string;
  revision: Date;
}

@Injectable()
export class ConfigurationService {

  private _loaded: boolean = false;
  private _error: any = null;
  private _value: Configuration = null;
  private _observable: ReplaySubject<Configuration> = new ReplaySubject<Configuration>(1);

  constructor(@Inject('BASE_URL') private baseUrl: string, private http: HttpClient) { }

  initialize(): Observable<Configuration> {
    this._loaded = false;
    this._error = null;
    this._value = null;

    //return this.load();
    this.refresh();
    return this.observable;
  }

  get loaded(): any {
    return this._loaded;
  }

  get error(): any {
    return this._error;
  }

  get value(): Configuration {
    return this._value;
  }

  get observable(): Observable<Configuration> {
    return this._observable;
  }

  refresh(): void {
    this.load().subscribe();
  }

  private load(): Observable<Configuration> {
    return this.http
      .get<Configuration>('api/configuration')
      .pipe(map((data: Configuration) => {
        this._value = data;
        this._loaded = true;
        this._observable.next(this._value);
        return this._value;
      }), catchError((err: any) => {
        this._error = err;
        throw err;
      }));
  }
}

import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable, ReplaySubject } from 'rxjs';
import { ConfigurationService } from './configuration.service';

export interface Authorization {
  name: string;
  authorized: boolean;
  roles: string[]
  revision: Date;
}

@Injectable()
export class AuthorizationService {

  private _loaded: boolean = false;
  private _error: any = null;
  private _value: Authorization = null;
  private _observable: ReplaySubject<Authorization> = new ReplaySubject<Authorization>(1);

  constructor(private http: HttpClient
    , private configuration: ConfigurationService
  ) {
    this.configuration.observable.subscribe(configuration => this.refresh());
  }

  initialize(): Observable<Authorization> {
    this._loaded = false;
    this._error = null;
    this._value = null;

    //return this.load();
    //this.configuration.observable.subscribe(configuration => this.refresh());
    return this.observable;
    //return this.load();
  }

  get loaded(): any {
    return this._loaded;
  }

  get error(): any {
    return this._error;
  }


  get value(): Authorization {
    return this._value;
  }

  get observable(): Observable<Authorization> {
    return this._observable;
  }

  refresh(): void {
    this.load().subscribe();
  }

  private load(): Observable<Authorization> {
    return this.http
      .get<Authorization>(this.configuration.value.authorizationUrl)
      .pipe(map((data: Authorization) => {
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

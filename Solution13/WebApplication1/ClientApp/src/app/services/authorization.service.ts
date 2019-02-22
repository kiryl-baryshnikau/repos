import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ConfigurationService } from './configuration.service';

interface Authorization {
  name: string;
  authorized: boolean;
  roles: string[]
}

@Injectable()
export class AuthorizationService implements Authorization {
  name: string;
  authorized: boolean;
  roles: string[]

  private _loaded: boolean = false;
  private _error: any = null;

  constructor(private configuration: ConfigurationService, private http: HttpClient) { }

  initialize(): Observable<Authorization> {
    this._loaded = false;
    this._error = null;

    return this.http
      .get<Authorization>(this.configuration.authorizationUrl)
      .pipe(map((data: Authorization) => {
        Object.keys(data).forEach(key => {
          this[key] = data[key];
        });
        this._loaded = true;
        return data;
      }), catchError((err: any) => {
        this._error = err;
        throw err;
      }));
  }


  get loaded(): any {
    return this._loaded;
  }

  get error(): any {
    return this._error;
  }
}

import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ConfigurationService } from './configuration.service';
import { DirectoryService } from './directory.service';
import { AuthorizationService } from './authorization.service';

export interface Preference {
  prefA: string;
  prefB: number;
  revision: Date;
}

@Injectable()
export class PreferenceService implements Preference {
  prefA: string;
  prefB: number;
  revision: Date;

  private _loaded: boolean = false;
  private _error: any = null;

  constructor(private http: HttpClient
    , private configuration: ConfigurationService
    , private authorization: AuthorizationService
    , private directory: DirectoryService
  ) { }

  initialize(): Observable<Preference> {
    this._loaded = false;
    this._error = null;

    return this.http
      .get<Preference>(this.configuration.value.preferenceUrl)
      .pipe(map((data: Preference) => {
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

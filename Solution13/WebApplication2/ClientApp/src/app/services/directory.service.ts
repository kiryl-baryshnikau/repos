import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ConfigurationService } from './configuration.service';

export interface Directory {
  dirA: string;
  dirB: number;
  revision: Date;
}

@Injectable()
export class DirectoryService implements Directory {
  dirA: string;
  dirB: number;
  revision: Date;

  private _loaded: boolean = false;
  private _error: any = null;

  constructor(private http: HttpClient
    , private configuration: ConfigurationService
  ) { }

  initialize(): Observable<Directory> {
    this._loaded = false;
    this._error = null;

    return this.http
      .get<Directory>(this.configuration.value.directoryUrl)
      .pipe(map((data: Directory) => {
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

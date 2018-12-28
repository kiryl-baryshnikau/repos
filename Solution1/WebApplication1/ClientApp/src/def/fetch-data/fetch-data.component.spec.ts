import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { FetchDataComponent } from './fetch-data.component';
import { defer, of } from 'rxjs';

// https://netbasal.com/testing-observables-in-angular-a2dbbfaf5329
// import { cold, getTestScheduler } from 'jasmine-marbles';
// const todosServiceStub = {
//   get() {
//     const todos$ = cold('--x|', { x: [{ id: 1 }] });
//     return todos$
//   }
// };


export function asyncData<T>(data: T) {
  return defer(() => Promise.resolve(data));
}

describe('FetchDataComponent', () => {
  let httpClientSpy: { get: jasmine.Spy };
  let fixture: ComponentFixture<FetchDataComponent>;
  let component: FetchDataComponent;

  beforeEach(async(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    TestBed.configureTestingModule({
      declarations: [FetchDataComponent],
      providers: [
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: 'BASE_URL', useValue: 'http://localhost/' }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    httpClientSpy.get.and.returnValue(asyncData([]));
    // httpClientSpy.get.and.returnValue(of([]));
    fixture = TestBed.createComponent(FetchDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display a title', async(() => {
    const titleText = fixture.nativeElement.querySelector('h1').textContent;
    expect(titleText).toEqual('Weather forecast');
  }));

  it('should display \'Loading...\' after created ', async(() => {
    const titleText = fixture.nativeElement.querySelector('em').textContent;
    expect(titleText).toEqual('Loading...');
  }));

  it('should call HttpClient to fetch data in constructor', async(async () => {
    expect(httpClientSpy.get.calls.count()).toBe(1, 'one call');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('em').length).toEqual(0);
    expect(component.forecasts.length).toBe(0, 'no data');
  }));

  // it('should work', () => {
  //   const todos = element.querySelectorAll('.todo');
  //   const loading = element.querySelector('.loading');
  //   expect(loading).not.toBeNull();
  //   getTestScheduler().flush(); // flush the observables
  //   fixture.detectChanges();
  //   expect(element.querySelectorAll('.todo').length).toEqual(1);
  //   expect(element.querySelectorAll('.loading').length).toEqual(0);
  // });
});

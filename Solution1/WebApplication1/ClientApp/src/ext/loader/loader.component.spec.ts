import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { LoaderComponent } from './loader.component';
import { defer } from 'rxjs';

describe('LoaderComponent', () => {
  let httpClientSpy: { get: jasmine.Spy };
  let fixture: ComponentFixture<LoaderComponent>;
  let component: LoaderComponent;

  beforeEach(async(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    TestBed.configureTestingModule({
      declarations: [LoaderComponent],
      providers: [
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: 'BASE_URL', useValue: 'http://localhost/' }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoaderComponent);
    component = fixture.componentInstance;
  });

  it('should do default init/refresh sequence', async(async () => {
    // X. Define data that will be returned in ngOnInint()
    // httpClientSpy.get.and.returnValue(defer(() => Promise.resolve([])));
    httpClientSpy.get.withArgs('http://localhost/api/SampleData/WeatherForecasts').and.returnValue(defer(() => Promise.resolve([])));
    httpClientSpy.get
      .withArgs('http://localhost/api/SampleData/WeatherForecasts2')
      .and
      .returnValue(defer(() => Promise.resolve([
        {
          dateFormatted: '1', temperatureC: 1, temperatureF: 1, summary: '1'
        }])));
    // X. Ensure that initial rendering is made and ngOnInint() is called
    fixture.detectChanges();
    // X. Check if 'Loading...' message is displayed
    let titleText = fixture.nativeElement.querySelector('em').textContent;
    expect(titleText).toEqual('Loading...');
    // X. Ensure that reload button is not dispalyed
    expect(fixture.nativeElement.querySelectorAll('button').length).toEqual(0);
    // X. Check if ngOnInint() calls httpClient
    expect(httpClientSpy.get.calls.count()).toBe(1, 'first call');
    // X. Wait untill data will be received from httpClient
    await fixture.whenStable();
    // X. Ensure that component is re-rendered
    fixture.detectChanges();
    // X. Ensure that loading message is gone
    expect(fixture.nativeElement.querySelectorAll('em').length).toEqual(0);
    // X. Check that data has empty array
    expect(component.data.length).toBe(0, 'no data');
    // X. Ensure that reload button is dispalyed
    expect(fixture.nativeElement.querySelectorAll('button').length).toEqual(1);


    // X. Define data that will be returned in onReloadClick()
    // httpClientSpy.get.and.returnValue(defer(() => Promise.resolve([])));
    httpClientSpy.get.calls.reset();

    // X. Cliclk Reload button
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    // X. Ensure that content is re-rendered
    fixture.detectChanges();
    // X. Check if 'Loading...' message is displayed
    titleText = fixture.nativeElement.querySelector('em').textContent;
    expect(titleText).toEqual('Loading...');

    // X. Check if ngOnInint() calls httpClient
    // expect(httpClientSpy.get.calls.count()).toBe(2, 'second call');
    expect(httpClientSpy.get.calls.count()).toBe(1, 'second call');

    // X. Wait untill data will be received from httpClient
    await fixture.whenStable();
    // X. Ensure that component is re-rendered
    fixture.detectChanges();
    // X. Ensure that loading message is gone
    expect(fixture.nativeElement.querySelectorAll('em').length).toEqual(0);
    // X. Check that data has empty array
    expect(component.data.length).toBe(0, 'no data');
    // X. Ensure that reload button is dispalyed
    expect(fixture.nativeElement.querySelectorAll('button').length).toEqual(1);
  }));
});

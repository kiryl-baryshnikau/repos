import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultLibComponent } from './default-lib.component';

describe('DefaultLibComponent', () => {
  let component: DefaultLibComponent;
  let fixture: ComponentFixture<DefaultLibComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DefaultLibComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

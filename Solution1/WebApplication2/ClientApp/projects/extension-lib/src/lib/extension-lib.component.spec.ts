import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtensionLibComponent } from './extension-lib.component';

describe('ExtensionLibComponent', () => {
  let component: ExtensionLibComponent;
  let fixture: ComponentFixture<ExtensionLibComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExtensionLibComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtensionLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

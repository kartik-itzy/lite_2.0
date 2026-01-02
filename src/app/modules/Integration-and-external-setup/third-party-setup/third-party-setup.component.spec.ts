import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThirdPartySetupComponent } from './third-party-setup.component';

describe('ThirdPartySetupComponent', () => {
  let component: ThirdPartySetupComponent;
  let fixture: ComponentFixture<ThirdPartySetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThirdPartySetupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThirdPartySetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

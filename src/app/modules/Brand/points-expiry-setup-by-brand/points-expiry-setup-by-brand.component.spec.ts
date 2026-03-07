import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointsExpirySetupByBrandComponent } from './points-expiry-setup-by-brand.component';

describe('PointsExpirySetupByBrandComponent', () => {
  let component: PointsExpirySetupByBrandComponent;
  let fixture: ComponentFixture<PointsExpirySetupByBrandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PointsExpirySetupByBrandComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PointsExpirySetupByBrandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CouponPlanByBrandComponent } from './coupon-plan-by-brand.component';

describe('CouponPlanByBrandComponent', () => {
  let component: CouponPlanByBrandComponent;
  let fixture: ComponentFixture<CouponPlanByBrandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CouponPlanByBrandComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CouponPlanByBrandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

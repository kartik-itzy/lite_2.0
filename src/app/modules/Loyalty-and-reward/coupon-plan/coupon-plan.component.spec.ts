import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CouponPlanComponent } from './coupon-plan.component';

describe('CouponPlanComponent', () => {
  let component: CouponPlanComponent;
  let fixture: ComponentFixture<CouponPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CouponPlanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CouponPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

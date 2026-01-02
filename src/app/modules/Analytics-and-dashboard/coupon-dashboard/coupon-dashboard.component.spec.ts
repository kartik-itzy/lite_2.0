import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CouponDashboardComponent } from './coupon-dashboard.component';

describe('CouponDashboardComponent', () => {
  let component: CouponDashboardComponent;
  let fixture: ComponentFixture<CouponDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CouponDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CouponDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

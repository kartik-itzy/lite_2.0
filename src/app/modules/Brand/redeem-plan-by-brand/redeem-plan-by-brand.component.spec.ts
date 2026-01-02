import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedeemPlanByBrandComponent } from './redeem-plan-by-brand.component';

describe('RedeemPlanByBrandComponent', () => {
  let component: RedeemPlanByBrandComponent;
  let fixture: ComponentFixture<RedeemPlanByBrandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RedeemPlanByBrandComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RedeemPlanByBrandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

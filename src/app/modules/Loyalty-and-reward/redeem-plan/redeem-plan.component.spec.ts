import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedeemPlanComponent } from './redeem-plan.component';

describe('RedeemPlanComponent', () => {
  let component: RedeemPlanComponent;
  let fixture: ComponentFixture<RedeemPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RedeemPlanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RedeemPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

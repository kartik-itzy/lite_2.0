import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoyaltyPlanComponent } from './loyalty-plan.component';

describe('LoyaltyPlanComponent', () => {
  let component: LoyaltyPlanComponent;
  let fixture: ComponentFixture<LoyaltyPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoyaltyPlanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoyaltyPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

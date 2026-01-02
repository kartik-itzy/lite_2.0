import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoyaltyPlanByBrandComponent } from './loyalty-plan-by-brand.component';

describe('LoyaltyPlanByBrandComponent', () => {
  let component: LoyaltyPlanByBrandComponent;
  let fixture: ComponentFixture<LoyaltyPlanByBrandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoyaltyPlanByBrandComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoyaltyPlanByBrandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopupPromotionByBrandDetailsComponent } from './topup-promotion-by-brand-details.component';

describe('TopupPromotionByBrandDetailsComponent', () => {
  let component: TopupPromotionByBrandDetailsComponent;
  let fixture: ComponentFixture<TopupPromotionByBrandDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopupPromotionByBrandDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopupPromotionByBrandDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

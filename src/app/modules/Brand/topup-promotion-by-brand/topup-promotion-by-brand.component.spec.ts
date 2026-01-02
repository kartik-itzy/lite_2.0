import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopupPromotionByBrandComponent } from './topup-promotion-by-brand.component';

describe('TopupPromotionByBrandComponent', () => {
  let component: TopupPromotionByBrandComponent;
  let fixture: ComponentFixture<TopupPromotionByBrandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopupPromotionByBrandComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopupPromotionByBrandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

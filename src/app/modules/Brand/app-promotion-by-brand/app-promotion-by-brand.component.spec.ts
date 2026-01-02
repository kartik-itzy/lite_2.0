import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppPromotionByBrandComponent } from './app-promotion-by-brand.component';

describe('AppPromotionByBrandComponent', () => {
  let component: AppPromotionByBrandComponent;
  let fixture: ComponentFixture<AppPromotionByBrandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppPromotionByBrandComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppPromotionByBrandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

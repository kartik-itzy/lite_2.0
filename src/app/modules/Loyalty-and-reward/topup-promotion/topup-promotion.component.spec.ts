import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopupPromotionComponent } from './topup-promotion.component';

describe('TopupPromotionComponent', () => {
  let component: TopupPromotionComponent;
  let fixture: ComponentFixture<TopupPromotionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopupPromotionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopupPromotionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

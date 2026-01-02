import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppPromotionComponent } from './app-promotion.component';

describe('AppPromotionComponent', () => {
  let component: AppPromotionComponent;
  let fixture: ComponentFixture<AppPromotionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppPromotionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppPromotionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

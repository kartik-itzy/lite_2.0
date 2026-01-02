import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandPointsComponent } from './brand-points.component';

describe('BrandPointsComponent', () => {
  let component: BrandPointsComponent;
  let fixture: ComponentFixture<BrandPointsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandPointsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrandPointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

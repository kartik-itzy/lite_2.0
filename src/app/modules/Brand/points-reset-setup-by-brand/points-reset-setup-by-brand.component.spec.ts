import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointsResetSetupByBrandComponent } from './points-reset-setup-by-brand.component';

describe('PointsResetSetupByBrandComponent', () => {
  let component: PointsResetSetupByBrandComponent;
  let fixture: ComponentFixture<PointsResetSetupByBrandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PointsResetSetupByBrandComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PointsResetSetupByBrandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

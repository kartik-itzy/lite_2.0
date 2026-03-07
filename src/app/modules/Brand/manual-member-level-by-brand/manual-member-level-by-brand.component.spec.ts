import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualMemberLevelByBrandComponent } from './manual-member-level-by-brand.component';

describe('ManualMemberLevelByBrandComponent', () => {
  let component: ManualMemberLevelByBrandComponent;
  let fixture: ComponentFixture<ManualMemberLevelByBrandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManualMemberLevelByBrandComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManualMemberLevelByBrandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

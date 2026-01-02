import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberSegmentationSetupComponent } from './member-segmentation-setup.component';

describe('MemberSegmentationSetupComponent', () => {
  let component: MemberSegmentationSetupComponent;
  let fixture: ComponentFixture<MemberSegmentationSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberSegmentationSetupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemberSegmentationSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

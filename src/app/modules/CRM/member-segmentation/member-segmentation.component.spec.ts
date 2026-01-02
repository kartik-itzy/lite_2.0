import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberSegmentationComponent } from './member-segmentation.component';

describe('MemberSegmentationComponent', () => {
  let component: MemberSegmentationComponent;
  let fixture: ComponentFixture<MemberSegmentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberSegmentationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemberSegmentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

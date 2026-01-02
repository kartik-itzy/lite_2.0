import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualMemberLevelComponent } from './manual-member-level.component';

describe('ManualMemberLevelComponent', () => {
  let component: ManualMemberLevelComponent;
  let fixture: ComponentFixture<ManualMemberLevelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManualMemberLevelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManualMemberLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

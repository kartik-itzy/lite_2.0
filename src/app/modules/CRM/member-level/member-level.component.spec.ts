import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberLevelComponent } from './member-level.component';

describe('MemberLevelComponent', () => {
  let component: MemberLevelComponent;
  let fixture: ComponentFixture<MemberLevelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberLevelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemberLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

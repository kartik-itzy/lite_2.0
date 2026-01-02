import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubMemberComponent } from './sub-member.component';

describe('SubMemberComponent', () => {
  let component: SubMemberComponent;
  let fixture: ComponentFixture<SubMemberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubMemberComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberDefaultComponent } from './member-default.component';

describe('MemberDefaultComponent', () => {
  let component: MemberDefaultComponent;
  let fixture: ComponentFixture<MemberDefaultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberDefaultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemberDefaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

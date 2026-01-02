import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberLevelByBrandComponent } from './member-level-by-brand.component';

describe('MemberLevelByBrandComponent', () => {
  let component: MemberLevelByBrandComponent;
  let fixture: ComponentFixture<MemberLevelByBrandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberLevelByBrandComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemberLevelByBrandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

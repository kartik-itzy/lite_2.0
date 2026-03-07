import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberDefaultByBrandComponent } from './member-default-by-brand.component';

describe('MemberDefaultByBrandComponent', () => {
  let component: MemberDefaultByBrandComponent;
  let fixture: ComponentFixture<MemberDefaultByBrandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberDefaultByBrandComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemberDefaultByBrandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

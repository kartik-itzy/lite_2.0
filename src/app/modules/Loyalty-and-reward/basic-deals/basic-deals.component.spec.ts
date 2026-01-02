import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicDealsComponent } from './basic-deals.component';

describe('BasicDealsComponent', () => {
  let component: BasicDealsComponent;
  let fixture: ComponentFixture<BasicDealsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicDealsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasicDealsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

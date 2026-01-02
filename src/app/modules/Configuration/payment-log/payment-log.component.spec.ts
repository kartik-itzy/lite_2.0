import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentLogComponent } from './payment-log.component';

describe('PaymentLogComponent', () => {
  let component: PaymentLogComponent;
  let fixture: ComponentFixture<PaymentLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentLogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

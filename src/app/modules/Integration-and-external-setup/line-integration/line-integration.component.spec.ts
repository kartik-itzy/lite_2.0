import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineIntegrationComponent } from './line-integration.component';

describe('LineIntegrationComponent', () => {
  let component: LineIntegrationComponent;
  let fixture: ComponentFixture<LineIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LineIntegrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LineIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

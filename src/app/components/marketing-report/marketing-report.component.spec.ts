import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketingReportComponent } from './marketing-report.component';

describe('MarketingReportComponent', () => {
  let component: MarketingReportComponent;
  let fixture: ComponentFixture<MarketingReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketingReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketingReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

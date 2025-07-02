import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesopportunitiesComponent } from './salesopportunities.component';

describe('SalesopportunitiesComponent', () => {
  let component: SalesopportunitiesComponent;
  let fixture: ComponentFixture<SalesopportunitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesopportunitiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesopportunitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

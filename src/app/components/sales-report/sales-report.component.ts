import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common'; // DatePipe and CurrencyPipe for formatting
import { FormsModule } from '@angular/forms'; // Needed for ngModel on input fields
import { RouterModule, Router } from '@angular/router'; // For header navigation and back button

import { SalesReportService, SalesReportResponseDto } from '../../services/sales-report.service';

@Component({
  selector: 'app-sales-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule, // Important for routerLink
    DatePipe,     // For formatting dates in the template
    CurrencyPipe  // For formatting currency in the template
  ],
  templateUrl: './sales-report.component.html',
  styleUrls: ['./sales-report.component.css']
})
export class SalesReportComponent implements OnInit {

  // For fetching a specific sales report (from backend's GET /api/salesreports/{opportunityId})
  // Note: This endpoint actually retrieves the external SalesOpportunityResponseDto directly,
  // which implies it's either an on-the-fly report or a saved report using that DTO.
  // We'll use this for viewing reports that are either freshly fetched or from a "saved" perspective.
  specificOpportunityIdInput: number | null = null;
  displayedReports: SalesReportResponseDto[] = []; // To display reports (either all or specific)

  // For generating and saving a new report (backend POST /api/salesreports/{opportunityId}/generate)
  opportunityIdToGenerate: number | null = null;

  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading: boolean = false;

  constructor(
    private salesReportService: SalesReportService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.resetDisplayState(); // Initialize with empty display state
    // Optionally, you might want to fetch all reports on load:
    // this.showAllSalesReports();
  }

  /**
   * Fetches a specific sales report based on the ID entered.
   * This calls the backend endpoint that retrieves a sales report by opportunityId.
   */
  fetchSpecificSalesReport(): void {
    this.clearMessages();
    this.displayedReports = []; // Clear current display before new fetch

    if (this.specificOpportunityIdInput === null || isNaN(this.specificOpportunityIdInput)) {
      this.errorMessage = 'Please enter a valid Sales Opportunity ID to fetch the report.';
      return;
    }

    this.isLoading = true;
    this.salesReportService.getSalesReportById(this.specificOpportunityIdInput).subscribe({
      next: (report: SalesReportResponseDto) => {
        this.displayedReports = [report]; // Display single report as a card
        this.successMessage = `Sales Report for Opportunity ID ${report.id} fetched successfully!`;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching specific sales report:', err);
        this.errorMessage = `Failed to load Sales Report for Opportunity ID ${this.specificOpportunityIdInput}. Details: ${err.message || 'Unknown error'}`;
        this.isLoading = false;
        this.displayedReports = []; // Clear reports on error
      }
    });
  }

  /**
   * Fetches and displays all available sales reports.
   * This calls the backend endpoint that retrieves all sales opportunities (reports).
   */
  showAllSalesReports(): void {
    this.clearMessages();
    this.specificOpportunityIdInput = null; // Clear specific ID input
    this.displayedReports = []; // Clear specific display before showing all

    this.isLoading = true;
    this.salesReportService.getAllSalesReports().subscribe({
      next: (reports: SalesReportResponseDto[]) => {
        this.displayedReports = reports; // Display all reports as cards
        this.isLoading = false;
        if (reports.length === 0) {
          this.errorMessage = 'No sales reports available. Try generating some first.';
        } else {
          this.successMessage = `Successfully loaded ${reports.length} sales reports.`;
        }
      },
      error: (err) => {
        console.error('Error fetching all sales reports:', err);
        this.errorMessage = `Failed to load all sales reports. Details: ${err.message || 'Unknown error'}`;
        this.isLoading = false;
        this.displayedReports = []; // Clear reports on error
      }
    });
  }

  /**
   * Triggers the generation and saving of a new sales report
   * based on an external sales opportunity ID.
   */
  generateNewSalesReport(): void {
    this.clearMessages();
    this.displayedReports = []; // Clear current display when generating

    if (this.opportunityIdToGenerate === null || isNaN(this.opportunityIdToGenerate)) {
      this.errorMessage = 'Please enter a valid Sales Opportunity ID to generate a report.';
      return;
    }

    this.isLoading = true;
    this.salesReportService.generateAndSaveSalesReport(this.opportunityIdToGenerate).subscribe({
      next: (report: SalesReportResponseDto) => {
        this.successMessage = `Report for Sales Opportunity ID ${report.id} generated and saved successfully!`;
        this.isLoading = false;
        // After generating, it's common to show the newly generated report or refresh all
        this.showAllSalesReports(); // Refresh the list to include the new report
        this.opportunityIdToGenerate = null; // Clear input after successful generation
      },
      error: (err) => {
        console.error('Error generating new sales report:', err);
        this.errorMessage = `Failed to generate report for Sales Opportunity ID ${this.opportunityIdToGenerate}. Details: ${err.message || 'Unknown error'}`;
        this.isLoading = false;
      }
    });
  }

  /**
   * Handles the logout action.
   */
  logout(): void {
    console.log('Logging out from Sales Reports...');
    this.router.navigate(['/login']); // Navigate to login page on logout
  }

  /**
   * Helper method to reset the displayed reports and messages.
   */
  private resetDisplayState(): void {
    this.clearMessages();
    this.specificOpportunityIdInput = null;
    this.opportunityIdToGenerate = null;
    this.displayedReports = []; // Clears all displayed cards
  }

  private clearMessages(): void {
    this.errorMessage = null;
    this.successMessage = null;
  }
}

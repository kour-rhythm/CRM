import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // DatePipe for formatting dates
import { FormsModule } from '@angular/forms'; // Needed for ngModel on input fields
import { RouterModule, Router } from '@angular/router'; // For header navigation and back button

import { MarketingReportService, MarketingReportResponseDto } from '../../services/marketing-report.service';
 
@Component({
  selector: 'app-marketing-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule, // Important for routerLink
    DatePipe // For formatting dates in the template
  ],
  templateUrl: './marketing-report.component.html',
  styleUrls: ['./marketing-report.component.css']
})
export class MarketingReportComponent implements OnInit {

  // For fetching specific saved report
  savedReportIdInput: number | null = null;
  displayedReports: MarketingReportResponseDto[] = []; // To display reports (either all saved or specific saved)

  // For generating a new report (from external campaign ID)
  campaignIdToGenerate: number | null = null;

  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading: boolean = false;

  constructor(
    private marketingReportService: MarketingReportService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.resetDisplayState(); // Initialize with empty display state
    // Optionally fetch all saved reports on component load:
    // this.showAllSavedMarketingReports();
  }

  /**
   * Fetches a specific saved marketing report based on the ID entered.
   */
  fetchSpecificSavedReport(): void {
    this.clearMessages();
    this.displayedReports = []; // Clear current display before new fetch

    if (this.savedReportIdInput === null || isNaN(this.savedReportIdInput)) {
      this.errorMessage = 'Please enter a valid Campaign ID to fetch the saved report.';
      return;
    }

    this.isLoading = true;
    this.marketingReportService.getSavedMarketingReportById(this.savedReportIdInput).subscribe({
      next: (report: MarketingReportResponseDto) => {
        this.displayedReports = [report]; // Display single report as a card
        this.successMessage = 'Saved report fetched successfully!';
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching specific saved marketing report:', err);
        this.errorMessage = `Failed to load saved marketing report with Campaign ID ${this.savedReportIdInput}. Details: ${err.message || 'Unknown error'}`;
        this.isLoading = false;
        this.displayedReports = []; // Clear reports on error
      }
    });
  }

  /**
   * Fetches and displays all available saved marketing reports.
   */
  showAllSavedMarketingReports(): void {
    this.clearMessages();
    this.savedReportIdInput = null; // Clear specific ID input
    this.displayedReports = []; // Clear specific display before showing all

    this.isLoading = true;
    this.marketingReportService.getAllSavedMarketingReports().subscribe({
      next: (reports: MarketingReportResponseDto[]) => {
        this.displayedReports = reports; // Display all reports as cards
        this.isLoading = false;
        if (reports.length === 0) {
          this.errorMessage = 'No saved marketing reports available in the database. Try generating some first.';
        } else {
          this.successMessage = `Successfully loaded ${reports.length} saved marketing reports.`;
        }
      },
      error: (err) => {
        console.error('Error fetching all saved marketing reports:', err);
        this.errorMessage = `Failed to load all saved marketing reports. Details: ${err.message || 'Unknown error'}`;
        this.isLoading = false;
        this.displayedReports = []; // Clear reports on error
      }
    });
  }

  /**
   * Triggers the generation and saving of a new marketing report
   * based on an external campaign ID.
   */
  generateNewMarketingReport(): void {
    this.clearMessages();
    this.displayedReports = []; // Clear current display when generating

    if (this.campaignIdToGenerate === null || isNaN(this.campaignIdToGenerate)) {
      this.errorMessage = 'Please enter a valid Campaign ID from the Marketing Module to generate a report.';
      return;
    }

    this.isLoading = true;
    this.marketingReportService.generateMarketingReport(this.campaignIdToGenerate).subscribe({
      next: (report: MarketingReportResponseDto) => {
        this.successMessage = `Report for Campaign ID ${report.campaignId} generated and saved successfully!`;
        this.isLoading = false;
        // Optionally, refresh all saved reports or just show the newly generated one
        this.showAllSavedMarketingReports();
        this.campaignIdToGenerate = null; // Clear input after successful generation
      },
      error: (err) => {
        console.error('Error generating new marketing report:', err);
        this.errorMessage = `Failed to generate report for Campaign ID ${this.campaignIdToGenerate}. Details: ${err.message || 'Unknown error'}`;
        this.isLoading = false;
      }
    });
  }

  /**
   * Handles the logout action.
   */
  logout(): void {
    console.log('Logging out from Marketing Reports...');
    this.router.navigate(['/login']);
  }

  /**
   * Helper method to reset the displayed reports and messages.
   */
  private resetDisplayState(): void {
    this.clearMessages();
    this.savedReportIdInput = null;
    this.campaignIdToGenerate = null;
    this.displayedReports = []; // Clears all displayed cards
  }

  private clearMessages(): void {
    this.errorMessage = null;
    this.successMessage = null;
  }
}

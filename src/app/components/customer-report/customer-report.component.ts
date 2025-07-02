import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Added DatePipe for consistency, though not used directly yet
import { FormsModule } from '@angular/forms'; // Needed for ngModel on input fields
import { RouterModule, Router } from '@angular/router'; // For header navigation and back button

import { CustomerReportDto, CustomerReportService } from '../../services/customer-report.service';

@Component({
  selector: 'app-customer-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule, // Important for routerLink
    DatePipe // For formatting dates in the template (if needed later)
  ],
  templateUrl: './customer-report.component.html',
  styleUrls: ['./customer-report.component.css']
})
export class CustomerReportComponent implements OnInit {

  customerReportIdInput: number | null = null; // For fetching specific report
  displayedReports: CustomerReportDto[] = []; // To display reports (either all or specific)

  // New property for generating a report
  customerIdToGenerate: number | null = null;

  errorMessage: string | null = null;
  successMessage: string | null = null; // For general success messages
  isLoading: boolean = false;

  constructor(
    private customerReportService: CustomerReportService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.resetDisplayState(); // Initialize with empty display state
    // Optionally fetch all reports on component load:
    // this.showAllCustomerReports();
  }

  /**
   * Helper method to check if a value is NaN.
   * This allows `isNaN` to be called safely from the template.
   * @param value The value to check.
   * @returns True if the value is NaN, false otherwise.
   */
  isNumberNaN(value: any): boolean {
    return isNaN(value);
  }

  /**
   * Fetches a specific customer report based on the ID entered in the input field.
   */
  fetchSpecificCustomerReport(): void {
    this.clearMessages();
    this.displayedReports = []; // Clear current display before new fetch

    if (this.customerReportIdInput === null || this.isNumberNaN(this.customerReportIdInput)) {
      this.errorMessage = 'Please enter a valid Customer ID.';
      return;
    }

    this.isLoading = true;
    this.customerReportService.getCustomerReportById(this.customerReportIdInput).subscribe({
      next: (report: CustomerReportDto) => {
        this.displayedReports = [report]; // Display single report as a card
        this.errorMessage = null;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching specific customer report:', err);
        this.errorMessage = `Failed to load customer report with ID ${this.customerReportIdInput}. Details: ${err.message || 'Unknown error'}`;
        this.isLoading = false;
        this.displayedReports = []; // Clear reports on error
      }
    });
  }

  /**
   * Fetches and displays all available customer reports.
   */
  showAllCustomerReports(): void {
    this.clearMessages();
    this.customerReportIdInput = null; // Clear specific ID input
    this.displayedReports = []; // Clear specific display before showing all

    this.isLoading = true;
    this.customerReportService.getAllCustomerReports().subscribe({
      next: (reports: CustomerReportDto[]) => {
        this.displayedReports = reports; // Display all reports as cards
        this.isLoading = false;
        if (reports.length === 0) {
          this.errorMessage = 'No customer reports available in the database. Try generating some first.';
        }
      },
      error: (err) => {
        console.error('Error fetching all customer reports:', err);
        this.errorMessage = `Failed to load all customer reports. Details: ${err.message || 'Unknown error'}`;
        this.isLoading = false;
        this.displayedReports = []; // Clear reports on error
      }
    });
  }

  /**
   * Triggers the generation and saving of a new customer report
   * based on an external Customer ID.
   * NOTE: You will need to ensure your CustomerReportService has a method
   * like `generateCustomerReport(customerId: number): Observable<CustomerReportDto>`
   * that calls your backend API to perform this action.
   */
  generateAndSaveCustomerReport(): void {
    this.clearMessages();
    this.displayedReports = []; // Clear current display when generating

    if (this.customerIdToGenerate === null || this.isNumberNaN(this.customerIdToGenerate)) {
      this.errorMessage = 'Please enter a valid Customer ID to generate a report.';
      return;
    }

    this.isLoading = true;
    // Assuming a service method `generateCustomerReport` exists in CustomerReportService
    this.customerReportService.generateCustomerReport(this.customerIdToGenerate).subscribe({
      next: (report: CustomerReportDto) => {
        this.successMessage = `Report for Customer ID ${report.customerId} generated and saved successfully!`;
        this.isLoading = false;
        // Optionally, refresh all saved reports or just show the newly generated one
        this.showAllCustomerReports();
        this.customerIdToGenerate = null; // Clear input after successful generation
      },
      error: (err) => {
        console.error('Error generating new customer report:', err);
        this.errorMessage = `Failed to generate report for Customer ID ${this.customerIdToGenerate}. Details: ${err.error?.message || 'Unknown error'}`;
        this.isLoading = false;
      }
    });
  }

  /**
   * Handles the logout action.
   */
  logout(): void {
    console.log('Logging out from Customer Reports...');
    this.router.navigate(['/login']);
  }

  /**
   * Helper method to reset the displayed reports and messages.
   */
  private resetDisplayState(): void {
    this.clearMessages();
    this.customerReportIdInput = null;
    this.customerIdToGenerate = null; // Clear the generate input as well
    this.displayedReports = []; // Clears all displayed cards
  }

  private clearMessages(): void {
    this.errorMessage = null;
    this.successMessage = null;
  }
}

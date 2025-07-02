import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { SalesOpportunityDto, SalesOpportunityResponseDto, SalesOpportunityService } from '../../services/salesopportunities.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sales-opportunities',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './salesopportunities.component.html',
  styleUrls: ['./salesopportunities.component.css']
})
export class SalesOpportunitiesComponent implements OnInit {
  @ViewChild('opportunityForm') opportunityForm!: NgForm;
  @ViewChild('updateOpportunityForm') updateOpportunityForm!: NgForm; // ViewChild for the update form

  opportunity: SalesOpportunityDto = {
    name: '',
    stage: 'Prospecting', // Default stage
    amount: null,
    closeDate: null,
    leadSource: '',
    notes: null
  };

  opportunityIdInput: number | null = null; // For fetching specific opportunity for display
  displayedOpportunities: SalesOpportunityResponseDto[] = []; // For displaying search results (specific or all)

  // New properties for updating sales opportunities
  opportunityIdForUpdate: number | null = null;
  opportunityToUpdate: SalesOpportunityResponseDto | null = null; // Holds the opportunity fetched for updating

  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading: boolean = false;

  // Define possible stages for the dropdown
  opportunityStages: string[] = [
    'Prospecting', 'Qualification', 'Needs Analysis', 'Value Proposition',
    'Decision Makers', 'Perception Analysis', 'Proposal/Price Quote',
    'Negotiation/Review', 'Closed Won', 'Closed Lost'
  ];

  constructor(
    private salesOpportunityService: SalesOpportunityService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.resetDisplayState(); // Clear display tables initially
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
   * Handles form submission for creating a new sales opportunity.
   */
  onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null; // Clear previous success messages

    if (this.opportunityForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      Object.keys(this.opportunityForm.controls).forEach(field => {
        const control = this.opportunityForm.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return;
    }

    this.isLoading = true;
    const opportunityToCreate = { ...this.opportunity };

    if (opportunityToCreate.amount === null) {
      opportunityToCreate.amount = 0; // Default to 0 if not provided
    }

    this.salesOpportunityService.createSalesOpportunity(opportunityToCreate).subscribe({
      next: (newOpportunity: SalesOpportunityResponseDto) => {
        this.successMessage = `Sales Opportunity '${newOpportunity.name}' (ID: ${newOpportunity.id}) added successfully!`;
        this.resetForm(); // Reset form and display states
        this.isLoading = false;
        this.showAllOpportunities(); // Refresh the displayed list
      },
      error: (err) => {
        console.error('Error creating sales opportunity:', err);
        this.errorMessage = `Failed to add sales opportunity: ${err.error?.message || 'An unexpected error occurred. Check console.'}`;
        this.isLoading = false;
      }
    });
  }

  /**
   * Fetches a specific sales opportunity based on the input ID for display.
   */
  fetchOpportunityFromInput(): void {
    this.errorMessage = null;
    this.successMessage = null;
    this.displayedOpportunities = []; // Clear current display before new fetch

    if (this.opportunityIdInput === null || this.isNumberNaN(this.opportunityIdInput)) {
      this.errorMessage = 'Please enter a valid Sales Opportunity ID.';
      return;
    }

    this.isLoading = true;
    this.salesOpportunityService.getSalesOpportunityById(this.opportunityIdInput).subscribe({
      next: (opportunity: SalesOpportunityResponseDto | null) => {
        if (opportunity) {
          this.displayedOpportunities = [opportunity]; // Display single opportunity as a card
          this.errorMessage = null;
        } else {
          this.errorMessage = `Sales Opportunity with ID ${this.opportunityIdInput} not found.`;
          this.displayedOpportunities = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching specific sales opportunity:', err);
        this.errorMessage = `Failed to load sales opportunity with ID ${this.opportunityIdInput}. Check backend/console. Details: ${err.message || 'Unknown error'}`;
        this.isLoading = false;
        this.displayedOpportunities = [];
      }
    });
  }

  /**
   * Fetches a specific sales opportunity based on the input ID and populates the update form.
   */
  fetchOpportunityForUpdate(): void {
    this.errorMessage = null;
    this.successMessage = null;
    this.opportunityToUpdate = null; // Clear previous data

    if (this.opportunityIdForUpdate === null || this.isNumberNaN(this.opportunityIdForUpdate)) {
      this.errorMessage = 'Please enter a valid Opportunity ID for update.';
      return;
    }

    this.isLoading = true;
    this.salesOpportunityService.getSalesOpportunityById(this.opportunityIdForUpdate).subscribe({
      next: (opportunity: SalesOpportunityResponseDto | null) => {
        if (opportunity) {
          this.opportunityToUpdate = opportunity;
          this.errorMessage = null;
        } else {
          this.errorMessage = `Sales Opportunity with ID ${this.opportunityIdForUpdate} not found for update.`;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching sales opportunity for update:', err);
        this.errorMessage = `Failed to load sales opportunity for update: ${err.error?.message || 'Unknown error'}`;
        this.isLoading = false;
      }
    });
  }

  /**
   * Handles form submission for updating an existing sales opportunity.
   */
  updateOpportunity(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (!this.opportunityToUpdate || this.updateOpportunityForm.invalid) {
      this.errorMessage = 'Please select an opportunity and fill in all required fields correctly for update.';
      if (this.updateOpportunityForm) {
        Object.keys(this.updateOpportunityForm.controls).forEach(field => {
          const control = this.updateOpportunityForm.controls[field];
          control.markAsTouched({ onlySelf: true });
        });
      }
      return;
    }

    this.isLoading = true;
    // Ensure ID is passed separately as it's part of the path in the update service
    const id = this.opportunityToUpdate.id;
    const opportunityPayload: SalesOpportunityDto = {
        name: this.opportunityToUpdate.name,
        stage: this.opportunityToUpdate.stage,
        amount: this.opportunityToUpdate.amount,
        closeDate: this.opportunityToUpdate.closeDate,
        leadSource: this.opportunityToUpdate.leadSource,
        notes: this.opportunityToUpdate.notes
    };

    this.salesOpportunityService.updateSalesOpportunity(id, opportunityPayload).subscribe({
      next: (updatedOpportunity: SalesOpportunityResponseDto) => {
        this.successMessage = `Sales Opportunity '${updatedOpportunity.name}' (ID: ${updatedOpportunity.id}) updated successfully!`;
        this.opportunityToUpdate = updatedOpportunity; // Update displayed data in the form
        this.isLoading = false;
        this.showAllOpportunities(); // Refresh the displayed list
      },
      error: (err) => {
        console.error('Error updating sales opportunity:', err);
        this.errorMessage = `Failed to update sales opportunity: ${err.error?.message || 'An unexpected error occurred. Check console.'}`;
        this.isLoading = false;
      }
    });
  }

  /**
   * Fetches and displays all sales opportunities.
   */
  showAllOpportunities(): void {
    this.errorMessage = null;
    this.successMessage = null;
    this.opportunityIdInput = null; // Clear specific ID input
    this.displayedOpportunities = []; // Clear specific display before showing all

    this.isLoading = true;
    this.salesOpportunityService.getAllSalesOpportunities().subscribe({
      next: (opportunities: SalesOpportunityResponseDto[]) => {
        this.displayedOpportunities = opportunities; // Display all opportunities as cards
        this.isLoading = false;
        this.errorMessage = null;
      },
      error: (err) => {
        console.error('Error fetching all sales opportunities:', err);
        this.errorMessage = `Failed to load all sales opportunities. Please ensure your Spring Boot backend is running and check console for network errors. Details: ${err.message || 'Unknown error'}`;
        this.isLoading = false;
        this.displayedOpportunities = [];
      }
    });
  }

  /**
   * Resets the creation form and all display states.
   */
  resetForm(): void {
    this.opportunity = {
      name: '',
      stage: 'Prospecting',
      amount: null,
      closeDate: null,
      leadSource: '',
      notes: null
    };
    if (this.opportunityForm) {
      this.opportunityForm.resetForm();
    }
    this.resetDisplayState();
  }

  /**
   * Helper method to reset the displayed sales opportunity cards and messages.
   */
  public resetDisplayState(): void { // Changed to public
    this.errorMessage = null;
    this.successMessage = null;
    this.opportunityIdInput = null;
    this.displayedOpportunities = []; // Clears all displayed cards
    this.opportunityIdForUpdate = null; // Clear update-related fields
    this.opportunityToUpdate = null;
    if (this.updateOpportunityForm) {
        this.updateOpportunityForm.resetForm(); // Reset update form as well
    }
  }

  logout(): void {
    // Implement actual logout logic here (e.g., clearing JWT token from localStorage)
    console.log('Logging out...');
    // For now, just navigate to the login page.
    this.router.navigate(['/login']);
  }
}

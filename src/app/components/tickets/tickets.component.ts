import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms'; // FormsModule is still needed for ticketIdInput
import { Router, RouterModule } from '@angular/router'; // For logout navigation

import { TicketDto, TicketService, TicketStatus } from '../../services/ticket.service';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // Keep FormsModule for ticketIdInput, add RouterModule
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css']
})
export class TicketsComponent implements OnInit {
  // @ViewChild('ticketForm') ticketForm!: NgForm; // Remove NgForm ViewChild as creation form is removed
  @ViewChild('updateStatusForm') updateStatusForm!: NgForm; // ViewChild for the new update form

  // ticket object no longer needed as there's no creation form for the issue itself
  // ticket: TicketDto = {
  //   issue: '',
  //   customerId: null as any,
  //   productId: null as any
  // };

  ticketIdInput: number | null = null; // For fetching specific ticket for viewing
  displayedTickets: TicketDto[] = []; // For displaying tickets (specific or all)

  // New properties for updating ticket status
  ticketIdForUpdate: number | null = null;
  newStatusForUpdate: TicketStatus | null = null;

  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading: boolean = false;

  // No longer need availableCustomers or availableProducts, as creation form is removed
  // availableCustomers: CustomerDto[] = [];
  // availableProducts: ProductDto[] = [];
  ticketStatuses = Object.values(TicketStatus); // Still useful for displaying and selecting status

  constructor(
    private ticketService: TicketService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.resetDisplayState(); // Clear display initially
    // No longer need to populate customer/product dropdowns as form is removed
    // this.populateCustomerAndProductDropdowns();
  }

  // populateCustomerAndProductDropdowns() method removed as creation form is removed
  // private populateCustomerAndProductDropdowns(): void { /* ... */ }

  // onSubmit() method removed as creation form is removed
  // onSubmit(): void { /* ... */ }

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
   * Fetches a specific ticket based on the input ID for display.
   */
  fetchTicketFromInput(): void {
    this.errorMessage = null;
    this.successMessage = null;
    this.displayedTickets = []; // Clear current display before new fetch

    if (this.ticketIdInput === null || this.isNumberNaN(this.ticketIdInput)) { // Changed to use isNumberNaN
      this.errorMessage = 'Please enter a valid Ticket ID.';
      return;
    }

    this.isLoading = true;
    this.ticketService.getTicketById(this.ticketIdInput).subscribe({
      next: (ticket: TicketDto | null) => {
        if (ticket) {
          this.displayedTickets = [ticket]; // Display single ticket as a card
          this.errorMessage = null;
        } else {
          this.errorMessage = `Ticket with ID ${this.ticketIdInput} not found.`;
          this.displayedTickets = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching specific ticket:', err);
        this.errorMessage = `Failed to load ticket with ID ${this.ticketIdInput}. Check backend/console. Details: ${err.message || 'Unknown error'}`;
        this.isLoading = false;
        this.displayedTickets = [];
      }
    });
  }

  /**
   * Fetches and displays all tickets.
   */
  showAllTickets(): void {
    this.errorMessage = null;
    this.successMessage = null;
    this.ticketIdInput = null; // Clear specific ID input
    this.displayedTickets = []; // Clear specific display before showing all

    this.isLoading = true;
    this.ticketService.getAllTickets().subscribe({
      next: (tickets: TicketDto[]) => {
        this.displayedTickets = tickets; // Display all tickets as cards
        this.isLoading = false;
        this.errorMessage = null;
      },
      error: (err) => {
        console.error('Error fetching all tickets:', err);
        this.errorMessage = `Failed to load all tickets. Please ensure your Spring Boot backend is running and check console for network errors. Details: ${err.message || 'Unknown error'}`;
        this.isLoading = false;
        this.displayedTickets = [];
      }
    });
  }

  /**
   * Updates the status of a ticket based on input fields.
   */
  updateTicketStatus(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.ticketIdForUpdate === null || this.isNumberNaN(this.ticketIdForUpdate) || this.newStatusForUpdate === null) { // Changed to use isNumberNaN
      this.errorMessage = 'Please enter a valid Ticket ID and select a new Status.';
      // Mark fields as touched to show validation messages if they are invalid
      if (this.updateStatusForm) {
        Object.keys(this.updateStatusForm.controls).forEach(field => {
          const control = this.updateStatusForm.controls[field];
          control.markAsTouched({ onlySelf: true });
        });
      }
      return;
    }

    this.isLoading = true;
    this.ticketService.updateTicketStatus(this.ticketIdForUpdate, this.newStatusForUpdate).subscribe({
      next: (updatedTicket: TicketDto) => {
        this.successMessage = `Ticket #${updatedTicket.id} status updated to '${updatedTicket.status}' successfully!`;
        // Optionally refresh the displayed tickets to show the update
        if (this.displayedTickets.length > 0 && this.displayedTickets[0].id === updatedTicket.id) {
          // If a specific ticket was displayed, update it
          this.displayedTickets[0] = updatedTicket;
        } else {
          // Otherwise, just refresh all if applicable, or show specific one
          this.showAllTickets(); // Refresh all tickets to reflect the change
        }
        this.isLoading = false;
        // Reset update form fields
        this.ticketIdForUpdate = null;
        this.newStatusForUpdate = null;
        if (this.updateStatusForm) {
          this.updateStatusForm.resetForm();
        }
      },
      error: (err) => {
        console.error('Error updating ticket status:', err);
        this.errorMessage = `Failed to update ticket status: ${err.error?.message || 'An unexpected error occurred. Check console.'}`;
        this.isLoading = false;
      }
    });
  }

  /**
   * Helper method to reset the displayed ticket cards and messages.
   */
  private resetDisplayState(): void {
    this.errorMessage = null;
    this.successMessage = null;
    this.ticketIdInput = null;
    this.displayedTickets = []; // Clears all displayed cards
    this.ticketIdForUpdate = null; // Clear update fields
    this.newStatusForUpdate = null; // Clear update fields
  }

  /**
   * Handles the logout action, navigating to the login page.
   */
  logout(): void {
    // Implement actual logout logic here (e.g., clearing JWT token from localStorage)
    console.log('Logging out...');
    // For now, just navigate to the login page.
    this.router.navigate(['/login']);
  }
}

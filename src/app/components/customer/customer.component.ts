import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { CustomerDto, CustomerService, CustomerResponse } from '../../services/customer.service';
import { Router,RouterModule } from '@angular/router';
@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule], // HttpClientModule is provided globally via app.config.ts
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  @ViewChild('customerForm') customerForm!: NgForm;

  customer: CustomerDto = {
    name: '',
    mobileNo: '',
    emailId: '',
    noOfOrders: 0
  };

  // customerSelectionType is no longer needed
  // customerSelectionType: 'all' | 'specific' = 'all'; // This line can be removed

  customerIdInput: number | null = null; // Property for the input field

  displayedCustomers: CustomerDto[] = []; // For specific customer results
  displayedAllCustomers: CustomerDto[] = []; // For all customers table

  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading: boolean = false;

  constructor(private customerService: CustomerService, private router: Router) { }

  ngOnInit(): void {
    // We will not fetch all customers on init, waiting for user action
    // this.fetchAllCustomers();
    this.resetDisplayState(); // Clear tables and messages initially
  }

  /**
   * New method to fetch customer based on input ID.
   */
  fetchCustomerFromInput(): void {
    this.errorMessage = null;
    this.successMessage = null;
    this.displayedAllCustomers = []; // Clear all customers table when fetching specific

    if (this.customerIdInput === null || isNaN(this.customerIdInput)) {
      this.errorMessage = 'Please enter a valid Customer ID.';
      this.displayedCustomers = []; // Clear specific customer table if input is invalid
      return;
    }

    this.fetchSpecificCustomer(this.customerIdInput);
  }

  /**
   * New method to explicitly show all customers.
   */
  showAllCustomers(): void {
    this.errorMessage = null;
    this.successMessage = null;
    this.customerIdInput = null; // Clear specific ID input
    this.displayedCustomers = []; // Clear specific customer table
    this.fetchAllCustomers(); // Fetch and display all customers
  }

  /**
   * Fetches all customers and populates `displayedAllCustomers`.
   */
  private fetchAllCustomers(): void {
    this.isLoading = true;
    this.customerService.getAllCustomers(0, 100, 'name', 'asc').subscribe({
      next: (response: CustomerResponse) => {
        this.displayedAllCustomers = response.content; // Populate the ALL customers table
        this.isLoading = false;
        this.errorMessage = null;
      },
      error: (err) => {
        console.error('Error fetching all customers:', err);
        this.errorMessage = `Failed to load all customers. Please ensure your Spring Boot backend is running and check console for network errors (CORS issues, etc.). Details: ${err.message || 'Unknown error'}`;
        this.isLoading = false;
        this.displayedAllCustomers = []; // Clear the table on error
      }
    });
  }

  /**
   * Fetches a single customer by ID and populates the `displayedCustomers` array.
   * @param id The ID of the customer to fetch.
   */
  private fetchSpecificCustomer(id: number): void {
    this.isLoading = true;
    this.customerService.getCustomerById(id).subscribe({
      next: (customer: CustomerDto | null) => {
        if (customer) {
          this.customer = { ...customer }; // Populate form with fetched data (useful if user wants to modify)
          this.displayedCustomers = [customer]; // Display only the fetched customer in the specific table
          this.errorMessage = null;
        } else {
          this.errorMessage = `Customer with ID ${id} not found.`;
          this.displayedCustomers = []; // Clear table if not found
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching specific customer:', err);
        this.errorMessage = `Failed to load customer with ID ${id}. Please check the backend connection or console for more details. Details: ${err.message || 'Unknown error'}`;
        this.isLoading = false;
        this.displayedCustomers = []; // Clear table on error
      }
    });
  }

  /**
   * Handles form submission for creating a new customer.
   */
  onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null; // Clear success message from previous operations

    if (this.customerForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      Object.keys(this.customerForm.controls).forEach(field => {
        const control = this.customerForm.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return;
    }

    this.isLoading = true;
    const customerToCreate = {
      name: this.customer.name,
      mobileNo: this.customer.mobileNo,
      emailId: this.customer.emailId,
      noOfOrders: 0
    };

    this.customerService.createCustomer(customerToCreate).subscribe({
      next: (newCustomer: CustomerDto) => {
        alert(`Customer '${newCustomer.name}' added successfully!`); // Show alert
        this.resetForm(); // Reset form and display states
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error creating customer:', err);
        this.errorMessage = `Failed to add customer: ${err.error?.message || 'An unexpected error occurred. Check console.'}`;
        this.isLoading = false;
      }
    });
  }

  /**
   * Resets the form and display state.
   */
  resetForm(): void {
    this.customer = {
      name: '',
      mobileNo: '',
      emailId: '',
      noOfOrders: 0
    };
    if (this.customerForm) {
      this.customerForm.resetForm();
    }
    this.resetDisplayState(); // Call helper to clear displayed data
  }

  /**
   * Helper method to reset the displayed customer tables and messages.
   */
  private resetDisplayState(): void {
    this.errorMessage = null;
    this.successMessage = null;
    this.customerIdInput = null; // Clear the customer ID input
    this.displayedCustomers = []; // Clear the specific customer table
    this.displayedAllCustomers = []; // Clear the all customers table
  }
  logout(): void {
    // Implement actual logout logic here (e.g., clearing JWT token from localStorage)
    console.log('Logging out...');
    // For now, just navigate to the login page.
    this.router.navigate(['/login']);
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ProductDto, ProductService, ProductResponse } from '../../services/product.service';
import { CustomerService, CustomerDto,CustomerResponse } from '../../services/customer.service'; // Need CustomerService to get customer IDs
import { Router,RouterModule } from '@angular/router';
@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  @ViewChild('productForm') productForm!: NgForm;

  product: ProductDto = { 
    productName: '',
    productBrandName: '',
    productBrandDescription: '',
    productPrice: 0,
    productReviewOutOfFive: 1 // Default to 1, min is 1
  };

  customerIdForProduct: number | null = null; // For the customer ID input in the product form
  productIdInput: number | null = null; // For the input to fetch a specific product

  displayedSpecificProduct: ProductDto[] = []; // To display the fetched specific product
  displayedAllProducts: ProductDto[] = []; // To display all products

  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading: boolean = false;

  availableCustomers: CustomerDto[] = []; // To populate dropdown for associating product with customer

  constructor(
    private productService: ProductService,
    private customerService: CustomerService, // Inject CustomerService
    private router: Router // Inject Router service
  ) { }

  ngOnInit(): void {
    this.resetDisplayState(); // Clear tables and messages initially
    this.populateCustomerDropdown(); // Fetch customers to populate the product form's dropdown
  }

  /**
   * Fetches all customers to populate the dropdown for product creation.
   */
  private populateCustomerDropdown(): void {
    this.customerService.getAllCustomers(0, 100, 'name', 'asc').subscribe({
      next: (response: CustomerResponse) => {
        this.availableCustomers = response.content;
      },
      error: (err) => {
        console.error('Error populating customer dropdown for products:', err);
        // Display a general error if customers cannot be loaded for association
        this.errorMessage = `Failed to load customers for product association: ${err.message || 'Unknown error'}`;
      }
    });
  }

  /**
   * Handles form submission for creating a new product.
   */
  onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.productForm.invalid || this.customerIdForProduct === null) {
      this.errorMessage = 'Please fill in all required fields and select a Customer for the product.';
      // Mark all fields as touched to show validation messages immediately
      Object.keys(this.productForm.controls).forEach(field => {
        const control = this.productForm.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return;
    }

    this.isLoading = true;
    const productToCreate = { ...this.product };
    delete productToCreate.id; // Ensure ID is not sent for new creation

    this.productService.createProduct(this.customerIdForProduct, productToCreate).subscribe({
      next: (newProduct: ProductDto) => {
        alert(`Product '${newProduct.productName}' added successfully for Customer ID: ${this.customerIdForProduct}!`);
        this.resetForm(); // Reset form and display states
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error creating product:', err);
        this.errorMessage = `Failed to add product: ${err.error?.message || 'An unexpected error occurred.'}`;
        this.isLoading = false;
      }
    });
  }

  /**
   * Fetches a specific product based on the input ID.
   */
  fetchProductFromInput(): void {
    this.errorMessage = null;
    this.successMessage = null;
    this.displayedAllProducts = []; // Clear all products table when fetching specific

    if (this.productIdInput === null || isNaN(this.productIdInput)) {
      this.errorMessage = 'Please enter a valid Product ID.';
      this.displayedSpecificProduct = [];
      return;
    }

    this.fetchSpecificProduct(this.productIdInput);
  }

  /**
   * Fetches and displays all products.
   */
  showAllProducts(): void {
    this.errorMessage = null;
    this.successMessage = null;
    this.productIdInput = null; // Clear specific product ID input
    this.displayedSpecificProduct = []; // Clear specific product table
    this.fetchAllProducts(); // Fetch and display all products
  }

  /**
   * Private helper to fetch all products from the service.
   */
  private fetchAllProducts(): void {
    this.isLoading = true;
    this.productService.getAllProducts(0, 100, 'productName', 'asc').subscribe({
      next: (response: ProductResponse) => {
        this.displayedAllProducts = response.content;
        this.isLoading = false;
        this.errorMessage = null;
      },
      error: (err) => {
        console.error('Error fetching all products:', err);
        this.errorMessage = `Failed to load all products. Please ensure your Spring Boot backend is running and check console for network errors. Details: ${err.message || 'Unknown error'}`;
        this.isLoading = false;
        this.displayedAllProducts = [];
      }
    });
  }

  /**
   * Private helper to fetch a specific product from the service.
   * @param id The ID of the product to fetch.
   */
  private fetchSpecificProduct(id: number): void {
    this.isLoading = true;
    this.productService.getProductById(id).subscribe({
      next: (product: ProductDto | null) => {
        if (product) {
          this.product = { ...product }; // Populate form (optional, for editing or showing details)
          this.displayedSpecificProduct = [product]; // Display in specific product table
          this.errorMessage = null;
        } else {
          this.errorMessage = `Product with ID ${id} not found.`;
          this.displayedSpecificProduct = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching specific product:', err);
        this.errorMessage = `Failed to load product with ID ${id}. Check backend/console. Details: ${err.message || 'Unknown error'}`;
        this.isLoading = false;
        this.displayedSpecificProduct = [];
      }
    });
  }

  /**
   * Resets the product form and all display states.
   */
  resetForm(): void {
    this.product = {
      productName: '',
      productBrandName: '',
      productBrandDescription: '',
      productPrice: 0,
      productReviewOutOfFive: 1
    };
    this.customerIdForProduct = null; // Clear customer ID for product
    if (this.productForm) {
      this.productForm.resetForm();
    }
    this.resetDisplayState(); // Clear displayed data and messages
  }

  /**
   * Helper method to reset the displayed product tables and messages.
   */
  private resetDisplayState(): void {
    this.errorMessage = null;
    this.successMessage = null;
    this.productIdInput = null; // Clear specific product ID input
    this.displayedSpecificProduct = []; // Clear specific product table
    this.displayedAllProducts = []; // Clear all products table
  }
  logout(): void {
    // Implement actual logout logic here (e.g., clearing JWT token from localStorage)
    console.log('Logging out...');
    // For now, just navigate to the login page.
    this.router.navigate(['/login']);
  }
}

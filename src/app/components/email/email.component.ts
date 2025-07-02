import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

import { MarketingService, CampaignDto, SendEmailRequest } from '../../services/marketing.service';
import { CustomerService, CustomerDto, CustomerResponse } from '../../services/customer.service'; // Assuming CustomerService exists
import { ProductService, ProductDto, ProductResponse } from '../../services/product.service'; // Will create a basic ProductService later
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FilterCampaignsPipe } from '../../pipes/filter-campaigns.pipe'; // <<< ADDED THIS IMPORT

@Component({
  selector: 'app-email',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    FilterCampaignsPipe // <<< ADDED THE PIPE TO IMPORTS
  ],
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.css']
})
export class EmailComponent implements OnInit {
  sendEmailForm: FormGroup;
  sendEmailMessage: string = '';
  sendEmailSuccess: boolean = false;
  isLoading: boolean = false;

  campaigns: CampaignDto[] = [];
  customers: CustomerDto[] = [];
  products: ProductDto[] = [];

  constructor(
    private fb: FormBuilder,
    private marketingService: MarketingService,
    private customerService: CustomerService,
    private productService: ProductService, // Inject ProductService
    private router: Router
  ) {
    this.sendEmailForm = this.fb.group({
      campaignId: [null, Validators.required],
      customerIds: [[], Validators.required], // Array of numbers for customer IDs
      productId: [null], // Optional productId
      subjectTemplate: ['', Validators.required],
      bodyTemplate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCampaigns();
    this.loadCustomers();
    this.loadProducts();
  }

  /**
   * Loads all email campaigns for the dropdown.
   */
  loadCampaigns(): void {
    this.isLoading = true;
    this.marketingService.getAllEmailCampaigns().pipe(
      catchError(error => {
        console.error('Error loading campaigns:', error);
        this.sendEmailMessage = `Failed to load campaigns: ${error.message}`;
        this.sendEmailSuccess = false;
        return of([]);
      })
    ).subscribe(campaigns => {
      this.campaigns = campaigns;
      this.isLoading = false;
    });
  }

  /**
   * Loads all customers for the multi-select dropdown.
   */
  loadCustomers(): void {
    this.isLoading = true;
    this.customerService.getAllCustomers(0, 1000).pipe( // Fetch a large enough page size
      catchError(error => {
        console.error('Error loading customers:', error);
        this.sendEmailMessage = `Failed to load customers: ${error.message}`;
        this.sendEmailSuccess = false;
        return of({ content: [], pageNo: 0, pageSize: 0, totalElements: 0, totalPages: 0, last: true });
      })
    ).subscribe((response: CustomerResponse) => {
      this.customers = response.content;
      this.isLoading = false;
    });
  }

  /**
   * Loads all products for the dropdown.
   */
  loadProducts(): void {
    this.isLoading = true;
    this.productService.getAllProducts(0, 1000).pipe( // Fetch a large enough page size
      catchError(error => {
        console.error('Error loading products:', error);
        this.sendEmailMessage = `Failed to load products: ${error.message}`;
        this.sendEmailSuccess = false;
        return of({ content: [], pageNo: 0, pageSize: 0, totalElements: 0, totalPages: 0, last: true });
      })
    ).subscribe((response: ProductResponse) => {
      this.products = response.content;
      this.isLoading = false;
    });
  }


  /**
   * Handles the submission of the email sending form.
   */
  sendEmailCampaign(): void {
    this.sendEmailMessage = '';
    this.sendEmailSuccess = false;

    if (this.sendEmailForm.invalid) {
      this.sendEmailMessage = 'Please fill in all required fields correctly.';
      this.sendEmailSuccess = false;
      this.sendEmailForm.markAllAsTouched();
      console.log('Form invalid:', this.sendEmailForm.errors, this.sendEmailForm.value);
      return;
    }

    const { campaignId, customerIds, productId, subjectTemplate, bodyTemplate } = this.sendEmailForm.value;

    const payload: SendEmailRequest = {
      customerIds: customerIds,
      productId: productId === '' ? null : productId, // Convert empty string to null for optional productId
      subjectTemplate: subjectTemplate,
      bodyTemplate: bodyTemplate
    };

    this.isLoading = true;
    this.marketingService.sendEmailCampaign(campaignId, payload).subscribe({
      next: (response) => {
        this.sendEmailMessage = `Email campaign initiated: ${response}`;
        this.sendEmailSuccess = true;
        this.sendEmailForm.reset({
          campaignId: null,
          customerIds: [],
          productId: null,
          subjectTemplate: '',
          bodyTemplate: ''
        });
      },
      error: (err) => {
        this.sendEmailMessage = `Error sending email campaign: ${err.message || 'An unexpected error occurred.'}`;
        this.sendEmailSuccess = false;
        console.error('Send email error:', err);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  /**
   * Handles the logout action.
   */
  logout(): void {
    console.log('Logging out from Marketing Email...');
    this.router.navigate(['/login']);
  }
}

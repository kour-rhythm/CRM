import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

import { MarketingService, CampaignDto, SendSmsRequest } from '../../services/marketing.service';
import { CustomerService, CustomerDto, CustomerResponse } from '../../services/customer.service';
import { ProductService, ProductDto, ProductResponse } from '../../services/product.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FilterCampaignsPipe } from '../../pipes/filter-campaigns.pipe'; // Import the pipe

@Component({
  selector: 'app-sms',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    FilterCampaignsPipe // Add the pipe to imports
  ],
  templateUrl: './sms.component.html',
  styleUrls: ['./sms.component.css']
})
export class SmsComponent implements OnInit {
  sendSmsForm: FormGroup;
  sendSmsMessage: string = '';
  sendSmsSuccess: boolean = false;
  isLoading: boolean = false;

  campaigns: CampaignDto[] = [];
  customers: CustomerDto[] = [];
  products: ProductDto[] = [];

  constructor(
    private fb: FormBuilder,
    private marketingService: MarketingService,
    private customerService: CustomerService,
    private productService: ProductService,
    private router: Router
  ) {
    this.sendSmsForm = this.fb.group({
      campaignId: [null, Validators.required],
      customerIds: [[], Validators.required], // Array of numbers for customer IDs
      productId: [null], // Optional productId
      messageTemplate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCampaigns();
    this.loadCustomers();
    this.loadProducts();
  }

  /**
   * Loads all campaigns for the dropdown (will be filtered by pipe for SMS type).
   */
  loadCampaigns(): void {
    this.isLoading = true;
    this.marketingService.getAllCampaigns().pipe( // Get all campaigns, then filter by type in template
      catchError(error => {
        console.error('Error loading campaigns:', error);
        this.sendSmsMessage = `Failed to load campaigns: ${error.message}`;
        this.sendSmsSuccess = false;
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
        this.sendSmsMessage = `Failed to load customers: ${error.message}`;
        this.sendSmsSuccess = false;
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
        this.sendSmsMessage = `Failed to load products: ${error.message}`;
        this.sendSmsSuccess = false;
        return of({ content: [], pageNo: 0, pageSize: 0, totalElements: 0, totalPages: 0, last: true });
      })
    ).subscribe((response: ProductResponse) => {
      this.products = response.content;
      this.isLoading = false;
    });
  }

  /**
   * Handles the submission of the SMS sending form.
   */
  sendSmsCampaign(): void {
    this.sendSmsMessage = '';
    this.sendSmsSuccess = false;

    if (this.sendSmsForm.invalid) {
      this.sendSmsMessage = 'Please fill in all required fields correctly.';
      this.sendSmsSuccess = false;
      this.sendSmsForm.markAllAsTouched();
      console.log('Form invalid:', this.sendSmsForm.errors, this.sendSmsForm.value);
      return;
    }

    const { campaignId, customerIds, productId, messageTemplate } = this.sendSmsForm.value;

    const payload: SendSmsRequest = {
      customerIds: customerIds,
      productId: productId === '' ? null : productId, // Convert empty string to null for optional productId
      messageTemplate: messageTemplate
    };

    this.isLoading = true;
    this.marketingService.sendSmsCampaign(campaignId, payload).subscribe({
      next: (response) => {
        this.sendSmsMessage = `SMS campaign initiated: ${response}`;
        this.sendSmsSuccess = true;
        this.sendSmsForm.reset({
          campaignId: null,
          customerIds: [],
          productId: null,
          messageTemplate: ''
        });
      },
      error: (err) => {
        this.sendSmsMessage = `Error sending SMS campaign: ${err.message || 'An unexpected error occurred.'}`;
        this.sendSmsSuccess = false;
        console.error('Send SMS error:', err);
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
    console.log('Logging out from Marketing SMS...');
    this.router.navigate(['/login']);
  }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // For ngModel for dropdowns
import { RouterModule, Router } from '@angular/router'; // For routerLink and programmatic navigation

import { MarketingService, CampaignDto, CampaignType } from '../../services/marketing.service'; // Import MarketingService and DTOs
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-campaigns',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // For ngModel
    ReactiveFormsModule, // For FormGroup
    RouterModule // For routerLink in the header
  ],
  templateUrl: './campaigns.component.html',
  styleUrls: ['./campaigns.component.css']
})
export class CampaignsComponent implements OnInit {
  campaignForm: FormGroup;
  addCampaignMessage: string = '';
  addCampaignSuccess: boolean = false;
  isLoading: boolean = false;

  // Expose CampaignType enum to the template
  public CampaignType = CampaignType; // <<< ADDED THIS LINE

  campaignTypes = Object.values(CampaignType); // To populate the dropdown for campaign type

  // For displaying campaigns
  allCampaigns: CampaignDto[] = [];
  displayedCampaigns: CampaignDto[] = [];
  specificCampaignId: number | null = null;
  specificCampaignMessage: string = '';
  selectedDisplayOption: 'all' | 'specific' = 'all';

  constructor(
    private fb: FormBuilder,
    private marketingService: MarketingService,
    private router: Router
  ) {
    this.campaignForm = this.fb.group({
      name: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      type: [CampaignType.EMAIL, Validators.required], // Default to EMAIL
      mailerSendCampaignId: [''] // Added mailerSendCampaignId to the form
    });
  }

  ngOnInit(): void {
    this.fetchAllCampaigns();
  }

  /**
   * Handles the submission of the campaign creation form.
   */
  createCampaign(): void {
    this.addCampaignMessage = '';
    this.addCampaignSuccess = false;

    if (this.campaignForm.invalid) {
      this.addCampaignMessage = 'Please fill in all required fields correctly.';
      this.addCampaignSuccess = false;
      this.campaignForm.markAllAsTouched();
      return;
    }

    const newCampaign: CampaignDto = this.campaignForm.value;
    this.isLoading = true;

    this.marketingService.createCampaign(newCampaign).subscribe({
      next: (campaign) => {
        this.addCampaignMessage = `Campaign '${campaign.name}' (ID: ${campaign.campaignID}) created successfully!`;
        this.addCampaignSuccess = true;
        this.campaignForm.reset({ type: CampaignType.EMAIL, mailerSendCampaignId: '' }); // Reset form, keep default type and clear mailerSendCampaignId
        this.fetchAllCampaigns(); // Refresh the list of campaigns
      },
      error: (err) => {
        this.addCampaignMessage = `Error creating campaign: ${err.message || 'An unexpected error occurred.'}`;
        this.addCampaignSuccess = false;
        console.error('Create campaign error:', err);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  /**
   * Fetches all campaigns from the backend.
   * NOW uses marketingService.getAllCampaigns() to get ALL types of campaigns.
   */
  fetchAllCampaigns(): void {
    this.isLoading = true;
    this.marketingService.getAllCampaigns().pipe(
      catchError(error => {
        console.error('Failed to load all campaigns:', error);
        this.addCampaignMessage = `Error fetching campaigns: ${error.message}. Please ensure your backend has a GET /api/marketing/campaigns/all endpoint that returns all campaign types.`;
        this.addCampaignSuccess = false;
        return of([]);
      })
    ).subscribe(campaigns => {
      this.allCampaigns = campaigns;
      // Only update displayedCampaigns if "All" is selected
      if (this.selectedDisplayOption === 'all') {
        this.displayedCampaigns = [...this.allCampaigns];
      }
      this.isLoading = false;
    });
  }

  /**
   * Handles change in the display option (All Campaigns vs. Specific Campaign).
   */
  onDisplayOptionChange(): void {
    this.specificCampaignMessage = '';
    if (this.selectedDisplayOption === 'all') {
      this.specificCampaignId = null; // Clear specific ID
      this.displayedCampaigns = [...this.allCampaigns]; // Show all campaigns
    } else {
      this.displayedCampaigns = []; // Clear displayed campaigns when switching to specific
    }
  }

  /**
   * Fetches a specific campaign by ID.
   */
  getSpecificCampaign(): void {
    this.specificCampaignMessage = '';
    this.displayedCampaigns = [];

    if (this.specificCampaignId === null || isNaN(this.specificCampaignId)) {
      this.specificCampaignMessage = 'Please enter a valid numeric Campaign ID.';
      return;
    }

    this.isLoading = true;
    this.marketingService.getCampaignById(this.specificCampaignId).pipe(
      catchError(error => {
        console.error(`Failed to load campaign with ID ${this.specificCampaignId}:`, error);
        this.specificCampaignMessage = `Error fetching campaign: ${error.message}`;
        return of(null); // Return null on error so map doesn't fail
      })
    ).subscribe(campaign => {
      if (campaign) {
        this.displayedCampaigns = [campaign]; // Display single campaign in an array
        this.specificCampaignMessage = ''; // Clear message on success
      } else {
        this.specificCampaignMessage = `Campaign with ID ${this.specificCampaignId} not found.`;
      }
      this.isLoading = false;
    });
  }

  /**
   * Handles the logout action, navigating to the login page.
   */
  logout(): void {
    // In a full application, this would also clear authentication tokens/session.
    console.log('Logging out from Marketing Portal...');
    this.router.navigate(['/login']);
  }
}

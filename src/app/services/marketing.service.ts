import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
// Assuming environment.ts exists for apiUrl, or hardcode it if not using environments
// import { environment } from '../../environments/environment';

// DTO for Campaign (matches backend payload.CampaignDto)
export interface CampaignDto {
  campaignID?: number; // Optional for creation
  name: string;
  startDate: string | null; // LocalDate in backend maps to string (YYYY-MM-DD)
  endDate: string | null; // LocalDate in backend maps to string (YYYY-MM-DD)
  type: CampaignType; // EMAIL, SMS, SOCIAL_MEDIA
  mailerSendCampaignId?: string | null; // Optional
}

// Enum for CampaignType (matches backend entity.CampaignType)
export enum CampaignType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA'
}

// DTO for sending Email Campaign request (matches backend payload.SendEmailRequest)
export interface SendEmailRequest {
  customerIds: number[];
  productId: number | null;
  subjectTemplate: string;
  bodyTemplate: string;
}

// DTO for sending SMS Campaign request (matches backend payload.SendSmsRequest)
export interface SendSmsRequest {
  customerIds: number[];
  productId: number | null;
  messageTemplate: string;
}


@Injectable({
  providedIn: 'root'
})
export class MarketingService {
  // Update this URL to match your Marketing microservice's base URL
  private apiBaseUrl = 'http://localhost:8004'; // Based on your previous context for Marketing Service
  private campaignsUrl = `${this.apiBaseUrl}/api/marketing/campaigns`;

  constructor(private http: HttpClient) { }

  /**
   * Centralized error handling for MarketingService.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred in Marketing Service!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side Error: ${error.error.message}`;
    } else {
      if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Server Error (${error.status}): ${error.message || 'Something went wrong on the server.'}`;
      }
    }
    console.error('MarketingService error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Creates a new campaign.
   * POST /api/marketing/campaigns
   * @param campaignDto The campaign data to create.
   * @returns An Observable of the created CampaignDto.
   */
  createCampaign(campaignDto: CampaignDto): Observable<CampaignDto> {
    return this.http.post<CampaignDto>(this.campaignsUrl, campaignDto)
      .pipe(catchError(this.handleError));
  }

  /**
   * Retrieves a campaign by its ID.
   * GET /api/marketing/campaigns/{id}
   * @param id The ID of the campaign to retrieve.
   * @returns An Observable of CampaignDto (or null if not found).
   */
  getCampaignById(id: number): Observable<CampaignDto | null> {
    return this.http.get<CampaignDto>(`${this.campaignsUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Retrieves all campaigns (regardless of type).
   * NEW METHOD to fetch all campaigns. You need to implement a corresponding backend endpoint.
   * GET /api/marketing/campaigns/all (or just GET /api/marketing/campaigns if it returns all)
   * For this implementation, I'm assuming a new endpoint like '/all' or that the root GET returns all.
   * If your root GET /api/marketing/campaigns already returns all types, you can change the URL below.
   * @returns An Observable of a list of CampaignDto.
   */
  getAllCampaigns(): Observable<CampaignDto[]> {
    // Assuming your backend will have a new endpoint like /api/marketing/campaigns/all
    // OR if GET /api/marketing/campaigns (the base URL) returns all campaigns,
    // you can change this to `this.campaignsUrl`
    return this.http.get<CampaignDto[]>(`${this.campaignsUrl}/all`) // <<< NEW: Assuming a /all endpoint
      .pipe(catchError(this.handleError));
  }


  /**
   * Retrieves all email campaigns.
   * GET /api/marketing/campaigns/email
   * (Kept this method as it's specifically for EMAIL campaigns based on backend)
   * @returns An Observable of a list of CampaignDto.
   */
  getAllEmailCampaigns(): Observable<CampaignDto[]> {
    return this.http.get<CampaignDto[]>(`${this.campaignsUrl}/email`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Deletes a campaign by its ID.
   * DELETE /api/marketing/campaigns/{id}
   * @param id The ID of the campaign to delete.
   * @returns An Observable for the completion of the delete operation.
   */
  deleteCampaign(id: number): Observable<void> {
    return this.http.delete<void>(`${this.campaignsUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Sends an email campaign.
   * POST /api/marketing/campaigns/{campaignId}/send/email
   * @param campaignId The ID of the campaign to send.
   * @param sendEmailRequest The payload containing customer IDs, product ID, subject, and body templates.
   * @returns An Observable of a string response from the backend.
   */
  sendEmailCampaign(campaignId: number, sendEmailRequest: SendEmailRequest): Observable<string> {
    return this.http.post(`${this.campaignsUrl}/${campaignId}/send/email`, sendEmailRequest, { responseType: 'text' })
      .pipe(catchError(this.handleError));
  }

  /**
   * Sends an SMS campaign.
   * POST /api/marketing/campaigns/{campaignId}/send/sms
   * @param campaignId The ID of the campaign to send.
   * @param sendSmsRequest The payload containing customer IDs, product ID, and message template.
   * @returns An Observable of a string response from the backend.
   */
  sendSmsCampaign(campaignId: number, sendSmsRequest: SendSmsRequest): Observable<string> {
    return this.http.post(`${this.campaignsUrl}/${campaignId}/send/sms`, sendSmsRequest, { responseType: 'text' })
      .pipe(catchError(this.handleError));
  }
}

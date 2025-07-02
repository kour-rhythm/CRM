import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// DTO representing a Marketing Campaign fetched from the external Marketing Module.
// Corresponds to backend's com.payload.MarketingReportDto.
export interface MarketingReportDto {
  campaignID: number; // Corresponds to 'campaignID' in the external Campaign entity
  name: string;       // Corresponds to 'name' in the external Campaign entity
  startDate: string;  // LocalDate is usually serialized as 'YYYY-MM-DD' string
  endDate: string;    // LocalDate is usually serialized as 'YYYY-MM-DD' string
  type: string;       // Corresponds to 'type' in the external Campaign entity (as String)
  mailerSendCampaignId: string | null; // Optional, can be null
}

// DTO representing a Marketing Report response from your CRM's local database.
// Corresponds to backend's com.payload.MarketingReportResponseDto.
export interface MarketingReportResponseDto {
  campaignId: number; // The ID of the original campaign (also the report's ID)
  name: string;
  startDate: string;
  endDate: string;
  type: string;
  mailerSendCampaignId: string | null;
  generatedAt: string; // LocalDateTime is usually serialized as ISO 8601 string
}

@Injectable({
  providedIn: 'root'
})
export class MarketingReportService {
  // IMPORTANT: Ensure this matches your backend's base URL for Marketing Reports.
  // Based on your MarketingReportController, it's 'http://localhost:8080/api/marketingreports'.
  private apiBaseUrl = 'http://localhost:8065/api/marketingreports';

  constructor(private http: HttpClient) { }

  /**
   * Centralized error handling for HTTP requests.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred in Marketing Report Service!';
    if (error.error instanceof ErrorEvent) {
      // Client-side network error or a script error
      errorMessage = `Client-side Error: ${error.error.message}`;
    } else {
      // Backend error (server-side error)
      if (typeof error.error === 'string') {
        errorMessage = error.error; // If the backend sends a simple string error
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message; // If the backend sends an object with a 'message' field
      } else {
        errorMessage = `Server Error (${error.status}): ${error.message || 'Something went wrong on the server.'}`;
      }
    }
    console.error('MarketingReportService error:', errorMessage);
    return throwError(() => new Error(errorMessage)); // Propagate a user-friendly error
  }

  /**
   * Fetches a specific saved marketing report from the local database by its campaign ID.
   * Corresponds to backend GET /api/marketingreports/saved/{campaignId}
   * @param campaignId The ID of the saved marketing report (which is the campaignId).
   * @returns An Observable of MarketingReportResponseDto.
   */
  getSavedMarketingReportById(campaignId: number): Observable<MarketingReportResponseDto> {
    return this.http.get<MarketingReportResponseDto>(`${this.apiBaseUrl}/saved/${campaignId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Fetches all saved marketing reports from the local database.
   * Corresponds to backend GET /api/marketingreports/saved/all
   * @returns An Observable of a list of MarketingReportResponseDto.
   */
  getAllSavedMarketingReports(): Observable<MarketingReportResponseDto[]> {
    return this.http.get<MarketingReportResponseDto[]>(`${this.apiBaseUrl}/saved/all`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Triggers the generation and saving of a new marketing report
   * based on an external campaign ID. This involves fetching data from the external
   * Marketing Module via the backend and persisting it in the local database.
   * Corresponds to backend POST /api/marketingreports/{campaignId}/generate
   * @param campaignId The ID of the marketing campaign from the external module to generate report for.
   * @returns An Observable of the newly generated and saved MarketingReportResponseDto.
   */
  generateMarketingReport(campaignId: number): Observable<MarketingReportResponseDto> {
    // The backend expects a POST to /{campaignId}/generate, typically with an empty body.
    return this.http.post<MarketingReportResponseDto>(`${this.apiBaseUrl}/${campaignId}/generate`, {})
      .pipe(catchError(this.handleError));
  }

  // NOTE: The backend also has endpoints for getting raw external campaign data (getMarketingCampaign, getAllMarketingCampaigns).
  // While not strictly needed for the 'Marketing Reports' UI (which focuses on saved reports and generation),
  // if you ever need to display raw data before saving, you would add these methods:

  /*
  getMarketingCampaignDetails(campaignId: number): Observable<MarketingReportDto> {
    return this.http.get<MarketingReportDto>(`${this.apiBaseUrl}/${campaignId}`)
      .pipe(catchError(this.handleError));
  }

  getAllMarketingCampaignDetails(): Observable<MarketingReportDto[]> {
    return this.http.get<MarketingReportDto[]>(`${this.apiBaseUrl}/all`)
      .pipe(catchError(this.handleError));
  }
  */
}

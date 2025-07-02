import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// DTO representing a Sales Report response from your CRM's local database.
// This DTO directly mirrors the backend's 'com.payload.SalesOpportunityResponseDto'
// which is consistently used by the SalesReportController.
// Note: 'generatedAt' from the backend SalesReport entity is NOT included here
// because the backend's SalesReportController currently exposes 'SalesOpportunityResponseDto'
// which does not contain 'generatedAt'. If your backend changes to include it,
// you would add 'generatedAt: string;' here.
export interface SalesReportResponseDto {
  id: number;          // The ID of the original sales opportunity (also the report's ID)
  name: string;        // Name of the sales opportunity
  stage: string;       // Current stage of the opportunity
  amount: number | null; // Sales amount, can be null
  closeDate: string | null; // LocalDate is usually serialized as 'YYYY-MM-DD' string
  leadSource: string;  // Source of the lead
  notes: string | null; // Additional notes, can be null
}

@Injectable({
  providedIn: 'root'
})
export class SalesReportService {
  // IMPORTANT: Ensure this matches your backend's base URL for Sales Reports.
  // Based on your SalesReportController, it's 'http://localhost:8080/api/salesreports'.
  private apiBaseUrl = 'http://localhost:8065/api/salesreports';

  constructor(private http: HttpClient) { }

  /**
   * Centralized error handling for HTTP requests.
   * Provides a user-friendly error message from HttpErrorResponse.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred in Sales Report Service!';
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
    console.error('SalesReportService error:', errorMessage);
    return throwError(() => new Error(errorMessage)); // Propagate a user-friendly error
  }

  /**
   * Fetches a specific sales report from the local database by its opportunity ID.
   * Corresponds to backend GET /api/salesreports/{opportunityId}
   * @param opportunityId The ID of the sales opportunity to retrieve the report for.
   * @returns An Observable of SalesReportResponseDto.
   */
  getSalesReportById(opportunityId: number): Observable<SalesReportResponseDto> {
    return this.http.get<SalesReportResponseDto>(`${this.apiBaseUrl}/${opportunityId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Fetches and displays all available sales reports from the local database.
   * Corresponds to backend GET /api/salesreports/all
   * @returns An Observable of a list of SalesReportResponseDto.
   */
  getAllSalesReports(): Observable<SalesReportResponseDto[]> {
    return this.http.get<SalesReportResponseDto[]>(`${this.apiBaseUrl}/all`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Triggers the generation and saving of a new sales report for a given opportunity ID.
   * This involves fetching data from the external Sales Opportunity Service via the backend
   * and persisting it in the local database.
   * Corresponds to backend POST /api/salesreports/{opportunityId}/generate
   * @param opportunityId The ID of the sales opportunity from the external module to generate report for.
   * @returns An Observable of the newly generated and saved SalesReportResponseDto.
   */
  generateAndSaveSalesReport(opportunityId: number): Observable<SalesReportResponseDto> {
    // The backend expects a POST to /{opportunityId}/generate, typically with an empty body.
    return this.http.post<SalesReportResponseDto>(`${this.apiBaseUrl}/${opportunityId}/generate`, {})
      .pipe(catchError(this.handleError));
  }
}

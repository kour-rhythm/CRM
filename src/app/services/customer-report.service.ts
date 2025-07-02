import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// DTO for Customer Report (matches backend payload.CustomerReportDto)
// Note: mostRecentOrderDate is string here because backend LocalDateTime typically
// serializes to ISO 8601 strings in JSON.
export interface CustomerReportDto {
  id?: number; // Corresponds to 'id' in backend CustomerReport entity (optional for DTO if not always present)
  customerId: number;
  customerName: string;
  customerEmail: string;
  noOfOrders: number;
  mostRecentOrderDate: string; // Keep as string for ISO date representation
}

@Injectable({
  providedIn: 'root'
})
export class CustomerReportService {
  private apiBaseUrl = 'http://localhost:8065'; // Adjust to your backend's base URL if different
  private reportUrl = `${this.apiBaseUrl}/api/customer`; // Base URL for report endpoints

  constructor(private http: HttpClient) { }

  /**
   * Centralized error handling for HTTP requests.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred in Customer Report Service!';
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
    console.error('CustomerReportService error:', errorMessage);
    return throwError(() => new Error(errorMessage)); // Propagate a user-friendly error
  }

  /**
   * Fetches a single customer report by customer ID.
   * GET /api/customer/{customerId}/report
   * @param customerId The ID of the customer to retrieve the report for.
   * @returns An Observable of CustomerReportDto.
   */
  getCustomerReportById(customerId: number): Observable<CustomerReportDto> {
    return this.http.get<CustomerReportDto>(`${this.reportUrl}/${customerId}/report`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Fetches all customer reports.
   * GET /api/customer/report/all
   * @returns An Observable of a list of CustomerReportDto.
   */
  getAllCustomerReports(): Observable<CustomerReportDto[]> {
    return this.http.get<CustomerReportDto[]>(`${this.reportUrl}/report/all`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Generates and saves a customer report for a given customer ID.
   * POST /api/customer/{customerId}/report/generate
   * @param customerId The ID of the customer for whom to generate the report.
   * @returns An Observable of the generated CustomerReportDto.
   */
  generateCustomerReport(customerId: number): Observable<CustomerReportDto> {
    // The backend endpoint typically expects a POST request, often with an empty body or minimal data.
    // Ensure this aligns with your Spring Boot controller's @RequestBody for this endpoint.
    return this.http.post<CustomerReportDto>(`${this.apiBaseUrl}/api/customer/${customerId}/report/generate`, {})
      .pipe(catchError(this.handleError));
  }
}

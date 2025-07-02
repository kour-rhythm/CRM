import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// DTO for creating/updating (no ID in request)
export interface SalesOpportunityDto {
  name: string;
  stage: string;
  amount: number | null; // Use number | null to handle potential null from form or backend
  closeDate: string | null; // Use string for LocalDate (YYYY-MM-DD)
  leadSource: string;
  notes: string | null; // Use string | null
}

// DTO for responses (includes ID)
export interface SalesOpportunityResponseDto {
  id: number;
  name: string;
  stage: string;
  amount: number | null;
  closeDate: string | null;
  leadSource: string;
  notes: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class SalesOpportunityService {
  private apiUrl = 'http://localhost:8002/api/salesopportunities'; // Your backend API base URL

  constructor(private http: HttpClient) { }

  /**
   * Creates a new sales opportunity.
   * POST /api/salesopportunities
   * @param salesOppDto The sales opportunity data to create.
   * @returns An Observable of the created SalesOpportunityResponseDto.
   */
  createSalesOpportunity(salesOppDto: SalesOpportunityDto): Observable<SalesOpportunityResponseDto> {
    return this.http.post<SalesOpportunityResponseDto>(this.apiUrl, salesOppDto);
  }

  /**
   * Retrieves all sales opportunities.
   * GET /api/salesopportunities
   * @returns An Observable of a list of SalesOpportunityResponseDto.
   */
  getAllSalesOpportunities(): Observable<SalesOpportunityResponseDto[]> {
    return this.http.get<SalesOpportunityResponseDto[]>(this.apiUrl);
  }

  /**
   * Retrieves a sales opportunity by its ID.
   * GET /api/salesopportunities/{id}
   * @param id The ID of the sales opportunity to retrieve.
   * @returns An Observable of SalesOpportunityResponseDto (or null if not found).
   */
  getSalesOpportunityById(id: number): Observable<SalesOpportunityResponseDto | null> {
    return this.http.get<SalesOpportunityResponseDto>(`${this.apiUrl}/${id}`).pipe(
      map(opportunity => opportunity || null) // Ensure null is returned if API returns empty/undefined
    );
  }

  /**
   * Updates an existing sales opportunity.
   * PUT /api/salesopportunities/{id}
   * @param id The ID of the sales opportunity to update.
   * @param salesOppDto The updated sales opportunity data.
   * @returns An Observable of the updated SalesOpportunityResponseDto.
   */
  updateSalesOpportunity(id: number, salesOppDto: SalesOpportunityDto): Observable<SalesOpportunityResponseDto> {
    return this.http.put<SalesOpportunityResponseDto>(`${this.apiUrl}/${id}`, salesOppDto);
  }

  /**
   * Deletes a sales opportunity by its ID.
   * DELETE /api/salesopportunities/{id}
   * @param id The ID of the sales opportunity to delete.
   * @returns An Observable for the completion of the delete operation.
   */
  deleteSalesOpportunity(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Tracks an activity for a sales opportunity.
   * POST /api/salesopportunities/{id}/track-activity
   * @param opportunityId The ID of the sales opportunity.
   * @param activityDetails The details of the activity to track.
   * @returns An Observable of a string response from the backend.
   */
  trackActivity(opportunityId: number, activityDetails: string): Observable<string> {
    // Backend expects a raw string in the request body
    return this.http.post(`${this.apiUrl}/${opportunityId}/track-activity`, activityDetails, { responseType: 'text' });
  }
}

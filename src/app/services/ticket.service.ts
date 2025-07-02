import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Enum for TicketStatus (matching backend)
export enum TicketStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

// DTO for requests/responses (matching backend payload.TicketDto)
export interface TicketDto {
  id?: number; // Optional for creation
  issue: string;
  customerId: number;
  productId: number;
  status?: TicketStatus; // Optional for creation, backend sets default
  assignedAgentId?: number | null;
  assignedAgentName?: string | null;
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = 'http://localhost:8003/api/tickets'; // Base URL for Ticket APIs
  private apiCustomerProductsUrl = 'http://localhost:8001/api/customers'; // For customer/product validation

  constructor(private http: HttpClient) { }

  /**
   * Creates a new ticket for a specific customer and product.
   * POST /api/customers/{customerId}/products/{productId}/tickets
   * @param customerId The ID of the customer associated with the ticket.
   * @param productId The ID of the product associated with the ticket.
   * @param ticketDto The ticket data to create (issue, customerId, productId).
   * @returns An Observable of the created TicketDto.
   */
  createTicket(customerId: number, productId: number, ticketDto: TicketDto): Observable<TicketDto> {
    return this.http.post<TicketDto>(`${this.apiCustomerProductsUrl}/${customerId}/products/${productId}/tickets`, ticketDto);
  }

  /**
   * Retrieves all tickets from the system.
   * GET /api/tickets
   * @returns An Observable of a list of TicketDto objects.
   */
  getAllTickets(): Observable<TicketDto[]> {
    return this.http.get<TicketDto[]>(this.apiUrl);
  }

  /**
   * Retrieves a ticket by its ID.
   * GET /api/tickets/{ticketId}
   * @param ticketId The ID of the ticket to retrieve.
   * @returns An Observable of TicketDto (or null if not found).
   */
  getTicketById(ticketId: number): Observable<TicketDto | null> {
    return this.http.get<TicketDto>(`${this.apiUrl}/${ticketId}`).pipe(
      map(ticket => ticket || null) // Backend returns a single TicketDto or 404
    );
  }

  /**
   * Retrieves tickets associated with a specific customer ID.
   * GET /api/customers/{customerId}/tickets
   * @param customerId The ID of the customer.
   * @returns An Observable of a list of TicketDto objects.
   */
  getTicketsByCustomerId(customerId: number): Observable<TicketDto[]> {
    return this.http.get<TicketDto[]>(`${this.apiCustomerProductsUrl}/${customerId}/tickets`);
  }

  /**
   * Retrieves tickets assigned to a specific agent ID.
   * GET /api/agents/{agentId}/tickets
   * @param agentId The ID of the agent.
   * @returns An Observable of a list of TicketDto objects.
   */
  getTicketsByAgentId(agentId: number): Observable<TicketDto[]> {
    // Note: Your backend /api/agents/{agentId}/tickets implies an Agent module/service.
    // Ensure this path is correct if your Agent service is separate or integrated.
    // For now, assume it's directly under /api.
    return this.http.get<TicketDto[]>(`${this.apiCustomerProductsUrl.replace('customers', 'agents')}/${agentId}/tickets`);
  }

  /**
   * Updates the status of a specific ticket.
   * PUT /api/tickets/{ticketId}/status?newStatus={newStatus}
   * @param ticketId The ID of the ticket to update.
   * @param newStatus The new status for the ticket (e.g., 'RESOLVED', 'CLOSED').
   * @returns An Observable of the updated TicketDto.
   */
  updateTicketStatus(ticketId: number, newStatus: string): Observable<TicketDto> {
    const params = new HttpParams().set('newStatus', newStatus);
    return this.http.put<TicketDto>(`${this.apiUrl}/${ticketId}/status`, null, { params });
  }

  /**
   * Assigns an agent to a specific ticket.
   * PUT /api/tickets/{ticketId}/assign-agent/{agentId}
   * @param ticketId The ID of the ticket.
   * @param agentId The ID of the agent to assign.
   * @returns An Observable of the updated TicketDto.
   */
  assignAgentToTicket(ticketId: number, agentId: number): Observable<TicketDto> {
    return this.http.put<TicketDto>(`${this.apiUrl}/${ticketId}/assign-agent/${agentId}`, null);
  }

  /**
   * Deletes a ticket by its ID.
   * DELETE /api/tickets/{ticketId}
   * @param ticketId The ID of the ticket to delete.
   * @returns An Observable for the completion of the delete operation.
   */
  deleteTicket(ticketId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${ticketId}`);
  }

  /**
   * Fetches the count of tickets for a specific customer.
   * GET /api/customers/{customerId}/ticket-count
   * @param customerId The ID of the customer.
   * @returns An Observable of the ticket count.
   */
  getTicketCountByCustomerId(customerId: number): Observable<number> {
    return this.http.get<number>(`${this.apiCustomerProductsUrl}/${customerId}/ticket-count`);
  }
}

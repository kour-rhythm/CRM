import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // <<< This import IS NECESSARY here for the map operator

// Define interfaces to match your DTOs
export interface CustomerDto {
  id?: number;
  name: string;
  mobileNo: string;
  emailId: string;
  noOfOrders: number;
}

export interface CustomerResponse {
  content: CustomerDto[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = 'http://localhost:8001/api/customers'; // Your backend API base URL

  constructor(private http: HttpClient) { }

  /**
   * Creates a new customer.
   * @param customerDto The customer data to create.
   * @returns An Observable of the created CustomerDto.
   */
  createCustomer(customerDto: CustomerDto): Observable<CustomerDto> {
    return this.http.post<CustomerDto>(this.apiUrl, customerDto);
  }

  /**
   * Fetches all customers with pagination and sorting.
   * @param pageNo Page number (0-indexed).
   * @param pageSize Number of items per page.
   * @param sortBy Field to sort by.
   * @param sortDir Sort direction (asc or desc).
   * @returns An Observable of CustomerResponse.
   */
  getAllCustomers(
    pageNo: number = 0,
    pageSize: number = 100, // Increased default page size for dropdown population
    sortBy: string = 'id',
    sortDir: string = 'asc'
  ): Observable<CustomerResponse> {
    let params = new HttpParams()
      .set('pageNo', pageNo.toString())
      .set('pageSize', pageSize.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);
    return this.http.get<CustomerResponse>(this.apiUrl, { params });
  }

  /**
   * Fetches a specific customer by ID.
   * It uses the backend's `getCustomersByIds` endpoint by passing a single ID in a list.
   * @param id The ID of the customer to fetch.
   * @returns An Observable of CustomerDto (or null if not found).
   */
  getCustomerById(id: number): Observable<CustomerDto | null> { // Explicitly allow null
    let params = new HttpParams().set('ids', id.toString());
    // The backend returns List<CustomerDto>, so we'll expect an array and take the first one
    return this.http.get<CustomerDto[]>(`${this.apiUrl}/by-ids`, { params }).pipe(
      // Map the response to return only the first CustomerDto or null if not found
      map(customers => customers.length > 0 ? customers[0] : null)
    ); // No need for explicit 'as Observable<CustomerDto>' cast if type is inferred correctly
  }

  // You would also add updateCustomer and deleteCustomer methods here if needed
}

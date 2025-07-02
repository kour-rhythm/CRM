import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // Import map operator for RxJS pipe

// Interfaces matching your backend DTOs
export interface ProductDto {
  id?: number;
  productName: string;
  productBrandName: string;
  productBrandDescription: string;
  productPrice: number;
  productReviewOutOfFive: number;
}

export interface ProductResponse {
  content: ProductDto[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8001/api'; // Base URL for product APIs

  constructor(private http: HttpClient) { }

  /**
   * Creates a new product for a specific customer.
   * POST /api/customers/{customerId}/products
   * @param customerId The ID of the customer the product belongs to.
   * @param productDto The product data to create.
   * @returns An Observable of the created ProductDto.
   */
  createProduct(customerId: number, productDto: ProductDto): Observable<ProductDto> {
    return this.http.post<ProductDto>(`${this.apiUrl}/customers/${customerId}/products`, productDto);
  }

  /**
   * Fetches all products with pagination and sorting.
   * GET /api/products
   * @param pageNo Page number (0-indexed).
   * @param pageSize Number of items per page.
   * @param sortBy Field to sort by.
   * @param sortDir Sort direction (asc or desc).
   * @returns An Observable of ProductResponse.
   */
  getAllProducts(
    pageNo: number = 0,
    pageSize: number = 10,
    sortBy: string = 'id',
    sortDir: string = 'asc'
  ): Observable<ProductResponse> {
    let params = new HttpParams()
      .set('pageNo', pageNo.toString())
      .set('pageSize', pageSize.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);
    return this.http.get<ProductResponse>(`${this.apiUrl}/products`, { params });
  }

  /**
   * Fetches a single product by its ID.
   * GET /api/products/{id}
   * @param productId The ID of the product to fetch.
   * @returns An Observable of ProductDto (or null if not found).
   */
  getProductById(productId: number): Observable<ProductDto | null> {
    return this.http.get<ProductDto>(`${this.apiUrl}/products/${productId}`).pipe(
      map(product => product || null) // Ensure null is returned if API returns empty/undefined
    );
  }

  // Note: Your backend also has getProductsByCustomerId and getProductByCustomerId endpoints.
  // We'll focus on getAllProducts and getProductById for the initial UI.
  // If you need UI for products specific to a customer, we can add that later.
}

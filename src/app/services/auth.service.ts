import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http'; // Corrected the typo 'm HttpErrorResponse'
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8001';
  private _isLoggedIn: boolean = false; // Default to false
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Initialize authentication status ONLY if in a browser environment
    if (this.isBrowser) {
      this._isLoggedIn = !!localStorage.getItem('authToken');
    }
  }

  /**
   * Centralized error handling for HTTP requests in AuthService.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown authentication error occurred!';
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
    console.error('AuthService error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Checks if the user is currently authenticated.
   * This method now solely relies on the internal `_isLoggedIn` flag,
   * which is safely initialized based on the platform.
   * @returns A boolean indicating the authentication status.
   */
  isAuthenticated(): boolean {
    return this._isLoggedIn;
  }

  /**
   * Sends a login request to the backend authentication endpoint.
   * On successful login, it updates the authentication state and stores a flag in localStorage.
   * @param loginDto An object containing usernameOrEmail and password.
   * @returns An Observable that emits the backend's response (a string in this case).
   */
  login(loginDto: any): Observable<string> {
    return this.http.post(`${this.apiUrl}/api/auth/login`, loginDto, { responseType: 'text' })
      .pipe(
        tap(response => {
          this._isLoggedIn = true; // Set the in-memory flag
          if (this.isBrowser) { // Only use localStorage if in a browser
            // Store a simple boolean flag or string instead of a token
            localStorage.setItem('authToken', 'true');
          }
          console.log('Login successful:', response);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Sends a registration request to the backend authentication endpoint.
   * @param registerDto An object containing name, username, email, and password.
   * @returns An Observable that emits the backend's response (a string in this case).
   */
  register(registerDto: any): Observable<string> {
    return this.http.post(`${this.apiUrl}/api/auth/register`, registerDto, { responseType: 'text' })
      .pipe(
        tap(response => {
          console.log('Registration successful:', response);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Logs out the current user by clearing the authentication state.
   * This method should be called when the user explicitly logs out.
   */
  logout(): void {
    this._isLoggedIn = false; // Clear the in-memory flag
    if (this.isBrowser) { // Only clear localStorage if in a browser
      localStorage.removeItem('authToken'); // Remove the token from localStorage
    }
    console.log('User logged out. Auth token removed.');
  }
}

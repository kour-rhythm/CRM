//this is my login to dashboard access denied feature 
//this is like going to dashboard withour logging in 
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service'; // Import your AuthService

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.authService.isAuthenticated()) {
      // If the user is authenticated, allow activation of the route
      return true;
    } else {
      // If not authenticated, redirect them to the unauthorized page
      // And return a UrlTree to tell Angular to navigate
      return this.router.createUrlTree(['/unauthorized']);
    }
  }
}

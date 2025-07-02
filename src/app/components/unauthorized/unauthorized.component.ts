import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // Import Router and RouterModule

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule // Needed for routerLink in the template
  ],
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.css']
})
export class UnauthorizedComponent {

  constructor(private router: Router) { }

  /**
   * Redirects the user to the login page.
   */
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}

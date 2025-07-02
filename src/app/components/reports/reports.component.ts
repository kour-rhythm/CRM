import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; // For routerLink and programmatic navigation

@Component({
  selector: 'app-pre-reports', // Renamed selector
  standalone: true,
  imports: [
    CommonModule,
    RouterModule // For routerLink in the header and navigation buttons
  ],
  templateUrl: './reports.component.html', // Renamed template file
  styleUrls: ['./reports.component.css'] // Renamed style file
})
export class ReportsComponent { // Renamed class

  constructor(private router: Router) { }

  /**
   * Handles the logout action, navigating to the login page.
   */
  logout(): void {
    console.log('Logging out from Pre-Reports...');
    this.router.navigate(['/login']);
  }

  // No specific report generation logic here, just navigation
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // For routerLink

@Component({
  selector: 'app-marketing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './marketing.component.html',
  styleUrls: ['./marketing.component.css']
})
export class MarketingComponent {
  // Simple component to act as a landing page for marketing sub-modules.
  // No specific logic needed here beyond navigation.
}

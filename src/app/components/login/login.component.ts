import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginData = {
    usernameOrEmail: '',
    password: ''
  };
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false; // Add isLoading property

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    // No specific initialization logic needed here for now.
  }

  onSubmit(loginForm: NgForm): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true; // Set loading to true on submission

    if (loginForm.valid) {
      this.authService.login(this.loginData).subscribe({
        next: response => {
          this.successMessage = response;
          this.errorMessage = '';
          loginForm.resetForm();
          this.isLoading = false; // Set loading to false on success
          this.router.navigate(['/dashboard']);
        },
        error: err => {
          this.errorMessage = err.message || 'Login failed. Please try again.';
          this.successMessage = '';
          this.isLoading = false; // Set loading to false on error
          console.error('Login error:', err);
        }
      });
    } else {
      this.errorMessage = 'Please fill in all required fields.';
      this.isLoading = false; // Set loading to false if form is invalid
    }
  }
}

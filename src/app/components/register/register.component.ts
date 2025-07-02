import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerData = {
    name: '',
    username: '',
    email: '',
    password: ''
  };
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false; // Add isLoading property

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    // No specific initialization logic needed here for now.
  }

  onSubmit(registerForm: NgForm): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true; // Set loading to true on submission

    if (registerForm.valid) {
      this.authService.register(this.registerData).subscribe({
        next: response => {
          this.successMessage = response;
          this.errorMessage = '';
          registerForm.resetForm();
          this.isLoading = false; // Set loading to false on success
          this.router.navigate(['/login']);
        },
        error: err => {
          this.errorMessage = err.message || 'Registration failed. Please try again.';
          this.successMessage = '';
          this.isLoading = false; // Set loading to false on error
          console.error('Registration error:', err);
        }
      });
    } else {
      this.errorMessage = 'Please fill in all required fields and ensure they are valid.';
      this.isLoading = false; // Set loading to false if form is invalid
    }
  }
}

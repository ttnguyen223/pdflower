import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  email = '';
  password = '';
  passwordConfirm = '';
  errorMessage: string | null = null;
  successMessage: string | null = null;
  inputsDisabled = false;
  passwordMismatchError: string | null = null;

  constructor(private authService: AuthService, private router: Router) { 
  }

  checkPasswordMatch(): void {
    if (this.password && this.passwordConfirm && this.password !== this.passwordConfirm) {
      this.passwordMismatchError = 'Passwords do not match.';
    } else {
      this.passwordMismatchError = null; 
    }
  }

  async onSubmit() {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.password !== this.passwordConfirm) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    try {
      await this.authService.signUp(this.email, this.password);
      
      // On success:
      this.successMessage = 'Account created successfully! Proceed to login.';
      this.inputsDisabled = true;

    } catch (error: any) {
      // On error:
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        this.errorMessage = 'The email address is already in use by another account.';
      } else if (error.code === 'auth/invalid-email') {
        this.errorMessage = 'The email address format is invalid.';
      } else if (error.code === 'auth/weak-password') {
        this.errorMessage = 'The password is too weak. Please use at least 6 characters.';
      } else {
        this.errorMessage = 'An unexpected error occurred. Please try again.';
      }
    }
  }
}

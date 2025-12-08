import { Component, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MessageDialog } from '../../dialogs/message-dialog/message-dialog';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  errorMessage: string | null = null;
  private dialog = inject(MatDialog);

  constructor(private authService: AuthService, private router: Router) { }

  async onSubmit() {
    this.errorMessage = null; // Clear previous errors
    try {
      await this.authService.signIn(this.email, this.password);
      this.router.navigate(['/']);
    } catch (error: any) {
      // Handle and display the specific Firebase error
      console.error(error);
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          this.errorMessage = 'Incorrect username or password. Please check your details.';
          break;
        case 'auth/invalid-email':
          this.errorMessage = 'The email address format is invalid.';
          break;
        case 'auth/too-many-requests':
          this.errorMessage = 'Too many login attempts. Please try again later.';
          break;
        default:
          this.errorMessage = 'An unexpected error occurred during login. Please try again.';
      }
    }
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  async onForgotPassword(event: Event): Promise<void> {
    event.preventDefault();
    this.errorMessage = null;
    // Check if the user entered an email address in the email input
    if (!this.email) {
      this.errorMessage = "Please enter your email address to reset your password.";
      return;
    }

    try {
      await this.authService.resetPassword(this.email);
      this.dialog.open(MessageDialog, {
        data: {
          title: 'Password Reset Sent',
          message: 'If this email address is registered with us, you will receive a password reset link shortly. Please check your inbox.'
        }
      });
    } catch (error: any) {
       console.error(error);
       if (error.code === 'auth/user-not-found') {
           this.errorMessage = 'No account found with that email address.';
       } else {
           this.errorMessage = 'Could not send reset email. Please try again.';
       }
    }
  }
}

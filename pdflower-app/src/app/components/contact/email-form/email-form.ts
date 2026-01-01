import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-email-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule
  ],
  templateUrl: './email-form.html',
  styleUrls: ['./email-form.css']
})
export class EmailFormComponent {
  contactForm: FormGroup;
  targetEmail = 'ttnguyen223@gmail.com';

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      senderEmail: ['', [Validators.required, Validators.email]], // Sender's email validation
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      const { senderEmail, subject, message } = this.contactForm.value;
      
      // Constructing mailto link with encoded parameters
      const mailtoLink = `mailto:${this.targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        `From: ${senderEmail}\n\n${message}`
      )}`;
      
      window.location.href = mailtoLink;
    }
  }
}

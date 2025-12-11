import { Component, Inject, inject, signal } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';

export interface FilterDialogData {
  allCategories: string[];
  selectedCategories: string[];
}

@Component({
  selector: 'app-filter-dialog',
  standalone: true,
  imports: [
    MatDialogModule, MatButtonModule, MatCheckboxModule, 
    FormsModule, CommonModule, MatFormFieldModule, MatListModule
  ],
  templateUrl: './filter-dialog.html',
  styleUrl: './filter-dialog.css',
})

export class FilterDialog {
  localSelectedCategories: string[];

  constructor(
    public dialogRef: MatDialogRef<FilterDialog>,
    @Inject(MAT_DIALOG_DATA) public data: FilterDialogData
  ) {
    this.localSelectedCategories = [...data.selectedCategories];
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onClear(): void {
    this.localSelectedCategories = [];
  }
}

import { Component, Inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

// Updated interface to include categoryCounts
export interface FilterDialogData {
  allCategories: string[];
  selectedCategories: string[];
  categoryCounts: Record<string, number>; // Maps category name to product count
}

@Component({
  selector: 'app-filter-dialog',
  templateUrl: './filter-dialog.html',
  styleUrl: './filter-dialog.css',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule
  ],
})
export class FilterDialog {
  // Use a local signal to manage selections within the dialog session
  localSelectedCategories = signal<string[]>([]);

  constructor(
    public dialogRef: MatDialogRef<FilterDialog>,
    @Inject(MAT_DIALOG_DATA) public data: FilterDialogData
  ) {
    // Initialize the local selection state with whatever was passed in
    this.localSelectedCategories.set([...data.selectedCategories]);
  }

  onCancel(): void {
    // Close the dialog without passing back any data
    this.dialogRef.close();
  }

  onApply(): void {
    // Close the dialog and pass the locally selected categories back
    this.dialogRef.close(this.localSelectedCategories());
  }

  // Helper function to check if a checkbox should be checked
  isSelected(category: string): boolean {
    return this.localSelectedCategories().includes(category);
  }

  toggleSelection(category: string, event: MatCheckboxChange): void {
    const isChecked = event.checked; 
    this.localSelectedCategories.update(currentFilters => {
      if (isChecked) {
        if (!currentFilters.includes(category)) {
            return [...currentFilters, category];
        }
      } else {
        return currentFilters.filter(filter => filter !== category);
      }
      return currentFilters;
    });
  }
}

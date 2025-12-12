import { Component, Inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Interface defining the shape of data passed into and out of the dialog
export interface FilterDialogData {
  allCategories: string[];
  selectedCategories: string[];
}

@Component({
  selector: 'app-filter-dialog',
  templateUrl: './filter-dialog.html',
  styleUrl: './filter-dialog.css',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,          // Needed for ngModel binding on checkboxes
    MatDialogModule,      // Provides dialog structure components
    MatButtonModule,      // Material buttons
    MatCheckboxModule     // Material checkboxes
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
    // Close the dialog without passing back any data (undefined or null)
    this.dialogRef.close();
  }

  onApply(): void {
    // Close the dialog and pass the locally selected categories back to the parent component
    this.dialogRef.close(this.localSelectedCategories());
  }

  // Helper function to check if a checkbox should be checked
  isSelected(category: string): boolean {
    return this.localSelectedCategories().includes(category);
  }

  toggleSelection(category: string, event: MatCheckboxChange): void {
    const isChecked = event.checked; // Access 'checked' directly from the event object
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

import { Component, Inject, inject, LOCALE_ID } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model'
import { Category } from '../../../models/category.model';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { Observable } from 'rxjs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-product-form-modal',
  standalone: true,
  imports: [MatDialogModule, ReactiveFormsModule, MatInputModule, MatButtonModule, CommonModule,
    MatIconModule,
    MatRadioModule,
    MatCheckboxModule,
    MatCardModule,
    MatTooltipModule
  ],
  templateUrl: './product-form-modal.html',
  styleUrl: './product-form-modal.css',
  providers: [{ provide: LOCALE_ID, useValue: 'vi-VN' }] 
})
export class ProductFormModal {
  form: FormGroup;
  private productService = inject(ProductService);
  errorMessage: string | null = null;
  categories$: Observable<Category[]>;
  public sortedImagePreviews: { url: string; isMain: boolean; }[] = [];

  // Inject the dialog reference and the data passed in (the product if editing)
  constructor(
    public dialogRef: MatDialogRef<ProductFormModal>,
    @Inject(MAT_DIALOG_DATA) public data: Product | undefined,
    private fb: FormBuilder
  ) {
    this.categories$ = this.productService.getCategories();

    // Build the form with validators
    this.form = this.fb.group({
      name: [data?.name || '', Validators.required],
      price: [this.formatVndPrice(data?.price) || '', Validators.required],
      description: [data?.description || ''], 
      quantity: [data?.quantity || 0, [Validators.required, Validators.min(0)]],
      categories: this.fb.array(data?.categories || [], Validators.required),
      id: [data?.id || null],
      imageUrls: this.fb.array([]) // This array holds groups of { url: '', isMain: boolean }
    });

    // Populate existing images from `data`, prioritizing the existing main image flag.
    if (data?.imageUrls && data.imageUrls.length > 0) {
      data.imageUrls.forEach(url => this.addImageUrlGroup(url, data.mainImageUrl === url));
    } else {
      // Always start with at least one empty input field
      this.addImageUrlGroup();
    }

    this.imageUrlsArray.valueChanges.subscribe(() => {
        this.sortImageUrls();
    });

    this.sortImageUrls();
  }

   trackByIndex(index: number): number {
    return index;
  }

  sortImageUrls(): void {
    const currentUrls = this.imageUrlsArray.value;
    // Filter out invalid URLs for display purposes
    const validUrls = currentUrls.filter((item: any) => item.url && item.url.startsWith('http'));
    
    this.sortedImagePreviews = [...validUrls].sort((a, b) => {
        // Sort function: if 'a' is main, it comes first (-1). If 'b' is main, it comes first (1).
        if (a.isMain && !b.isMain) return -1;
        if (!a.isMain && b.isMain) return 1;
        return 0; // Maintain original order otherwise
    });
  }
  // --- Image URL FormArray Management ---

  get imageUrlsArray(): FormArray {
    return this.form.get('imageUrls') as FormArray;
  }

  private createImageUrlGroup(url: string = '', isMain: boolean = false): FormGroup {
    return this.fb.group({
      url: [url, [Validators.required, Validators.pattern('https?://.*')]], // Basic URL validation
      isMain: [isMain] 
    });
  }

  addImageUrlGroup(url: string = '', isMain: boolean = false): void {
    // If adding a new empty row, and it's the first one, default it to main.
    if (this.imageUrlsArray.length === 0) {
        isMain = true;
    }
    this.imageUrlsArray.push(this.createImageUrlGroup(url, isMain));
  }

  removeImageUrlGroup(index: number): void {
    const wasMain = this.imageUrlsArray.at(index).get('isMain')?.value;
    
    this.imageUrlsArray.removeAt(index);

    // CRITICAL CHANGE: We no longer force a new empty input if the array is empty.
    // The user can submit with 0 or 1 input box visible (but 'onSave' ensures > 0 valid URLs exist).

    // If the removed item was the main image, make the *new* first item the main one automatically.
    if (wasMain && this.imageUrlsArray.length > 0) {
        this.imageUrlsArray.at(0).get('isMain')?.setValue(true);
    }
    // sortImageUrls() is called via valueChanges subscription
  }

  setMainImage(index: number): void {
    // Unset all others first
    this.imageUrlsArray.controls.forEach((control, i) => {
      control.get('isMain')?.setValue(i === index);
    });
  }

  // --- Price Formatting Logic ---

  private formatVndPrice(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(value)) return '';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
  }

  private parseVndPrice(formattedValue: string): number {
    const numericString = formattedValue.replace(/[^\d]/g, '');
    return parseInt(numericString, 10) || 0;
  }

  onPriceInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const rawValue = inputElement.value;
    const numericValue = this.parseVndPrice(rawValue);
    const formattedValue = this.formatVndPrice(numericValue);
    this.form.controls['price'].setValue(formattedValue, { emitEvent: false });
  }
  
  // --- Category Management ---

  get categoriesFormArray(): FormArray {
    return this.form.get('categories') as FormArray;
  }

  onCategoryChange(event: any): void {
    const categoriesArray = this.categoriesFormArray;
    if (event.checked) {
      categoriesArray.push(new FormControl(event.source.value));
    } else {
      const index = categoriesArray.controls.findIndex(ctrl => ctrl.value === event.source.value);
      if (index !== -1) {
        categoriesArray.removeAt(index);
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close(); 
  }

  // --- Save Logic ---
  
  async onSave(): Promise<void> {
    this.errorMessage = null;

    if (!this.form.valid) {
      this.errorMessage = "Vui lòng kiểm tra lại tất cả các trường bị lỗi.";
      this.form.markAllAsTouched();
      return; 
    }
    
    const formValue = this.form.value;
    const urls: string[] = formValue.imageUrls
      .map((item: { url: string, isMain: boolean }) => item.url)
      .filter((url: string | null | undefined) => !!url && url.startsWith('http'));

    if (urls.length === 0) {
      this.errorMessage = "Sản phẩm phải có ít nhất một hình ảnh URL hợp lệ.";
      return;
    }

    const mainImageItem = formValue.imageUrls.find((item: { url: string, isMain: boolean }) => item.isMain);
    const mainImageUrl: string = mainImageItem?.url || urls[0];
    
    const priceInNumber = this.parseVndPrice(formValue.price);

    // Start with a base object that includes all form values
    const productData: Partial<Product> = {
        ...formValue,
        price: priceInNumber,
        imageUrls: urls,
        mainImageUrl: mainImageUrl,
    };

    try {
      if (productData.id) {
        // If we have an ID (editing an existing product), update it.
        await this.productService.updateProduct(productData as Product);
      } else {
        // If we don't have an ID (new product), prepare the data *without* the null ID field.

        // Create a copy and delete the 'id' key explicitly before sending to addDoc
        const dataWithoutId = { ...productData };
        delete dataWithoutId.id; 
        
        await this.productService.addProduct(dataWithoutId as Omit<Product, 'id'>);
      }
      this.dialogRef.close(true); 
      
    } catch (error: any) {
      console.error("Save failed", error);
      this.errorMessage = "Failed to save product: " + (error.message || "An unexpected error occurred.");
    }
  }
}

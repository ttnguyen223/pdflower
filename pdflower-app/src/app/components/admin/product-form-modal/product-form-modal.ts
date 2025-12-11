import { Component, Inject, inject, LOCALE_ID, ViewChild, ElementRef } from '@angular/core';
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
import { CloudinaryService } from '../../../services/cloudinary.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-product-form-modal',
  standalone: true,
  imports: [MatDialogModule, ReactiveFormsModule, MatInputModule, MatButtonModule, CommonModule,
    MatIconModule,
    MatRadioModule,
    MatCheckboxModule,
    MatCardModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './product-form-modal.html',
  styleUrl: './product-form-modal.css',
  providers: [{ provide: LOCALE_ID, useValue: 'vi-VN' }] 
})
export class ProductFormModal {
  form: FormGroup;
  private productService = inject(ProductService);
  private cloudinaryService = inject(CloudinaryService);

  errorMessage: string | null = null;
  categories$: Observable<Category[]>;
  
  localImagePreviews: string[] = [];
  isUploading = false;
  selectedFiles: File[] = [];
  public sortedImagePreviews: { url: string; isMain: boolean; }[] = [];
  @ViewChild('fileInput') fileInput!: ElementRef;

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
      imageUrls: this.fb.array([]) // Array of {url: string, isMain: boolean} groups
    });

    if (data?.imageUrls && data.imageUrls.length > 0) {
      data.imageUrls.forEach(url => this.addImageUrlGroup(url, data.mainImageUrl === url));
    } else {
      // Start with one input field if you reintroduce the manual URL input later.
      // For pure file upload interface, no initial "box" is necessary, just the dropzone.
    }
    
    this.imageUrlsArray.valueChanges.subscribe(() => {
        this.sortImageUrls();
    });
    this.sortImageUrls();
  }

  // --- File Upload Handlers (Re-implemented for Drag & Drop and Cloudinary) ---

  onDragOver(event: Event): void { event.preventDefault(); }
  onDragLeave(event: Event): void { event.preventDefault(); }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      this.selectedFiles = Array.from(event.dataTransfer.files);
      this.generateLocalPreviews();
    }
  }

  onFileSelected(event: any): void {
    this.errorMessage = null;
    this.selectedFiles = Array.from(event.target.files);
    this.generateLocalPreviews();
  }

  clearSelectedFiles(): void {
    this.selectedFiles = [];
    this.localImagePreviews.forEach(url => URL.revokeObjectURL(url));
    this.localImagePreviews = [];
    if (this.fileInput) { this.fileInput.nativeElement.value = null; }
  }

  private generateLocalPreviews(): void {
    this.localImagePreviews.forEach(url => URL.revokeObjectURL(url));
    this.localImagePreviews = [];
    for (const file of this.selectedFiles) {
      this.localImagePreviews.push(URL.createObjectURL(file));
    }
  }

  removeSelectedFile(index: number): void {
    URL.revokeObjectURL(this.localImagePreviews[index]);
    this.selectedFiles.splice(index, 1);
    this.localImagePreviews.splice(index, 1);
    if (this.selectedFiles.length === 0 && this.fileInput) {
      this.fileInput.nativeElement.value = null;
    }
  }

   trackByIndex(index: number): number {
    return index;
  }

  sortImageUrls(): void {
    const currentUrls = this.imageUrlsArray.value;
    const validUrls = currentUrls.filter((item: any) => item.url && item.url.startsWith('http'));
    
    this.sortedImagePreviews = [...validUrls].sort((a, b) => {
        if (a.isMain && !b.isMain) return -1;
        if (!a.isMain && b.isMain) return 1;
        return 0;
    });
  }
  // --- Image URL FormArray Management ---

  get imageUrlsArray(): FormArray {
    return this.form.get('imageUrls') as FormArray;
  }

  private createImageUrlGroup(url: string = '', isMain: boolean = false): FormGroup {
    return this.fb.group({
      url: [url, [Validators.required, Validators.pattern('https?://.*')]],
      isMain: [isMain] 
    });
  }

  addImageUrlGroup(url: string, isMain: boolean = false): void {
    // If we are adding the very first URL, mark it as main automatically
    if (this.imageUrlsArray.length === 0) {
        isMain = true;
    }
    this.imageUrlsArray.push(this.createImageUrlGroup(url, isMain));
  }

  removeImageUrlGroup(index: number): void {
    const wasMain = this.imageUrlsArray.at(index).get('isMain')?.value;
    this.imageUrlsArray.removeAt(index);
    
    // If the removed item was the main image and others exist, assign a new main
    if (wasMain && this.imageUrlsArray.length > 0) {
        this.imageUrlsArray.at(0).get('isMain')?.setValue(true);
    }
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
    
    // START STEP 1: UPLOAD SELECTED FILES
    if (this.selectedFiles.length > 0) {
        this.isUploading = true;
        try {
            const uploadPromises = this.selectedFiles.map(file => 
                this.cloudinaryService.uploadImage(file)
            );
            const urls: string[] = await Promise.all(uploadPromises);
            
            // Add the new URLs to the form array before proceeding to save the product data
            urls.forEach(url => this.addImageUrlGroup(url, false)); 
            this.clearSelectedFiles(); // Clear the local file list
            
        } catch (error: any) {
            this.errorMessage = "Tải lên hình ảnh thất bại. " + (error.message || "Vui lòng thử lại.");
            this.isUploading = false;
            return; // Stop the save process if upload fails
        }
        this.isUploading = false;
    }
    // END STEP 1

    // START STEP 2: CONSTRUCT AND SAVE PRODUCT DATA TO FIRESTORE

    if (this.imageUrlsArray.length === 0) {
        this.errorMessage = "Sản phẩm phải có ít nhất một hình ảnh.";
        return;
    }

    const formValue = this.form.value;
    const urls: string[] = formValue.imageUrls
      .map((item: { url: string, isMain: boolean }) => item.url)
      .filter((url: string | null | undefined) => !!url && url.startsWith('http'));

    const mainImageItem = formValue.imageUrls.find((item: { url: string, isMain: boolean }) => item.isMain);
    const mainImageUrl: string = mainImageItem?.url || urls;
    
    const priceInNumber = this.parseVndPrice(formValue.price);

    const productData: Partial<Product> = {
        ...formValue,
        price: priceInNumber,
        imageUrls: urls,
        mainImageUrl: mainImageUrl,
    };

    try {
      if (productData.id) {
        await this.productService.updateProduct(productData as Product);
      } else {
        const dataWithoutId = { ...productData };
        delete dataWithoutId.id; 
        await this.productService.addProduct(dataWithoutId as Omit<Product, 'id'>);
      }
      this.dialogRef.close(true); 
      
    } catch (error: any) {
      console.error("Save failed", error);
      this.errorMessage = "Lưu sản phẩm thất bại: " + (error.message || "Đã xảy ra lỗi không mong muốn.");
    }
  }
}

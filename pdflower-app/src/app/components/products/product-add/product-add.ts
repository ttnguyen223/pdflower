import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { FileUrlPipe } from '../../../utilities/file-url-pipe'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-product-add',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FileUrlPipe,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './product-add.html',
  styleUrl: './product-add.css',
})
export class ProductAdd {
  private storage: Storage = inject(Storage);
  private firestore: Firestore = inject(Firestore);
  private fb: FormBuilder = inject(FormBuilder);
  
  productForm: FormGroup;
  files: File[] = [];
  uploadedImageUrls: string[] = [];
  mainImageUrl: string = '';
  isUploading: boolean = false;
  
  availableCategories: string[] = ["KỆ HOA CHIA BUỒN", "HOA BÓ", "HOA HỘP"];

  constructor() {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      quantity: [0, [Validators.required, Validators.min(0)]],
      isActive: [true], // Default active
      categories: [[] as string[], Validators.required], // Multi-select array
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
        this.files.push(...Array.from(input.files));
    }
  }

  removeFile(index: number): void {
    this.files.splice(index, 1);
  }

  setMainImage(url: string): void {
    this.mainImageUrl = url;
  }

  async onSubmit(): Promise<void> {
    if (this.productForm.invalid || this.files.length === 0) {
      alert('Please fill out all required fields and upload at least one image.');
      return;
    }

    this.isUploading = true;
    const uploadPromises: Promise<string>[] = [];

    for (const file of this.files) {
      const storageRef = ref(this.storage, `product-images/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      const promise = new Promise<string>((resolve, reject) => {
        uploadTask.on('state_changed',
          () => {},
          (error) => reject(error.message),
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then(downloadURL => resolve(downloadURL));
          }
        );
      });
      uploadPromises.push(promise);
    }

    try {
      this.uploadedImageUrls = await Promise.all(uploadPromises);
      if (!this.mainImageUrl && this.uploadedImageUrls.length > 0) {
        this.mainImageUrl = this.uploadedImageUrls[0];
      }
      await this.saveProductToFirestore();
      alert('Product created successfully!');
      this.resetForm();
    } catch (error) {
      console.error("Upload failed", error);
      alert('Image upload failed.');
    } finally {
      this.isUploading = false;
    }
  }

  private async saveProductToFirestore(): Promise<void> {
    const formData = this.productForm.value;
    const productData = {
      ...formData,
      mainImageUrl: this.mainImageUrl,
      imageUrls: this.uploadedImageUrls,
      insertDate: new Date(),
      updateDate: new Date()
    };
    await addDoc(collection(this.firestore, 'products'), productData);
  }

  private resetForm(): void {
    this.productForm.reset({
      name: '', description: '', price: 0, quantity: 0, isActive: true, categories: []
    });
    this.files = [];
    this.uploadedImageUrls = [];
    this.mainImageUrl = '';
  }
}
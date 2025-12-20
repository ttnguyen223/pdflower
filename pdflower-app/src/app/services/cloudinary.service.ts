import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private http = inject(HttpClient);
  private readonly CLOUD_NAME = environment.cloudinary.cloudName;
  private readonly UPLOAD_PRESET = environment.cloudinary.uploadPreset;
  private readonly UPLOAD_URL = `https://api.cloudinary.com/v1_1/${this.CLOUD_NAME}/image/upload`;

  async uploadImage(file: File): Promise<string> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.UPLOAD_PRESET);
    formData.append('folder', 'products')

    const response = await firstValueFrom(
      this.http.post<CloudinaryUploadResponse>(this.UPLOAD_URL, formData)
    );
    
    return response.secure_url;
  }
}

// Helper interface for the expected response structure from Cloudinary's API
interface CloudinaryUploadResponse {
  asset_id: string;
  public_id: string;
  version: number;
  signature: string; // May not be present in unsigned responses
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string; // <-- This is the URL you need
  // ... many more fields
}

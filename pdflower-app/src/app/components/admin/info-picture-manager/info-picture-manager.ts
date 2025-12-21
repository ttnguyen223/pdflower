import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { InfoPictureService } from '../../../services/info-picture.service';
import { InfoPicture } from '../../../models/info-picture.model';
import { CloudinaryService } from '../../../services/cloudinary.service';

interface DisplayImage extends Partial<InfoPicture> {
  preview?: string;
  file?: File;
  isNewLocal: boolean;
}

@Component({
  selector: 'app-info-picture-manager',
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatIconModule, MatToolbarModule, 
    MatCardModule, DragDropModule, MatTooltipModule
  ],
  templateUrl: './info-picture-manager.html',
  styleUrl: './info-picture-manager.css'
})
export class InfoPictureManager implements OnInit {
  private infoService = inject(InfoPictureService);
  private cloudinaryService = inject(CloudinaryService);
  
  allImages = signal<DisplayImage[]>([]);
  // Track IDs that existed in DB but were removed in the UI
  deletedIds = signal<string[]>([]); 
  
  private baselineJson = signal<string>('');
  isUploading = signal(false);
  
  hasChanges = computed(() => {
    const current = this.allImages();
    // Changes exist if new photos added, photos deleted, or order changed
    if (current.some(img => img.isNewLocal) || this.deletedIds().length > 0) return true;
    return JSON.stringify(current) !== this.baselineJson();
  });

  ngOnInit(): void {
    this.loadImages();
  }

  loadImages(): void {
    this.infoService.getInfoPictures().subscribe(data => {
      const images: DisplayImage[] = data.map(img => ({ ...img, isNewLocal: false }));
      this.allImages.set(images);
      this.deletedIds.set([]); // Reset delete tracker
      this.baselineJson.set(JSON.stringify(images));
    });
  }

  onDrop(event: CdkDragDrop<DisplayImage[]>): void {
    this.allImages.update(current => {
      const newArray = [...current];
      moveItemInArray(newArray, event.previousIndex, event.currentIndex);
      return newArray;
    });
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files) {
      const newEntries = Array.from(files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        isNewLocal: true,
        isActive: true,
        type: file.name
      }));
      this.allImages.update(list => [...list, ...newEntries]);
    }
    event.target.value = ''; 
  }

  removeImage(index: number): void {
    const itemToRemove = this.allImages()[index];
    
    // If the image has an ID and is not a local unsaved file, track it for deletion
    if (itemToRemove.id && !itemToRemove.isNewLocal) {
      this.deletedIds.update(ids => [...ids, itemToRemove.id!]);
    }

    this.allImages.update(list => list.filter((_, i) => i !== index));
  }

  async onSaveAll(): Promise<void> {
    if (this.isUploading() || !this.hasChanges()) return;
    this.isUploading.set(true);

    try {
      // 1. Handle Deletions first
      const idsToDelete = this.deletedIds();
      for (const id of idsToDelete) {
        await this.infoService.deleteInfoPicture(id); // Ensure this method exists in your service
      }

      // 2. Handle Upserts (Add/Update)
      const currentList = this.allImages();
      const finalPayload: InfoPicture[] = [];

      for (let i = 0; i < currentList.length; i++) {
        const item = currentList[i];
        let url = item.imageUrl;

        if (item.isNewLocal && item.file) {
          url = await this.cloudinaryService.uploadImage(item.file);
        }

        finalPayload.push({
          id: item.id || '', 
          imageUrl: url!,
          type: item.type || 'Standard',
          isActive: item.isActive ?? true,
          order: i 
        });
      }

      await this.infoService.syncAllPictures(finalPayload);
      
      this.loadImages(); // Refresh and reset baseline/deletedIds
      alert('Đã lưu tất cả thay đổi thành công!');
    } catch (error) {
      console.error(error);
      alert('Lỗi khi lưu dữ liệu.');
    } finally {
      this.isUploading.set(false);
    }
  }
}

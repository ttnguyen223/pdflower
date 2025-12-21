import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc, 
  deleteDoc, 
  writeBatch, 
  query, 
  orderBy, 
  serverTimestamp 
} from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { InfoPicture } from '../models/info-picture.model';

@Injectable({
  providedIn: 'root'
})
export class InfoPictureService {
  private firestore: Firestore = inject(Firestore);
  private readonly COLLECTION_NAME = 'info_pictures';
  private infoCollection = collection(this.firestore, this.COLLECTION_NAME);

  /**
   * Retrieves all info pictures from Firestore sorted by 'order'
   */
  getInfoPictures(): Observable<InfoPicture[]> {
    const q = query(this.infoCollection, orderBy('order', 'asc'));
    return collectionData(q, { idField: 'id' }) as Observable<InfoPicture[]>;
  }

  /**
   * Synchronizes the entire list to Firestore in a single transaction.
   * Handles deletes for items removed from the UI and updates/adds for the rest.
   * 
   * @param pictures The current list of pictures to save/update
   * @param deletedIds IDs of documents that should be removed from Firestore
   */
  async syncAllPictures(pictures: InfoPicture[], deletedIds: string[] = []): Promise<void> {
    const batch = writeBatch(this.firestore);

    // 1. Add delete operations to the batch
    deletedIds.forEach(id => {
      const docRef = doc(this.firestore, `${this.COLLECTION_NAME}/${id}`);
      batch.delete(docRef);
    });

    // 2. Add upsert (set/update) operations to the batch
    pictures.forEach((pic, index) => {
      // If pic has an ID, reference it; otherwise, create a new doc reference
      const docRef = pic.id 
        ? doc(this.firestore, `${this.COLLECTION_NAME}/${pic.id}`)
        : doc(this.infoCollection);

      const picData = {
        imageUrl: pic.imageUrl,
        type: pic.type || 'Standard',
        isActive: pic.isActive ?? true,
        order: index, // Updated based on current drag-and-drop position
        updateDate: serverTimestamp() // Ensure 2025 server-side precision
      };

      // merge: true allows updating existing fields without overwriting the whole document
      batch.set(docRef, picData, { merge: true });
    });

    // Commit all deletions and updates at once
    return batch.commit();
  }

  /**
   * Standalone method to delete a single info card from Firestore
   */
  async deleteInfoPicture(id: string): Promise<void> {
    const docRef = doc(this.firestore, `${this.COLLECTION_NAME}/${id}`);
    return deleteDoc(docRef);
  }

  /**
   * Helper for UI components: Get only active card URLs in correct order
   */
  getActiveInfoCards(): Observable<string[]> {
    return this.getInfoPictures().pipe(
      map(pics => pics
        .filter(p => p.isActive)
        .map(p => p.imageUrl)
      )
    );
  }
}

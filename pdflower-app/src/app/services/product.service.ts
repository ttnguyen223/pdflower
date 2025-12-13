import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, setDoc, getDoc, updateDoc, deleteDoc, DocumentReference, serverTimestamp, query, orderBy, DocumentSnapshot, DocumentData } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { Category } from '../models/category.model'

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private firestore: Firestore = inject(Firestore);
  private storage: Storage = inject(Storage);
  private productsCollection = collection(this.firestore, 'products');

  getProducts(): Observable<Product[]> {
    // This option maps the Firestore document ID string into your Product's 'id' property.
    return collectionData(collection(this.firestore, 'products'), { idField: 'id' }) as Observable<Product[]>;
  }

  getCategories(): Observable<Category[]> {
    const categoriesCollectionRef = collection(this.firestore, 'categories'); 

    // Create a query that orders the collection by the 'name' field alphabetically (ascending is default)
    const categoriesQuery = query(
      categoriesCollectionRef, 
      orderBy('order', 'asc')
    );

    // Use collectionData with the new query
    return collectionData(categoriesQuery, { idField: 'id' }) as Observable<Category[]>;
  }

  async uploadImage(file: File, path: string): Promise<string> {
    const storageRef = ref(this.storage, `${path}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
  }

  addProduct(product: Partial<Product>): Promise<DocumentReference> {
    // Add serverTimestamp for automatic date creation
    return addDoc(this.productsCollection, {
        ...product,
        insertDate: serverTimestamp(),
        updateDate: serverTimestamp()
    });
  }

  updateProduct(productData: Product): Promise<void> {
    const productDocRef = doc(this.firestore, `products/${productData.id}`);
    return updateDoc(productDocRef, { ...productData, updateDate: serverTimestamp() });
  }

  async deleteProduct(id: string): Promise<void> {
    const productDocRef = doc(this.firestore, 'products', id);
    await deleteDoc(productDocRef);
  }

  async toggleProductActivity(product: Product): Promise<void> {
    const productDocRef = doc(this.firestore, 'products', product.id);
    // Update only the isActive field
    await updateDoc(productDocRef, { isActive: !product.isActive });
  }

  getProductById(id: string): Observable<Product | undefined> {
    const productDocRef = doc(this.firestore, `products/${id}`);
    // Use the 'from' operator to convert the Promise-based getDoc into an Observable
    return from(getDoc(productDocRef)).pipe(
      map((snapshot: DocumentSnapshot<DocumentData>) => {
        if (snapshot.exists()) {
          // Map the data and include the ID
          return { id: snapshot.id, ...snapshot.data() } as Product;
        } else {
          return undefined;
        }
      })
    );
  }
}
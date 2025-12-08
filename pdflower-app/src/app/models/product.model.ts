export interface Product {
    id: string; 
    name: string;
    description: string;
    mainImageUrl: string;
    imageUrls: string[];
    price: number; // Verify this is number in Firestore, not string
    quantity: number;
    isActive: boolean;
    categories: string[];
    // Date fields are typically Timestamps in Firestore, 
    // you may need a pipe or mapping in the service to convert them to JS Date objects if needed elsewhere.
    insertDate: any; 
    updateDate: any;

}
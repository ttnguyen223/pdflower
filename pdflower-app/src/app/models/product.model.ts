export interface Product {
    id: number;
    name: string;
    description: string;
    mainImageUrl: string;
    imageUrls: string[];
    price: number;
    quantity: number;
    isActive: boolean;
    categories: string[];
    insertDate: Date;
    updateDate: Date;
}
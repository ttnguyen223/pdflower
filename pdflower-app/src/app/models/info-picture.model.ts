export interface InfoPicture {
  id: string;
  imageUrl: string;
  type: string;      // Name to identify the card (e.g., "Contact Info", "Shipping Policy")
  isActive: boolean;  // Toggle visibility on product pages
  order: number;      // Position in the sequence (0, 1, 2...)
  insertDate?: Date;
  updateDate?: Date;
}
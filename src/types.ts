export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  category: string;
  flavors: string[];
  stock: number;
  cbdContent: string;
  rating: number;
  isFeatured?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  isActive: boolean;
  usageCount: number;
}

export interface Order {
  id: string;
  userId: string;
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  discountAmount?: number;
  promoCode?: string;
  createdAt: any; // Firestore Timestamp
}

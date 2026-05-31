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

export interface ShippingInfo {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  zipCode?: string;
  phone: string;
  email: string;
  documentType?: string;
  documentNumber?: string;
}

export type PaymentStatus = "PENDING" | "APPROVED" | "DECLINED" | "VOIDED" | "ERROR";

export interface Order {
  id: string;
  userId: string;
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  subtotal?: number;
  total: number;
  discountAmount?: number;
  promoCode?: string;
  shippingInfo?: ShippingInfo;
  paymentMethod?: string;
  serial?: string;
  reference?: string;
  status?: string;
  paymentStatus?: PaymentStatus;
  wompiTransactionId?: string | null;
  emailSent?: boolean;
  createdAt: any; // Firestore Timestamp
  updatedAt?: any;
}

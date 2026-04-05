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

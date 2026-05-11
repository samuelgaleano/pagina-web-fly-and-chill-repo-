import { Product } from "@/types";

export const products: Product[] = [
  {
    id: "disp-berry-runtz",
    name: "Berry Runtz Disposable",
    category: "Desechables",
    flavors: ["Berry Runtz"],
    price: 49.99,
    images: ["/produc.png"],
    description: "Vape desechable premium con el legendario sabor Berry Runtz. Destilado refinado y materia prima orgánica. Efecto rápido y sabor dulce inigualable.",
    stock: 15,
    rating: 5.0,
    cbdContent: "Premium"
  },
  {
    id: "disp-vape-pro",
    name: "Pro Stream Vape",
    category: "Desechables",
    flavors: ["Kush Hybrid"],
    price: 45.00,
    images: ["/vapes.png"],
    description: "Diseño ergonómico y flujo de aire optimizado. La experiencia definitiva en vaporización desechable con tecnología de cerámica.",
    stock: 20,
    rating: 4.9,
    cbdContent: "Premium"
  },
  {
    id: "cart-capsule-pure",
    name: "Pure Destillate Capsule",
    category: "CARTS IMPORTADOS",
    flavors: ["Sativa Gold"],
    price: 35.00,
    images: ["/capsulas.png"],
    description: "Cápsulas de destilado puro con terpenos naturales. Calidad importada con los más altos estándares de pureza.",
    stock: 100,
    rating: 4.8,
    cbdContent: "Elite"
  },
  {
    id: "spec-gold",
    name: "Gold Edition Combo",
    category: "COMBOS",
    flavors: ["Berry & Kush"],
    price: 65.00,
    images: ["/combos.png"],
    description: "Edición limitada Gold. El combo perfecto que incluye nuestro dertilado más puro y accesorios exclusivos de la marca.",
    stock: 10,
    rating: 5.0,
    cbdContent: "Elite"
  },
  {
    id: "spec-chill",
    name: "Chill Zone Special",
    category: "BATERIAS",
    flavors: ["Chill Vibes"],
    price: 55.00,
    images: ["/chill.png"],
    description: "Una colaboración especial enfocada en la relajación total. Diseño minimalista y rendimiento superior.",
    stock: 15,
    rating: 4.9,
    cbdContent: "Premium"
  }
];

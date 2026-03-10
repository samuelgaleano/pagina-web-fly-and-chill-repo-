import { Product } from "@/context/CartContext";

export const products: Product[] = [
  {
    id: "disp-cinnamon",
    name: "Cinnamon Bun Disposable",
    category: "Disposables",
    flavor: "Cinnamon Bun",
    price: 45.00,
    image: "https://picsum.photos/seed/vape1/800/800?blur=1",
    description: "Vape desechable premium con sabor a Cinnamon Bun. 97% CBD puro, destilado refinado y materia prima orgánica. Efecto rápido y sabor limpio.",
    stock: 50,
    rating: 4.8,
    cbdContent: "97%"
  },
  {
    id: "disp-kush",
    name: "Classic Kush Disposable",
    category: "Disposables",
    flavor: "Kush",
    price: 45.00,
    image: "https://picsum.photos/seed/vape2/800/800?blur=1",
    description: "El clásico sabor Kush en un formato desechable conveniente. Perfil híbrido perfecto para relajación y creatividad.",
    stock: 20,
    rating: 4.9,
    cbdContent: "97%"
  },
  {
    id: "cart-sativa",
    name: "Sativa Energy Cartridge",
    category: "Cartuchos",
    flavor: "Sativa",
    price: 35.00,
    image: "https://picsum.photos/seed/vape3/800/800?blur=1",
    description: "Cartucho recargable con perfil Sativa. Ideal para mantener la energía y el enfoque durante el día. Aceite ámbar brillante visible.",
    stock: 100,
    rating: 4.7,
    cbdContent: "97%"
  },
  {
    id: "cart-kush",
    name: "Night Kush Cartridge",
    category: "Cartuchos",
    flavor: "Kush",
    price: 35.00,
    image: "https://picsum.photos/seed/vape4/800/800?blur=1",
    description: "Cartucho recargable Kush para esas noches de chill. Potencia consistente y sabor inigualable.",
    stock: 5,
    rating: 4.6,
    cbdContent: "97%"
  },
  {
    id: "spec-gold",
    name: "Gold Edition: Pure Amber",
    category: "Ediciones Especiales",
    flavor: "Sativa",
    price: 65.00,
    image: "https://picsum.photos/seed/vape5/800/800?blur=1",
    description: "Edición limitada con el destilado más puro. Packaging premium negro con acentos dorados. Una experiencia de consumo superior.",
    stock: 0,
    rating: 5.0,
    cbdContent: "99%"
  },
  {
    id: "spec-chill",
    name: "Chill Zone Collab",
    category: "Ediciones Especiales",
    flavor: "Cinnamon Bun",
    price: 55.00,
    image: "https://picsum.photos/seed/vape6/800/800?blur=1",
    description: "Una colaboración especial con artistas de la comunidad. Diseño urbano exclusivo y sabor intenso.",
    stock: 15,
    rating: 4.9,
    cbdContent: "97%"
  }
];

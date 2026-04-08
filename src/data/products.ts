import { Product } from "@/types";

export const products: Product[] = [
  {
    id: "disp-berry-runtz",
    name: "Berry Runtz Disposable",
    category: "Desechables",
    flavors: ["Berry Runtz"],
    price: 49.99,
    images: ["/produc.png"],
    description: "Vape desechable premium con el legendario sabor Berry Runtz. 97% CBD puro, destilado refinado y materia prima orgánica. Efecto rápido y sabor dulce inigualable.",
    stock: 15,
    rating: 5.0,
    cbdContent: "97%"
  },
  {
    id: "disp-cinnamon",
    name: "Cinnamon Bun Disposable",
    category: "Desechables",
    flavors: ["Cinnamon Bun"],
    price: 45.00,
    images: ["https://images.unsplash.com/photo-1620331713240-ed6041047c44?q=80&w=1000&auto=format&fit=crop"],
    description: "Vape desechable premium con sabor a Cinnamon Bun. 97% CBD puro, destilado refinado y materia prima orgánica. Efecto rápido y sabor limpio.",
    stock: 50,
    rating: 4.8,
    cbdContent: "97%"
  },
  {
    id: "disp-kush",
    name: "Classic Kush Disposable",
    category: "Desechables",
    flavors: ["Kush"],
    price: 45.00,
    images: ["https://images.unsplash.com/photo-1594494024039-6616305d3307?q=80&w=1000&auto=format&fit=crop"],
    description: "El clásico sabor Kush en un formato desechable conveniente. Perfil híbrido perfecto para relajación y creatividad.",
    stock: 20,
    rating: 4.9,
    cbdContent: "97%"
  },
  {
    id: "cart-sativa",
    name: "Sativa Energy Cartridge",
    category: "CARTS NACIONALES",
    flavors: ["Sativa"],
    price: 35.00,
    images: ["https://images.unsplash.com/photo-1615485240384-552e4c645c2a?q=80&w=1000&auto=format&fit=crop"],
    description: "Cartucho recargable con perfil Sativa. Ideal para mantener la energía y el enfoque durante el día. Aceite ámbar brillante visible.",
    stock: 100,
    rating: 4.7,
    cbdContent: "97%"
  },
  {
    id: "cart-kush",
    name: "Night Kush Cartridge",
    category: "CARTS IMPORTADOS",
    flavors: ["Kush"],
    price: 35.00,
    images: ["https://images.unsplash.com/photo-1603909223429-69bb7101f420?q=80&w=1000&auto=format&fit=crop"],
    description: "Cartucho recargable Kush para esas noches de chill. Potencia consistente y sabor inigualable.",
    stock: 5,
    rating: 4.6,
    cbdContent: "97%"
  },
  {
    id: "spec-gold",
    name: "Gold Edition: Pure Amber",
    category: "COMBOS",
    flavors: ["Sativa", "Kush"],
    price: 65.00,
    images: ["https://images.unsplash.com/photo-1556928866-232211b7aa11?q=80&w=1000&auto=format&fit=crop"],
    description: "Edición limitada con el destilado más puro. Packaging premium negro con acentos dorados. Una experiencia de consumo superior.",
    stock: 10,
    rating: 5.0,
    cbdContent: "99%"
  },
  {
    id: "spec-chill",
    name: "Chill Zone Collab",
    category: "BATERIAS",
    flavors: ["Cinnamon Bun"],
    price: 55.00,
    images: ["https://images.unsplash.com/photo-1615485240384-552e4c645c2a?q=80&w=1000&auto=format&fit=crop"],
    description: "Una colaboración especial con artistas de la comunidad. Diseño urbano exclusivo y sabor intenso.",
    stock: 15,
    rating: 4.9,
    cbdContent: "97%"
  },
  {
    id: "bat-pro",
    name: "Pro Battery Black",
    category: "BATERIAS",
    flavors: ["Natural"],
    price: 25.00,
    images: ["https://images.unsplash.com/photo-1594494024039-6616305d3307?q=80&w=1000&auto=format&fit=crop"],
    description: "Batería de larga duración con 3 niveles de voltaje. Compatible con todos los cartuchos 510.",
    stock: 30,
    rating: 4.8,
    cbdContent: "N/A"
  }
];

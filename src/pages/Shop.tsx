import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Search, Filter, ShoppingCart, Eye } from "lucide-react";

export function Shop() {
  const { addToCart } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white min-h-screen pt-32 pb-24 text-brand-black">
      <div className="container mx-auto px-4">
        {/* Header - Bold & Minimal */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-xl">
            <h1 className="text-7xl md:text-8xl font-heading font-black uppercase tracking-tighter leading-[0.85] mb-6">
              NUESTRA <br /> <span className="text-brand-primary">TIENDA</span>
            </h1>
            <p className="text-xl text-gray-500 font-sans">
              Explora nuestra selección premium de destilados y accesorios diseñados para elevar tu estilo de vida.
            </p>
          </div>
          
          {/* Search - Clean & Modern */}
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="BUSCAR PRODUCTOS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-100 border-none rounded-none pl-12 pr-6 py-5 text-sm font-black uppercase tracking-widest text-brand-black focus:ring-2 focus:ring-brand-primary transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Categories Bar - Minimalist */}
        <div className="flex flex-wrap gap-4 mb-16 border-b border-gray-100 pb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-8 py-3 text-xs font-black uppercase tracking-[0.2em] transition-all ${
                selectedCategory === cat 
                  ? "bg-brand-black text-white" 
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-brand-black"
              }`}
            >
              {cat === "All" ? "TODOS" : cat}
            </button>
          ))}
        </div>

        {/* Product Grid - Clean High Impact */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-32 bg-gray-50">
              <p className="text-gray-400 font-black uppercase tracking-widest mb-8">No se encontraron productos.</p>
              <Button 
                className="bg-brand-black text-white rounded-none px-10 py-6 font-black uppercase tracking-widest"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
              >
                LIMPIAR FILTROS
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
              {filteredProducts.map((product) => (
                <motion.div 
                  key={product.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="group cursor-pointer"
                >
                  <Link to={`/shop/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-100 mb-6">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <span className="bg-brand-black text-white text-[10px] font-black px-3 py-1 uppercase tracking-widest">
                        {product.cbdContent} CBD
                      </span>
                      {product.stock <= 10 && product.stock > 0 && (
                        <span className="bg-brand-secondary text-white text-[10px] font-black px-3 py-1 uppercase tracking-widest">
                          POCO STOCK
                        </span>
                      )}
                      {product.stock === 0 && (
                        <span className="bg-gray-400 text-white text-[10px] font-black px-3 py-1 uppercase tracking-widest">
                          AGOTADO
                        </span>
                      )}
                    </div>
                    
                    {/* Quick Add Button */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <Button 
                        className="w-full bg-brand-black text-white hover:bg-brand-primary rounded-none font-black uppercase tracking-widest py-4"
                        disabled={product.stock === 0}
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart(product);
                        }}
                      >
                        {product.stock === 0 ? "AGOTADO" : "Añadir +"}
                      </Button>
                    </div>
                  </Link>
                  <div className="space-y-2">
                    <div className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">{product.category}</div>
                    <Link to={`/shop/${product.id}`}>
                      <h3 className="text-2xl font-heading font-black uppercase tracking-tight group-hover:text-brand-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="text-xl font-sans font-bold text-gray-400">${product.price.toFixed(2)}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

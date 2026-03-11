import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Search, Filter, ShoppingCart, Eye, ArrowRight } from "lucide-react";

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
    <div className="bg-brand-paper min-h-screen pt-40 pb-24 text-brand-black">
      <div className="container mx-auto px-6">
        {/* Header - Editorial Style */}
        <div className="flex flex-col lg:flex-row justify-between items-baseline mb-24 gap-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-[1px] bg-brand-primary"></span>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary">
                Catálogo Exclusivo
              </span>
            </div>
            <h1 className="serif text-7xl md:text-9xl font-light italic leading-none mb-8">
              Nuestra <br /> <span className="font-bold not-italic">Colección</span>
            </h1>
            <p className="text-xl text-gray-600 font-sans leading-relaxed max-w-lg">
              Explora una selección curada de destilados de la más alta pureza, 
              diseñados para quienes no aceptan menos que la excelencia.
            </p>
          </div>
          
          {/* Search - Refined */}
          <div className="relative w-full lg:w-96 group">
            <input
              type="text"
              placeholder="BUSCAR DESTILADO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-b-2 border-brand-black/10 rounded-none pl-12 pr-6 py-6 text-xs font-bold uppercase tracking-widest text-brand-black focus:border-brand-primary transition-all outline-none"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-black/30 group-focus-within:text-brand-primary transition-colors" />
          </div>
        </div>

        {/* Categories Bar - Minimalist Pills */}
        <div className="flex flex-wrap gap-3 mb-20">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full transition-all duration-300 ${
                selectedCategory === cat 
                  ? "bg-brand-black text-white shadow-xl shadow-brand-black/20" 
                  : "bg-white text-gray-400 hover:bg-gray-100 hover:text-brand-black border border-brand-black/5"
              }`}
            >
              {cat === "All" ? "TODOS" : cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-40 bg-white rounded-3xl border border-brand-black/5">
              <p className="serif text-3xl italic text-gray-400 mb-8">No hemos encontrado lo que buscas.</p>
              <Button 
                className="bg-brand-black text-white rounded-full px-12 py-6 text-xs font-bold uppercase tracking-widest hover:bg-brand-primary transition-all"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
              >
                LIMPIAR FILTROS
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-20">
              {filteredProducts.map((product, i) => (
                <motion.div 
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group"
                >
                  <Link to={`/shop/${product.id}`} className="block relative aspect-[3/4] overflow-hidden bg-white mb-8 rounded-2xl shadow-sm group-hover:shadow-2xl transition-all duration-700">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                      <div className="bg-brand-black text-white text-[9px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                        {product.cbdContent} CBD
                      </div>
                      {product.stock <= 10 && product.stock > 0 && (
                        <div className="bg-brand-secondary text-white text-[9px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                          POCO STOCK
                        </div>
                      )}
                      {product.stock === 0 && (
                        <div className="bg-gray-400 text-white text-[9px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                          AGOTADO
                        </div>
                      )}
                    </div>
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-brand-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center p-6">
                      <Button 
                        className="w-full bg-white text-brand-black hover:bg-brand-primary hover:text-white rounded-full font-black uppercase tracking-widest py-5 text-xs"
                        disabled={product.stock === 0}
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart(product);
                        }}
                      >
                        {product.stock === 0 ? "AGOTADO" : "Añadir al Carrito"}
                      </Button>
                    </div>
                  </Link>
                  
                  <div className="space-y-3 text-center">
                    <div className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.3em]">{product.category}</div>
                    <Link to={`/shop/${product.id}`}>
                      <h3 className="text-2xl font-heading font-black uppercase tracking-tighter group-hover:text-brand-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="serif text-2xl italic text-gray-500">${product.price.toFixed(2)}</div>
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

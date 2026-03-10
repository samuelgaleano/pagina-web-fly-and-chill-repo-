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
  const [selectedFlavor, setSelectedFlavor] = useState("All");

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];
  const flavors = ["All", ...Array.from(new Set(products.map(p => p.flavor)))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesFlavor = selectedFlavor === "All" || p.flavor === selectedFlavor;
    return matchesSearch && matchesCategory && matchesFlavor;
  });

  return (
    <div className="bg-brand-black min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-brand-gold/10 pb-8">
          <div className="mb-6 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-heading font-black text-white uppercase tracking-tighter mb-2">
              Catálogo
            </h1>
            <p className="text-brand-gold font-sans">Destilados premium de alta pureza.</p>
          </div>
          
          {/* Search */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-brand-dark border border-brand-gold/20 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-amber transition-colors"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 shrink-0 space-y-8">
            <div>
              <h3 className="font-heading font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4 text-brand-amber" /> Categorías
              </h3>
              <ul className="space-y-2">
                {categories.map(cat => (
                  <li key={cat}>
                    <button
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-sm font-sans transition-colors ${
                        selectedCategory === cat 
                          ? "text-brand-amber font-bold" 
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {cat === "All" ? "Todos los productos" : cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-heading font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4 text-brand-amber" /> Sabores
              </h3>
              <ul className="space-y-2">
                {flavors.map(flavor => (
                  <li key={flavor}>
                    <button
                      onClick={() => setSelectedFlavor(flavor)}
                      className={`text-sm font-sans transition-colors ${
                        selectedFlavor === flavor 
                          ? "text-brand-amber font-bold" 
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {flavor === "All" ? "Todos los sabores" : flavor}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-brand-dark rounded-xl border border-brand-gold/10">
                <p className="text-gray-400 font-sans mb-4">No se encontraron productos con esos filtros.</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("All");
                    setSelectedFlavor("All");
                  }}
                >
                  Limpiar Filtros
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <motion.div 
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="bg-brand-dark border border-brand-gold/10 rounded-xl overflow-hidden group flex flex-col"
                  >
                    <Link to={`/shop/${product.id}`} className="relative aspect-square overflow-hidden bg-black block">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <span className="bg-brand-black/80 backdrop-blur-sm text-brand-gold text-xs font-bold px-2 py-1 rounded border border-brand-gold/20 w-fit">
                          {product.cbdContent} CBD
                        </span>
                        {product.stock <= 10 && product.stock > 0 && (
                          <span className="bg-brand-amber/90 backdrop-blur-sm text-brand-black text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider w-fit">
                            Poco Stock
                          </span>
                        )}
                        {product.stock === 0 && (
                          <span className="bg-gray-800/90 backdrop-blur-sm text-gray-300 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider w-fit border border-gray-600">
                            Agotado
                          </span>
                        )}
                      </div>
                      
                      {/* Quick View Overlay */}
                      <div className="absolute inset-0 bg-brand-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <Button 
                          variant="amber" 
                          size="icon" 
                          className="rounded-full"
                          disabled={product.stock === 0}
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart(product);
                          }}
                        >
                          <ShoppingCart className="w-5 h-5" />
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-full bg-brand-black/50">
                          <Eye className="w-5 h-5" />
                        </Button>
                      </div>
                    </Link>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="text-xs text-brand-amber mb-1 font-bold uppercase tracking-wider">{product.category}</div>
                      <Link to={`/shop/${product.id}`}>
                        <h3 className="text-lg font-heading font-bold text-white mb-2 line-clamp-1 group-hover:text-brand-gold transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2 font-sans flex-1">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-xl font-bold text-white">${product.price.toFixed(2)}</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={product.stock === 0}
                          onClick={() => addToCart(product)}
                        >
                          {product.stock === 0 ? "Agotado" : "Añadir"}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

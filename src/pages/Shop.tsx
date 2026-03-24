import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Search, ShoppingCart, Filter, X, ChevronRight } from "lucide-react";

export function Shop() {
  const { addToCart } = useCart();
  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category))), []);
  const flavors = useMemo(() => Array.from(new Set(products.map(p => p.flavor))), []);
  const maxPrice = useMemo(() => Math.ceil(Math.max(...products.map(p => p.price), 0)), []);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: maxPrice });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Update priceRange when maxPrice changes (e.g. products load)
  useMemo(() => {
    setPriceRange(prev => ({ ...prev, max: maxPrice }));
  }, [maxPrice]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
    setCurrentPage(1);
  };

  const handleFlavorChange = (flavor: string) => {
    setSelectedFlavors(prev => 
      prev.includes(flavor) ? prev.filter(f => f !== flavor) : [...prev, flavor]
    );
    setCurrentPage(1);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category);
    const matchesFlavor = selectedFlavors.length === 0 || selectedFlavors.includes(p.flavor);
    const matchesPrice = p.price >= priceRange.min && p.price <= priceRange.max;
    return matchesSearch && matchesCategory && matchesFlavor && matchesPrice;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="bg-brand-black min-h-screen pt-32 pb-24 text-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="sticky top-32 space-y-10 bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-2xl">
              
              {/* Search Bar */}
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-brand-black/40 border border-white/10 rounded-full pl-12 pr-6 py-4 text-sm text-white focus:ring-2 focus:ring-brand-primary transition-all outline-none"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-brand-primary transition-colors" />
              </div>

              {/* Categories Section */}
              <div>
                <h3 className="text-brand-primary font-heading font-black uppercase tracking-[0.2em] text-xs mb-6 border-b border-brand-primary/20 pb-3">
                  Categorías
                </h3>
                <ul className="space-y-4">
                  {categories.map(cat => (
                    <li key={cat}>
                      <label className="flex items-center space-x-3 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input 
                            type="checkbox"
                            checked={selectedCategories.includes(cat)}
                            onChange={() => handleCategoryChange(cat)}
                            className="peer appearance-none w-5 h-5 border-2 border-white/20 rounded bg-transparent checked:bg-brand-primary checked:border-brand-primary transition-all cursor-pointer"
                          />
                          <X className="absolute w-3 h-3 text-brand-black opacity-0 peer-checked:opacity-100 left-1 transition-opacity pointer-events-none" />
                        </div>
                        <span className="text-sm text-gray-400 group-hover:text-white transition-colors uppercase tracking-widest font-bold">
                          {cat}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Flavors Section */}
              <div>
                <h3 className="text-brand-primary font-heading font-black uppercase tracking-[0.2em] text-xs mb-6 border-b border-brand-primary/20 pb-3">
                  Sabores
                </h3>
                <ul className="space-y-4">
                  {flavors.map(flavor => (
                    <li key={flavor}>
                      <label className="flex items-center space-x-3 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input 
                            type="checkbox"
                            checked={selectedFlavors.includes(flavor)}
                            onChange={() => handleFlavorChange(flavor)}
                            className="peer appearance-none w-5 h-5 border-2 border-white/20 rounded bg-transparent checked:bg-brand-primary checked:border-brand-primary transition-all cursor-pointer"
                          />
                          <X className="absolute w-3 h-3 text-brand-black opacity-0 peer-checked:opacity-100 left-1 transition-opacity pointer-events-none" />
                        </div>
                        <span className="text-sm text-gray-400 group-hover:text-white transition-colors uppercase tracking-widest font-bold">
                          {flavor}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Filter */}
              <div>
                <h3 className="text-brand-primary font-heading font-black uppercase tracking-[0.2em] text-xs mb-6 border-b border-brand-primary/20 pb-3">
                  Rango de Precio
                </h3>
                <div className="relative h-6 flex items-center px-2">
                  <div className="absolute left-2 right-2 h-1 bg-white/10 rounded-lg"></div>
                  <div 
                    className="absolute h-1 bg-brand-primary rounded-lg"
                    style={{
                      left: `calc(8px + ${(priceRange.min / maxPrice) * 100}% * (100% - 16px) / 100)`,
                      right: `calc(8px + ${100 - (priceRange.max / maxPrice) * 100}% * (100% - 16px) / 100)`
                    }}
                  ></div>
                  <input 
                    type="range" 
                    min="0" 
                    max={maxPrice} 
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: Math.min(parseInt(e.target.value), prev.max) }))}
                    className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-brand-primary/50 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand-black"
                  />
                  <input 
                    type="range" 
                    min="0" 
                    max={maxPrice} 
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: Math.max(parseInt(e.target.value), prev.min) }))}
                    className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-brand-primary/50 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand-black"
                  />
                </div>
                <div className="flex justify-between mt-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <span>$0</span>
                  <span className="text-brand-primary">${priceRange.min} - ${priceRange.max}</span>
                  <span>${maxPrice}+</span>
                </div>
              </div>

              {/* Reset Filters */}
              {(searchTerm || selectedCategories.length > 0 || selectedFlavors.length > 0 || priceRange.min > 0 || priceRange.max < maxPrice) && (
                <button 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategories([]);
                    setSelectedFlavors([]);
                    setPriceRange({ min: 0, max: maxPrice });
                  }}
                  className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand-secondary hover:text-white border border-brand-secondary/30 hover:bg-brand-secondary/20 rounded-xl transition-all"
                >
                  Limpiar Filtros
                </button>
              )}
            </div>
          </aside>

          {/* Product Grid Area */}
          <section className="flex-grow">
            <div className="flex flex-col sm:flex-row justify-between items-baseline mb-12 gap-4">
              <h2 className="text-4xl md:text-5xl font-heading font-black uppercase tracking-tighter">
                Explora la <span className="text-brand-primary italic font-light lowercase serif">Colección Elite</span>
              </h2>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">
                Mostrando {paginatedProducts.length} de {filteredProducts.length} productos
              </div>
            </div>

            {paginatedProducts.length === 0 ? (
              <div className="text-center py-32 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-sm">
                <p className="serif text-3xl italic text-gray-400 mb-8">No hemos encontrado lo que buscas.</p>
                <Button 
                  className="bg-brand-primary text-brand-black rounded-full px-12 py-6 text-xs font-black uppercase tracking-widest hover:bg-white transition-all"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategories([]);
                    setSelectedFlavors([]);
                    setPriceRange({ min: 0, max: maxPrice });
                  }}
                >
                  VER TODO EL CATÁLOGO
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedProducts.map((product, i) => (
                  <motion.article 
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden hover:shadow-[0_0_50px_rgba(118,187,202,0.15)] transition-all duration-500 flex flex-col h-full"
                  >
                    {/* Image Area */}
                    <div className="relative h-72 overflow-hidden bg-gradient-to-br from-brand-black to-brand-gray/40 p-8 flex items-center justify-center">
                      <div className="absolute top-6 left-6 bg-brand-primary text-brand-black px-4 py-1.5 text-[9px] font-black rounded-full uppercase tracking-widest z-10 shadow-lg shadow-brand-primary/20">
                        {product.cbdContent} Pureza
                      </div>
                      <Link to={`/shop/${product.id}`} className="w-full h-full flex items-center justify-center">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="object-contain h-full w-full group-hover:scale-110 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                      </Link>
                    </div>

                    {/* Content Area */}
                    <div className="p-8 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-4">
                        <Link to={`/shop/${product.id}`}>
                          <h3 className="text-xl font-heading font-black uppercase tracking-tighter group-hover:text-brand-primary transition-colors leading-tight">
                            {product.name}
                          </h3>
                        </Link>
                        <span className={`text-[9px] font-black uppercase tracking-widest flex items-center shrink-0 ml-4 ${product.stock > 0 ? "text-brand-primary" : "text-brand-secondary"}`}>
                          <span className={`w-2 h-2 rounded-full mr-2 ${product.stock > 0 ? "bg-brand-primary animate-pulse" : "bg-brand-secondary"}`}></span>
                          {product.stock > 0 ? "En Stock" : "Agotado"}
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-400 mb-6 line-clamp-2 font-sans leading-relaxed">
                        {product.description}
                      </p>

                      <div className="mt-auto">
                        <div className="text-3xl font-heading font-black text-brand-primary mb-8">
                          ${product.price.toFixed(2)} <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">USD</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <Button 
                            className="bg-brand-primary text-brand-black hover:bg-white text-[10px] font-black py-4 rounded-2xl transition-all duration-300 uppercase tracking-widest"
                            disabled={product.stock === 0}
                            onClick={() => addToCart(product)}
                          >
                            Añadir
                          </Button>
                          <Link to={`/shop/${product.id}`} className="w-full">
                            <Button 
                              variant="outline"
                              className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white text-[10px] font-black py-4 rounded-2xl transition-all duration-300 uppercase tracking-widest"
                            >
                              Detalles
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-20 flex justify-center items-center gap-3">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-brand-primary hover:text-brand-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-12 h-12 flex items-center justify-center rounded-2xl border transition-all text-xs font-black ${
                      currentPage === page 
                        ? "bg-brand-primary border-brand-primary text-brand-black shadow-lg shadow-brand-primary/20" 
                        : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-brand-primary hover:text-brand-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

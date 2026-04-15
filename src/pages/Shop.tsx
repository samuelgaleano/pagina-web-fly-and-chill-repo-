import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { useShop } from "@/context/ShopContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Search, Filter, X, ChevronRight, Database, WifiOff, ArrowRight, ChevronDown, Star } from "lucide-react";
import { formatPrice } from "@/lib/formatters";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { collection, doc, writeBatch } from "firebase/firestore";
import { products as initialProducts } from "@/data/products";

export function Shop() {
  const { products, loading, isAdmin, isOffline } = useShop();
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category))), [products]);
  const flavors = useMemo(() => Array.from(new Set(products.flatMap(p => p.flavors))), [products]);
  const maxPrice = useMemo(() => {
    const prices = products.map(p => Number(p.price)).filter(p => !isNaN(p));
    return prices.length > 0 ? Math.ceil(Math.max(...prices)) : 1000;
  }, [products]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [isFlavorsOpen, setIsFlavorsOpen] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Handle URL search params for initial category filtering
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam && categories.includes(categoryParam)) {
      setSelectedCategories([categoryParam]);
    }
  }, [searchParams, categories]);

  // Update priceRange when maxPrice changes
  useEffect(() => {
    if (maxPrice > 0) {
      setPriceRange(prev => ({ ...prev, max: maxPrice }));
    }
  }, [maxPrice]);

  const seedDatabase = async () => {
    if (!confirm("¿Estás seguro de que quieres poblar la base de datos con los productos iniciales?")) return;
    
    const batch = writeBatch(db);
    initialProducts.forEach(product => {
      const docRef = doc(collection(db, "products"), product.id);
      batch.set(docRef, product);
    });

    try {
      await batch.commit();
      alert("Base de datos poblada con éxito.");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "products");
    }
  };

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
    const matchesFlavor = selectedFlavors.length === 0 || p.flavors.some(f => selectedFlavors.includes(f));
    const matchesPrice = p.price >= priceRange.min && p.price <= priceRange.max;
    return matchesSearch && matchesCategory && matchesFlavor && matchesPrice;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading && products.length === 0) {
    return (
      <div className="bg-brand-black min-h-screen pt-32 flex items-center justify-center">
        <div className="text-brand-primary animate-pulse font-heading font-black text-2xl uppercase tracking-widest">
          Cargando Inventario...
        </div>
      </div>
    );
  }

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
                <button 
                  onClick={() => setIsFlavorsOpen(!isFlavorsOpen)}
                  className="w-full flex items-center justify-between text-brand-primary font-heading font-black uppercase tracking-[0.2em] text-xs mb-6 border-b border-brand-primary/20 pb-3 group"
                >
                  Sabores
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isFlavorsOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <motion.div
                  initial={false}
                  animate={{ 
                    height: isFlavorsOpen ? 'auto' : 0,
                    opacity: isFlavorsOpen ? 1 : 0,
                    marginBottom: isFlavorsOpen ? 24 : 0
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
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
                </motion.div>
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
                      left: `calc(8px + ${(maxPrice > 0 ? priceRange.min / maxPrice : 0) * 100}% * (100% - 16px) / 100)`,
                      right: `calc(8px + ${100 - (maxPrice > 0 ? priceRange.max / maxPrice : 100) * 100}% * (100% - 16px) / 100)`
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
              <div className="flex flex-wrap items-center gap-4">
                <h2 className="text-4xl md:text-5xl font-heading font-black uppercase tracking-tighter">
                  Explora la <span className="text-brand-primary italic font-light lowercase serif">Colección Elite</span>
                </h2>
                {isOffline && (
                  <div className="flex items-center gap-2 bg-brand-secondary/20 text-brand-secondary px-4 py-2 rounded-full border border-brand-secondary/30 animate-pulse">
                    <WifiOff className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Modo Offline (Caché)</span>
                  </div>
                )}
                {isAdmin && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={seedDatabase}
                    className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-brand-black text-[10px] font-black uppercase tracking-widest"
                  >
                    <Database className="w-3 h-3 mr-2" />
                    Poblar DB
                  </Button>
                )}
              </div>
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
                    className="group relative bg-brand-dark/40 border border-white/5 rounded-[2rem] p-5 hover:border-brand-primary/40 transition-all duration-500 hover:shadow-[0_0_50px_rgba(118,187,202,0.15)] flex flex-col h-full"
                  >
                    {/* Image Area */}
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-brand-black/60 mb-6 group-hover:bg-brand-black/40 transition-colors flex items-center justify-center">
                      <Link to={`/shop/${product.id}`} className="absolute inset-0 z-0 flex items-center justify-center">
                        <img 
                          src={product.images[0]} 
                          alt={product.name} 
                          className="object-contain h-full w-full p-8 group-hover:scale-110 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                      </Link>

                      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
                        {product.stock < 10 && product.stock > 0 && (
                          <span className="bg-brand-secondary text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg animate-pulse">
                            ÚLTIMAS UNIDADES
                          </span>
                        )}
                      </div>
                      
                      {/* Quick Action Overlay */}
                      <div className="absolute inset-0 bg-brand-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px] z-20">
                        <Link to={`/shop/${product.id}`} className="absolute inset-0 z-0" />
                        <Button 
                          className="relative z-10 bg-brand-primary text-brand-black hover:bg-white rounded-full font-black uppercase tracking-widest px-10 py-7 shadow-[0_0_30px_rgba(118,187,202,0.5)] transform translate-y-4 group-hover:translate-y-0 transition-all duration-500"
                          disabled={product.stock === 0}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addToCart(product);
                          }}
                        >
                          {product.stock > 0 ? "Añadir al Carrito" : "Agotado"}
                        </Button>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex flex-col flex-grow px-2">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[9px] font-black text-brand-primary/60 uppercase tracking-[0.3em]">{product.category}</span>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full border border-white/10">
                          <span className="text-[9px] font-black text-brand-secondary">{product.rating}</span>
                          <Star className="w-2.5 h-2.5 fill-brand-secondary text-brand-secondary" />
                        </div>
                      </div>
                      
                      <Link to={`/shop/${product.id}`} className="mb-6 block group/title">
                        <h3 className="text-2xl font-heading font-black uppercase tracking-tight group-hover/title:text-brand-primary transition-colors leading-tight line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>
                      
                      <div className="mt-auto flex justify-between items-center pt-6 border-t border-white/5">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Precio Elite</span>
                          <span className="text-2xl font-sans font-black text-white tracking-tight">${formatPrice(product.price)}</span>
                        </div>
                        <Link 
                          to={`/shop/${product.id}`}
                          className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-primary hover:border-brand-primary hover:text-brand-black transition-all group/btn shadow-xl active:scale-90"
                        >
                          <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
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

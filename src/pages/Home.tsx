import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useShop } from "@/context/ShopContext";
import { ShoppingCart, Eye, ArrowRight, Headphones } from "lucide-react";
import { formatPrice } from "@/lib/formatters";

export function Home() {
  const { addToCart } = useCart();
  const { products: shopProducts } = useShop();
  const [recentlyAdded, setRecentlyAdded] = useState<Set<string>>(new Set());
  
  const handleAddToCart = (product: any) => {
    addToCart(product);
    setRecentlyAdded(prev => new Set(prev).add(product.id));
    setTimeout(() => {
      setRecentlyAdded(prev => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 2000);
  };
  
  // Get the first 4 products from the store to display as featured
  const featuredProducts = useMemo(() => shopProducts.slice(0, 4), [shopProducts]);

  return (
    <div className="flex flex-col min-h-screen bg-brand-black">
      {/* Hero Section - Redesigned for better mobile responsiveness */}
      <section className="relative min-h-[90vh] md:h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/hero-bg-1.png" 
            alt="Fly and Chill Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/60 md:bg-black/50" />
        </div>
        
        <div className="relative z-10 container mx-auto px-6 h-full flex flex-col md:flex-row items-center justify-center md:justify-between pt-32 pb-20 md:py-0">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 text-center md:text-left space-y-8 md:space-y-6 z-20"
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-black text-white uppercase tracking-tighter leading-[0.85] md:leading-none">
              vuela y eleva <br /> tus <span className="text-brand-primary">Vibes</span>
            </h1>
            
            <div className="flex flex-col items-center md:items-start space-y-4">
              <p className="text-xl md:text-2xl text-white font-sans tracking-tight flex flex-wrap items-center justify-center md:justify-start gap-2">
                prueba nuestro <span className="text-brand-primary font-black uppercase">best seller</span> 
                <span className="flex items-center">
                  y ponte
                  <img 
                    src="/chill.png" 
                    alt="CHILL" 
                    className="h-[60px] md:h-[100px] object-contain transform -rotate-3 hover:scale-110 transition-transform duration-300 -ml-2 md:-ml-6"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const span = document.createElement('span');
                      span.className = "font-cursive text-4xl md:text-6xl text-brand-secondary uppercase ml-2 inline-block transform -rotate-3";
                      span.innerText = "CHILL";
                      e.currentTarget.parentNode?.appendChild(span);
                    }}
                  />
                </span>
              </p>
            </div>

            <div className="pt-6 md:pt-4">
              <Link to="/shop/disp-berry-runtz">
                <Button 
                  size="lg" 
                  className="w-full md:w-auto h-20 md:h-16 px-10 text-lg md:text-xl font-black tracking-tight bg-gradient-buy text-white rounded-2xl flex items-center justify-center gap-3 hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(255,0,0,0.4)] border-none animate-glow"
                >
                  <ShoppingCart className="w-6 h-6" />
                  COMPRAR BONE HEAD
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right Content - Product Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex-1 relative flex justify-center items-center mt-12 md:mt-0 md:translate-x-[10%] lg:translate-x-[20%]"
          >
            <div className="relative group max-w-[300px] md:max-w-none">
              {/* Glow effect behind product */}
              <div className="absolute inset-0 bg-brand-primary/30 blur-[80px] md:blur-[120px] rounded-full animate-pulse" />
              
              <img 
                src="/produc.png" 
                alt="Berry Runtz Disposable" 
                className="relative z-10 w-full h-auto object-contain animate-float drop-shadow-[0_0_50px_rgba(118,187,202,0.4)]"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>

        </div>

        {/* Flying Fly - Keeping the previous request's feature */}
        <div className="absolute top-20 right-0 md:right-40 pointer-events-none select-none z-20">
          <img 
            src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Fly.png" 
            alt="Mosca volando" 
            className="w-24 h-24 animate-fly"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>

      {/* Bento Grid Categories - Visual & Modern */}
      <section className="py-24 px-4 bg-brand-black">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[600px]">
            {/* Main Category: COMBOS */}
            <motion.div 
              whileHover={{ scale: 0.99 }}
              className="md:col-span-7 relative group overflow-hidden bg-brand-dark cursor-pointer rounded-[2rem] border border-white/5"
            >
              <Link to="/shop?category=BATERIAS" className="block w-full h-full">
                <img 
                  src="/combos.png" 
                  alt="COMBOS" 
                  className="w-full h-full object-contain opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = "https://picsum.photos/seed/combos/1200/800";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-transparent" />
                <div className="absolute bottom-10 left-10">
                  <h3 className="text-4xl md:text-5xl font-heading font-black text-white uppercase mb-4">COMBOS</h3>
                  <div className="inline-flex items-center gap-2 text-brand-primary font-bold uppercase tracking-widest hover:gap-4 transition-all">
                    Explorar <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Side Categories */}
            <div className="md:col-span-5 grid grid-rows-2 gap-6">
              {/* Top Side: VAPES */}
              <motion.div 
                whileHover={{ scale: 0.99 }}
                className="relative group overflow-hidden bg-brand-dark cursor-pointer rounded-[2rem] border border-white/5"
              >
                <Link to="/shop?category=Desechables" className="block w-full h-full">
                  <img 
                    src="/vapes.png" 
                    alt="VAPES" 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = "https://picsum.photos/seed/vapes/800/600";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-8 left-8">
                    <h3 className="text-3xl font-heading font-black text-white uppercase mb-2">VAPES</h3>
                    <div className="inline-flex items-center gap-2 text-brand-primary text-sm font-bold uppercase tracking-widest">
                      Ver Colección <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>

              {/* Bottom Side: CAPSULAS */}
              <motion.div 
                whileHover={{ scale: 0.99 }}
                className="relative group overflow-hidden bg-brand-dark cursor-pointer rounded-[2rem] border border-white/5"
              >
                <Link to="/shop?category=CARTS NACIONALES" className="block w-full h-full">
                  <img 
                    src="/capsulas.png" 
                    alt="CAPSULAS" 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = "https://picsum.photos/seed/capsulas/800/600";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-8 left-8">
                    <h3 className="text-3xl font-heading font-black text-white uppercase mb-2">CAPSULAS</h3>
                    <div className="inline-flex items-center gap-2 text-brand-primary text-sm font-bold uppercase tracking-widest">
                      Ver Colección <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products - Dark & Premium Catalog */}
      <section className="py-32 bg-brand-black text-white relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-secondary/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-6xl md:text-7xl font-heading font-black uppercase tracking-tighter leading-[0.9] mb-6">
                LOS MÁS <br /> <span className="text-brand-primary">BUSCADOS</span>
              </h2>
              <p className="text-xl text-white/60 font-sans max-w-lg">
                Nuestros productos estrella, seleccionados por la comunidad por su pureza y sabor inigualable.
              </p>
            </div>
            <Link to="/shop" className="group flex items-center gap-3 font-black uppercase tracking-widest text-sm border-b-2 border-brand-primary pb-1 text-brand-primary hover:text-white hover:border-white transition-all">
              VER TODO EL CATÁLOGO <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group relative bg-brand-dark/40 border border-white/5 rounded-[2rem] p-5 hover:border-brand-primary/40 transition-all duration-500 hover:shadow-[0_0_50px_rgba(118,187,202,0.15)] flex flex-col h-full"
              >
                <Link to={`/shop/${product.id}`} className="block relative aspect-square overflow-hidden rounded-2xl bg-brand-black/60 mb-6 group-hover:bg-brand-black/40 transition-colors">
                  <img 
                    src={product.images[0]} 
                    alt={product.name} 
                    className="w-full h-full object-contain p-8 group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.stock < 10 && product.stock > 0 && (
                      <span className="bg-brand-secondary text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg animate-pulse">
                        ÚLTIMAS UNIDADES
                      </span>
                    )}
                  </div>
                  
                  {/* Quick Action Overlay */}
                  <div className="absolute inset-0 bg-brand-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                    <Button 
                      className={`rounded-full font-black uppercase tracking-widest px-10 py-7 shadow-[0_0_30px_rgba(118,187,202,0.5)] transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 ${
                        recentlyAdded.has(product.id) 
                          ? "bg-white text-brand-black scale-105" 
                          : "bg-brand-primary text-brand-black hover:bg-white"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product);
                      }}
                    >
                      {recentlyAdded.has(product.id) ? "¡Añadido! ✅" : "Añadir al Carrito"}
                    </Button>
                  </div>
                </Link>

                <div className="flex flex-col flex-grow px-2">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black text-brand-primary/80 uppercase tracking-[0.25em]">{product.category}</span>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-full border border-white/5">
                      <span className="text-[10px] font-bold text-brand-secondary">{product.rating}</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-secondary shadow-[0_0_8px_rgba(255,0,0,0.5)]" />
                    </div>
                  </div>
                  
                  <Link to={`/shop/${product.id}`} className="mb-4">
                    <h3 className="text-2xl font-heading font-black uppercase tracking-tight group-hover:text-brand-primary transition-colors leading-tight line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  
                  <div className="mt-auto flex justify-between items-center pt-4 border-t border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Precio</span>
                      <span className="text-2xl font-sans font-black text-white">${formatPrice(product.price)}</span>
                    </div>
                    <Link 
                      to={`/shop/${product.id}`}
                      className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center hover:bg-brand-primary hover:border-brand-primary hover:text-brand-black transition-all group/btn shadow-lg"
                    >
                      <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lifestyle / Community - Bold & Social */}
      <section className="relative py-40 overflow-hidden bg-brand-black">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://picsum.photos/seed/texture/1000/1000')] bg-repeat opacity-5 mix-blend-overlay" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.h2 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="text-7xl md:text-9xl font-heading font-black text-white uppercase tracking-tighter mb-12 leading-[0.8]"
            >
              JOIN THE <br /> <span className="text-brand-secondary">FAM</span>
            </motion.h2>
            <p className="text-2xl text-gray-400 font-sans mb-16 max-w-2xl mx-auto leading-relaxed">
              Fly and Chill no es solo una marca, es un ecosistema cultural. 
              Conecta con nosotros y sé parte de la evolución.
            </p>
            <div className="flex flex-wrap justify-center gap-8">
              <Link to="/community">
                <Button size="lg" className="h-20 px-16 text-xl font-black tracking-[0.2em] bg-brand-secondary text-white hover:bg-white hover:text-brand-black transition-all duration-500 rounded-none">
                  EXPLORAR COMUNIDAD
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Text Stroke */}
        <div className="absolute -bottom-10 left-0 w-full overflow-hidden whitespace-nowrap opacity-5 select-none pointer-events-none">
          <div className="text-[20vw] font-heading font-black uppercase tracking-tighter text-transparent border-text-white">
            FLY AND CHILL FLY AND CHILL FLY AND CHILL
          </div>
        </div>
      </section>
    </div>
  );
}

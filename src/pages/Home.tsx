import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Eye, ArrowRight } from "lucide-react";

export function Home() {
  const { addToCart } = useCart();
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen bg-brand-black">
      {/* Hero Section - Full Viewport, Bold & Immersive */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://picsum.photos/seed/vibe/1920/1080?blur=2" 
            alt="Fly and Chill Lifestyle" 
            className="w-full h-full object-cover opacity-40 scale-105 animate-pulse-slow"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-black/20 via-brand-black/40 to-brand-black" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(118,187,202,0.2)_0%,transparent_70%)]" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <span className="inline-block px-4 py-1.5 bg-brand-primary/20 border border-brand-primary/30 text-brand-primary text-xs font-black uppercase tracking-[0.2em] rounded-full mb-6">
              Estilo de Vida & Relajación
            </span>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-heading font-black text-white uppercase tracking-tighter mb-8 leading-[0.85]">
              FLY <br />
              <span className="text-brand-primary">&</span> CHILL
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 font-sans mb-12 max-w-xl leading-relaxed">
              Destilados de alta pureza diseñados para elevar tu experiencia. 
              97% CBD. 100% Auténtico.
            </p>
            <div className="flex flex-wrap gap-6">
              <Link to="/shop">
                <Button size="lg" className="h-16 px-10 text-lg font-black tracking-widest bg-white text-brand-black hover:bg-brand-primary hover:text-white transition-all duration-300 rounded-none">
                  COMPRAR AHORA
                </Button>
              </Link>
              <Link to="/community">
                <Button variant="outline" size="lg" className="h-16 px-10 text-lg font-black tracking-widest border-2 border-white/20 hover:border-brand-primary transition-all duration-300 rounded-none">
                  COMUNIDAD
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bento Grid Categories - Visual & Modern */}
      <section className="py-24 px-4 bg-brand-black">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[600px]">
            {/* Main Category */}
            <motion.div 
              whileHover={{ scale: 0.99 }}
              className="md:col-span-7 relative group overflow-hidden bg-brand-dark cursor-pointer"
            >
              <img 
                src="https://picsum.photos/seed/vape-main/1200/800" 
                alt="Vapes" 
                className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-transparent" />
              <div className="absolute bottom-10 left-10">
                <h3 className="text-4xl md:text-5xl font-heading font-black text-white uppercase mb-4">Vapes</h3>
                <Link to="/shop?category=vapes" className="inline-flex items-center gap-2 text-brand-primary font-bold uppercase tracking-widest hover:gap-4 transition-all">
                  Explorar <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>

            {/* Side Categories */}
            <div className="md:col-span-5 grid grid-rows-2 gap-6">
              <motion.div 
                whileHover={{ scale: 0.99 }}
                className="relative group overflow-hidden bg-brand-dark cursor-pointer"
              >
                <img 
                  src="https://picsum.photos/seed/merch/800/600" 
                  alt="Merch" 
                  className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8">
                  <h3 className="text-3xl font-heading font-black text-white uppercase mb-2">Merch</h3>
                  <Link to="/shop?category=merch" className="text-sm text-brand-secondary font-bold uppercase tracking-widest">Ver Colección</Link>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 0.99 }}
                className="relative group overflow-hidden bg-brand-dark cursor-pointer"
              >
                <img 
                  src="https://picsum.photos/seed/edibles/800/600" 
                  alt="Edibles" 
                  className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8">
                  <h3 className="text-3xl font-heading font-black text-white uppercase mb-2">Edibles</h3>
                  <Link to="/shop?category=edibles" className="text-sm text-brand-primary font-bold uppercase tracking-widest">Próximamente</Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products - Clean & High Impact */}
      <section className="py-32 bg-white text-brand-black">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-6xl md:text-7xl font-heading font-black uppercase tracking-tighter leading-[0.9] mb-6">
                LOS MÁS <br /> <span className="text-brand-primary">BUSCADOS</span>
              </h2>
              <p className="text-xl text-gray-600 font-sans">
                Nuestros productos estrella, seleccionados por la comunidad por su pureza y sabor inigualable.
              </p>
            </div>
            <Link to="/shop" className="group flex items-center gap-3 font-black uppercase tracking-widest text-sm border-b-2 border-brand-black pb-1 hover:text-brand-primary hover:border-brand-primary transition-all">
              VER TODO EL CATÁLOGO <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {featuredProducts.map((product) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                <Link to={`/shop/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-100 mb-6">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-brand-black text-white text-[10px] font-black px-3 py-1 uppercase tracking-widest">
                      {product.cbdContent} CBD
                    </span>
                  </div>
                  {/* Quick Add Button */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <Button 
                      className="w-full bg-brand-black text-white hover:bg-brand-primary rounded-none font-black uppercase tracking-widest py-4"
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart(product);
                      }}
                    >
                      Añadir +
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
                  <div className="text-xl font-sans font-bold text-gray-500">${product.price.toFixed(2)}</div>
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

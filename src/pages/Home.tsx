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
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-brand-black">
          <img 
            src="https://picsum.photos/seed/vape-hero/1920/1080?blur=4" 
            alt="Fly and Chill Hero" 
            className="w-full h-full object-cover opacity-30"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/50 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(118,187,202,0.15)_0%,transparent_60%)]" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-heading font-black text-white uppercase tracking-tighter mb-6 leading-none">
              Fly and Chill: <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-brand-amber">
                Premium CBD Vapes
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 font-sans mb-10 max-w-2xl mx-auto">
              Para relajación y creatividad. Destilados de alta pureza con 97% CBD, 
              diseñados para ofrecer una experiencia potente y consistente.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/shop">
                <Button size="lg" className="w-full sm:w-auto text-lg font-bold">
                  COMPRAR AHORA
                </Button>
              </Link>
              <Link to="/community">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg">
                  ÚNETE A LA COMUNIDAD
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Promotions Carousel (Static for now) */}
      <section className="bg-brand-dark py-12 border-y border-brand-gold/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between bg-brand-black border border-brand-gold/20 rounded-2xl p-8 overflow-hidden relative group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(118,187,202,0.1)_0%,transparent_50%)]" />
            <div className="relative z-10 md:w-1/2 mb-8 md:mb-0">
              <span className="inline-block px-3 py-1 bg-brand-amber text-brand-black text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                Nuevo Lanzamiento
              </span>
              <h2 className="text-3xl md:text-4xl font-heading font-black text-white uppercase mb-4">
                Cinnamon Bun Disposable
              </h2>
              <p className="text-gray-400 mb-6 font-sans">
                El sabor más esperado ya está aquí. 20% de descuento por tiempo limitado.
              </p>
              <Button onClick={() => addToCart(products[0])} className="font-bold">
                AÑADIR AL CARRITO - $45.00
              </Button>
            </div>
            <div className="relative z-10 md:w-1/2 flex justify-center">
              <img 
                src={products[0].image} 
                alt={products[0].name} 
                className="w-64 h-64 object-cover rounded-xl shadow-2xl shadow-brand-amber/20 group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-brand-black">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-heading font-black text-white uppercase tracking-tighter mb-2">
                Los Más Buscados
              </h2>
              <p className="text-brand-gold font-sans">Potencia, pureza y sabor consistente.</p>
            </div>
            <Link to="/shop" className="hidden sm:flex items-center gap-2 text-brand-amber hover:text-brand-gold font-bold uppercase text-sm transition-colors">
              Ver todo el catálogo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <motion.div 
                key={product.id}
                whileHover={{ y: -5 }}
                className="bg-brand-dark border border-brand-gold/10 rounded-xl overflow-hidden group flex flex-col"
              >
                <Link to={`/shop/${product.id}`} className="relative aspect-square overflow-hidden bg-black block">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-brand-black/80 backdrop-blur-sm text-brand-gold text-xs font-bold px-2 py-1 rounded border border-brand-gold/20">
                      {product.cbdContent} CBD
                    </span>
                  </div>
                  {/* Quick View Overlay */}
                  <div className="absolute inset-0 bg-brand-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <Button 
                      variant="amber" 
                      size="icon" 
                      className="rounded-full"
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
                      onClick={() => addToCart(product)}
                    >
                      Añadir
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-8 sm:hidden flex justify-center">
            <Link to="/shop">
              <Button variant="outline" className="w-full">Ver todo el catálogo</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Community Teaser */}
      <section className="py-24 bg-brand-dark relative overflow-hidden border-t border-brand-gold/10">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://picsum.photos/seed/pattern/1000/1000')] bg-repeat opacity-10 mix-blend-overlay"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-heading font-black text-white uppercase tracking-tighter mb-6">
            Join Our <span className="text-brand-green">Chill Zone</span>
          </h2>
          <p className="text-lg text-gray-300 font-sans mb-10 max-w-2xl mx-auto">
            Fly and Chill no es solo una marca, es un ecosistema cultural. 
            Descubre nuestras playlists, memes y conecta con la comunidad.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/community">
              <Button size="lg" variant="green" className="font-bold">
                EXPLORAR COMUNIDAD
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

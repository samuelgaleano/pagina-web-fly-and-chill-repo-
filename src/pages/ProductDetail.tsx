import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useShop } from "@/context/ShopContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Star, ArrowLeft, ShieldCheck, Truck, Droplet, Minus, Plus, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/formatters";

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, loading } = useShop();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const product = products.find(p => p.id === id);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-black">
        <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 bg-brand-black">
        <h2 className="serif text-4xl italic text-white mb-4">Producto no encontrado</h2>
        <p className="text-gray-400 mb-8">El producto que buscas no existe o ha sido retirado.</p>
        <Button onClick={() => navigate("/shop")} className="rounded-full px-10">Volver a la tienda</Button>
      </div>
    );
  }

  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);

  return (
    <div className="bg-brand-black min-h-screen pt-40 pb-24 text-white">
      <div className="container mx-auto px-6">
        <Link to="/shop" className="inline-flex items-center gap-3 text-gray-400 hover:text-brand-primary transition-colors mb-12 text-[10px] font-bold uppercase tracking-[0.3em]">
          <ArrowLeft className="w-4 h-4" /> Volver al catálogo
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 mb-20">
          {/* Image Gallery - 7 columns on desktop */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div 
              key={activeImageIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden relative group"
            >
              <img 
                src={product.images[activeImageIndex]} 
                alt={product.name} 
                className="w-full h-full object-contain p-6 md:p-12 group-hover:scale-105 transition-transform duration-1000"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            
            {/* Thumbnails - Horizontal scroll on mobile */}
            <div className="flex lg:grid lg:grid-cols-6 gap-4 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 no-scrollbar">
              {product.images.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImageIndex(i)}
                  className={`flex-shrink-0 w-20 h-20 lg:w-auto lg:h-auto aspect-square bg-white/5 rounded-2xl border transition-all ${
                    activeImageIndex === i ? "border-brand-primary ring-1 ring-brand-primary" : "border-white/10 opacity-50 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info - 5 columns on desktop */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-brand-primary text-[10px] font-black uppercase tracking-[0.4em]">{product.category}</span>
              <span className="w-1 h-1 rounded-full bg-white/20"></span>
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em]">{product.flavors.join(" / ")}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white uppercase tracking-tighter leading-[0.9] mb-6">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center text-brand-primary">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-current" : "opacity-30"}`} />
                ))}
              </div>
              <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">({product.rating} / 5.0)</span>
            </div>
            
            <div className="serif text-4xl md:text-5xl italic text-brand-primary mb-10 flex items-baseline gap-2">
              <span className="text-sm not-italic font-black uppercase tracking-widest text-white/40 mr-2">Precio</span>
              ${formatPrice(product.price)}
            </div>
            
            {/* Quick Features */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
                  <Droplet className="w-5 h-5 text-brand-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Pureza</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Premium</span>
                </div>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-brand-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Calidad</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Orgánico</span>
                </div>
              </div>
            </div>

            {/* Purchase Controls */}
            <div className="space-y-6 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-md shadow-2xl relative overflow-hidden group/purchase">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover/purchase:bg-brand-primary/10 transition-colors" />
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center bg-brand-black/40 border border-white/10 rounded-full p-1.5 shadow-inner">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-brand-primary hover:bg-white/5 rounded-full transition-all"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-black text-lg text-white">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-brand-primary hover:bg-white/5 rounded-full transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-right">
                  <div className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">Disponibilidad</div>
                  <div className="text-[10px] font-black uppercase tracking-widest">
                    {product.stock > 0 ? (
                      <span className="text-brand-primary flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                        {product.stock} EN STOCK
                      </span>
                    ) : (
                      <span className="text-brand-secondary">AGOTADO</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 relative z-10">
                <Button 
                  size="lg" 
                  className="w-full h-20 text-xs font-black tracking-[0.3em] bg-brand-primary text-brand-black hover:bg-white rounded-[1.5rem] transition-all shadow-[0_20px_40px_-15px_rgba(118,187,202,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(118,187,202,0.4)] active:scale-95"
                  disabled={product.stock === 0}
                  onClick={() => addToCart(product, quantity)}
                >
                  AÑADIR AL CARRITO
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full h-16 text-[10px] font-black tracking-[0.2em] border-white/10 hover:border-brand-primary text-white hover:text-brand-primary rounded-[1.25rem] transition-all hover:bg-brand-primary/5 group/buy"
                  disabled={product.stock === 0}
                  onClick={() => {
                    addToCart(product, quantity);
                    navigate("/checkout");
                  }}
                >
                  <span className="group-hover/buy:scale-110 transition-transform">COMPRAR AHORA</span>
                </Button>
              </div>

              <div className="pt-6 mt-2 border-t border-white/5 space-y-4 relative z-10">
                <div className="flex items-center justify-center gap-8">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-brand-primary/60" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Envío Gratis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-primary/60" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Pago Seguro</span>
                  </div>
                </div>
                
                {/* Payment Icons Placeholder */}
                <div className="flex justify-center gap-3 opacity-30 grayscale">
                  <div className="w-8 h-5 bg-white/20 rounded-sm" />
                  <div className="w-8 h-5 bg-white/20 rounded-sm" />
                  <div className="w-8 h-5 bg-white/20 rounded-sm" />
                  <div className="w-8 h-5 bg-white/20 rounded-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Info Section - Full Width for Long Descriptions */}
        <div className="mb-32 bg-white/5 rounded-[3rem] border border-white/10 overflow-hidden">
          <div className="flex border-b border-white/10 bg-white/5 overflow-x-auto no-scrollbar">
            {["description", "ingredients", "shipping"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative whitespace-nowrap ${
                  activeTab === tab ? "text-brand-primary bg-white/5" : "text-gray-500 hover:text-white"
                }`}
              >
                {tab === "description" ? "Descripción Detallada" : tab === "ingredients" ? "Ingredientes" : "Envío & Entrega"}
                {activeTab === tab && (
                  <motion.div layoutId="activeTabDetail" className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-primary" />
                )}
              </button>
            ))}
          </div>
          <div className="p-8 md:p-12 lg:p-16">
            <div className="serif text-xl md:text-2xl text-white/70 leading-relaxed max-w-5xl italic">
              {activeTab === "description" && (
                <div className="space-y-8">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="w-12 h-[1px] bg-brand-primary/30"></span>
                    <h3 className="not-italic font-heading font-black uppercase tracking-[0.4em] text-xs text-brand-primary">La Experiencia Fly & Chill</h3>
                  </div>
                  <p>{product.description}</p>
                  <p>Nuestra fórmula exclusiva ha sido perfeccionada para ofrecer un equilibrio perfecto entre relajación y claridad mental. Cada lote es testeado en laboratorios independientes para garantizar la ausencia de metales pesados, pesticidas y solventes residuales.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-italic mt-12">
                    <div className="space-y-2">
                      <h4 className="font-heading font-black text-sm uppercase tracking-widest text-white">Calidad Garantizada</h4>
                      <p className="text-sm text-gray-500 font-sans">Pureza verificada por lote para asegurar la mejor experiencia en cada sesión.</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-heading font-black text-sm uppercase tracking-widest text-white">Sabor Premium</h4>
                      <p className="text-sm text-gray-500 font-sans">Terpenos de grado alimenticio que capturan la esencia natural de cada variedad.</p>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "ingredients" && (
                <div className="space-y-8">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="w-12 h-[1px] bg-brand-primary/30"></span>
                    <h3 className="not-italic font-heading font-black uppercase tracking-[0.4em] text-xs text-brand-primary">Pureza Sin Compromisos</h3>
                  </div>
                  <ul className="space-y-4 font-sans not-italic text-lg">
                    <li className="flex items-center gap-4 border-b border-white/5 pb-4">
                      <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
                      <span>Destilado Premium de amplio espectro</span>
                    </li>
                    <li className="flex items-center gap-4 border-b border-white/5 pb-4">
                      <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
                      <span>Terpenos botánicos naturales específicos de la cepa</span>
                    </li>
                    <li className="flex items-center gap-4 border-b border-white/5 pb-4">
                      <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
                      <span>Libre de VG, PG, PEG y Aceites MCT</span>
                    </li>
                    <li className="flex items-center gap-4">
                      <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
                      <span>Cáñamo orgánico cultivado bajo estándares de la UE/EE.UU.</span>
                    </li>
                  </ul>
                </div>
              )}
              {activeTab === "shipping" && (
                <div className="space-y-12 not-italic font-sans">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                          <Truck className="w-6 h-6 text-brand-primary" />
                        </div>
                        <h5 className="font-heading font-black uppercase tracking-widest text-white text-sm">Logística Territorial (Bogotá)</h5>
                      </div>
                      <p className="text-base text-gray-400">Envíos y entregas en Bogotá son inmediatas en menos de 24 horas según disponibilidad.</p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                          <Truck className="w-6 h-6 text-brand-primary" />
                        </div>
                        <h5 className="font-heading font-black uppercase tracking-widest text-white text-sm">Logística Nacional</h5>
                      </div>
                      <p className="text-base text-gray-400">Envíos a todo el país. Tiempo estimado de entrega: 2-4 días hábiles dependiendo de la ubicación.</p>
                    </div>
                  </div>
                  <div className="p-6 bg-brand-secondary/10 border border-brand-secondary/20 rounded-2xl">
                    <p className="text-xs text-brand-secondary font-black uppercase tracking-widest text-center">
                      IMPORTANTE: Se requiere verificación de mayoría de edad (18+/21+) al momento de la entrega.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-12">
              <span className="w-8 h-[1px] bg-brand-primary"></span>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary">
                También te podría gustar
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {relatedProducts.map((related) => (
                <motion.div 
                  key={related.id}
                  whileHover={{ y: -10 }}
                  className="group"
                >
                  <Link to={`/shop/${related.id}`} className="block relative aspect-square overflow-hidden bg-white/5 border border-white/10 rounded-3xl shadow-sm mb-6">
                    <img 
                      src={related.images[0]} 
                      alt={related.name} 
                      className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-1000"
                      referrerPolicy="no-referrer"
                    />
                  </Link>
                  <div className="text-center space-y-2">
                    <Link to={`/shop/${related.id}`}>
                      <h3 className="text-xl font-heading font-black uppercase tracking-tighter text-white group-hover:text-brand-primary transition-colors">
                        {related.name}
                      </h3>
                    </Link>
                    <div className="serif text-xl italic text-brand-primary">${formatPrice(related.price)}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

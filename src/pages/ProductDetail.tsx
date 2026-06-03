import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useShop } from "@/context/ShopContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Star, ArrowLeft, ArrowRight, ShieldCheck, Truck, Droplet, Minus, Plus, Loader2, Phone, ChevronLeft, ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/formatters";

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, loading } = useShop();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);

  const product = products.find(p => p.id === id);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

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
    <div className="bg-brand-black min-h-screen pt-20 pb-28 lg:pb-16 text-white overflow-x-hidden">
      <div className="container mx-auto px-5 max-w-7xl">
        <Link to="/shop" className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-primary transition-colors mb-3 text-[9px] font-black uppercase tracking-[0.2em] opacity-50 hover:opacity-100">
          <ArrowLeft className="w-3 h-3" /> Volver
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 mb-12">
          <div className="lg:col-span-7">
            <div className="relative group aspect-[4/5] md:aspect-square bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden shadow-brand-primary/5">
              <motion.div 
                key={activeImageIndex}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full h-full flex items-center justify-center p-3 md:p-8"
              >
                <motion.img 
                  src={product.images[activeImageIndex]} 
                  alt={product.name} 
                  className="w-full h-full object-contain cursor-grab active:cursor-grabbing"
                  referrerPolicy="no-referrer"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.1}
                  onDragEnd={(_, info) => {
                    const swipeThreshold = 40;
                    if (info.offset.x > swipeThreshold) {
                      setActiveImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
                    } else if (info.offset.x < -swipeThreshold) {
                      setActiveImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
                    }
                  }}
                />
              </motion.div>

              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <button 
                    onClick={() => setActiveImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white transition-all opacity-0 group-hover:opacity-100 hidden md:flex z-20"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={() => setActiveImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white transition-all opacity-0 group-hover:opacity-100 hidden md:flex z-20"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Mobile Arrows (Visible by default) */}
              {product.images.length > 1 && (
                <div className="absolute inset-x-0 bottom-10 flex items-center justify-between px-6 md:hidden z-20 pointer-events-none">
                  <button 
                    onClick={() => setActiveImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white pointer-events-auto"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setActiveImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white pointer-events-auto"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Progress Indicators */}
              {product.images.length > 1 && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2.5 z-10">
                  {product.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIndex(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        activeImageIndex === i ? "w-8 bg-brand-primary" : "w-1.5 bg-white/20 hover:bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:col-span-5 flex flex-col pt-0 lg:pt-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-brand-primary text-[10px] font-black uppercase tracking-[0.4em]">{product.category}</span>
              <span className="w-1 h-1 rounded-full bg-white/20"></span>
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em]">{product.flavors.join(" / ")}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-heading font-black text-white uppercase tracking-tighter leading-[0.8] mb-6">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-6 opacity-70">
              <div className="flex items-center text-brand-primary">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? "fill-current" : "opacity-30"}`} />
                ))}
              </div>
              <span className="text-gray-400 text-[9px] font-black uppercase tracking-widest">({product.rating} / 5.0)</span>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div className="serif text-4xl md:text-5xl lg:text-6xl italic text-brand-primary flex items-baseline gap-2">
                <span className="text-[10px] not-italic font-black uppercase tracking-[0.3em] text-white/30 mr-2">Valor</span>
                ${formatPrice(product.price)}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 shrink-0 h-14">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-brand-primary transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center font-black text-lg text-white">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-brand-primary transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                
                {product.stock > 0 ? (
                  <div className="flex flex-col gap-1 pr-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${product.stock <= 5 ? "bg-brand-secondary" : "bg-brand-primary"} animate-pulse`} />
                      <span className="text-white text-[9px] font-black uppercase tracking-[0.2em]">
                        {product.stock <= 5 ? "POCAS UNIDADES" : "DISPONIBLE"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-2 rounded-xl border border-brand-secondary/30 bg-brand-secondary/5">
                    <span className="text-brand-secondary text-[9px] font-black uppercase tracking-[0.2em]">AGOTADO</span>
                  </div>
                )}
              </div>
            </div>

            {/* Main Purchase Section - Consolidated Card */}
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 mb-8 relative group/purchase overflow-hidden transition-all hover:bg-white/[0.07] hover:border-white/20">
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover/purchase:bg-brand-primary/10 transition-all duration-700" />
              
              <div className="relative z-10 space-y-8">
                {/* Acción PRINCIPAL: comprar ahora (va directo al checkout, el
                    camino más corto a la venta). */}
                <div className="flex flex-col gap-4">
                  <Button
                    size="lg"
                    className="w-full h-16 text-sm font-black tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-brand-primary/20 active:scale-95 bg-brand-primary text-brand-black hover:bg-white flex items-center justify-center gap-3"
                    disabled={product.stock === 0}
                    onClick={() => {
                      addToCart(product, quantity);
                      navigate("/checkout");
                    }}
                  >
                    {product.stock === 0 ? "AGOTADO" : "COMPRAR AHORA"}
                    {product.stock > 0 && <ArrowRight className="w-5 h-5" />}
                  </Button>
                </div>

                {/* Acciones secundarias: añadir al carrito (sin salir) + WhatsApp. */}
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className={`h-14 text-[10px] font-black tracking-[0.2em] rounded-2xl transition-all ${
                      isAdded
                        ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                        : "border-white/10 hover:border-brand-primary text-white hover:text-brand-primary hover:bg-white/5"
                    }`}
                    disabled={product.stock === 0}
                    onClick={handleAddToCart}
                  >
                    {isAdded ? "¡AÑADIDO! ✅" : "AÑADIR AL CARRITO"}
                  </Button>
                  <a
                    href={`https://api.whatsapp.com/send?phone=573019202618&text=Hola!%20Estoy%20interesado%20en%20el%20producto:%20${product.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-14 flex items-center justify-center gap-3 text-[10px] font-black tracking-[0.15em] border border-[#25D366]/30 bg-[#25D366]/5 hover:bg-[#25D366]/10 text-[#25D366] rounded-2xl transition-all"
                  >
                    <Phone className="w-4 h-4 fill-[#25D366]" />
                    WHATSAPP
                  </a>
                </div>

                {/* Shipping & Security Info - Integrated at bottom of card */}
                <div className="pt-8 border-t border-white/5">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                        <Truck className="w-4 h-4 text-brand-primary/80" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Envío Gratis</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4 text-brand-primary/80" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Pago Seguro</span>
                    </div>
                  </div>
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

      {/* Barra de compra FIJA inferior — solo móvil. Estándar de e-commerce
          para que comprar esté siempre a un toque sin tener que hacer scroll. */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-brand-black/90 backdrop-blur-xl border-t border-white/10 px-4 py-3 flex items-center gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col shrink-0">
          <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Precio</span>
          <span className="text-xl font-sans font-black text-brand-primary leading-none">${formatPrice(product.price)}</span>
        </div>
        <Button
          className="flex-1 h-14 text-xs font-black tracking-[0.2em] rounded-2xl bg-brand-primary text-brand-black hover:bg-white active:scale-95 transition-all flex items-center justify-center gap-2"
          disabled={product.stock === 0}
          onClick={() => {
            addToCart(product, quantity);
            navigate("/checkout");
          }}
        >
          {product.stock === 0 ? "AGOTADO" : "COMPRAR AHORA"}
          {product.stock > 0 && <ArrowRight className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}

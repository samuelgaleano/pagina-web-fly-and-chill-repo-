import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Star, ArrowLeft, ShieldCheck, Truck, Droplet, Minus, Plus } from "lucide-react";

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  const product = products.find(p => p.id === id);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 bg-brand-paper">
        <h2 className="serif text-4xl italic text-brand-black mb-4">Producto no encontrado</h2>
        <p className="text-gray-500 mb-8">El producto que buscas no existe o ha sido retirado.</p>
        <Button onClick={() => navigate("/shop")} className="rounded-full px-10">Volver a la tienda</Button>
      </div>
    );
  }

  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);

  return (
    <div className="bg-brand-paper min-h-screen pt-40 pb-24 text-brand-black">
      <div className="container mx-auto px-6">
        <Link to="/shop" className="inline-flex items-center gap-3 text-gray-400 hover:text-brand-primary transition-colors mb-12 text-[10px] font-bold uppercase tracking-[0.3em]">
          <ArrowLeft className="w-4 h-4" /> Volver al catálogo
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 mb-32">
          {/* Image Gallery */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square bg-white rounded-3xl shadow-sm overflow-hidden relative group"
            >
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-6 left-6">
                <div className="bg-brand-black text-white text-[10px] font-bold px-5 py-2 rounded-full uppercase tracking-widest">
                  {product.cbdContent} CBD
                </div>
              </div>
            </motion.div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <button key={i} className="aspect-square bg-white rounded-2xl shadow-sm overflow-hidden hover:ring-2 ring-brand-primary transition-all">
                  <img src={`${product.image}?sig=${i}`} alt="" className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-brand-primary text-[10px] font-bold uppercase tracking-[0.3em]">{product.category}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em]">{product.flavor}</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-heading font-black text-brand-black uppercase tracking-tighter leading-none mb-6">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center text-brand-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-current" : "opacity-30"}`} />
                ))}
              </div>
              <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">({product.rating} / 5.0)</span>
            </div>
            
            <div className="serif text-4xl italic text-brand-black mb-10">
              ${product.price.toFixed(2)}
            </div>
            
            <p className="serif text-2xl text-gray-600 leading-relaxed mb-12 italic">
              "{product.description}"
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-black/5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                  <Droplet className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <h4 className="text-brand-black font-bold text-xs uppercase tracking-widest mb-1">Pureza Extrema</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">Destilado refinado para máxima potencia.</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-black/5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-brand-green" />
                </div>
                <div>
                  <h4 className="text-brand-black font-bold text-xs uppercase tracking-widest mb-1">100% Orgánico</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">Materia prima de la más alta calidad.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 mb-12">
              <div className="flex items-center bg-white border border-brand-black/10 rounded-full p-1 w-full sm:w-auto">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-brand-primary transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-brand-primary transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest">
                {product.stock > 0 ? (
                  <span className="text-brand-green">{product.stock} DISPONIBLES</span>
                ) : (
                  <span className="text-red-500">AGOTADO TEMPORALMENTE</span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="flex-1 h-16 text-xs font-black tracking-widest bg-brand-black text-white hover:bg-brand-primary rounded-full transition-all"
                disabled={product.stock === 0}
                onClick={() => addToCart(product, quantity)}
              >
                AÑADIR AL CARRITO
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="flex-1 h-16 text-xs font-black tracking-widest border-brand-black/10 hover:border-brand-primary rounded-full transition-all"
                disabled={product.stock === 0}
                onClick={() => {
                  addToCart(product, quantity);
                  navigate("/checkout");
                }}
              >
                COMPRAR AHORA
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs - Editorial Style */}
        <div className="mb-32">
          <div className="flex gap-12 border-b border-brand-black/5 mb-12 overflow-x-auto no-scrollbar">
            {["description", "ingredients", "shipping"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-6 text-[10px] font-bold uppercase tracking-[0.3em] transition-all relative whitespace-nowrap ${
                  activeTab === tab ? "text-brand-black" : "text-gray-400 hover:text-brand-black"
                }`}
              >
                {tab === "description" ? "Descripción" : tab === "ingredients" ? "Ingredientes" : "Envío"}
                {activeTab === tab && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-primary" />
                )}
              </button>
            ))}
          </div>
          <div className="serif text-2xl text-gray-600 leading-relaxed max-w-4xl italic">
            {activeTab === "description" && (
              <div className="space-y-6">
                <p>La experiencia Fly and Chill se caracteriza por un efecto rápido, sabor limpio y potencia consistente. Nuestros destilados son sometidos a rigurosos procesos de refinamiento para alcanzar hasta un 97% de pureza de CBD.</p>
                <p>Diseñado para el estilo de vida urbano, este producto combina tecnología de extracción avanzada con un perfil de terpenos cuidadosamente seleccionado para ofrecer la mejor experiencia en cada inhalación.</p>
              </div>
            )}
            {activeTab === "ingredients" && (
              <ul className="list-disc pl-8 space-y-4">
                <li>Destilado de CBD de amplio espectro (97% pureza)</li>
                <li>Terpenos botánicos naturales</li>
                <li>Sin VG, PG, PEG, MCT o Vitamina E Acetato</li>
                <li>Cultivado orgánicamente en EE.UU.</li>
              </ul>
            )}
            {activeTab === "shipping" && (
              <div className="space-y-8 not-italic">
                <div className="flex items-start gap-4">
                  <Truck className="w-6 h-6 text-brand-primary shrink-0 mt-1" />
                  <div>
                    <h5 className="font-heading font-black uppercase tracking-widest text-brand-black text-sm mb-2">Envío Estándar Gratuito</h5>
                    <p className="text-lg text-gray-500">En pedidos superiores a $100. Entrega en 3-5 días hábiles.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Truck className="w-6 h-6 text-brand-gold shrink-0 mt-1" />
                  <div>
                    <h5 className="font-heading font-black uppercase tracking-widest text-brand-black text-sm mb-2">Envío Express</h5>
                    <p className="text-lg text-gray-500">$15.00. Entrega en 1-2 días hábiles.</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-8">Nota: Todos los envíos requieren firma de un adulto (21+) en el momento de la entrega.</p>
              </div>
            )}
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
                  <Link to={`/shop/${related.id}`} className="block relative aspect-square overflow-hidden bg-white rounded-3xl shadow-sm mb-6">
                    <img 
                      src={related.image} 
                      alt={related.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                      referrerPolicy="no-referrer"
                    />
                  </Link>
                  <div className="text-center space-y-2">
                    <Link to={`/shop/${related.id}`}>
                      <h3 className="text-xl font-heading font-black uppercase tracking-tighter group-hover:text-brand-primary transition-colors">
                        {related.name}
                      </h3>
                    </Link>
                    <div className="serif text-xl italic text-gray-500">${related.price.toFixed(2)}</div>
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

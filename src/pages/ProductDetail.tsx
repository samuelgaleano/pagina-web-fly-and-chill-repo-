import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Star, ArrowLeft, ShieldCheck, Truck, Droplet } from "lucide-react";

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  const product = products.find(p => p.id === id);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl font-heading font-bold text-white mb-4">Producto no encontrado</h2>
        <p className="text-gray-400 mb-8">El producto que buscas no existe o ha sido retirado.</p>
        <Button onClick={() => navigate("/shop")}>Volver a la tienda</Button>
      </div>
    );
  }

  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);

  return (
    <div className="bg-brand-black min-h-screen py-12">
      <div className="container mx-auto px-4">
        <Link to="/shop" className="inline-flex items-center gap-2 text-gray-400 hover:text-brand-gold transition-colors mb-8 text-sm font-bold uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4" /> Volver al catálogo
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 mb-24">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-brand-dark rounded-2xl border border-brand-gold/10 overflow-hidden relative group">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-brand-black/80 backdrop-blur-sm text-brand-gold text-sm font-bold px-3 py-1.5 rounded border border-brand-gold/20">
                  {product.cbdContent} CBD
                </span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <button key={i} className="aspect-square bg-brand-dark rounded-lg border border-brand-gold/10 overflow-hidden hover:border-brand-amber transition-colors">
                  <img src={`${product.image}?sig=${i}`} alt="" className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-brand-amber text-sm font-bold uppercase tracking-wider">{product.category}</span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-400 text-sm">{product.flavor}</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-heading font-black text-white uppercase tracking-tighter mb-4">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center text-brand-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? "fill-current" : "opacity-30"}`} />
                ))}
              </div>
              <span className="text-gray-400 text-sm">({product.rating} / 5.0)</span>
            </div>
            
            <div className="text-3xl font-bold text-white mb-8">
              ${product.price.toFixed(2)}
            </div>
            
            <p className="text-gray-300 font-sans leading-relaxed mb-8">
              {product.description}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-brand-dark p-4 rounded-xl border border-brand-gold/10 flex items-start gap-3">
                <Droplet className="w-6 h-6 text-brand-amber shrink-0" />
                <div>
                  <h4 className="text-white font-bold text-sm mb-1">Pureza Extrema</h4>
                  <p className="text-gray-400 text-xs">Destilado refinado para máxima potencia.</p>
                </div>
              </div>
              <div className="bg-brand-dark p-4 rounded-xl border border-brand-gold/10 flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-brand-green shrink-0" />
                <div>
                  <h4 className="text-white font-bold text-sm mb-1">100% Orgánico</h4>
                  <p className="text-gray-400 text-xs">Materia prima de la más alta calidad.</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center bg-brand-dark border border-brand-gold/20 rounded-lg">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-brand-gold transition-colors"
                >
                  -
                </button>
                <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-brand-gold transition-colors"
                >
                  +
                </button>
              </div>
              <div className="text-sm text-gray-400">
                {product.stock > 0 ? (
                  <span className="text-brand-green">{product.stock} disponibles en stock</span>
                ) : (
                  <span className="text-red-500">Agotado temporalmente</span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <Button 
                size="lg" 
                className="flex-1 text-lg font-bold"
                disabled={product.stock === 0}
                onClick={() => addToCart(product, quantity)}
              >
                AÑADIR AL CARRITO
              </Button>
              <Button 
                variant="amber" 
                size="lg" 
                className="flex-1 text-lg font-bold"
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

        {/* Tabs */}
        <div className="mb-24">
          <div className="flex border-b border-brand-gold/10 mb-8">
            {["description", "ingredients", "shipping"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 font-heading font-bold uppercase tracking-wider text-sm transition-colors relative ${
                  activeTab === tab ? "text-brand-gold" : "text-gray-400 hover:text-white"
                }`}
              >
                {tab === "description" ? "Descripción" : tab === "ingredients" ? "Ingredientes" : "Envío"}
                {activeTab === tab && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gold" />
                )}
              </button>
            ))}
          </div>
          <div className="text-gray-300 font-sans leading-relaxed max-w-3xl">
            {activeTab === "description" && (
              <div className="space-y-4">
                <p>La experiencia Fly and Chill se caracteriza por un efecto rápido, sabor limpio y potencia consistente. Nuestros destilados son sometidos a rigurosos procesos de refinamiento para alcanzar hasta un 97% de pureza de CBD.</p>
                <p>Diseñado para el estilo de vida urbano, este producto combina tecnología de extracción avanzada con un perfil de terpenos cuidadosamente seleccionado para ofrecer la mejor experiencia en cada inhalación.</p>
              </div>
            )}
            {activeTab === "ingredients" && (
              <ul className="list-disc pl-5 space-y-2">
                <li>Destilado de CBD de amplio espectro (97% pureza)</li>
                <li>Terpenos botánicos naturales</li>
                <li>Sin VG, PG, PEG, MCT o Vitamina E Acetato</li>
                <li>Cultivado orgánicamente en EE.UU.</li>
              </ul>
            )}
            {activeTab === "shipping" && (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-brand-amber shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-white mb-1">Envío Estándar Gratuito</h5>
                    <p className="text-sm">En pedidos superiores a $100. Entrega en 3-5 días hábiles.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-white mb-1">Envío Express</h5>
                    <p className="text-sm">$15.00. Entrega en 1-2 días hábiles.</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4">Nota: Todos los envíos requieren firma de un adulto (21+) en el momento de la entrega.</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-3xl font-heading font-black text-white uppercase tracking-tighter mb-8">
              También te podría gustar
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedProducts.map((related) => (
                <Link key={related.id} to={`/shop/${related.id}`} className="bg-brand-dark border border-brand-gold/10 rounded-xl overflow-hidden group flex flex-col">
                  <div className="aspect-square overflow-hidden bg-black">
                    <img 
                      src={related.image} 
                      alt={related.name} 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-heading font-bold text-white mb-2 group-hover:text-brand-gold transition-colors">
                      {related.name}
                    </h3>
                    <span className="text-xl font-bold text-white">${related.price.toFixed(2)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

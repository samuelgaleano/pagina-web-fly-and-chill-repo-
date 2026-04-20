import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Trash2, ArrowRight, ShoppingBag, Minus, Plus } from "lucide-react";
import { motion } from "motion/react";
import { formatPrice } from "@/lib/formatters";

export function Cart() {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 bg-brand-black pt-32">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shadow-2xl mb-8">
          <ShoppingBag className="w-10 h-10 text-brand-primary/30" />
        </div>
        <h2 className="serif text-4xl italic text-white mb-4">Tu carrito está vacío</h2>
        <p className="text-gray-400 mb-10 font-sans max-w-md leading-relaxed">
          Parece que aún no has seleccionado ninguna de nuestras piezas exclusivas. 
          Explora nuestra colección y encuentra tu experiencia ideal.
        </p>
        <Link to="/shop">
          <Button size="lg" className="rounded-full px-12 py-6 text-xs font-black uppercase tracking-widest bg-brand-primary text-brand-black hover:bg-white transition-all">
            Ir a la Colección
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-brand-black min-h-screen pt-40 pb-24 text-white">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex items-center gap-3 mb-12">
          <span className="w-8 h-[1px] bg-brand-primary"></span>
          <h1 className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary">
            Tu Selección Personal
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Cart Items */}
          <div className="flex-1 space-y-8">
            {items.map((item) => (
              <motion.div 
                key={item.id} 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-8 relative group border border-white/10 shadow-2xl"
              >
                <Link to={`/shop/${item.id}`} className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 bg-brand-black/40 rounded-2xl overflow-hidden group-hover:shadow-[0_0_30px_rgba(118,187,202,0.2)] transition-all duration-500 flex items-center justify-center">
                  <img 
                    src={item.images[0]} 
                    alt={item.name} 
                    className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-1000"
                    referrerPolicy="no-referrer"
                  />
                </Link>
                
                <div className="flex-1 flex flex-col w-full">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-brand-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-2 block">
                        {item.category}
                      </span>
                      <Link to={`/shop/${item.id}`}>
                        <h3 className="text-2xl font-heading font-black text-white uppercase tracking-tighter hover:text-brand-primary transition-colors line-clamp-1">
                          {item.name}
                        </h3>
                      </Link>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-500 hover:text-brand-secondary transition-colors p-2"
                      aria-label="Eliminar producto"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <p className="serif text-lg text-gray-400 italic mb-6">
                    {item.flavors.join(" / ")} • {item.cbdContent}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center bg-brand-black/40 border border-white/10 rounded-full p-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-brand-primary transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-bold text-white">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-brand-primary transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="serif text-2xl italic text-brand-primary">
                      ${formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 sm:p-10 sticky top-32 border border-white/10 shadow-2xl">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary mb-10">
                Resumen de Compra
              </h3>
              
              <div className="space-y-6 mb-10 font-sans">
                <div className="flex justify-between text-gray-400 text-sm font-medium">
                  <span>Subtotal</span>
                  <span className="text-white">${formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-400 text-sm font-medium">
                  <span>Envío estimado</span>
                  <span className="text-brand-primary">Gratis</span>
                </div>
                <div className="flex justify-between text-gray-400 text-sm font-medium">
                  <span>Impuestos</span>
                  <span className="text-white">Calculado en checkout</span>
                </div>
                <div className="border-t border-white/10 pt-8 flex justify-between items-end mt-8">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">Total Estimado</span>
                  <span className="serif text-5xl italic text-brand-primary">${formatPrice(totalPrice)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <Button 
                  size="lg" 
                  className="w-full h-16 text-xs font-black uppercase tracking-widest bg-brand-primary text-brand-black hover:bg-white rounded-full transition-all shadow-xl shadow-brand-primary/20"
                  onClick={() => navigate("/checkout")}
                >
                  Proceder al Pago <ArrowRight className="w-4 h-4 ml-3" />
                </Button>
                
                <div className="relative flex items-center py-4">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">O</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                <a 
                  href={`https://api.whatsapp.com/send?phone=573019202618&text=Hola!%20Vengo%20desde%20la%20página%20web%20y%20quiero%20comprar:%0A${items.map(i => `- ${i.quantity}x ${i.name}`).join('%0A')}%0ATotal:%20$${formatPrice(totalPrice)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  <Button variant="outline" size="lg" className="w-full h-16 text-xs font-black uppercase tracking-widest border-white/10 hover:border-brand-primary text-white hover:text-brand-primary rounded-full transition-all">
                    Comprar vía WhatsApp
                  </Button>
                </a>
              </div>
              
              <p className="text-[10px] font-bold text-gray-500 text-center mt-10 uppercase tracking-widest leading-relaxed">
                Al proceder, confirmas que eres <br /> mayor de 21 años.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

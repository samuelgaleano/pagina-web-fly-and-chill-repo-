import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Trash2, ArrowRight, ShoppingBag } from "lucide-react";

export function Cart() {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 bg-brand-black">
        <ShoppingBag className="w-20 h-20 text-brand-gold/20 mb-6" />
        <h2 className="text-3xl font-heading font-bold text-white mb-4 uppercase tracking-wider">Tu carrito está vacío</h2>
        <p className="text-gray-400 mb-8 font-sans max-w-md">
          Parece que aún no has añadido ningún producto premium a tu carrito. 
          Explora nuestro catálogo y encuentra tu experiencia ideal.
        </p>
        <Link to="/shop">
          <Button size="lg" className="font-bold uppercase tracking-wider">
            Ir a la Tienda
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-brand-black min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-4xl md:text-5xl font-heading font-black text-white uppercase tracking-tighter mb-12 border-b border-brand-gold/10 pb-6">
          Tu Carrito
        </h1>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items */}
          <div className="flex-1 space-y-6">
            {items.map((item) => (
              <div key={item.id} className="bg-brand-dark border border-brand-gold/10 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6 relative group">
                <Link to={`/shop/${item.id}`} className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 bg-black rounded-xl overflow-hidden border border-brand-gold/20">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    referrerPolicy="no-referrer"
                  />
                </Link>
                
                <div className="flex-1 flex flex-col w-full">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-brand-amber text-xs font-bold uppercase tracking-wider mb-1 block">
                        {item.category}
                      </span>
                      <Link to={`/shop/${item.id}`}>
                        <h3 className="text-lg sm:text-xl font-heading font-bold text-white hover:text-brand-gold transition-colors line-clamp-1">
                          {item.name}
                        </h3>
                      </Link>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-500 hover:text-red-500 transition-colors p-2"
                      aria-label="Eliminar producto"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <p className="text-gray-400 text-sm font-sans mb-4 line-clamp-2">
                    {item.flavor} • {item.cbdContent} CBD
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center bg-brand-black border border-brand-gold/20 rounded-lg">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-brand-gold transition-colors"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-bold text-white">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-brand-gold transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xl font-bold text-white">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="bg-brand-dark border border-brand-gold/20 rounded-2xl p-6 sm:p-8 sticky top-28 shadow-2xl shadow-brand-amber/5">
              <h3 className="text-2xl font-heading font-bold text-white uppercase tracking-wider mb-6 border-b border-brand-gold/10 pb-4">
                Resumen
              </h3>
              
              <div className="space-y-4 mb-8 font-sans">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span className="text-white">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Envío estimado</span>
                  <span className="text-white">Calculado en checkout</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Impuestos</span>
                  <span className="text-white">Calculado en checkout</span>
                </div>
                <div className="border-t border-brand-gold/10 pt-4 flex justify-between items-center mt-4">
                  <span className="text-lg font-bold text-white uppercase">Total Estimado</span>
                  <span className="text-3xl font-black text-brand-gold">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <Button 
                  size="lg" 
                  className="w-full text-lg font-bold uppercase tracking-wider"
                  onClick={() => navigate("/checkout")}
                >
                  Proceder al Pago <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-brand-gold/10"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-500 text-xs uppercase tracking-widest">O</span>
                  <div className="flex-grow border-t border-brand-gold/10"></div>
                </div>

                <a 
                  href={`https://wa.me/1234567890?text=Hola,%20quiero%20comprar%20los%20siguientes%20productos:%0A${items.map(i => `- ${i.quantity}x ${i.name}`).join('%0A')}%0ATotal:%20$${totalPrice.toFixed(2)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  <Button variant="green" size="lg" className="w-full font-bold uppercase tracking-wider">
                    Comprar vía WhatsApp
                  </Button>
                </a>
              </div>
              
              <p className="text-xs text-gray-500 text-center mt-6 font-sans">
                Al proceder, confirmas que eres mayor de 21 años.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

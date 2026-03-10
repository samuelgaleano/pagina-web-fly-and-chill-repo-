import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, CreditCard, MapPin, Truck } from "lucide-react";

export function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  if (items.length === 0 && step !== 3) {
    navigate("/shop");
    return null;
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setStep(3);
      clearCart();
    }, 2000);
  };

  return (
    <div className="bg-brand-black min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-heading font-black text-white uppercase tracking-tighter mb-12 text-center">
          Checkout
        </h1>

        {/* Progress Bar */}
        <div className="flex justify-between items-center mb-12 max-w-2xl mx-auto relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-brand-dark rounded-full z-0"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-gold rounded-full z-0 transition-all duration-500"
            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
          ></div>
          
          {[
            { num: 1, label: "Envío", icon: MapPin },
            { num: 2, label: "Pago", icon: CreditCard },
            { num: 3, label: "Confirmación", icon: CheckCircle2 }
          ].map((s) => (
            <div key={s.num} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                step >= s.num 
                  ? "bg-brand-gold border-brand-gold text-brand-black" 
                  : "bg-brand-dark border-brand-gold/20 text-gray-500"
              }`}>
                <s.icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${
                step >= s.num ? "text-brand-gold" : "text-gray-500"
              }`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-brand-dark border border-brand-gold/20 rounded-2xl p-8 shadow-2xl shadow-brand-amber/5">
                <h2 className="text-2xl font-heading font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-3">
                  <MapPin className="text-brand-amber" /> Dirección de Envío
                </h2>
                <form onSubmit={handleShippingSubmit} className="space-y-6 font-sans">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">Nombre</label>
                      <input required type="text" className="w-full bg-brand-black border border-brand-gold/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-amber" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">Apellidos</label>
                      <input required type="text" className="w-full bg-brand-black border border-brand-gold/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-amber" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Dirección</label>
                    <input required type="text" className="w-full bg-brand-black border border-brand-gold/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-amber" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm text-gray-400">Ciudad</label>
                      <input required type="text" className="w-full bg-brand-black border border-brand-gold/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-amber" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">Código Postal</label>
                      <input required type="text" className="w-full bg-brand-black border border-brand-gold/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-amber" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">Teléfono</label>
                      <input required type="tel" className="w-full bg-brand-black border border-brand-gold/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-amber" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">Email</label>
                      <input required type="email" className="w-full bg-brand-black border border-brand-gold/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-amber" />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-brand-gold/10">
                    <Button type="submit" size="lg" className="w-full font-bold uppercase tracking-wider">
                      Continuar al Pago
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {step === 2 && (
              <div className="bg-brand-dark border border-brand-gold/20 rounded-2xl p-8 shadow-2xl shadow-brand-amber/5">
                <h2 className="text-2xl font-heading font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-3">
                  <CreditCard className="text-brand-amber" /> Método de Pago
                </h2>
                <form onSubmit={handlePaymentSubmit} className="space-y-6 font-sans">
                  {/* Placeholder for Stripe/Bolt Elements */}
                  <div className="bg-brand-black border border-brand-gold/20 rounded-xl p-6 mb-8 text-center">
                    <p className="text-gray-400 mb-4">Integración de pasarela de pago segura (Stripe/Bolt).</p>
                    <div className="h-12 bg-brand-dark border border-dashed border-brand-gold/30 rounded-lg flex items-center justify-center text-brand-gold/50 text-sm">
                      [ Elemento de Tarjeta de Crédito ]
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6 border-t border-brand-gold/10">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-1/3">
                      Atrás
                    </Button>
                    <Button type="submit" size="lg" className="w-2/3 font-bold uppercase tracking-wider" disabled={isProcessing}>
                      {isProcessing ? "Procesando..." : `Pagar $${(totalPrice + 15).toFixed(2)}`}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {step === 3 && (
              <div className="bg-brand-dark border border-brand-gold/20 rounded-2xl p-12 text-center shadow-2xl shadow-brand-amber/5">
                <div className="w-20 h-20 bg-brand-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-brand-green" />
                </div>
                <h2 className="text-3xl font-heading font-black text-white uppercase tracking-tighter mb-4">
                  ¡Pedido Confirmado!
                </h2>
                <p className="text-gray-400 font-sans mb-8 max-w-md mx-auto">
                  Tu pedido #FC-{Math.floor(Math.random() * 100000)} ha sido procesado con éxito. 
                  Hemos enviado un correo de confirmación con los detalles.
                </p>
                <div className="bg-brand-black border border-brand-gold/10 rounded-xl p-6 mb-8 inline-block text-left">
                  <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-brand-amber" /> Estado del Envío
                  </h4>
                  <p className="text-sm text-gray-400">Preparando para envío. Tiempo estimado: 3-5 días hábiles.</p>
                </div>
                <br />
                <Button onClick={() => navigate("/shop")} size="lg" className="font-bold uppercase tracking-wider">
                  Volver a la Tienda
                </Button>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          {step !== 3 && (
            <div className="lg:col-span-1">
              <div className="bg-brand-dark border border-brand-gold/20 rounded-2xl p-6 sticky top-28">
                <h3 className="text-xl font-heading font-bold text-white uppercase tracking-wider mb-6 border-b border-brand-gold/10 pb-4">
                  Resumen del Pedido
                </h3>
                
                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 rounded-lg bg-black overflow-hidden shrink-0 border border-brand-gold/10">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-white line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-gray-400">Cant: {item.quantity}</p>
                        <p className="text-sm font-bold text-brand-gold mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 font-sans text-sm border-t border-brand-gold/10 pt-6">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span className="text-white">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Envío (Express)</span>
                    <span className="text-white">$15.00</span>
                  </div>
                  <div className="border-t border-brand-gold/10 pt-3 flex justify-between items-center mt-3">
                    <span className="font-bold text-white uppercase">Total</span>
                    <span className="text-2xl font-black text-brand-gold">${(totalPrice + 15).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

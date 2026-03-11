import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, CreditCard, MapPin, Truck, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

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
    <div className="bg-brand-paper min-h-screen pt-40 pb-24 text-brand-black">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="flex items-center justify-center gap-3 mb-16">
          <span className="w-8 h-[1px] bg-brand-primary"></span>
          <h1 className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary">
            Finalizar Pedido
          </h1>
          <span className="w-8 h-[1px] bg-brand-primary"></span>
        </div>

        {/* Progress Bar - Refined */}
        <div className="flex justify-between items-center mb-20 max-w-2xl mx-auto relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-brand-black/5 z-0"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-[1px] bg-brand-primary z-0 transition-all duration-700"
            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
          ></div>
          
          {[
            { num: 1, label: "Envío", icon: MapPin },
            { num: 2, label: "Pago", icon: CreditCard },
            { num: 3, label: "Confirmación", icon: CheckCircle2 }
          ].map((s) => (
            <div key={s.num} className="relative z-10 flex flex-col items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-500 ${
                step >= s.num 
                  ? "bg-brand-black border-brand-black text-white shadow-xl shadow-brand-black/20" 
                  : "bg-white border-brand-black/5 text-gray-300"
              }`}>
                <s.icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-500 ${
                step >= s.num ? "text-brand-black" : "text-gray-300"
              }`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-brand-black/5"
              >
                <h2 className="text-2xl font-heading font-black text-brand-black uppercase tracking-tighter mb-10 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-brand-primary" />
                  </div>
                  Dirección de Envío
                </h2>
                <form onSubmit={handleShippingSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Nombre</label>
                      <input required type="text" className="w-full bg-brand-paper border-none rounded-2xl px-6 py-4 text-brand-black focus:ring-2 focus:ring-brand-primary transition-all outline-none" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Apellidos</label>
                      <input required type="text" className="w-full bg-brand-paper border-none rounded-2xl px-6 py-4 text-brand-black focus:ring-2 focus:ring-brand-primary transition-all outline-none" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Dirección</label>
                    <input required type="text" className="w-full bg-brand-paper border-none rounded-2xl px-6 py-4 text-brand-black focus:ring-2 focus:ring-brand-primary transition-all outline-none" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3 md:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Ciudad</label>
                      <input required type="text" className="w-full bg-brand-paper border-none rounded-2xl px-6 py-4 text-brand-black focus:ring-2 focus:ring-brand-primary transition-all outline-none" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Código Postal</label>
                      <input required type="text" className="w-full bg-brand-paper border-none rounded-2xl px-6 py-4 text-brand-black focus:ring-2 focus:ring-brand-primary transition-all outline-none" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Teléfono</label>
                      <input required type="tel" className="w-full bg-brand-paper border-none rounded-2xl px-6 py-4 text-brand-black focus:ring-2 focus:ring-brand-primary transition-all outline-none" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email</label>
                      <input required type="email" className="w-full bg-brand-paper border-none rounded-2xl px-6 py-4 text-brand-black focus:ring-2 focus:ring-brand-primary transition-all outline-none" />
                    </div>
                  </div>

                  <div className="pt-10 border-t border-brand-black/5">
                    <Button type="submit" size="lg" className="w-full h-16 text-xs font-black uppercase tracking-widest bg-brand-black text-white hover:bg-brand-primary rounded-full transition-all shadow-xl shadow-brand-black/10">
                      Continuar al Pago
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-brand-black/5"
              >
                <h2 className="text-2xl font-heading font-black text-brand-black uppercase tracking-tighter mb-10 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-brand-primary" />
                  </div>
                  Método de Pago
                </h2>
                <form onSubmit={handlePaymentSubmit} className="space-y-8">
                  <div className="bg-brand-paper rounded-3xl p-10 mb-10 text-center border-2 border-dashed border-brand-black/5">
                    <p className="text-gray-400 text-sm mb-6 font-medium">Integración de pasarela de pago segura (Stripe/Bolt).</p>
                    <div className="h-16 bg-white rounded-2xl border border-brand-black/5 flex items-center justify-center text-brand-primary/40 text-[10px] font-bold uppercase tracking-[0.3em]">
                      [ Elemento de Tarjeta de Crédito ]
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-brand-black/5">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 h-16 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Atrás
                    </Button>
                    <Button type="submit" size="lg" className="flex-[2] h-16 text-xs font-black uppercase tracking-widest bg-brand-black text-white hover:bg-brand-primary rounded-full transition-all shadow-xl shadow-brand-black/10" disabled={isProcessing}>
                      {isProcessing ? "Procesando..." : `Pagar $${(totalPrice + 15).toFixed(2)}`}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-12 sm:p-20 text-center shadow-sm border border-brand-black/5"
              >
                <div className="w-24 h-24 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-10">
                  <CheckCircle2 className="w-10 h-10 text-brand-green" />
                </div>
                <h2 className="text-5xl font-heading font-black text-brand-black uppercase tracking-tighter mb-6">
                  ¡Pedido Confirmado!
                </h2>
                <p className="serif text-2xl text-gray-500 italic mb-12 max-w-md mx-auto leading-relaxed">
                  Tu pedido #FC-{Math.floor(Math.random() * 100000)} ha sido procesado con éxito. 
                  Pronto recibirás un correo con los detalles.
                </p>
                <div className="bg-brand-paper rounded-2xl p-8 mb-12 inline-block text-left border border-brand-black/5">
                  <h4 className="text-[10px] font-bold text-brand-black uppercase tracking-widest mb-3 flex items-center gap-3">
                    <Truck className="w-4 h-4 text-brand-primary" /> Estado del Envío
                  </h4>
                  <p className="text-sm text-gray-500 font-medium">Preparando para envío. Tiempo estimado: 3-5 días hábiles.</p>
                </div>
                <br />
                <Button onClick={() => navigate("/shop")} size="lg" className="h-16 rounded-full px-12 text-xs font-black uppercase tracking-widest bg-brand-black text-white hover:bg-brand-primary transition-all">
                  Volver a la Colección
                </Button>
              </motion.div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          {step !== 3 && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-8 sticky top-32 shadow-sm border border-brand-black/5">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary mb-8">
                  Resumen del Pedido
                </h3>
                
                <div className="space-y-6 mb-8 max-h-80 overflow-y-auto pr-2 no-scrollbar">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-5">
                      <div className="w-20 h-20 rounded-2xl bg-brand-paper overflow-hidden shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 py-1">
                        <h4 className="text-xs font-black text-brand-black uppercase tracking-tight line-clamp-1 mb-1">{item.name}</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Cant: {item.quantity}</p>
                        <p className="serif text-lg italic text-brand-black">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 font-sans text-sm border-t border-brand-black/5 pt-8">
                  <div className="flex justify-between text-gray-500 font-medium">
                    <span>Subtotal</span>
                    <span className="text-brand-black">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 font-medium">
                    <span>Envío (Express)</span>
                    <span className="text-brand-black">$15.00</span>
                  </div>
                  <div className="border-t border-brand-black/5 pt-6 flex justify-between items-end mt-6">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Total</span>
                    <span className="serif text-4xl italic text-brand-black">${(totalPrice + 15).toFixed(2)}</span>
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

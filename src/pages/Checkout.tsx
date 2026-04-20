import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, CreditCard, MapPin, Truck, ArrowLeft, Ticket, Loader2, X, ShieldCheck, Phone } from "lucide-react";
import { motion } from "motion/react";
import { formatPrice } from "@/lib/formatters";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, increment, serverTimestamp } from "firebase/firestore";
import { PromoCode } from "@/types";

export function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState("");

  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    zipCode: "",
    phone: "",
    email: ""
  });

  const [paymentMethod, setPaymentMethod] = useState<"nequi" | "pse_card">("nequi");
  const [orderId, setOrderId] = useState("");
  const itemsCount = items.length;

  useEffect(() => {
    if (itemsCount === 0 && step !== 3) {
      navigate("/shop");
    }
  }, [itemsCount, step, navigate]);

  if (itemsCount === 0 && step !== 3) {
    return null;
  }

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    
    setIsApplyingPromo(true);
    setPromoError("");
    
    try {
      const q = query(
        collection(db, "promoCodes"), 
        where("code", "==", promoInput.toUpperCase().trim()),
        where("isActive", "==", true)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setPromoError("Código no válido o expirado");
        setAppliedPromo(null);
      } else {
        const promoData = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as PromoCode;
        setAppliedPromo(promoData);
        setPromoInput("");
      }
    } catch (error) {
      console.error("Error applying promo:", error);
      setPromoError("Error al validar el código");
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const calculateDiscount = () => {
    if (!appliedPromo) return 0;
    if (appliedPromo.discountType === "percentage") {
      return (totalPrice * appliedPromo.discountValue) / 100;
    }
    return appliedPromo.discountValue;
  };

  const discountAmount = calculateDiscount();
  
  const getShippingCost = () => {
    if (!shippingInfo.city) return 15000;
    const city = shippingInfo.city.toLowerCase().trim();
    if (city === "bogota" || city === "bogotá") return 10000;
    return 15000;
  };

  const shippingCost = getShippingCost();
  const subscriptionFee = 5000;
  const finalTotal = totalPrice + shippingCost + subscriptionFee - discountAmount;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
      const orderData = {
        userId: "anonymous",
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        total: finalTotal,
        discountAmount: discountAmount,
        promoCode: appliedPromo?.code || null,
        shippingInfo,
        paymentMethod,
        status: "pending"
      };

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderData }),
        signal: controller.signal,
      }).catch(err => {
        if (err.name === 'AbortError') throw new Error("Tiempo de espera agotado. Reintenta.");
        console.error("Fetch error:", err);
        throw new Error("No se pudo conectar con el servidor. Por favor intenta de nuevo.");
      });

      clearTimeout(timeoutId);
      const data = await response.json().catch(() => ({ error: "Error de servidor" }));

      if (response.ok) {
        setOrderId(data.orderId);
        setIsProcessing(false);
        setStep(3);
        clearCart();
      } else {
        alert(data.error || "Hubo un error al procesar tu pedido. Intenta nuevamente.");
        throw new Error(data.error || "Error al crear el pedido");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      setIsProcessing(false);
      // Ensure the user sees some feedback
      if (!window.alert) { // Support if alert is blocked
        setPromoError(error.message || "Error al procesar el pedido");
      }
    }
  };

  return (
    <div className="bg-brand-black min-h-screen pt-40 pb-24 text-white">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="flex flex-col items-center justify-center gap-4 mb-16">
          <div className="flex items-center gap-3">
            <span className="w-8 h-[1px] bg-brand-primary"></span>
            <h1 className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary">
              Finalizar Pedido
            </h1>
            <span className="w-8 h-[1px] bg-brand-primary"></span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <ShieldCheck className="w-3 h-3 text-brand-primary" />
            <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Checkout Seguro & Encriptado</span>
          </div>
        </div>

        {/* Progress Bar - Refined */}
        <div className="flex justify-between items-center mb-20 max-w-2xl mx-auto relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-white/10 z-0"></div>
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
                  ? "bg-brand-primary border-brand-primary text-brand-black shadow-xl shadow-brand-primary/20" 
                  : "bg-brand-black border-white/10 text-gray-500"
              }`}>
                <s.icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-500 ${
                step >= s.num ? "text-brand-primary" : "text-gray-500"
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
                className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl"
              >
                <h2 className="text-2xl font-heading font-black text-white uppercase tracking-tighter mb-10 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-brand-primary" />
                  </div>
                  Dirección de Envío
                </h2>
                <form onSubmit={handleShippingSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Nombre</label>
                      <input 
                        required 
                        type="text" 
                        value={shippingInfo.firstName}
                        onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})}
                        className="w-full bg-brand-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-primary transition-all outline-none" 
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Apellidos</label>
                      <input 
                        required 
                        type="text" 
                        value={shippingInfo.lastName}
                        onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})}
                        className="w-full bg-brand-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-primary transition-all outline-none" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Dirección</label>
                    <input 
                      required 
                      type="text" 
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                      className="w-full bg-brand-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-primary transition-all outline-none" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3 md:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Ciudad</label>
                      <input 
                        required 
                        type="text" 
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                        className="w-full bg-brand-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-primary transition-all outline-none" 
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Código Postal</label>
                      <input 
                        required 
                        type="text" 
                        value={shippingInfo.zipCode}
                        onChange={(e) => setShippingInfo({...shippingInfo, zipCode: e.target.value})}
                        className="w-full bg-brand-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-primary transition-all outline-none" 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Teléfono</label>
                      <input 
                        required 
                        type="tel" 
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                        className="w-full bg-brand-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-primary transition-all outline-none" 
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Email</label>
                      <input 
                        required 
                        type="email" 
                        value={shippingInfo.email}
                        onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                        className="w-full bg-brand-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-primary transition-all outline-none" 
                      />
                    </div>
                  </div>

                  <div className="pt-10 border-t border-white/10">
                    <Button type="submit" size="lg" className="w-full h-20 text-xs font-black uppercase tracking-[0.3em] bg-brand-primary text-brand-black hover:bg-white rounded-2xl transition-all shadow-[0_20px_40px_-15px_rgba(118,187,202,0.3)]">
                      CONTINUAR AL PAGO
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl"
              >
                <h2 className="text-2xl font-heading font-black text-white uppercase tracking-tighter mb-10 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-brand-primary" />
                  </div>
                  Método de Pago
                </h2>
                <form onSubmit={handlePaymentSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("nequi")}
                      className={`p-8 rounded-3xl border-2 transition-all text-left group ${
                        paymentMethod === "nequi" 
                          ? "bg-brand-primary/10 border-brand-primary shadow-lg shadow-brand-primary/10" 
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                          paymentMethod === "nequi" ? "bg-brand-primary text-brand-black" : "bg-white/10 text-gray-400"
                        }`}>
                          <Phone className="w-6 h-6" />
                        </div>
                        {paymentMethod === "nequi" && <CheckCircle2 className="w-5 h-5 text-brand-primary" />}
                      </div>
                      <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">Brev-B</h3>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">Transferencia directa Brev-B</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("pse_card")}
                      className={`p-8 rounded-3xl border-2 transition-all text-left group ${
                        paymentMethod === "pse_card" 
                          ? "bg-brand-primary/10 border-brand-primary shadow-lg shadow-brand-primary/10" 
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                          paymentMethod === "pse_card" ? "bg-brand-primary text-brand-black" : "bg-white/10 text-gray-400"
                        }`}>
                          <CreditCard className="w-6 h-6" />
                        </div>
                        {paymentMethod === "pse_card" && <CheckCircle2 className="w-5 h-5 text-brand-primary" />}
                      </div>
                      <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">PSE/ Tarjeta Crédito - Débito</h3>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">Pasarela de pago segura</p>
                    </button>
                  </div>

                  <div className="bg-brand-black/40 rounded-3xl p-8 border border-white/10">
                    {paymentMethod === "nequi" ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 text-brand-primary">
                          <ShieldCheck className="w-5 h-5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Instrucciones de Pago</span>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                          Al confirmar, recibirás un resumen con los datos para la transferencia a Brev-B (@SAG296). Envía el comprobante a nuestro WhatsApp para procesar tu envío:
                        </p>
                        <a 
                          href="https://api.whatsapp.com/send?phone=573019202618&text=Hola%20vengo%20desde%20la%20pagina%20web%20deseo%20comprar%20%3A%20"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 text-brand-primary font-black uppercase tracking-widest text-[11px] bg-brand-primary/10 py-2 rounded-lg border border-brand-primary/20 hover:bg-brand-primary hover:text-brand-black transition-all"
                        >
                          <Phone className="w-3 h-3" /> +57 301 920 2618
                        </a>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 text-brand-primary">
                          <ShieldCheck className="w-5 h-5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Pago con Link Directo (PSE / Tarjetas)</span>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                          Te enviaremos un link de pago personalizado a tu correo. Un administrador gestionará tu pago de forma manual pronto.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-white/10">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 h-16 rounded-2xl text-[10px] font-bold uppercase tracking-widest border-white/10 text-white hover:border-brand-primary">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Atrás
                    </Button>
                    <Button type="submit" size="lg" className="flex-[2] h-20 text-xs font-black uppercase tracking-[0.3em] bg-brand-primary text-brand-black hover:bg-white rounded-2xl transition-all shadow-[0_20px_40px_-15px_rgba(118,187,202,0.3)]" disabled={isProcessing}>
                      {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : `CONFIRMAR PAGO $${formatPrice(finalTotal)}`}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 sm:p-20 text-center border border-white/10 shadow-2xl"
              >
                <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-10">
                  <CheckCircle2 className="w-10 h-10 text-brand-primary" />
                </div>
                <h2 className="text-5xl font-heading font-black text-white uppercase tracking-tighter mb-6">
                  ¡Pedido Confirmado!
                </h2>
                <p className="serif text-2xl text-gray-400 italic mb-8 max-w-md mx-auto leading-relaxed">
                  Tu pedido <span className="text-brand-primary font-bold not-italic">#FC-{orderId?.substring(0, 6).toUpperCase()}</span> ha sido procesado con éxito. 
                  Pronto recibirás un correo con los detalles.
                </p>
                
                {paymentMethod === "nequi" && (
                  <div className="bg-white/5 border border-brand-primary/30 rounded-3xl p-8 mb-12 max-w-md mx-auto">
                    <h3 className="text-brand-primary font-black uppercase tracking-widest text-xs mb-4">Instrucciones de Pago (Brev-B)</h3>
                    <p className="text-sm text-gray-400 mb-6 font-sans">Para procesar tu pedido, realiza la transferencia a:</p>
                    <div className="bg-brand-black/60 rounded-2xl py-4 mb-8 border border-white/5">
                      <span className="text-3xl font-black text-white tracking-widest">@SAG296</span>
                    </div>
                    
                    <p className="text-sm text-gray-300 font-bold mb-4">Envía el comprobante por WhatsApp:</p>
                    <a 
                      href={`https://api.whatsapp.com/send?phone=573019202618&text=Hola!%20Adjunto%20comprobante%20de%20pago%20para%20el%20pedido%20%23FC-${orderId?.substring(0, 6).toUpperCase()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 w-full h-16 bg-[#25D366] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-[#25D366]/20"
                    >
                      <Phone className="w-5 h-5 fill-white" />
                      ENVIAR COMPROBANTE
                    </a>
                    <p className="text-2xl font-black text-[#25D366] mt-4 tracking-widest">+57 301 920 2618</p>
                  </div>
                )}
                <div className="bg-brand-black/40 rounded-2xl p-8 mb-12 inline-block text-left border border-white/10">
                  <h4 className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mb-3 flex items-center gap-3">
                    <Truck className="w-4 h-4" /> Estado del Envío
                  </h4>
                  <p className="text-sm text-gray-400 font-medium">Preparando para envío. Entregas en Bogotá en menos de 24 horas según disponibilidad.</p>
                </div>
                <br />
                <Button onClick={() => navigate("/shop")} size="lg" className="h-16 rounded-full px-12 text-xs font-black uppercase tracking-widest bg-brand-primary text-brand-black hover:bg-white transition-all">
                  Volver a la Colección
                </Button>
              </motion.div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          {step !== 3 && (
            <div className="lg:col-span-1">
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 sticky top-32 border border-white/10 shadow-2xl">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary mb-8">
                  Resumen del Pedido
                </h3>
                
                <div className="space-y-6 mb-8 max-h-80 overflow-y-auto pr-2 no-scrollbar">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-5">
                      <div className="w-20 h-20 rounded-2xl bg-brand-black/40 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 py-1">
                        <h4 className="text-xs font-black text-white uppercase tracking-tight line-clamp-1 mb-1">{item.name}</h4>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Cant: {item.quantity}</p>
                        <p className="serif text-lg italic text-brand-primary">${formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 font-sans text-sm border-t border-white/10 pt-8">
                  <div className="flex justify-between text-gray-400 font-medium">
                    <span>Subtotal</span>
                    <span className="text-white">${formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400 font-medium">
                    <div className="flex flex-col">
                      <span>Envío</span>
                      <span className="text-[8px] uppercase tracking-widest opacity-50">
                        {shippingInfo.city ? (shippingInfo.city.toLowerCase().trim() === "bogota" || shippingInfo.city.toLowerCase().trim() === "bogotá" ? "Tarifa Bogotá" : "Tarifa Nacional") : "Calculando..."}
                      </span>
                    </div>
                    <span className="text-brand-primary">${formatPrice(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400 font-medium border-b border-white/5 pb-4">
                    <div className="flex flex-col">
                      <span>Suscripción Fly Club</span>
                      <span className="text-[8px] uppercase tracking-widest opacity-50">Autorización de envío comunidad</span>
                    </div>
                    <span className="text-brand-primary">${formatPrice(subscriptionFee)}</span>
                  </div>
                  
                  {/* Promo Code Input */}
                  <div className="pt-4">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                          type="text" 
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                          placeholder="CÓDIGO PROMO"
                          className="w-full bg-brand-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-[10px] font-bold uppercase tracking-widest text-white focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                        />
                      </div>
                      <Button 
                        type="button"
                        onClick={handleApplyPromo}
                        disabled={isApplyingPromo || !promoInput.trim()}
                        className="bg-white/5 border border-white/10 hover:bg-brand-primary hover:text-brand-black px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        {isApplyingPromo ? <Loader2 className="w-3 h-3 animate-spin" /> : "Aplicar"}
                      </Button>
                    </div>
                    {promoError && <p className="text-[9px] text-brand-secondary mt-2 font-bold uppercase tracking-widest">{promoError}</p>}
                    {appliedPromo && (
                      <div className="flex justify-between items-center mt-3 bg-brand-primary/10 border border-brand-primary/20 rounded-xl px-4 py-2">
                        <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">
                          {appliedPromo.code} Aplicado
                        </span>
                        <button 
                          onClick={() => setAppliedPromo(null)}
                          className="text-brand-primary hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {appliedPromo && (
                    <div className="flex justify-between text-brand-primary font-bold">
                      <span>Descuento</span>
                      <span>-${formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  <div className="border-t border-white/10 pt-6 flex justify-between items-end mt-6">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-1">Total</span>
                    <span className="serif text-4xl italic text-brand-primary">${formatPrice(finalTotal)}</span>
                  </div>
                </div>

                {/* Trust Badges in Sidebar */}
                <div className="mt-10 grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center text-center p-4 bg-white/5 rounded-2xl border border-white/5">
                    <ShieldCheck className="w-5 h-5 text-brand-primary mb-2" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Garantía de Satisfacción</span>
                  </div>
                  <div className="flex flex-col items-center text-center p-4 bg-white/5 rounded-2xl border border-white/5">
                    <Truck className="w-5 h-5 text-brand-primary mb-2" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Envío Discreto</span>
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

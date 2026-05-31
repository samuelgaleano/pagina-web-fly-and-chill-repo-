import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, CreditCard, MapPin, Truck, ArrowLeft, Ticket, Loader2, X, ShieldCheck, Landmark, Smartphone, Lock } from "lucide-react";
import { motion } from "motion/react";
import { formatPrice } from "@/lib/formatters";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { PromoCode } from "@/types";

type PaymentChannel = "CARD" | "PSE" | "NEQUI" | "BANCOLOMBIA";

const PAYMENT_OPTIONS: { id: PaymentChannel; title: string; desc: string; icon: any }[] = [
  { id: "CARD", title: "Tarjeta", desc: "Crédito o débito", icon: CreditCard },
  { id: "PSE", title: "PSE", desc: "Débito desde tu banco", icon: Landmark },
  { id: "NEQUI", title: "Nequi", desc: "Pago desde la app", icon: Smartphone },
  { id: "BANCOLOMBIA", title: "Bancolombia", desc: "Botón Bancolombia", icon: Landmark },
];

const DOC_TYPES = ["CC", "CE", "NIT", "PP", "TI"];

const WOMPI_CHECKOUT_URL = "https://checkout.wompi.co/p/";

export function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState("");

  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    documentType: "CC",
    documentNumber: "",
    address: "",
    city: "",
    zipCode: "",
    phone: "",
    email: ""
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentChannel>("CARD");
  const itemsCount = items.length;

  useEffect(() => {
    if (itemsCount === 0) {
      navigate("/shop");
    }
  }, [itemsCount, navigate]);

  if (itemsCount === 0) {
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
  const subscriptionFee = 5000;
  const finalTotal = Math.max(0, totalPrice + subscriptionFee - discountAmount);

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  // Build the Wompi Web Checkout URL with literal (colon) keys and redirect.
  const redirectToWompi = (data: any) => {
    const fullName = `${shippingInfo.firstName} ${shippingInfo.lastName}`.trim();
    const phone = shippingInfo.phone.replace(/\D/g, "");
    const parts = [
      `public-key=${encodeURIComponent(data.publicKey)}`,
      `currency=${encodeURIComponent(data.currency)}`,
      `amount-in-cents=${data.amountInCents}`,
      `reference=${encodeURIComponent(data.reference)}`,
      `signature:integrity=${encodeURIComponent(data.signature)}`,
      `redirect-url=${encodeURIComponent(data.redirectUrl)}`,
      `customer-data:email=${encodeURIComponent(shippingInfo.email)}`,
      `customer-data:full-name=${encodeURIComponent(fullName)}`,
      `customer-data:phone-number=${encodeURIComponent(phone)}`,
      `customer-data:legal-id=${encodeURIComponent(shippingInfo.documentNumber)}`,
      `customer-data:legal-id-type=${encodeURIComponent(shippingInfo.documentType)}`,
    ];
    window.location.href = `${WOMPI_CHECKOUT_URL}?${parts.join("&")}`;
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setCheckoutError("");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const orderData = {
        userId: "anonymous",
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal: totalPrice,
        total: finalTotal,
        discountAmount: discountAmount,
        promoCode: appliedPromo?.code || null,
        shippingInfo,
        paymentMethod,
      };

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderData }),
        signal: controller.signal,
      }).catch(err => {
        if (err.name === 'AbortError') throw new Error("Tiempo de espera agotado. Reintenta.");
        throw new Error("No se pudo conectar con el servidor. Intenta de nuevo.");
      });

      clearTimeout(timeoutId);
      const data = await response.json().catch(() => ({ error: "Error de servidor" }));

      if (!response.ok || !data.signature || !data.publicKey) {
        throw new Error(data.error || "No se pudo iniciar el pago. Intenta nuevamente.");
      }

      // Remember the order so the confirmation page can show it even if the
      // status query is slow, then hand off to Wompi's secure checkout.
      try {
        localStorage.setItem("lastOrder", JSON.stringify({ serial: data.serial, reference: data.reference }));
      } catch {}

      clearCart();
      redirectToWompi(data);
    } catch (error: any) {
      console.error("Checkout error:", error);
      setIsProcessing(false);
      setCheckoutError(error.message || "Error al procesar el pago");
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
            <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Pago Seguro Procesado por Wompi</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex justify-between items-center mb-20 max-w-2xl mx-auto relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-white/10 z-0"></div>
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-[1px] bg-brand-primary z-0 transition-all duration-700"
            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
          ></div>

          {[
            { num: 1, label: "Datos", icon: MapPin },
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
                  Datos de Envío
                </h2>
                <form onSubmit={handleShippingSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Nombre</label>
                      <input required type="text" value={shippingInfo.firstName}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
                        className="w-full bg-brand-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-primary transition-all outline-none" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Apellidos</label>
                      <input required type="text" value={shippingInfo.lastName}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
                        className="w-full bg-brand-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-primary transition-all outline-none" />
                    </div>
                  </div>

                  {/* Documento (requerido por Wompi) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Tipo de Documento</label>
                      <select value={shippingInfo.documentType}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, documentType: e.target.value })}
                        className="w-full bg-brand-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-primary transition-all outline-none appearance-none">
                        {DOC_TYPES.map(t => <option key={t} value={t} className="bg-brand-black">{t}</option>)}
                      </select>
                    </div>
                    <div className="space-y-3 md:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Número de Documento</label>
                      <input required type="text" inputMode="numeric" value={shippingInfo.documentNumber}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, documentNumber: e.target.value.replace(/\D/g, "") })}
                        className="w-full bg-brand-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-primary transition-all outline-none" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Dirección</label>
                    <input required type="text" value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                      className="w-full bg-brand-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-primary transition-all outline-none" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3 md:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Ciudad</label>
                      <input required type="text" value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                        className="w-full bg-brand-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-primary transition-all outline-none" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Cód. Postal (Opcional)</label>
                      <input type="text" value={shippingInfo.zipCode}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, zipCode: e.target.value })}
                        className="w-full bg-brand-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-primary transition-all outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Teléfono</label>
                      <input required type="tel" value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                        className="w-full bg-brand-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-primary transition-all outline-none" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Email</label>
                      <input required type="email" value={shippingInfo.email}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                        className="w-full bg-brand-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-primary transition-all outline-none" />
                    </div>
                  </div>

                  <div className="pt-10 border-t border-white/10">
                    <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                      className="w-full h-24 text-sm font-black uppercase tracking-[0.3em] bg-brand-primary text-brand-black hover:bg-white rounded-2xl transition-all shadow-[0_20px_40px_-15px_rgba(118,187,202,0.3)] relative overflow-hidden group">
                      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12"></div>
                      <span className="relative z-10 flex flex-col items-center justify-center leading-none">
                        <span className="text-[9px] font-black opacity-60 tracking-[0.2em] mb-1 group-hover:opacity-100 transition-opacity">PASO SIGUIENTE</span>
                        <span className="text-xl font-black">CONTINUAR AL PAGO</span>
                      </span>
                    </motion.button>
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
                    {PAYMENT_OPTIONS.map((opt) => {
                      const active = paymentMethod === opt.id;
                      const Icon = opt.icon;
                      return (
                        <button key={opt.id} type="button" onClick={() => setPaymentMethod(opt.id)}
                          className={`p-8 rounded-3xl border-2 transition-all text-left group ${
                            active ? "bg-brand-primary/10 border-brand-primary shadow-lg shadow-brand-primary/10"
                                   : "bg-white/5 border-white/10 hover:border-white/20"
                          }`}>
                          <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                              active ? "bg-brand-primary text-brand-black" : "bg-white/10 text-gray-400"
                            }`}>
                              <Icon className="w-6 h-6" />
                            </div>
                            {active && <CheckCircle2 className="w-5 h-5 text-brand-primary" />}
                          </div>
                          <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">{opt.title}</h3>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">{opt.desc}</p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="bg-brand-black/40 rounded-3xl p-8 border border-white/10">
                    <div className="flex items-center gap-4 text-brand-primary mb-3">
                      <Lock className="w-5 h-5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Pago 100% Seguro</span>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Al continuar serás dirigido a la pasarela segura de <strong className="text-white">Wompi</strong> para completar tu pago por <strong className="text-brand-primary">${formatPrice(finalTotal)} COP</strong>.
                      Tus datos financieros son procesados directamente por Wompi y nunca se almacenan en nuestra tienda.
                    </p>
                  </div>

                  {checkoutError && (
                    <p className="text-[11px] text-brand-secondary font-bold uppercase tracking-widest text-center bg-brand-secondary/10 border border-brand-secondary/20 rounded-xl py-3">
                      {checkoutError}
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-white/10">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={isProcessing}
                      className="flex-1 h-16 rounded-2xl text-[10px] font-bold uppercase tracking-widest border-white/10 text-white hover:border-brand-primary">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Atrás
                    </Button>
                    <motion.button type="submit" disabled={isProcessing} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="flex-[2] h-24 text-sm font-black uppercase tracking-[0.3em] bg-brand-primary text-brand-black hover:bg-white rounded-2xl transition-all shadow-[0_20px_40px_-15px_rgba(118,187,202,0.4)] relative overflow-hidden group disabled:opacity-70">
                      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12"></div>
                      <span className="relative z-10 flex flex-col items-center justify-center leading-none">
                        {isProcessing ? (
                          <span className="flex items-center gap-3"><Loader2 className="w-6 h-6 animate-spin" /> REDIRIGIENDO…</span>
                        ) : (
                          <>
                            <span className="text-lg font-black tracking-[0.1em] mb-0.5 group-hover:scale-105 transition-transform">PAGAR AHORA</span>
                            <span className="text-[10px] font-bold opacity-60 tracking-widest flex items-center gap-1">
                              TOTAL: <span className="opacity-40 font-medium">$</span>{formatPrice(finalTotal)}
                            </span>
                          </>
                        )}
                      </span>
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}
          </div>

          {/* Order Summary Sidebar */}
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

              {/* Promo Code Input */}
              <div className="pt-4 pb-8 border-b border-white/10">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="text" value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      placeholder="CÓDIGO PROMO"
                      className="w-full bg-brand-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-[10px] font-bold uppercase tracking-widest text-white focus:ring-1 focus:ring-brand-primary outline-none transition-all" />
                  </div>
                  <motion.button type="button" whileTap={{ scale: 0.95 }}
                    animate={appliedPromo ? { scale: [1, 1.05, 1], transition: { duration: 0.3 } } : {}}
                    onClick={handleApplyPromo} disabled={isApplyingPromo || !promoInput.trim()}
                    className={`px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      appliedPromo ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                   : "bg-blue-600 text-white hover:bg-gray-500/20 focus:ring-1 focus:ring-blue-400"
                    }`}>
                    {isApplyingPromo ? <Loader2 className="w-3 h-3 animate-spin" /> : appliedPromo ? "¡LISTO! ✅" : "Aplicar"}
                  </motion.button>
                </div>
                {promoError && <p className="text-[9px] text-brand-secondary mt-2 font-bold uppercase tracking-widest">{promoError}</p>}
                {appliedPromo && (
                  <div className="flex justify-between items-center mt-3 bg-brand-primary/10 border border-brand-primary/20 rounded-xl px-4 py-2">
                    <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{appliedPromo.code} Aplicado</span>
                    <button onClick={() => setAppliedPromo(null)} className="text-brand-primary hover:text-white"><X className="w-3 h-3" /></button>
                  </div>
                )}
              </div>

              <div className="space-y-4 font-sans text-sm border-t border-white/10 pt-8">
                <div className="flex justify-between text-gray-400 font-medium">
                  <span>Subtotal</span>
                  <span className="text-white">${formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-400 font-medium border-b border-white/5 pb-4">
                  <div className="flex flex-col">
                    <span>Suscripción Fly Club</span>
                    <span className="text-[8px] uppercase tracking-widest opacity-50">Autorización de envío comunidad</span>
                  </div>
                  <span className="text-brand-primary">${formatPrice(subscriptionFee)}</span>
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

              <div className="mt-10 grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center text-center p-4 bg-white/5 rounded-2xl border border-white/5">
                  <ShieldCheck className="w-5 h-5 text-brand-primary mb-2" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Pago Protegido</span>
                </div>
                <div className="flex flex-col items-center text-center p-4 bg-white/5 rounded-2xl border border-white/5">
                  <Truck className="w-5 h-5 text-brand-primary mb-2" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Envío Discreto</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

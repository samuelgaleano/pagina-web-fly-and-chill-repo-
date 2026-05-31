import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Truck, Loader2, XCircle, Clock, MessageCircle, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

const BUSINESS_PHONE = "573019202618";

type UIState = "loading" | "approved" | "declined" | "pending";

export function CheckoutConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const transactionId = searchParams.get("id");

  const [uiState, setUiState] = useState<UIState>("loading");
  const [serial, setSerial] = useState<string>("");
  const pollRef = useRef<number>(0);

  useEffect(() => {
    // Fallback serial from the order we stored before redirecting.
    try {
      const saved = localStorage.getItem("lastOrder");
      if (saved) setSerial(JSON.parse(saved).serial || "");
    } catch {}

    if (!transactionId) {
      setUiState("pending");
      return;
    }

    let cancelled = false;

    const check = async () => {
      try {
        const res = await fetch(`/api/wompi/transaction/${transactionId}`);
        const data = await res.json();
        if (cancelled) return;

        if (data.serial) setSerial(data.serial);
        const status = String(data.status || "").toUpperCase();

        if (status === "APPROVED") {
          setUiState("approved");
          localStorage.removeItem("lastOrder");
          return;
        }
        if (status === "DECLINED" || status === "ERROR" || status === "VOIDED") {
          setUiState("declined");
          return;
        }

        // Still PENDING — keep polling for a while.
        pollRef.current += 1;
        if (pollRef.current < 10) {
          setUiState("loading");
          setTimeout(check, 3000);
        } else {
          setUiState("pending");
        }
      } catch (err) {
        if (cancelled) return;
        pollRef.current += 1;
        if (pollRef.current < 10) {
          setTimeout(check, 3000);
        } else {
          setUiState("pending");
        }
      }
    };

    check();
    return () => { cancelled = true; };
  }, [transactionId]);

  const statusWhatsappUrl = `https://api.whatsapp.com/send?phone=${BUSINESS_PHONE}&text=${encodeURIComponent(
    `Hola, quiero preguntar sobre el estado de mi pedido y fechas de entrega de mi pedido numero: ${serial}`
  )}`;

  return (
    <div className="bg-brand-black min-h-screen pt-40 pb-24 text-white">
      <div className="container mx-auto px-6 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 sm:p-20 text-center border border-white/10 shadow-2xl"
        >
          {uiState === "loading" && (
            <>
              <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-10">
                <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-heading font-black text-white uppercase tracking-tighter mb-6">
                Verificando tu pago…
              </h2>
              <p className="serif text-xl text-gray-400 italic max-w-md mx-auto leading-relaxed">
                Estamos confirmando tu transacción con Wompi. Esto puede tardar unos segundos, no cierres esta ventana.
              </p>
            </>
          )}

          {uiState === "approved" && (
            <>
              <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-10">
                <CheckCircle2 className="w-10 h-10 text-brand-primary" />
              </div>
              <h2 className="text-3xl sm:text-5xl font-heading font-black text-white uppercase tracking-tighter mb-6">
                ¡Pago Exitoso!
              </h2>
              <p className="serif text-2xl text-gray-400 italic mb-8 max-w-md mx-auto leading-relaxed">
                Tu pedido <span className="text-brand-primary font-bold not-italic">{serial}</span> ha sido confirmado.
                Te enviamos el resumen y el comprobante a tu correo.
              </p>

              <div className="bg-brand-black/40 rounded-2xl p-8 mb-10 inline-block text-left border border-white/10">
                <h4 className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mb-3 flex items-center gap-3">
                  <Truck className="w-4 h-4" /> Estado del Envío
                </h4>
                <p className="text-sm text-gray-400 font-medium">Preparando para envío. Entregas en Bogotá en menos de 24 horas según disponibilidad.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a href={statusWhatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full h-16 rounded-full px-10 text-xs font-black uppercase tracking-widest bg-[#25D366] text-white hover:bg-[#1ebe5a] transition-all flex items-center justify-center gap-3">
                    <MessageCircle className="w-5 h-5" /> Consultar Estado de mi Pedido
                  </Button>
                </a>
                <Button onClick={() => navigate("/shop")} size="lg" variant="outline"
                  className="w-full sm:w-auto h-16 rounded-full px-10 text-xs font-black uppercase tracking-widest border-white/10 text-white hover:border-brand-primary">
                  Volver a la Colección
                </Button>
              </div>
            </>
          )}

          {uiState === "declined" && (
            <>
              <div className="w-24 h-24 bg-brand-secondary/10 rounded-full flex items-center justify-center mx-auto mb-10">
                <XCircle className="w-10 h-10 text-brand-secondary" />
              </div>
              <h2 className="text-3xl sm:text-5xl font-heading font-black text-white uppercase tracking-tighter mb-6">
                Pago No Aprobado
              </h2>
              <p className="serif text-2xl text-gray-400 italic mb-10 max-w-md mx-auto leading-relaxed">
                Tu pago para el pedido <span className="text-white font-bold not-italic">{serial}</span> no pudo procesarse.
                No se realizó ningún cargo. Puedes intentarlo nuevamente.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button onClick={() => navigate("/checkout")} size="lg"
                  className="w-full sm:w-auto h-16 rounded-full px-10 text-xs font-black uppercase tracking-widest bg-brand-primary text-brand-black hover:bg-white transition-all">
                  Reintentar el Pago
                </Button>
                <a href={statusWhatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline"
                    className="w-full h-16 rounded-full px-10 text-xs font-black uppercase tracking-widest border-white/10 text-white hover:border-brand-primary flex items-center justify-center gap-3">
                    <MessageCircle className="w-5 h-5" /> Contactar Soporte
                  </Button>
                </a>
              </div>
            </>
          )}

          {uiState === "pending" && (
            <>
              <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-10">
                <Clock className="w-10 h-10 text-yellow-500" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-heading font-black text-white uppercase tracking-tighter mb-6">
                Pago en Proceso
              </h2>
              <p className="serif text-xl text-gray-400 italic mb-10 max-w-md mx-auto leading-relaxed">
                Tu pago {serial && (<span className="text-white font-bold not-italic">({serial}) </span>)}
                aún se está procesando. Te confirmaremos por correo en cuanto Wompi finalice la transacción.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a href={statusWhatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full h-16 rounded-full px-10 text-xs font-black uppercase tracking-widest bg-[#25D366] text-white hover:bg-[#1ebe5a] transition-all flex items-center justify-center gap-3">
                    <MessageCircle className="w-5 h-5" /> Consultar Estado de mi Pedido
                  </Button>
                </a>
                <Button onClick={() => navigate("/shop")} size="lg" variant="outline"
                  className="w-full sm:w-auto h-16 rounded-full px-10 text-xs font-black uppercase tracking-widest border-white/10 text-white hover:border-brand-primary">
                  Volver a la Colección
                </Button>
              </div>
            </>
          )}

          <div className="mt-12 pt-8 border-t border-white/10 flex items-center justify-center gap-2 text-gray-500">
            <ShieldCheck className="w-3 h-3 text-brand-primary" />
            <span className="text-[8px] font-black uppercase tracking-widest">Transacción procesada de forma segura por Wompi</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

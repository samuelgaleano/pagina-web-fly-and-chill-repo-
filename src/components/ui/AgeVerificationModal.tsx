import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./Button";

export function AgeVerificationModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasVerified = localStorage.getItem("ageVerified");
    if (!hasVerified) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("ageVerified", "true");
    setIsOpen(false);
  };

  const handleDecline = () => {
    window.location.href = "https://www.google.com";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-black/95 backdrop-blur-xl p-6"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.97, opacity: 0, y: 8 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="bg-brand-dark/80 backdrop-blur-2xl p-10 md:p-14 rounded-[3rem] max-w-lg w-full text-center shadow-[0_0_50px_rgba(118,187,202,0.2)] relative overflow-hidden border border-white/10"
          >
            {/* Animated Gradient Border Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 via-transparent to-brand-secondary/20 opacity-30 pointer-events-none" />
            
            {/* Decorative Top Bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-primary via-white to-brand-primary animate-pulse" />
            
            <div className="flex items-center justify-center gap-3 mb-8 relative z-10">
              <span className="w-6 h-[1px] bg-brand-primary/50"></span>
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-primary">
                Verificación de Seguridad
              </span>
              <span className="w-6 h-[1px] bg-brand-primary/50"></span>
            </div>

            <h2 className="serif text-4xl md:text-5xl font-light italic leading-tight mb-8 text-white relative z-10">
              ¿Eres mayor de <br /> <span className="font-bold not-italic text-brand-primary border-b-2 border-brand-primary/20">edad?</span>
            </h2>
            
            <div className="space-y-6 mb-10 relative z-10">
              <p className="serif text-lg text-white/70 italic leading-relaxed">
                Confirma tu edad para acceder a la experiencia 
                <span className="block text-brand-primary font-bold not-italic mt-2 text-sm uppercase tracking-widest">
                  21+ USA • 18+ COLOMBIA
                </span>
              </p>
              
              <div className="p-5 bg-white/5 rounded-3xl text-[10px] text-white/50 text-left space-y-2 font-sans border border-white/5 backdrop-blur-sm">
                <div className="flex items-start gap-2">
                  <span className="text-brand-primary">•</span>
                  <p>Cumplimiento Farm Bill 2018 (USA) & Ley 1787 de 2016 (COL).</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-brand-primary">•</span>
                  <p>Contenido para adultos. El consumo es responsabilidad del usuario.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 relative z-10">
              <Button 
                onClick={handleAccept} 
                className="w-full h-16 rounded-2xl bg-brand-primary text-brand-black hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(118,187,202,0.3)]"
              >
                INGRESAR AHORA
              </Button>
              <button 
                onClick={handleDecline} 
                className="w-full h-14 rounded-2xl border border-white/10 text-white/40 hover:bg-white/5 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest"
              >
                SOY MENOR / SALIR
              </button>
            </div>

            <div className="mt-10 text-[9px] font-black uppercase tracking-[0.3em] text-white/20 flex justify-center gap-6 relative z-10">
              <a href="#" className="hover:text-brand-primary transition-colors">Términos</a>
              <span className="text-white/10">•</span>
              <a href="#" className="hover:text-brand-primary transition-colors">Privacidad</a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

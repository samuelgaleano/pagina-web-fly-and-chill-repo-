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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-black/95 backdrop-blur-xl p-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-brand-paper p-12 md:p-16 rounded-[3rem] max-w-xl w-full text-center shadow-2xl relative overflow-hidden"
          >
            {/* Decorative Background */}
            <div className="absolute top-0 left-0 w-full h-2 bg-brand-primary" />
            
            <div className="flex items-center justify-center gap-3 mb-10">
              <span className="w-8 h-[1px] bg-brand-primary"></span>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary">
                Acceso Restringido
              </span>
              <span className="w-8 h-[1px] bg-brand-primary"></span>
            </div>

            <h2 className="serif text-5xl md:text-6xl font-light italic leading-tight mb-8 text-brand-black">
              ¿Eres mayor de <br /> <span className="font-bold not-italic">21 años?</span>
            </h2>
            
            <p className="serif text-xl text-gray-500 italic mb-12 leading-relaxed">
              Al ingresar a este sitio, confirmas que eres mayor de edad (21+ en EE.UU.) 
              y aceptas nuestros Términos y Condiciones y Política de Privacidad.
            </p>

            <div className="flex flex-col gap-4">
              <Button onClick={handleAccept} className="w-full h-20 rounded-full bg-brand-black text-white hover:bg-brand-primary hover:text-brand-black transition-all text-xs font-black uppercase tracking-widest shadow-2xl shadow-brand-black/10">
                SÍ, SOY MAYOR DE EDAD
              </Button>
              <button 
                onClick={handleDecline} 
                className="w-full h-16 rounded-full border border-brand-black/10 text-brand-black hover:bg-brand-black hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
              >
                SALIR DEL SITIO
              </button>
            </div>

            <div className="mt-12 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex justify-center gap-8">
              <a href="#" className="hover:text-brand-primary transition-colors">Términos</a>
              <a href="#" className="hover:text-brand-primary transition-colors">Privacidad</a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

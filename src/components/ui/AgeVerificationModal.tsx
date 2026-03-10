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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-brand-dark border border-brand-gold/20 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl shadow-brand-amber/10"
          >
            <h2 className="text-3xl font-heading font-bold text-brand-gold mb-4 uppercase tracking-wider">
              Verificación de Edad
            </h2>
            <p className="text-gray-300 mb-8 font-sans">
              Al ingresar a este sitio, confirmas que eres mayor de edad (21+ en EE.UU.) 
              y aceptas nuestros Términos y Condiciones y Política de Privacidad.
            </p>
            <div className="flex flex-col gap-4">
              <Button onClick={handleAccept} size="lg" className="w-full text-lg font-bold">
                ACEPTAR Y ENTRAR
              </Button>
              <Button onClick={handleDecline} variant="outline" size="lg" className="w-full">
                RECHAZAR
              </Button>
            </div>
            <div className="mt-6 text-xs text-gray-500 flex justify-center gap-4">
              <a href="#" className="hover:text-brand-gold transition-colors">Términos</a>
              <a href="#" className="hover:text-brand-gold transition-colors">Privacidad</a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

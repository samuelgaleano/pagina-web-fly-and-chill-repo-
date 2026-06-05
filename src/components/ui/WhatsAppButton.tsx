import { MessageCircle } from "lucide-react";
import { motion } from "motion/react";

export function WhatsAppButton() {
  return (
    <motion.a
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ scale: 1.08, y: -4 }}
      whileTap={{ scale: 0.94 }}
      href="https://api.whatsapp.com/send?phone=573019202618&text=Hola%20vengo%20desde%20la%20pagina%20web%20deseo%20comprar%20%3A%20"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-48 right-8 z-40 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-2xl shadow-[#25D366]/30 group"
      aria-label="Chat en WhatsApp"
    >
      {/* Anillo de pulso sutil: tenue y lento para llamar la atención sin
          distraer (un elemento siempre visible no debe animarse de forma fuerte). */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping [animation-duration:3s] motion-reduce:hidden" />
      <MessageCircle className="relative w-6 h-6 sm:w-7 sm:h-7" />
    </motion.a>
  );
}

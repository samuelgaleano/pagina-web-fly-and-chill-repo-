import { MessageCircle } from "lucide-react";
import { motion } from "motion/react";

export function WhatsAppButton() {
  return (
    <motion.a
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1, y: -5 }}
      whileTap={{ scale: 0.9 }}
      href="https://wa.me/1234567890?text=Hola,%20quisiera%20más%20información%20sobre%20los%20productos%20Fly%20and%20Chill"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-28 right-8 z-40 w-16 h-16 rounded-full bg-brand-black text-white flex items-center justify-center shadow-2xl shadow-brand-black/20 border border-white/10 group"
      aria-label="Chat en WhatsApp"
    >
      <div className="absolute inset-0 bg-brand-primary rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 -z-10" />
      <MessageCircle className="w-7 h-7 group-hover:text-brand-black transition-colors duration-500" />
    </motion.a>
  );
}

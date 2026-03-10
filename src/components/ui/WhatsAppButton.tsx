import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/1234567890?text=Hola,%20quisiera%20más%20información%20sobre%20los%20productos%20Fly%20and%20Chill"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-6 z-40 w-14 h-14 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-lg shadow-brand-primary/20 hover:bg-brand-secondary hover:scale-110 transition-all"
      aria-label="Chat en WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
}

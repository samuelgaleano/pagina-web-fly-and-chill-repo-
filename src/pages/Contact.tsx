import React, { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { Mail, MapPin, Phone, MessageCircle, Search } from "lucide-react";

export function Contact() {
  const [orderId, setOrderId] = useState("");
  const [trackingStatus, setTrackingStatus] = useState<string | null>(null);

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) {
      setTrackingStatus(`El pedido ${orderId} está en camino. Entrega estimada: Mañana.`);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Mensaje enviado. Te responderemos pronto.");
  };

  return (
    <div className="bg-brand-black min-h-screen">
      {/* Hero */}
      <section className="relative py-32 overflow-hidden border-b border-brand-gold/10">
        <div className="absolute inset-0 bg-brand-dark">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,127,107,0.1)_0%,transparent_70%)]" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-heading font-black text-white uppercase tracking-tighter mb-6">
            Soporte & <span className="text-brand-amber">Contacto</span>
          </h1>
          <p className="text-xl text-gray-300 font-sans max-w-2xl mx-auto mb-10">
            Estamos aquí para ayudarte. Contáctanos o rastrea tu pedido.
          </p>
        </div>
      </section>

      <section className="py-24 bg-brand-black border-b border-brand-gold/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-heading font-black text-white uppercase tracking-tighter mb-8">
                Envíanos un mensaje
              </h2>
              <form onSubmit={handleContactSubmit} className="space-y-6 font-sans">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Nombre</label>
                    <input required type="text" className="w-full bg-brand-dark border border-brand-gold/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-amber" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Email</label>
                    <input required type="email" className="w-full bg-brand-dark border border-brand-gold/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-amber" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Asunto</label>
                  <input required type="text" className="w-full bg-brand-dark border border-brand-gold/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-amber" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Mensaje</label>
                  <textarea required rows={5} className="w-full bg-brand-dark border border-brand-gold/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-amber resize-none"></textarea>
                </div>
                <Button type="submit" size="lg" className="w-full font-bold uppercase tracking-wider">
                  Enviar Mensaje
                </Button>
              </form>
            </div>

            {/* Info & Tracking */}
            <div className="space-y-12">
              {/* Tracking */}
              <div className="bg-brand-dark border border-brand-gold/20 rounded-2xl p-8 shadow-2xl shadow-brand-amber/5">
                <h3 className="text-2xl font-heading font-bold text-brand-gold uppercase tracking-wider mb-6 flex items-center gap-3">
                  <Search className="text-brand-amber" /> Rastrear Pedido
                </h3>
                <form onSubmit={handleTrackOrder} className="space-y-4">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="Número de pedido (ej. FC-12345)" 
                      className="flex-1 bg-brand-black border border-brand-gold/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-amber"
                      required
                    />
                    <Button type="submit" variant="outline" className="shrink-0">
                      Rastrear
                    </Button>
                  </div>
                </form>
                {trackingStatus && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-brand-black border border-brand-green/30 rounded-lg text-brand-green font-sans"
                  >
                    {trackingStatus}
                  </motion.div>
                )}
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-brand-dark border border-brand-gold/10 rounded-xl p-6 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-brand-black rounded-full flex items-center justify-center text-brand-amber mb-4 border border-brand-gold/20">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white mb-2">Email</h4>
                  <p className="text-sm text-gray-400">hello@flyandchill.com</p>
                </div>
                <div className="bg-brand-dark border border-brand-gold/10 rounded-xl p-6 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-brand-black rounded-full flex items-center justify-center text-brand-green mb-4 border border-brand-gold/20">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white mb-2">WhatsApp</h4>
                  <p className="text-sm text-gray-400">+1 (555) 123-4567</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

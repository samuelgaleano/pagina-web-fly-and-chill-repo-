import React, { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { Mail, MapPin, Phone, MessageCircle, Search, ArrowRight } from "lucide-react";

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
    <div className="bg-brand-black min-h-screen pt-20">
      {/* Hero - Editorial Style */}
      <section className="relative py-40 overflow-hidden">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="w-8 h-[1px] bg-brand-primary"></span>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary">
              Atención Exclusiva
            </span>
            <span className="w-8 h-[1px] bg-brand-primary"></span>
          </div>
          <h1 className="serif text-7xl md:text-9xl font-light italic leading-none mb-10 text-white">
            Soporte & <br /> <span className="font-bold not-italic">Contacto</span>
          </h1>
          <p className="serif text-2xl text-gray-400 italic leading-relaxed max-w-2xl mx-auto">
            "Estamos aquí para asegurar que tu experiencia sea tan pura como nuestros destilados."
          </p>
        </div>
      </section>

      <section className="py-32 bg-brand-black">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
            {/* Contact Form */}
            <div>
              <h2 className="text-4xl font-heading font-black text-white uppercase tracking-tighter mb-12">
                Envíanos un mensaje
              </h2>
              <form onSubmit={handleContactSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Nombre</label>
                    <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-primary transition-all outline-none" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Email</label>
                    <input required type="email" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-primary transition-all outline-none" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Asunto</label>
                  <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-primary transition-all outline-none" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Mensaje</label>
                  <textarea required rows={5} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-primary transition-all outline-none resize-none"></textarea>
                </div>
                <Button type="submit" size="lg" className="w-full h-16 text-xs font-black uppercase tracking-widest bg-brand-primary text-brand-black hover:bg-white rounded-full transition-all shadow-xl shadow-brand-primary/20">
                  Enviar Mensaje <ArrowRight className="w-4 h-4 ml-3" />
                </Button>
              </form>
            </div>

            {/* Info & Tracking */}
            <div className="space-y-16">
              {/* Tracking */}
              <div className="bg-white/5 rounded-3xl p-10 border border-white/10">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary mb-8 flex items-center gap-3">
                  <Search className="w-4 h-4" /> Rastrear Pedido
                </h3>
                <form onSubmit={handleTrackOrder} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="text" 
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="Número de pedido (ej. FC-12345)" 
                      className="flex-1 bg-white/10 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-primary transition-all outline-none text-sm placeholder:text-gray-500"
                      required
                    />
                    <Button type="submit" className="h-14 rounded-2xl px-8 bg-brand-primary text-brand-black hover:bg-white transition-all text-xs font-bold uppercase tracking-widest">
                      Rastrear
                    </Button>
                  </div>
                </form>
                {trackingStatus && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-6 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl text-brand-primary serif text-lg italic"
                  >
                    {trackingStatus}
                  </motion.div>
                )}
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <a href="mailto:flyandchill0@gmail.com" className="bg-white/5 rounded-3xl p-10 border border-white/10 text-center group hover:border-brand-primary transition-colors">
                  <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center text-brand-primary mx-auto mb-6 shadow-sm group-hover:bg-brand-primary group-hover:text-brand-black transition-all">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-3">Email</h4>
                  <p className="serif text-lg text-gray-400 italic">flyandchill0@gmail.com</p>
                </a>
                <a href="https://wa.me/573019202618" target="_blank" rel="noopener noreferrer" className="bg-white/5 rounded-3xl p-10 border border-white/10 text-center group hover:border-brand-primary transition-colors">
                  <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center text-brand-primary mx-auto mb-6 shadow-sm group-hover:bg-brand-primary group-hover:text-brand-black transition-all">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-3">WhatsApp</h4>
                  <p className="serif text-lg text-gray-400 italic">+57 3019202618</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

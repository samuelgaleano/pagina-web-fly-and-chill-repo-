import React, { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { Music, Instagram, Twitter, Send, ArrowRight, Play } from "lucide-react";

export function Community() {
  const [email, setEmail] = useState("");
  const [song, setSong] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribed(true);
    setEmail("");
  };

  const handleSongSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSong("");
    alert("¡Canción sugerida! La revisaremos para la próxima playlist.");
  };

  return (
    <div className="bg-brand-paper min-h-screen pt-20">
      {/* Hero - Editorial Style */}
      <section className="relative py-40 overflow-hidden">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="w-8 h-[1px] bg-brand-primary"></span>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary">
              Cultura & Estilo
            </span>
            <span className="w-8 h-[1px] bg-brand-primary"></span>
          </div>
          <h1 className="serif text-7xl md:text-9xl font-light italic leading-none mb-10 text-brand-black">
            Join the <br /> <span className="font-bold not-italic">Chill Zone</span>
          </h1>
          <p className="serif text-2xl text-gray-500 italic leading-relaxed max-w-2xl mx-auto">
            "Donde el cannabis se encuentra con la cultura digital. Memes, playlists y comunidad."
          </p>
        </div>
      </section>

      {/* Playlists & Music - Split Layout */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Music className="w-5 h-5 text-brand-primary" />
                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary">
                  Fly & Chill Playlists
                </h2>
              </div>
              <h3 className="text-5xl font-heading font-black text-brand-black uppercase tracking-tighter mb-8">
                El Soundtrack <br /> de tu Vuelo
              </h3>
              <p className="serif text-xl text-gray-500 italic leading-relaxed mb-12">
                Nuestra comunidad cura las mejores playlists para cada momento. 
                Ya sea que busques relajarte con un Kush o activarte con una Sativa, 
                tenemos el soundtrack perfecto para elevar tu experiencia.
              </p>
              
              <div className="bg-brand-paper rounded-3xl p-10 border border-brand-black/5 shadow-sm">
                <h4 className="text-[10px] font-bold text-brand-black uppercase tracking-widest mb-6">Sugiérenos un track</h4>
                <form onSubmit={handleSongSubmit} className="flex gap-3">
                  <input 
                    type="text" 
                    value={song}
                    onChange={(e) => setSong(e.target.value)}
                    placeholder="Link de Spotify o nombre de la canción" 
                    className="flex-1 bg-white border-none rounded-2xl px-6 py-4 text-sm text-brand-black focus:ring-2 focus:ring-brand-primary transition-all outline-none"
                    required
                  />
                  <Button type="submit" className="w-14 h-14 rounded-2xl bg-brand-black text-white hover:bg-brand-primary transition-all flex items-center justify-center">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </div>
            
            <div className="relative group">
              <div className="aspect-square bg-brand-paper rounded-3xl overflow-hidden border border-brand-black/5 shadow-2xl relative">
                <img 
                  src="https://picsum.photos/seed/playlist/1000/1000" 
                  alt="Playlist Cover" 
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-brand-black/20 flex items-center justify-center">
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl text-brand-black"
                  >
                    <Play className="w-8 h-8 fill-current" />
                  </motion.button>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-primary/10 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Social Feeds & Memes - High End Gallery */}
      <section className="py-32 bg-brand-paper">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-heading font-black text-brand-black uppercase tracking-tighter mb-6">
              Cultura Digital
            </h2>
            <p className="serif text-xl text-gray-500 italic">Lo mejor de nuestra comunidad en redes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white rounded-3xl overflow-hidden group shadow-sm hover:shadow-2xl transition-all duration-500 border border-brand-black/5"
              >
                <div className="p-6 flex items-center gap-4 border-b border-brand-black/5">
                  <div className="w-10 h-10 rounded-full bg-brand-paper flex items-center justify-center border border-brand-black/5">
                    <span className="text-brand-black font-heading font-black text-[10px] italic">F&C</span>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-brand-black uppercase tracking-widest">flyandchill</h4>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">@flyandchill_us</p>
                  </div>
                  <Instagram className="w-4 h-4 text-gray-300 ml-auto" />
                </div>
                <div className="aspect-square bg-brand-paper relative overflow-hidden">
                  <img 
                    src={`https://picsum.photos/seed/meme${i}/800/800`} 
                    alt="Community Post" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-8">
                  <p className="serif text-lg text-gray-600 italic leading-relaxed">
                    {i % 2 === 0 ? "Cuando el Kush pega justo a tiempo 🪰💨 #FlyAndChill #CannabisCulture" : "Viernes de Sativa y creatividad. ¿Qué están armando hoy? 🎨✨"}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter - Immersive */}
      <section className="py-40 bg-brand-black text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src="https://picsum.photos/seed/newsletter/1920/1080?blur=10" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-10">
            <span className="w-8 h-[1px] bg-brand-primary"></span>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary">
              Membresía Exclusiva
            </span>
            <span className="w-8 h-[1px] bg-brand-primary"></span>
          </div>
          <h2 className="text-6xl md:text-8xl font-heading font-black uppercase tracking-tighter mb-10">
            Únete a la <br /> <span className="text-brand-primary">Familia</span>
          </h2>
          <p className="serif text-2xl text-gray-400 italic mb-16 leading-relaxed">
            Suscríbete a nuestro newsletter para recibir drops exclusivos, invitaciones a eventos de la comunidad y un 10% de descuento en tu primera compra.
          </p>
          
          {isSubscribed ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-brand-primary/20 border border-brand-primary/30 rounded-3xl p-12 inline-block"
            >
              <h3 className="text-3xl font-heading font-black uppercase tracking-widest mb-4">¡Bienvenido!</h3>
              <p className="serif text-xl italic text-gray-300">Revisa tu correo para tu código de descuento exclusivo.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 justify-center">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu mejor correo electrónico" 
                className="w-full sm:w-[400px] bg-white/5 border border-white/10 rounded-full px-10 py-6 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all text-lg backdrop-blur-xl"
                required
              />
              <Button type="submit" size="lg" className="h-20 px-12 rounded-full bg-brand-primary text-brand-black hover:bg-white transition-all text-xs font-black uppercase tracking-widest shadow-2xl shadow-brand-primary/20">
                Suscribirme <ArrowRight className="w-5 h-5 ml-3" />
              </Button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

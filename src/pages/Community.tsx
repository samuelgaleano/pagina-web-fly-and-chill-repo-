import React, { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { Music, Instagram, Twitter, Send } from "lucide-react";

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
    <div className="bg-brand-black min-h-screen">
      {/* Hero */}
      <section className="relative py-32 overflow-hidden border-b border-brand-gold/10">
        <div className="absolute inset-0 bg-brand-dark">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(118,187,202,0.1)_0%,transparent_70%)]" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-heading font-black text-white uppercase tracking-tighter mb-6">
            Join the <span className="text-brand-green">Chill Zone</span>
          </h1>
          <p className="text-xl text-gray-300 font-sans max-w-2xl mx-auto mb-10">
            Donde el cannabis se encuentra con la cultura. Memes, playlists y comunidad.
          </p>
        </div>
      </section>

      {/* Playlists & Music */}
      <section className="py-24 bg-brand-black border-b border-brand-gold/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h2 className="text-4xl font-heading font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-4">
                <Music className="w-10 h-10 text-brand-green" /> Fly & Chill Playlists
              </h2>
              <p className="text-gray-400 font-sans mb-8 leading-relaxed">
                Nuestra comunidad cura las mejores playlists para cada momento. 
                Ya sea que busques relajarte con un Kush o activarte con una Sativa, 
                tenemos el soundtrack perfecto.
              </p>
              
              <div className="bg-brand-dark border border-brand-gold/20 rounded-2xl p-6 shadow-2xl shadow-brand-green/5 mb-8">
                <h3 className="font-bold text-white uppercase tracking-wider mb-4">Sugiérenos un track</h3>
                <form onSubmit={handleSongSubmit} className="flex gap-2">
                  <input 
                    type="text" 
                    value={song}
                    onChange={(e) => setSong(e.target.value)}
                    placeholder="Link de Spotify o nombre de la canción" 
                    className="flex-1 bg-brand-black border border-brand-gold/20 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-green transition-colors"
                    required
                  />
                  <Button type="submit" variant="green" size="icon" className="shrink-0">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </div>
            
            <div className="md:w-1/2 w-full">
              {/* Spotify Embed Placeholder */}
              <div className="bg-brand-dark border border-brand-gold/10 rounded-2xl p-4 h-96 flex flex-col items-center justify-center text-center">
                <Music className="w-16 h-16 text-brand-green/50 mb-4" />
                <p className="text-gray-400 font-sans mb-4">Spotify Playlist Embed</p>
                <div className="w-full max-w-sm h-20 bg-brand-black rounded-lg border border-brand-gold/5 flex items-center px-4 gap-4">
                  <div className="w-12 h-12 bg-gray-800 rounded"></div>
                  <div className="flex-1 text-left">
                    <div className="h-3 bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-2 bg-gray-800 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Feeds & Memes */}
      <section className="py-24 bg-brand-dark">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-black text-white uppercase tracking-tighter mb-4">
              Cultura Digital
            </h2>
            <p className="text-brand-amber font-sans">Lo mejor de nuestra comunidad en redes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Mock Social Posts */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="bg-brand-black border border-brand-gold/10 rounded-xl overflow-hidden group"
              >
                <div className="p-4 flex items-center gap-3 border-b border-brand-gold/5">
                  <div className="w-8 h-8 rounded-full bg-brand-dark flex items-center justify-center border border-brand-gold/30">
                    <span className="text-brand-gold font-heading font-black text-xs italic">F&C</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">flyandchill</h4>
                    <p className="text-xs text-gray-500">@flyandchill_us</p>
                  </div>
                  <Instagram className="w-4 h-4 text-gray-500 ml-auto" />
                </div>
                <div className="aspect-square bg-brand-dark relative overflow-hidden">
                  <img 
                    src={`https://picsum.photos/seed/meme${i}/600/600`} 
                    alt="Community Post" 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-400 font-sans">
                    {i % 2 === 0 ? "Cuando el Kush pega justo a tiempo 🪰💨 #FlyAndChill #CannabisCulture" : "Viernes de Sativa y creatividad. ¿Qué están armando hoy? 🎨✨"}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 bg-brand-black border-t border-brand-gold/10">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-black text-brand-gold uppercase tracking-tighter mb-6">
            Únete a la Familia
          </h2>
          <p className="text-gray-400 font-sans mb-10">
            Suscríbete a nuestro newsletter para recibir drops exclusivos, invitaciones a eventos de la comunidad y un 10% de descuento en tu primera compra.
          </p>
          
          {isSubscribed ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-brand-dark border border-brand-green/30 rounded-2xl p-8 inline-block"
            >
              <h3 className="text-2xl font-bold text-brand-green mb-2">¡Bienvenido a la Chill Zone!</h3>
              <p className="text-gray-300">Revisa tu correo para tu código de descuento.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 justify-center">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu mejor correo electrónico" 
                className="w-full sm:w-96 bg-brand-dark border border-brand-gold/20 rounded-lg px-6 py-4 text-white focus:outline-none focus:border-brand-amber transition-colors text-lg"
                required
              />
              <Button type="submit" size="lg" className="font-bold uppercase tracking-wider text-lg">
                Suscribirme
              </Button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { Music, Instagram, Twitter, Send, ArrowRight, Play, Loader2, ExternalLink } from "lucide-react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

const INSTAGRAM_URL = "https://www.instagram.com/flyand_chill/";

interface IgPost {
  id: string;
  url: string;
}

export function Community() {
  const [email, setEmail] = useState("");
  const [song, setSong] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSendingSong, setIsSendingSong] = useState(false);
  const [igPosts, setIgPosts] = useState<IgPost[]>([]);
  const [igLoading, setIgLoading] = useState(true);

  // Publicaciones de Instagram gestionadas desde el panel de Admin.
  // Cada post nuevo aparece arriba (orden por fecha de creación desc).
  useEffect(() => {
    const q = query(collection(db, "instagramPosts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setIgPosts(snap.docs.map(d => ({ id: d.id, url: (d.data() as any).url })));
      setIgLoading(false);
    }, () => setIgLoading(false));
    return () => unsub();
  }, []);

  // Carga el script oficial de Instagram y procesa los embeds cada vez que
  // cambian las publicaciones.
  useEffect(() => {
    if (igPosts.length === 0) return;
    const process = () => (window as any).instgrm?.Embeds?.process();
    const existing = document.getElementById("ig-embed-script") as HTMLScriptElement | null;
    if (existing) {
      process();
    } else {
      const s = document.createElement("script");
      s.id = "ig-embed-script";
      s.src = "https://www.instagram.com/embed.js";
      s.async = true;
      s.onload = process;
      document.body.appendChild(s);
    }
    // Reprocesar tras un pequeño delay por si el script ya estaba cargado.
    const t = setTimeout(process, 300);
    return () => clearTimeout(t);
  }, [igPosts]);
  const [songSent, setSongSent] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribed(true);
    setEmail("");
  };

  const handleSongSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!song.trim() || isSendingSong) return;
    setIsSendingSong(true);
    try {
      const res = await fetch("/api/community/song", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ song }),
      });
      if (!res.ok) throw new Error();
      setSong("");
      setSongSent(true);
      setTimeout(() => setSongSent(false), 3500);
    } catch {
      alert("No se pudo registrar la sugerencia. Intenta de nuevo.");
    } finally {
      setIsSendingSong(false);
    }
  };

  return (
    <div className="bg-brand-black min-h-screen pt-20">
      {/* Playlists & Music - Split Layout */}
      <section className="py-32 bg-brand-black">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Music className="w-5 h-5 text-brand-primary" />
                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary">
                  Fly & Chill Playlists
                </h2>
              </div>
              <h3 className="text-5xl font-heading font-black text-white uppercase tracking-tighter mb-8">
                Alimenta el <br /> <span className="text-brand-primary">Soundtrack</span>
              </h3>
              <p className="serif text-xl text-gray-400 italic leading-relaxed mb-12">
                ¿Tienes ese track que te hace volar? Nuestra comunidad cura las mejores playlists para cada momento. 
                Sugiérenos tu canción favorita y ayúdanos a construir la vibra perfecta.
              </p>
              
              <div className="bg-white/5 rounded-3xl p-10 border border-white/10 shadow-sm">
                <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-6">Sugiérenos un track para la playlist</h4>
                <form onSubmit={handleSongSubmit} className="flex gap-3">
                  <input
                    type="text"
                    value={song}
                    onChange={(e) => setSong(e.target.value)}
                    placeholder="Link de Spotify o nombre de la canción"
                    className="flex-1 bg-white/10 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:ring-2 focus:ring-brand-primary transition-all outline-none placeholder:text-gray-500"
                    required
                  />
                  <Button type="submit" disabled={isSendingSong || !song.trim()} className="w-14 h-14 rounded-2xl bg-brand-primary text-brand-black hover:bg-white transition-all flex items-center justify-center disabled:opacity-60">
                    {isSendingSong ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </form>
                {songSent && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 text-[11px] font-bold uppercase tracking-widest text-brand-primary flex items-center gap-2"
                  >
                    <Music className="w-3.5 h-3.5" /> ¡Gracias! La revisaremos para la próxima playlist.
                  </motion.p>
                )}
              </div>
            </div>
            
            <div className="relative group">
              <div className="bg-white/5 rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
                <iframe 
                  data-testid="embed-iframe" 
                  style={{ borderRadius: '12px' }} 
                  src="https://open.spotify.com/embed/playlist/0kt99sSD2NgkzGJTEYJ1zG?utm_source=generator&theme=0" 
                  width="100%" 
                  height="450" 
                  frameBorder="0" 
                  allowFullScreen 
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                  loading="lazy"
                ></iframe>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-primary/10 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Feed — se actualiza solo desde @flyand_chill */}
      <section className="py-32 bg-brand-black">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-16 md:mb-24">
            <div className="flex items-center gap-3 mb-6">
              <Instagram className="w-5 h-5 text-brand-primary" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary">@flyand_chill</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-heading font-black text-white uppercase tracking-tighter mb-6">
              Cultura Digital
            </h2>
            <p className="serif text-xl text-gray-400 italic max-w-xl">
              Lo último de nuestra comunidad, directo desde Instagram.
            </p>
          </div>

          {/* Skeleton de carga */}
          {igLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-[500px] rounded-3xl bg-white/5 border border-white/10 animate-pulse" />
              ))}
            </div>
          ) : igPosts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                {igPosts.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ delay: Math.min(i * 0.05, 0.3), duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
                    className="rounded-3xl overflow-hidden border border-white/10 bg-white shadow-lg"
                  >
                    {/* Embed oficial de Instagram. instgrm.Embeds.process() lo
                        convierte en la tarjeta de la publicación. */}
                    <blockquote
                      className="instagram-media"
                      data-instgrm-permalink={post.url}
                      data-instgrm-version="14"
                      style={{ margin: 0, width: "100%", minWidth: 0, border: 0 }}
                    >
                      <a href={post.url} target="_blank" rel="noopener noreferrer" className="block p-6 text-center text-gray-500 text-sm">
                        Ver publicación en Instagram
                      </a>
                    </blockquote>
                  </motion.div>
                ))}
              </div>
              <div className="flex justify-center mt-16">
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="h-16 px-12 rounded-full text-xs font-black uppercase tracking-widest border-white/10 hover:border-brand-primary text-white hover:text-brand-primary transition-all flex items-center gap-3">
                    <Instagram className="w-5 h-5" /> Síguenos en Instagram
                  </Button>
                </a>
              </div>
            </>
          ) : (
            /* Fallback elegante si aún no se han agregado publicaciones */
            <div className="max-w-xl mx-auto text-center bg-white/5 border border-white/10 rounded-[2.5rem] p-12 md:p-16 shadow-2xl">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-primary/30 to-brand-secondary/30 flex items-center justify-center mx-auto mb-8 border border-white/10">
                <Instagram className="w-9 h-9 text-white" />
              </div>
              <h3 className="text-2xl font-heading font-black text-white uppercase tracking-tighter mb-4">
                Síguenos en Instagram
              </h3>
              <p className="serif text-lg text-gray-400 italic mb-10 leading-relaxed">
                Las últimas publicaciones, drops y momentos de la comunidad están en nuestra cuenta.
              </p>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="h-16 px-12 rounded-full bg-brand-primary text-brand-black hover:bg-white transition-all text-xs font-black uppercase tracking-widest flex items-center gap-3">
                  @flyand_chill <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
            </div>
          )}
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

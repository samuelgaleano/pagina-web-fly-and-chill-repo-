import { motion } from "motion/react";
import { Leaf, Users, Zap, ShieldCheck } from "lucide-react";

export function About() {
  return (
    <div className="bg-brand-black min-h-screen">
      {/* Hero */}
      <section className="relative py-32 overflow-hidden border-b border-brand-gold/10">
        <div className="absolute inset-0 bg-brand-dark">
          <img 
            src="https://picsum.photos/seed/about-hero/1920/1080?blur=4" 
            alt="Fly and Chill Team" 
            className="w-full h-full object-cover opacity-20"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/50 to-transparent" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-heading font-black text-white uppercase tracking-tighter mb-6">
            Nuestra <span className="text-brand-gold">Historia</span>
          </h1>
          <p className="text-xl text-gray-300 font-sans max-w-2xl mx-auto mb-10">
            Más que una marca de cannabis, somos una plataforma de estilo de vida.
          </p>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-24 bg-brand-black border-b border-brand-gold/10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-black text-white uppercase tracking-tighter mb-6">
              Filosofía de Marca
            </h2>
            <p className="text-lg text-gray-400 font-sans leading-relaxed">
              La filosofía de Fly and Chill se basa en una premisa simple: el cannabis moderno es cultura.
              No es únicamente un producto de consumo, sino un elemento presente en múltiples dimensiones culturales como la música, el arte digital, el entretenimiento y las comunidades online.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-brand-dark border border-brand-gold/20 rounded-2xl p-8 shadow-2xl shadow-brand-amber/5">
              <h3 className="text-2xl font-heading font-bold text-brand-amber uppercase tracking-wider mb-4">
                Misión
              </h3>
              <p className="text-gray-300 font-sans leading-relaxed">
                Ofrecer dispositivos vape de CBD de máxima pureza elaborados con materia prima orgánica y procesos de destilación avanzados, mientras se construye una comunidad digital conectada por la cultura del cannabis moderno.
              </p>
            </div>
            <div className="bg-brand-dark border border-brand-gold/20 rounded-2xl p-8 shadow-2xl shadow-brand-amber/5">
              <h3 className="text-2xl font-heading font-bold text-brand-amber uppercase tracking-wider mb-4">
                Visión
              </h3>
              <p className="text-gray-300 font-sans leading-relaxed">
                Convertirse en una de las marcas de vape CBD más influyentes de Estados Unidos, reconocida por la pureza del producto, diseño de marca, comunidad digital y experiencia cultural.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-brand-dark">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-black text-white uppercase tracking-tighter mb-4">
              Nuestros Valores
            </h2>
            <p className="text-brand-gold font-sans">Los pilares que sostienen nuestra marca.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Droplet, title: "Pureza", desc: "Destilados con hasta 97% de pureza de CBD obtenidos mediante procesos eficientes de refinamiento.", color: "text-brand-primary" },
              { icon: Users, title: "Comunidad", desc: "La marca se construye junto a su audiencia y se fortalece a través de interacción constante.", color: "text-brand-secondary" },
              { icon: Zap, title: "Experiencia", desc: "Cada producto busca generar una experiencia memorable, potente y consistente.", color: "text-brand-primary" },
              { icon: ShieldCheck, title: "Autenticidad", desc: "La estética y el lenguaje reflejan la cultura real de internet y del cannabis moderno.", color: "text-white" }
            ].map((val, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                className="bg-brand-black border border-brand-gold/10 rounded-2xl p-8 text-center group"
              >
                <div className={`w-16 h-16 rounded-full bg-brand-dark flex items-center justify-center mx-auto mb-6 border border-brand-gold/20 group-hover:border-brand-amber transition-colors ${val.color}`}>
                  <val.icon className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-heading font-bold text-white uppercase tracking-wider mb-4">
                  {val.title}
                </h4>
                <p className="text-sm text-gray-400 font-sans leading-relaxed">
                  {val.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Droplet(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
    </svg>
  )
}

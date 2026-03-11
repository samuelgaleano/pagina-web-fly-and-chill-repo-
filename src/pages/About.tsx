import { motion } from "motion/react";
import { Users, Zap, ShieldCheck, Droplet } from "lucide-react";

export function About() {
  return (
    <div className="bg-brand-paper min-h-screen pt-20">
      {/* Hero - Editorial Style */}
      <section className="relative py-40 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <span className="w-8 h-[1px] bg-brand-primary"></span>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary">
                  Nuestra Esencia
                </span>
              </div>
              <h1 className="serif text-7xl md:text-9xl font-light italic leading-none mb-10 text-brand-black">
                Nuestra <br /> <span className="font-bold not-italic">Historia</span>
              </h1>
              <p className="serif text-3xl text-gray-500 italic leading-relaxed max-w-xl">
                "Más que una marca de cannabis, somos una plataforma de estilo de vida diseñada para la nueva era."
              </p>
            </div>
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="https://picsum.photos/seed/about-hero/1200/1500" 
                alt="Fly and Chill Lifestyle" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-brand-black/10" />
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy - Minimalist Grid */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-24">
            <h2 className="text-5xl font-heading font-black text-brand-black uppercase tracking-tighter mb-10">
              Filosofía de Marca
            </h2>
            <p className="serif text-2xl text-gray-600 leading-relaxed italic">
              La filosofía de Fly and Chill se basa en una premisa simple: el cannabis moderno es cultura.
              No es únicamente un producto de consumo, sino un elemento presente en múltiples dimensiones culturales como la música, el arte digital y el entretenimiento.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-brand-paper rounded-3xl p-12 border border-brand-black/5">
              <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center mb-8">
                <span className="text-brand-primary font-bold text-xs">01</span>
              </div>
              <h3 className="text-2xl font-heading font-black text-brand-black uppercase tracking-widest mb-6">
                Misión
              </h3>
              <p className="serif text-xl text-gray-500 leading-relaxed italic">
                Ofrecer dispositivos vape de CBD de máxima pureza elaborados con materia prima orgánica y procesos de destilación avanzados, mientras se construye una comunidad digital conectada por la cultura del cannabis moderno.
              </p>
            </div>
            <div className="bg-brand-paper rounded-3xl p-12 border border-brand-black/5">
              <div className="w-12 h-12 rounded-full bg-brand-secondary/10 flex items-center justify-center mb-8">
                <span className="text-brand-secondary font-bold text-xs">02</span>
              </div>
              <h3 className="text-2xl font-heading font-black text-brand-black uppercase tracking-widest mb-6">
                Visión
              </h3>
              <p className="serif text-xl text-gray-500 leading-relaxed italic">
                Convertirse en una de las marcas de vape CBD más influyentes de Estados Unidos, reconocida por la pureza del producto, diseño de marca, comunidad digital y experiencia cultural.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values - High Impact */}
      <section className="py-32 bg-brand-paper">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-3 mb-16 justify-center">
            <span className="w-8 h-[1px] bg-brand-primary"></span>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary">
              Nuestros Valores
            </h2>
            <span className="w-8 h-[1px] bg-brand-primary"></span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Droplet, title: "Pureza", desc: "Destilados con hasta 97% de pureza de CBD obtenidos mediante procesos eficientes de refinamiento.", color: "text-brand-primary" },
              { icon: Users, title: "Comunidad", desc: "La marca se construye junto a su audiencia y se fortalece a través de interacción constante.", color: "text-brand-secondary" },
              { icon: Zap, title: "Experiencia", desc: "Cada producto busca generar una experiencia memorable, potente y consistente.", color: "text-brand-primary" },
              { icon: ShieldCheck, title: "Autenticidad", desc: "La estética y el lenguaje reflejan la cultura real de internet y del cannabis moderno.", color: "text-brand-black" }
            ].map((val, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                className="bg-white rounded-3xl p-10 text-center group shadow-sm hover:shadow-2xl transition-all duration-500 border border-brand-black/5"
              >
                <div className={`w-16 h-16 rounded-full bg-brand-paper flex items-center justify-center mx-auto mb-8 border border-brand-black/5 group-hover:border-brand-primary transition-colors ${val.color}`}>
                  <val.icon className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-heading font-black text-brand-black uppercase tracking-widest mb-6">
                  {val.title}
                </h4>
                <p className="serif text-lg text-gray-500 leading-relaxed italic">
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

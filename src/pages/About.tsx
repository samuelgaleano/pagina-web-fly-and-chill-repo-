import { motion, Variants } from "motion/react";
import { Users, Zap, ShieldCheck, Sparkles, Gift, Globe, Cpu } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";

export function About() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <div className="bg-brand-black min-h-screen pt-20 overflow-hidden">
      {/* Hero - High Impact Lifestyle */}
      <section className="relative min-h-[80vh] flex items-center py-20">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/seed/lifestyle-dark/1920/1080?blur=5" 
            alt="Lifestyle Background" 
            className="w-full h-full object-cover opacity-30"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-black via-transparent to-brand-black" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-4xl"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
              <span className="w-12 h-[1px] bg-brand-primary"></span>
              <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-brand-primary">
                The New Era
              </span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-6xl md:text-9xl font-heading font-black text-white uppercase tracking-tighter leading-[0.85] mb-8">
              Estilo de <br />
              <span className="text-brand-primary italic serif font-light lowercase">Vida</span> & <br />
              Innovación
            </motion.h1>

            <motion.p variants={itemVariants} className="serif text-xl md:text-2xl text-gray-400 italic leading-relaxed max-w-2xl mb-12">
              "No vendemos productos, curamos experiencias. Fly and Chill es la intersección entre la pureza absoluta y la cultura digital contemporánea."
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-6">
              <Link to="/community">
                <Button size="lg" className="bg-brand-primary text-brand-black hover:bg-white px-10 rounded-full font-black uppercase tracking-widest text-xs h-16 shadow-2xl shadow-brand-primary/20">
                  Únete a la Comunidad
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Essence Section - Focus on Concentration */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl" />
              <div className="bg-white/5 backdrop-blur-3xl rounded-[40px] p-12 border border-white/10 relative z-10 overflow-hidden group">
                <div className="absolute top-0 right-0 p-8">
                  <Sparkles className="w-12 h-12 text-brand-primary/20 group-hover:text-brand-primary/50 transition-colors" />
                </div>
                <h2 className="text-8xl font-heading font-black text-white mb-4">Pureza</h2>
                <h3 className="text-2xl font-heading font-black text-brand-primary uppercase tracking-widest mb-8">Absoluta</h3>
                <p className="serif text-xl text-gray-400 italic leading-relaxed">
                  Nuestra esencia es el resultado de una innovación radical. Eliminamos lo innecesario para concentrar la pureza en su estado más potente. Sin rellenos, sin compromisos. Solo la esencia.
                </p>
              </div>
            </motion.div>

            <div className="space-y-12">
              <div className="flex gap-8 items-start">
                <div className="w-16 h-16 shrink-0 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                  <Cpu className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xl font-heading font-black text-white uppercase tracking-widest mb-3">Método Inovador</h4>
                  <p className="text-gray-500 leading-relaxed">Redefinimos los estándares a través de procesos de refinamiento de vanguardia que preservan la integridad de cada molécula.</p>
                </div>
              </div>
              <div className="flex gap-8 items-start">
                <div className="w-16 h-16 shrink-0 rounded-2xl bg-white/5 flex items-center justify-center text-white">
                  <Globe className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xl font-heading font-black text-white uppercase tracking-widest mb-3">Impacto Global</h4>
                  <p className="text-gray-500 leading-relaxed">Desde Los Ángeles hasta Bogotá, conectamos una red global de mentes creativas que buscan elevar su día a día.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription & Gifts - Compact & Catchy */}
      <section className="py-24 bg-brand-primary/5 border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="bg-brand-black rounded-[50px] p-12 md:p-20 border border-brand-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-primary/5 skew-x-12 translate-x-1/2" />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-5xl md:text-7xl font-heading font-black text-white uppercase tracking-tighter leading-none mb-8">
                  Suscríbete. <br />
                  <span className="text-brand-primary">Recibe Regalos.</span>
                </h2>
                <p className="serif text-2xl text-gray-400 italic mb-10">
                  No somos un club de compras, somos una hermandad. Al inscribirte, no solo obtienes acceso; recibes drops exclusivos y regalos mensuales diseñados para complementar tu estilo de vida.
                </p>
                <ul className="space-y-4 mb-12">
                  {[
                    "Regalos exclusivos en cada suscripción",
                    "Acceso prioritario a nuevos lanzamientos",
                    "Invitaciones a eventos privados",
                    "Contenido curado para la comunidad"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-4 text-white font-heading font-bold uppercase tracking-widest text-[10px]">
                      <Gift className="w-4 h-4 text-brand-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button className="h-16 px-12 rounded-full bg-white text-brand-black hover:bg-brand-primary transition-all font-black uppercase tracking-widest text-xs">
                  Inscribirme Ahora
                </Button>
              </div>
              <div className="relative aspect-square">
                <div className="absolute inset-0 bg-brand-primary/20 rounded-full blur-3xl animate-pulse-slow" />
                <img 
                  src="https://picsum.photos/seed/gift-box/800/800" 
                  alt="Exclusive Gifts" 
                  className="w-full h-full object-cover rounded-[40px] relative z-10 shadow-2xl"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values - Minimalist & Compact */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "Calidad", desc: "Pureza absoluta para resultados inmediatos." },
              { icon: Users, title: "Comunidad", desc: "Unidos por la cultura, el arte y la innovación." },
              { icon: ShieldCheck, title: "Confianza", desc: "Transparencia total en cada gota de esencia." }
            ].map((val, idx) => (
              <div key={idx} className="p-10 rounded-3xl bg-white/5 border border-white/10 hover:border-brand-primary transition-all group">
                <val.icon className="w-10 h-10 text-brand-primary mb-6 group-hover:scale-110 transition-transform" />
                <h4 className="text-xl font-heading font-black text-white uppercase tracking-widest mb-4">{val.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

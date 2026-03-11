import { Link } from "react-router-dom";
import { Instagram, Twitter, Music, Mail, MapPin, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Footer() {
  return (
    <footer className="bg-brand-black pt-40 pb-20 text-white overflow-hidden relative">
      {/* Decorative Element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-primary/30 to-transparent" />
      
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-32">
          {/* Brand Info */}
          <div className="space-y-12">
            <Link to="/" className="flex flex-col gap-6 group">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img 
                    src="/logo.png" 
                    alt="Fly and Chill Logo" 
                    className="h-14 w-auto object-contain transition-transform group-hover:scale-110 duration-700"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden w-14 h-14 rounded-full bg-brand-primary flex items-center justify-center shadow-xl shadow-brand-primary/20">
                    <span className="text-brand-black font-heading font-black text-xl italic">F&C</span>
                  </div>
                </div>
                <span className="font-heading font-black text-3xl tracking-tighter text-white">
                  FLY AND CHILL
                </span>
              </div>
              <p className="serif text-xl text-gray-400 italic leading-relaxed max-w-xs">
                "Elevando el estándar del cannabis moderno a través de la pureza y el diseño."
              </p>
            </Link>
            <div className="flex gap-8">
              <a href="#" className="text-gray-500 hover:text-brand-primary transition-all duration-500 transform hover:-translate-y-1">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-500 hover:text-brand-primary transition-all duration-500 transform hover:-translate-y-1">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-500 hover:text-brand-primary transition-all duration-500 transform hover:-translate-y-1">
                <Music className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-primary mb-12">Explorar</h4>
            <ul className="space-y-6">
              <li><Link to="/shop" className="text-gray-400 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center group">
                <span className="w-0 group-hover:w-4 h-[1px] bg-brand-primary mr-0 group-hover:mr-3 transition-all duration-500"></span>
                Tienda
              </Link></li>
              <li><Link to="/community" className="text-gray-400 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center group">
                <span className="w-0 group-hover:w-4 h-[1px] bg-brand-primary mr-0 group-hover:mr-3 transition-all duration-500"></span>
                Comunidad
              </Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center group">
                <span className="w-0 group-hover:w-4 h-[1px] bg-brand-primary mr-0 group-hover:mr-3 transition-all duration-500"></span>
                Nosotros
              </Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center group">
                <span className="w-0 group-hover:w-4 h-[1px] bg-brand-primary mr-0 group-hover:mr-3 transition-all duration-500"></span>
                Contacto
              </Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-primary mb-12">Contacto</h4>
            <ul className="space-y-8">
              <li className="flex items-start gap-5 text-gray-400 group">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-brand-primary transition-colors duration-500">
                  <MapPin className="w-4 h-4 text-white group-hover:text-brand-black" />
                </div>
                <span className="serif text-lg italic">Los Angeles, California, USA</span>
              </li>
              <li className="flex items-center gap-5 text-gray-400 group">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-brand-primary transition-colors duration-500">
                  <Phone className="w-4 h-4 text-white group-hover:text-brand-black" />
                </div>
                <span className="serif text-lg italic">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-5 text-gray-400 group">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-brand-primary transition-colors duration-500">
                  <Mail className="w-4 h-4 text-white group-hover:text-brand-black" />
                </div>
                <span className="serif text-lg italic">hello@flyandchill.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-primary mb-12">Newsletter</h4>
            <p className="serif text-lg italic text-gray-400 mb-10 leading-relaxed">
              Recibe noticias, drops exclusivos y 10% off en tu primera compra.
            </p>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="TU CORREO" 
                  className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
                  required
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center text-brand-black hover:bg-white transition-all duration-500">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-20 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-10">
          <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.4em]">
            &copy; {new Date().getFullYear()} Fly and Chill. Todos los derechos reservados.
          </p>
          <div className="flex flex-wrap justify-center gap-10 text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">
            <a href="#" className="hover:text-brand-primary transition-colors">Términos</a>
            <a href="#" className="hover:text-brand-primary transition-colors">Privacidad</a>
            <a href="#" className="hover:text-brand-primary transition-colors">21+ Verificación</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

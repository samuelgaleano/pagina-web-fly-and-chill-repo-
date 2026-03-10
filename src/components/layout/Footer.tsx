import { Link } from "react-router-dom";
import { Instagram, Twitter, Music, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Footer() {
  return (
    <footer className="bg-brand-black pt-32 pb-16 border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          {/* Brand Info */}
          <div className="space-y-10">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="relative">
                <img 
                  src="/logo.png" 
                  alt="Fly and Chill Logo" 
                  className="h-12 w-auto object-contain transition-transform group-hover:scale-110 duration-500"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden w-12 h-12 rounded-none bg-brand-primary flex items-center justify-center">
                  <span className="text-brand-black font-heading font-black text-xl italic">F&C</span>
                </div>
              </div>
              <span className="font-heading font-black text-2xl tracking-tighter text-white">
                FLY AND CHILL
              </span>
            </Link>
            <p className="text-gray-500 text-lg font-sans leading-relaxed max-w-xs">
              Premium CBD Distillates. Cannabis Lifestyle. Community First.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-500 hover:text-brand-primary transition-all duration-300">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-500 hover:text-brand-primary transition-all duration-300">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-500 hover:text-brand-primary transition-all duration-300">
                <Music className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-black text-white uppercase tracking-[0.2em] text-xs mb-10">Explorar</h4>
            <ul className="space-y-4">
              <li><Link to="/shop" className="text-gray-500 hover:text-brand-primary text-sm font-black uppercase tracking-widest transition-colors">Tienda</Link></li>
              <li><Link to="/community" className="text-gray-500 hover:text-brand-primary text-sm font-black uppercase tracking-widest transition-colors">Comunidad</Link></li>
              <li><Link to="/about" className="text-gray-500 hover:text-brand-primary text-sm font-black uppercase tracking-widest transition-colors">Nosotros</Link></li>
              <li><Link to="/contact" className="text-gray-500 hover:text-brand-primary text-sm font-black uppercase tracking-widest transition-colors">Contacto</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-black text-white uppercase tracking-[0.2em] text-xs mb-10">Contacto</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4 text-gray-500 text-sm font-bold">
                <MapPin className="w-5 h-5 text-brand-primary shrink-0" />
                <span>Los Angeles, California, USA</span>
              </li>
              <li className="flex items-center gap-4 text-gray-500 text-sm font-bold">
                <Phone className="w-5 h-5 text-brand-primary shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-4 text-gray-500 text-sm font-bold">
                <Mail className="w-5 h-5 text-brand-primary shrink-0" />
                <span>hello@flyandchill.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-heading font-black text-white uppercase tracking-[0.2em] text-xs mb-10">Suscríbete</h4>
            <p className="text-gray-500 text-sm mb-8 font-bold">
              Recibe noticias, drops exclusivos y 10% off en tu primera compra.
            </p>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="TU CORREO" 
                className="w-full bg-brand-dark border-none rounded-none px-6 py-4 text-xs font-black uppercase tracking-widest text-white focus:ring-2 focus:ring-brand-primary transition-all"
                required
              />
              <Button type="submit" className="w-full bg-brand-primary text-brand-black hover:bg-white hover:text-brand-black transition-all duration-500 rounded-none font-black uppercase tracking-widest py-4">
                UNIRME
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Fly and Chill. Todos los derechos reservados.
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-gray-600">
            <a href="#" className="hover:text-white transition-colors">Términos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">21+ Verificación</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

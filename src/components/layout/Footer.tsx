import { Link } from "react-router-dom";
import { Instagram, Twitter, Music, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Footer() {
  return (
    <footer className="bg-brand-black border-t border-brand-gold/10 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <img 
                src="/logo.png" 
                alt="Fly and Chill Logo" 
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-dark flex items-center justify-center border border-brand-gold/30">
                  <span className="text-brand-gold font-heading font-black text-lg italic">F&C</span>
                </div>
                <span className="font-heading font-black text-xl tracking-tighter text-white">
                  FLY AND CHILL
                </span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm font-sans leading-relaxed">
              Premium CBD Distillates. Cannabis Lifestyle. Community First. 
              Elevating the modern cannabis culture through purity and connection.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-brand-dark flex items-center justify-center text-gray-400 hover:text-brand-gold hover:bg-brand-gold/10 transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-brand-dark flex items-center justify-center text-gray-400 hover:text-brand-gold hover:bg-brand-gold/10 transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-brand-dark flex items-center justify-center text-gray-400 hover:text-brand-gold hover:bg-brand-gold/10 transition-all">
                <Music className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-brand-gold uppercase tracking-wider mb-6">Explorar</h4>
            <ul className="space-y-3">
              <li><Link to="/shop" className="text-gray-400 hover:text-brand-amber text-sm transition-colors">Catálogo</Link></li>
              <li><Link to="/community" className="text-gray-400 hover:text-brand-amber text-sm transition-colors">Chill Zone</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-brand-amber text-sm transition-colors">Nuestra Historia</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-brand-amber text-sm transition-colors">Soporte</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-bold text-brand-gold uppercase tracking-wider mb-6">Contacto</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-400 text-sm">
                <MapPin className="w-5 h-5 text-brand-amber shrink-0" />
                <span>Los Angeles, California<br/>USA</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Phone className="w-5 h-5 text-brand-amber shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Mail className="w-5 h-5 text-brand-amber shrink-0" />
                <span>hello@flyandchill.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-heading font-bold text-brand-gold uppercase tracking-wider mb-6">Únete a la Comunidad</h4>
            <p className="text-gray-400 text-sm mb-4">
              Suscríbete para recibir noticias, drops exclusivos y 10% off en tu primera compra.
            </p>
            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Tu correo electrónico" 
                className="w-full bg-brand-dark border border-brand-gold/20 rounded-md px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-amber focus:ring-1 focus:ring-brand-amber transition-all"
                required
              />
              <Button type="submit" className="w-full font-bold uppercase tracking-wider">
                Suscribirme
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-brand-gold/10 pt-8 mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs text-center md:text-left">
            &copy; {new Date().getFullYear()} Fly and Chill. Todos los derechos reservados.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
            <a href="#" className="hover:text-brand-gold transition-colors">Términos y Condiciones</a>
            <a href="#" className="hover:text-brand-gold transition-colors">Política de Privacidad</a>
            <a href="#" className="hover:text-brand-gold transition-colors">Verificación de Edad (21+)</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

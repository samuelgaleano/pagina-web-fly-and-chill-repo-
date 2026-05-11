/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AgeVerificationModal } from "@/components/ui/AgeVerificationModal";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { CartProvider } from "@/context/CartContext";
import { ShopProvider } from "@/context/ShopContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import { Home } from "@/pages/Home";
import { Shop } from "@/pages/Shop";
import { ProductDetail } from "@/pages/ProductDetail";
import { Cart } from "@/pages/Cart";
import { Checkout } from "@/pages/Checkout";
import { Community } from "@/pages/Community";
import { About } from "@/pages/About";
import { Contact } from "@/pages/Contact";
import { Admin } from "@/pages/Admin";

export default function App() {
  return (
    <ErrorBoundary>
      <ShopProvider>
        <CartProvider>
          <Router>
            <ScrollToTop />
            <div className="min-h-screen bg-brand-black text-white flex flex-col font-sans">
              <AgeVerificationModal />
              <Navbar />
              
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/shop/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/admin" element={<Admin />} />
                </Routes>
              </main>

              <Footer />
              <WhatsAppButton />
            </div>
          </Router>
        </CartProvider>
      </ShopProvider>
    </ErrorBoundary>
  );
}


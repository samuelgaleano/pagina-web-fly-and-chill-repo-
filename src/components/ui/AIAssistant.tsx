import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./Button";
import { GoogleGenAI } from "@google/genai";

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([
    { role: "ai", content: "¡Hola! Soy tu asistente de Fly and Chill 🪰. ¿En qué te puedo ayudar hoy? ¿Buscas relajarte o algo más creativo?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      // Initialize Gemini API
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      
      const systemInstruction = `
        Eres un asistente de IA relajado, divertido y auténtico para la marca "Fly and Chill".
        Fly and Chill es una marca premium de destilados de CBD (vapes) con una fuerte identidad cultural digital, urbana y comunitaria.
        Tono: Relajado, humorístico, directo, conectado con la cultura de internet.
        Productos: Disposables, Cartuchos, Ediciones Especiales (97% CBD, orgánico). Sabores: Cinnamon Bun, Kush, Sativa.
        Valores: Pureza, Comunidad, Autenticidad, Experiencia, Innovación.
        Reglas: 
        - Recomienda productos basados en necesidades (ej. estrés -> Kush).
        - Confirma siempre que el usuario es mayor de 21 años si pregunta por compras.
        - Guía hacia el carrito o WhatsApp para compras rápidas.
        - Sé conciso y usa emojis.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMessage,
        config: {
          systemInstruction: systemInstruction,
        }
      });

      setMessages(prev => [...prev, { role: "ai", content: response.text || "¡Ups! Me quedé sin batería. Intenta de nuevo." }]);
    } catch (error) {
      console.error("Error calling Gemini:", error);
      setMessages(prev => [...prev, { role: "ai", content: "Lo siento, hubo un problema técnico. ¿Puedes intentar de nuevo? 😅" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-brand-gold text-brand-black flex items-center justify-center shadow-lg shadow-brand-gold/20 hover:scale-110 transition-transform"
        aria-label="Asistente IA"
      >
        <Bot className="w-7 h-7" />
      </button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-brand-dark border border-brand-gold/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden h-[500px] max-h-[80vh]"
          >
            {/* Header */}
            <div className="bg-brand-black p-4 border-b border-brand-gold/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center text-brand-black">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-brand-gold text-sm uppercase tracking-wider">Fly Bot</h3>
                  <p className="text-xs text-gray-400">En línea</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-black/50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div 
                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      msg.role === "user" 
                        ? "bg-brand-amber text-brand-black rounded-tr-none" 
                        : "bg-brand-gray text-white rounded-tl-none border border-brand-gold/10"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-brand-gray text-white p-3 rounded-2xl rounded-tl-none border border-brand-gold/10 text-sm flex gap-1 items-center">
                    <span className="w-2 h-2 bg-brand-gold rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-brand-gold rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-brand-gold rounded-full animate-bounce delay-150"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-brand-black border-t border-brand-gold/10">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 bg-brand-dark border border-brand-gold/20 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-amber transition-colors"
                />
                <Button type="submit" size="icon" variant="amber" className="rounded-full shrink-0" disabled={isLoading || !input.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

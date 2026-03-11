import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, Sparkles } from "lucide-react";
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
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-40 w-16 h-16 rounded-full bg-brand-black text-white flex items-center justify-center shadow-2xl shadow-brand-black/20 border border-white/10 group"
        aria-label="Asistente IA"
      >
        <div className="absolute inset-0 bg-brand-primary rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 -z-10" />
        <Sparkles className="w-7 h-7 group-hover:text-brand-black transition-colors duration-500" />
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-32 right-8 z-50 w-80 sm:w-96 bg-white rounded-[2rem] shadow-2xl flex flex-col overflow-hidden h-[600px] max-h-[80vh] border border-brand-black/5"
          >
            {/* Header */}
            <div className="bg-brand-black p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-brand-black shadow-lg shadow-brand-primary/20">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.3em]">Fly Bot</h3>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">En línea</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-brand-paper/30 no-scrollbar">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div 
                    className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user" 
                        ? "bg-brand-black text-white rounded-tr-none shadow-xl shadow-brand-black/10" 
                        : "bg-white text-brand-black rounded-tl-none border border-brand-black/5 shadow-sm serif italic text-base"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white text-brand-black p-4 rounded-2xl rounded-tl-none border border-brand-black/5 shadow-sm flex gap-2 items-center">
                    <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce delay-150"></span>
                    <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce delay-300"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 bg-white border-t border-brand-black/5">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-3"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 bg-brand-paper border-none rounded-full px-6 py-4 text-sm text-brand-black focus:ring-2 focus:ring-brand-primary transition-all outline-none"
                />
                <Button type="submit" className="w-14 h-14 rounded-full bg-brand-black text-white hover:bg-brand-primary hover:text-brand-black transition-all shrink-0 flex items-center justify-center" disabled={isLoading || !input.trim()}>
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

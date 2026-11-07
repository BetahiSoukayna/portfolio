// src/components/HeroChat.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, X, MessageCircle, Minimize2, Maximize2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function HeroChat() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Bonjour ! Je suis l'assistant IA de Soukayna. Posez-moi toutes vos questions sur son parcours, ses compétences ou ses projets !"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  // Extraction de la logique d'envoi globale pour éviter la manipulation directe du DOM
  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-5)
        }),
      });

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response || "Je suis désolé, je n'ai pas pu traiter votre demande."
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Erreur:", error);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "❌ Une erreur est survenue. Veuillez réessayer." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion du formulaire classique
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault(); // Bloque le rechargement
    sendMessage(input);
  };

  // Gestion des questions rapides (sans aucun risque de rechargement)
  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  const quickQuestions = [
    "Quels sont vos projets ?",
    "Quelles sont vos compétences ?",
    "Où avez-vous étudié ?",
    "Quels sont vos centres d'intérêt ?"
  ];

  return (
    <div className="relative w-full max-w-md">
      {/* Chat Container */}
      <div
        className={`rounded-2xl bg-(--card) shadow-2xl border border-(--card-border) overflow-hidden transition-all duration-300 ${
          isOpen 
            ? isMinimized 
              ? 'h-16' 
              : 'h-[500px] max-h-[80vh]'
            : 'h-auto'
        }`}
      >
        {/* Chat Body */}
        {isOpen && !isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 h-[350px] scrollbar-thin scrollbar-thumb-(--accent)/20">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`mb-3 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex max-w-[85%] items-start gap-2 rounded-lg px-4 py-2.5 ${
                      msg.role === "user"
                        ? "text-white"
                        : "bg-(--background) border border-(--card-border)"
                    }`}
                    style={
                      msg.role === "user"
                        ? {
                            background: 'linear-gradient(135deg, var(--accent) 0%, var(--gradient-end) 100%)'
                          }
                        : {}
                    }
                  >
                    {msg.role === "assistant" && <Bot className="mt-1 h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />}
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                    {msg.role === "user" && <User className="mt-1 h-4 w-4 flex-shrink-0" />}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 px-4 py-2">
                  <Bot className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full" style={{ backgroundColor: 'var(--accent)', animationDelay: "0.2s" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full" style={{ backgroundColor: 'var(--accent)', animationDelay: "0.4s" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-(--muted) mb-2">Questions rapides :</p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickQuestion(q)}
                      className="text-xs px-3 py-1.5 rounded-full border border-(--card-border) bg-(--background) text-(--muted) transition-all hover:scale-105"
                      style={{
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent)';
                        e.currentTarget.style.color = 'var(--accent)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--card-border)';
                        e.currentTarget.style.color = 'var(--muted)';
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSend} className="border-t border-(--card-border) p-3 bg-(--background)/50">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Posez votre question..."
                  className="flex-1 rounded-lg border border-(--card-border) bg-(--background) px-3 py-2 text-sm text-(--foreground) placeholder:text-(--muted) focus:outline-hidden focus:ring-2 transition-all"
                  style={{
                    '--tw-ring-color': 'var(--accent)',
                    outline: 'none'
                  } as React.CSSProperties}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="rounded-lg px-4 py-2 text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent) 0%, var(--gradient-end) 100%)'
                  }}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      {/* Bouton pour ouvrir le chat si fermé */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full rounded-2xl px-6 py-8 text-white shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl group"
          style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--gradient-end) 100%)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-sm font-medium text-white/80">💬 Chat en direct</p>
              <p className="text-lg font-bold">Posez vos questions à l&apos;IA</p>
            </div>
            <div className="rounded-full bg-white/20 p-3 transition-all group-hover:scale-110">
              <MessageCircle className="h-6 w-6" />
            </div>
          </div>
        </button>
      )}
    </div>
  );
}
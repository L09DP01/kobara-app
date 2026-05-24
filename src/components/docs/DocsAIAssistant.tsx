'use client';


import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, Send, Copy, Check, X, TerminalSquare, Loader2, Sparkles, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';

export function DocsAIAssistant({ currentSlug = '' }: { currentSlug?: string }) {
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('kobara_docs_chat_history');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Bonjour ! Je suis l\'assistant IA de Kobara. Comment puis-je vous aider avec votre intégration aujourd\'hui ? (ex: "Comment créer un paiement", "Valider mon code", etc.)'
      }
    ];
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { id: Date.now().toString(), role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/docs/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, page: currentSlug })
      });

      if (!response.ok) throw new Error('API Error');
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      if (reader) {
        setMessages([...newMessages, { id: (Date.now() + 1).toString(), role: 'assistant', content: '' }]);
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          assistantMessage += decoder.decode(value, { stream: true });
          
          setMessages(prev => {
            const last = prev[prev.length - 1];
            return [...prev.slice(0, -1), { ...last, content: assistantMessage }];
          });
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Une erreur est survenue lors de la communication avec le serveur.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('kobara_docs_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  const clearChat = () => {
    const init = [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Bonjour ! Je suis l\'assistant IA de Kobara. Comment puis-je vous aider avec votre intégration aujourd\'hui ? (ex: "Comment créer un paiement", "Valider mon code", etc.)'
      }
    ];
    setMessages(init);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('kobara_docs_chat_history');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const codeString = String(children).replace(/\n$/, '');
    
    if (!inline && match) {
      const isCopied = copiedCode === codeString;
      return (
        <div className="relative group my-4 rounded-lg overflow-hidden border border-border-subtle bg-[#0d1117]">
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#161b22] border-b border-border-subtle">
            <span className="text-xs font-mono text-white/70 uppercase tracking-wider">{match[1]}</span>
            <button 
              onClick={() => copyToClipboard(codeString)}
              className="p-1.5 rounded-md hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            >
              {isCopied ? <Check size={14} className="text-status-success" /> : <Copy size={14} />}
            </button>
          </div>
          <pre className="p-3 text-[13px] overflow-x-auto text-white/90">
            <code className={className} {...props}>{children}</code>
          </pre>
        </div>
      );
    }
    return <code className="bg-surface-container px-1.5 py-0.5 rounded text-[13px] text-primary font-mono" {...props}>{children}</code>;
  };

  // UI du Chat (Réutilisable Desktop/Mobile) - Défini comme JSX, pas comme un composant pour éviter la perte de focus
  const chatInterfaceNode = (
    <div className="flex flex-col h-full bg-surface-container-lowest dark:bg-surface-container-lowest border-l border-border-subtle dark:border-outline-variant shadow-2xl">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-border-subtle bg-surface-container/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-text-primary">Kobara AI</h3>
            <p className="text-[11px] text-text-secondary leading-none">Assistant Intégration</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 1 && (
            <button 
              onClick={clearChat}
              title="Effacer la conversation"
              className="p-2 text-text-secondary hover:text-status-error rounded-full hover:bg-status-error/10 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
          <button 
            onClick={() => setIsOpenMobile(false)}
            className="md:hidden p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-surface-container transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {messages.map((m: any) => (
          <div key={m.id} className={clsx("flex gap-3", m.role === 'user' ? "flex-row-reverse" : "")}>
            <div className={clsx(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              m.role === 'user' 
                ? "bg-surface-container-high text-text-primary" 
                : "bg-primary/10 text-primary border border-primary/20"
            )}>
              {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            
            <div className={clsx(
              "max-w-[85%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed shadow-sm",
              m.role === 'user'
                ? "bg-primary text-on-primary rounded-tr-sm"
                : "bg-surface-container-lowest border border-border-subtle text-text-primary rounded-tl-sm"
            )}>
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  code: CodeBlock,
                  p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                  a: ({href, children}) => <a href={href} className="text-primary hover:underline font-medium">{children}</a>,
                  ul: ({children}) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>,
                  strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                }}
              >
                {m.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
              <Bot size={16} />
            </div>
            <div className="bg-surface-container-lowest border border-border-subtle rounded-2xl rounded-tl-sm px-4 py-4 flex items-center gap-2 text-text-secondary">
              <Loader2 size={16} className="animate-spin text-primary" />
              <span className="text-[13px] animate-pulse">L'IA analyse le contexte...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-surface-container-lowest border-t border-border-subtle">
        <form onSubmit={handleSubmit} className="relative flex items-end">
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Posez une question ou collez votre code..."
            className="w-full bg-surface-container dark:bg-[#1A1D24] text-text-primary placeholder:text-text-secondary/50 text-[14px] rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none max-h-32 min-h-[50px] border border-border-subtle transition-shadow"
            rows={input.split('\n').length > 1 ? Math.min(input.split('\n').length, 5) : 1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="absolute right-2 bottom-2 w-8 h-8 bg-primary hover:bg-primary/90 text-on-primary rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <Send size={14} className="ml-0.5" />
          </button>
        </form>
        <div className="text-center mt-2">
          <span className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold flex items-center justify-center gap-1">
            <TerminalSquare size={10} />
            Copiez-collez votre code pour l'analyser
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* --- DESKTOP (Fixe à droite sous le header) --- */}
      <aside className="hidden lg:block fixed right-0 top-16 sm:top-20 bottom-0 w-[450px] z-30 transform transition-transform">
        {chatInterfaceNode}
      </aside>

      {/* --- MOBILE (Bouton flottant + Drawer) --- */}
      <div className="lg:hidden">
        {/* Floating Button */}
        <AnimatePresence>
          {!isOpenMobile && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => setIsOpenMobile(true)}
              className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform"
            >
              <Sparkles size={24} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Fullscreen Drawer */}
        <AnimatePresence>
          {isOpenMobile && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
                onClick={() => setIsOpenMobile(false)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-x-0 bottom-0 top-[10vh] z-50 bg-surface-container-lowest rounded-t-3xl overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.2)] flex flex-col"
              >
                {/* Handle for drawer */}
                <div className="w-full flex justify-center py-2 absolute top-0 z-10">
                  <div className="w-12 h-1.5 bg-border-subtle rounded-full" />
                </div>
                <div className="flex-1 mt-3">
                  {chatInterfaceNode}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

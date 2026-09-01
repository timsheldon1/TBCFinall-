import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Package {
  id?: string;
  _id?: string;
  name: string;
  destinations?: string[];
  location?: string;
  price: number;
  rating: number;
  duration: string;
  groupSize: string | number;
  category?: string;
  featured?: boolean;
  highlights?: string[];
  image?: string;
}

interface Property {
  id?: string;
  _id?: string;
  name: string;
  location: string;
  rating: number;
  numReviews?: number;
  basePricePerNight?: number;
  price?: number;
  featured?: boolean;
  images?: string[];
  description?: string;
  rooms?: { available: boolean }[];
}

interface NavLink {
  label: string;
  to: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  suggestions?: string[];
  packages?: Package[];
  properties?: Property[];
  links?: NavLink[];
}

interface ChatbotProps {
  className?: string;
}

// ─── Floating trigger ────────────────────────────────────────────────────────

export default function Chatbot({ className }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 bg-tbc-gold hover:bg-tbc-gold-dark text-tbc-earth shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          size="lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        <div className="absolute -top-2 -right-2">
          <Badge className="bg-tbc-earth border border-tbc-gold/50 text-tbc-gold text-xs px-1.5 py-0 rounded-full">
            1
          </Badge>
        </div>
      </div>
    );
  }

  return <ChatbotPanel className={className} onClose={() => setIsOpen(false)} />;
}

// ─── Panel ───────────────────────────────────────────────────────────────────

function ChatbotPanel({ className, onClose }: { className?: string; onClose: () => void }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages]       = useState<Message[]>([]);
  const [inputValue, setInputValue]   = useState('');
  const [isTyping, setIsTyping]       = useState(false);
  const messagesEndRef                = useRef<HTMLDivElement>(null);

  // Welcome message on first mount
  useEffect(() => {
    setMessages([{
      id: '1',
      text: "Hello! I'm your Safari Booking Assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
      suggestions: [
        'Show me packages',
        'Show me properties',
        'Book now',
        'Cancellation policy',
        'Contact support',
      ],
    }]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSendMessage = async (messageText?: string) => {
    const text = (messageText ?? inputValue).trim();
    if (!text || isTyping) return;

    const nextMessages: Message[] = [...messages, {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    }];
    setMessages(nextMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      const history = nextMessages
        .filter(m => m.text)
        .map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }));

      const { data } = await api.post('/agent/chat', { messages: history });

      const links: NavLink[] = [];
      if (data.packages?.length) links.push({ label: 'View all packages', to: '/packages' });
      if (data.properties?.length) links.push({ label: 'View all properties', to: '/collections' });

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: data.text,
        sender: 'bot',
        timestamp: new Date(),
        packages: data.packages?.length ? data.packages : undefined,
        properties: data.properties?.length ? data.properties : undefined,
        links: links.length > 0 ? links : undefined,
      }]);
    } catch (err) {
      console.error('Chatbot request failed:', err);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: "Sorry, I'm having trouble connecting right now. Please try again in a moment, or reach us directly.",
        sender: 'bot',
        timestamp: new Date(),
        links: [{ label: 'Contact Page', to: '/contact' }],
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <Card className={`w-[340px] shadow-[0_16px_48px_rgba(0,0,0,0.5)] border border-white/[0.08] bg-[#1c1917] rounded-none ${isMinimized ? 'h-14' : 'h-[480px]'} transition-all duration-300 flex flex-col`}>

        {/* Header */}
        <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between p-4 bg-[#1a1816] border-b border-white/[0.08] rounded-none">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-tbc-gold/70" />
            <CardTitle className="text-xs font-light tracking-[0.2em] uppercase text-white/70">Safari Assistant</CardTitle>
            {isTyping
              ? <div className="w-1.5 h-1.5 bg-tbc-gold/50 rounded-full animate-pulse" title="Thinking…" />
              : <div className="w-1.5 h-1.5 bg-emerald-400/70 rounded-full" title="Ready" />
            }
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setIsMinimized(!isMinimized)}
              className="h-6 w-6 p-0 text-white/40 hover:text-white/80 hover:bg-white/[0.06]">
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}
              className="h-6 w-6 p-0 text-white/40 hover:text-white/80 hover:bg-white/[0.06]">
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col flex-1 min-h-0 bg-[#1c1917]">

            {/* Messages */}
            <ScrollArea className="flex-1 min-h-0 p-3 bg-[#1c1917]">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[88%]">

                      {/* Sender + time */}
                      <div className={`flex items-center gap-1.5 mb-1 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                        {message.sender === 'bot' && <Bot className="h-3 w-3 text-tbc-gold/50" />}
                        {message.sender === 'user' && <User className="h-3 w-3 text-white/25" />}
                        <span className="text-[10px] text-white/20 font-light">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Bubble */}
                      <div className={`p-2.5 text-[11px] whitespace-pre-line font-light leading-relaxed ${
                        message.sender === 'user'
                          ? 'bg-tbc-gold/15 border border-tbc-gold/20 text-white/80'
                          : 'bg-[#292524] border border-white/[0.06] text-white/65'
                      }`}>
                        {message.text}
                      </div>

                      {/* Package cards */}
                      {message.packages && message.packages.length > 0 && (
                        <div className="mt-1.5 space-y-1.5">
                          {message.packages.map((pkg, i) => (
                            <Link
                              key={pkg.id ?? pkg._id ?? i}
                              to={`/packages`}
                              className="block bg-[#1a1816] border border-white/[0.07] hover:border-tbc-gold/30 transition-colors duration-200 p-2.5 group"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-white/75 text-[11px] font-light truncate group-hover:text-white/90 transition-colors">{pkg.name}</p>
                                  <p className="text-white/30 text-[10px] font-light mt-0.5">
                                    {pkg.destinations?.join(', ') || pkg.location} · {pkg.duration}
                                  </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-tbc-gold text-[11px] font-light">${pkg.price.toLocaleString()}</p>
                                  <p className="text-white/25 text-[10px]">per person</p>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Property cards */}
                      {message.properties && message.properties.length > 0 && (
                        <div className="mt-1.5 space-y-1.5">
                          {message.properties.map((prop, i) => (
                            <Link
                              key={prop.id ?? prop._id ?? i}
                              to={`/collections`}
                              className="block bg-[#1a1816] border border-white/[0.07] hover:border-tbc-gold/30 transition-colors duration-200 p-2.5 group"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-white/75 text-[11px] font-light truncate group-hover:text-white/90 transition-colors">{prop.name}</p>
                                  <p className="text-white/30 text-[10px] font-light mt-0.5">{prop.location}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  {prop.basePricePerNight || prop.price
                                    ? <p className="text-tbc-gold text-[11px] font-light">${(prop.basePricePerNight || prop.price)?.toLocaleString()}<span className="text-white/25">/night</span></p>
                                    : null
                                  }
                                  <p className="text-white/25 text-[10px]">★ {prop.rating}</p>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Nav links */}
                      {message.links && message.links.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {message.links.map((link) => (
                            <Link
                              key={link.to}
                              to={link.to}
                              onClick={onClose}
                              className="inline-flex items-center gap-1 text-[10px] font-light tracking-wide text-tbc-gold/70 hover:text-tbc-gold border border-tbc-gold/20 hover:border-tbc-gold/50 px-2.5 py-1 transition-colors duration-200"
                            >
                              {link.label} <ArrowRight className="h-2.5 w-2.5" />
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Suggestion chips */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {message.suggestions.map((s, i) => (
                            <Button key={i} variant="outline" size="sm"
                              onClick={() => !isTyping && handleSendMessage(s)}
                              disabled={isTyping}
                              className="text-[10px] h-6 px-2 rounded-none border-white/[0.1] text-white/35 hover:border-tbc-gold/40 hover:text-tbc-gold/80 hover:bg-transparent bg-transparent font-light disabled:opacity-25 disabled:cursor-wait"
                            >
                              {s}
                            </Button>
                          ))}
                        </div>
                      )}

                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex items-center gap-2">
                    <Bot className="h-3 w-3 text-tbc-gold/50" />
                    <div className="bg-[#292524] border border-white/[0.06] p-2.5">
                      <div className="flex space-x-1">
                        {[0, 0.1, 0.2].map((delay, i) => (
                          <div key={i} className="w-1.5 h-1.5 bg-tbc-gold/40 rounded-full animate-bounce" style={{ animationDelay: `${delay}s` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="flex-shrink-0 border-t border-white/[0.08] p-3 bg-[#1a1816]">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message…"
                  disabled={isTyping}
                  className="flex-1 text-xs rounded-none border-white/[0.1] bg-[#292524] text-white/70 placeholder:text-white/20 focus-visible:ring-0 focus-visible:border-tbc-gold/40 font-light h-9"
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isTyping}
                  size="sm"
                  className="rounded-none bg-tbc-gold hover:bg-tbc-gold-dark text-tbc-earth h-9 w-9 p-0 flex-shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

          </CardContent>
        )}
      </Card>
    </div>
  );
}

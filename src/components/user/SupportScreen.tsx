import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, GlassButton, GlassBadge } from '@/components/glass';
import { useStore } from '@/store';
import {
  AlertCircle,
  Bot,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  CreditCard,
  DollarSign,
  ExternalLink,
  FileText,
  HelpCircle,
  Image,
  Lock,
  Mail,
  MessageCircle,
  Paperclip,
  Phone,
  RefreshCw,
  Search,
  Send,
  Settings,
  Shield,
  User,
  X
} from 'lucide-react';;

interface Message {
  id: string;
  type: 'user' | 'ai' | 'support';
  content: string;
  timestamp: Date;
  read?: boolean;
  attachments?: { name: string; type: string; url: string }[];
}

interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  lastMessage: string;
  unread: number;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  icon: React.ReactNode;
}

const faqs: FAQ[] = [
  {
    id: '1',
    question: 'How do I transfer money?',
    answer: 'To transfer money, go to the Transfer tab, enter the recipient details, amount, and confirm with your PIN or biometric.',
    category: 'Transfers',
    icon: <DollarSign className="w-5 h-5" />,
  },
  {
    id: '2',
    question: 'How do I freeze my card?',
    answer: 'Go to Cards in your account, tap the card menu, and select "Freeze Card". You can unfreeze it anytime.',
    category: 'Cards',
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    id: '3',
    question: 'How do I enable biometrics?',
    answer: 'Go to Settings > Security > Biometric Login and toggle it on. You can use Face ID or fingerprint to log in.',
    category: 'Security',
    icon: <Shield className="w-5 h-5" />,
  },
  {
    id: '4',
    question: 'What are the transaction limits?',
    answer: 'Your daily limit is $10,000. Weekly limit is $50,000. Monthly limit is $200,000. Upgrade your tier for higher limits.',
    category: 'Account',
    icon: <Lock className="w-5 h-5" />,
  },
  {
    id: '5',
    question: 'How do I contact support?',
    answer: 'You can reach our support team 24/7 through this chat, by email at support@orbitpaybank.online, or by phone.',
    category: 'Support',
    icon: <MessageCircle className="w-5 h-5" />,
  },
];

const aiResponses = [
  "I understand your concern. Let me help you with that. Is there anything specific you'd like to know?",
  "Great question! Based on your account, I can see that your transaction was processed successfully.",
  "I recommend enabling two-factor authentication for better security. Would you like me to guide you through it?",
  "Your card is currently active. If you'd like to freeze it, you can do so from the Cards section.",
  "I've checked your account and everything looks good. Is there anything else I can help you with?",
];

export default function SupportScreen() {
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState<'chat' | 'tickets' | 'faq'>('chat');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your OrbitPay Assistant. How can I help you today?',
      timestamp: new Date(Date.now() - 300000),
      read: true,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: 'TKT-001',
      subject: 'Issue with international transfer',
      status: 'open',
      priority: 'high',
      createdAt: new Date(Date.now() - 86400000),
      lastMessage: 'Our team is looking into this for you.',
      unread: 1,
    },
  ]);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketForm, setTicketForm] = useState({ subject: '', priority: 'medium', message: '' });
  const chatEndRef = useRef<HTMLDivElement>(null);

  if (!user) return null;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: chatInput,
      timestamp: new Date(),
      read: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        timestamp: new Date(),
        read: false,
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const escalateToHuman = () => {
    const escalationMessage: Message = {
      id: Date.now().toString(),
      type: 'ai',
      content: 'I\'m connecting you with a human support agent. Please hold while I transfer your conversation...',
      timestamp: new Date(),
      read: false,
    };
    setMessages((prev) => [...prev, escalationMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const supportMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'support',
        content: 'Hello! I\'m a human support agent. How can I assist you today?',
        timestamp: new Date(),
        read: false,
      };
      setMessages((prev) => [...prev, supportMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const submitTicket = () => {
    if (!ticketForm.subject || !ticketForm.message) return;

    const newTicket: Ticket = {
      id: `TKT-${String(tickets.length + 1).padStart(3, '0')}`,
      subject: ticketForm.subject,
      status: 'open',
      priority: ticketForm.priority as Ticket['priority'],
      createdAt: new Date(),
      lastMessage: ticketForm.message,
      unread: 0,
    };

    setTickets((prev) => [newTicket, ...prev]);
    setTicketForm({ subject: '', priority: 'medium', message: '' });
    setShowTicketForm(false);
    setActiveTab('tickets');
  };

  return (
    <div className="p-5 space-y-5 animate-fade-in pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-[#0A0A0A]">Support</h1>
          <p className="text-sm text-[#0A0A0A]/50">We're here to help 24/7</p>
        </div>
        <GlassBadge variant="green" size="sm">
          <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse mr-1" />
          Online
        </GlassBadge>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowTicketForm(true)}
          className="p-4 bg-white/50 rounded-2xl flex flex-col items-center gap-2"
        >
          <div className="w-10 h-10 rounded-full bg-[#A8E6CF]/30 flex items-center justify-center">
            <FileText className="w-5 h-5 text-[#2ECC71]" />
          </div>
          <span className="text-xs font-medium text-[#0A0A0A]">New Ticket</span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => window.open('mailto:support@orbitpaybank.online', '_blank')}
          className="p-4 bg-white/50 rounded-2xl flex flex-col items-center gap-2"
        >
          <div className="w-10 h-10 rounded-full bg-[#DDA0DD]/30 flex items-center justify-center">
            <Mail className="w-5 h-5 text-[#DDA0DD]" />
          </div>
          <span className="text-xs font-medium text-[#0A0A0A]">Email</span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => window.open('tel:+13238927090', '_blank')}
          className="p-4 bg-white/50 rounded-2xl flex flex-col items-center gap-2"
        >
          <div className="w-10 h-10 rounded-full bg-[#F4F7C0]/30 flex items-center justify-center">
            <Phone className="w-5 h-5 text-[#0A0A0A]/60" />
          </div>
          <span className="text-xs font-medium text-[#0A0A0A]">Call Us</span>
        </motion.button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        {[
          { id: 'chat', label: 'Chat', icon: <MessageCircle className="w-4 h-4" /> },
          { id: 'tickets', label: 'Tickets', icon: <FileText className="w-4 h-4" />, badge: tickets.filter(t => t.unread > 0).length },
          { id: 'faq', label: 'FAQ', icon: <HelpCircle className="w-4 h-4" /> },
        ].map((tab) => (
          <motion.button
            key={tab.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-[#0A0A0A] text-white'
                : 'bg-white/50 text-[#0A0A0A]/60'
            }`}
          >
            {tab.icon}
            <span className="text-sm font-medium">{tab.label}</span>
            {tab.badge && tab.badge > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#FF6B6B] text-white text-xs flex items-center justify-center">
                {tab.badge}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <GlassCard className="flex flex-col h-[400px]">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] flex gap-2 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.type === 'user' ? 'bg-[#A8E6CF]' :
                    msg.type === 'ai' ? 'bg-[#DDA0DD]' : 'bg-[#F4F7C0]'
                  }`}>
                    {msg.type === 'user' ? (
                      <User className="w-4 h-4 text-[#0A0A0A]" />
                    ) : msg.type === 'ai' ? (
                      <Bot className="w-4 h-4 text-[#0A0A0A]" />
                    ) : (
                      <User className="w-4 h-4 text-[#0A0A0A]" />
                    )}
                  </div>
                  <div>
                    <div className={`px-4 py-2 rounded-2xl ${
                      msg.type === 'user'
                        ? 'bg-[#A8E6CF] rounded-tr-sm'
                        : msg.type === 'ai'
                        ? 'bg-[#F7F9F4] rounded-tl-sm'
                        : 'bg-[#DDA0DD] rounded-tl-sm'
                    }`}>
                      <p className="text-sm text-[#0A0A0A]">{msg.content}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-[#0A0A0A]/30">
                      <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {msg.type === 'user' && (
                        msg.read ? <CheckCheck className="w-3 h-3 text-[#2ECC71]" /> : <Check className="w-3 h-3" />
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#DDA0DD] flex items-center justify-center">
                    <Bot className="w-4 h-4 text-[#0A0A0A]" />
                  </div>
                  <div className="px-4 py-3 bg-[#F7F9F4] rounded-2xl rounded-tl-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-[#0A0A0A]/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-[#0A0A0A]/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-[#0A0A0A]/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-white/20">
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-xl bg-[#F7F9F4] flex items-center justify-center">
                <Paperclip className="w-5 h-5 text-[#0A0A0A]/40" />
              </button>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 bg-[#F7F9F4] rounded-xl text-sm outline-none"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={sendMessage}
                className="w-10 h-10 rounded-xl bg-[#A8E6CF] flex items-center justify-center"
              >
                <Send className="w-5 h-5 text-[#0A0A0A]" />
              </motion.button>
            </div>
            <button
              onClick={escalateToHuman}
              className="w-full mt-3 py-2 text-xs text-[#0A0A0A]/40 hover:text-[#0A0A0A] transition-colors"
            >
              Talk to human agent
            </button>
          </div>
        </GlassCard>
      )}

      {/* Tickets Tab */}
      {activeTab === 'tickets' && (
        <div className="space-y-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowTicketForm(true)}
            className="w-full p-4 bg-[#A8E6CF] rounded-2xl flex items-center justify-center gap-2"
          >
            <FileText className="w-5 h-5 text-[#0A0A0A]" />
            <span className="text-sm font-medium text-[#0A0A0A]">Create New Ticket</span>
          </motion.button>

          {tickets.map((ticket) => (
            <GlassCard key={ticket.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-[#0A0A0A]/50">{ticket.id}</span>
                  <GlassBadge
                    variant={ticket.status === 'open' ? 'green' : ticket.status === 'resolved' ? 'lavender' : 'yellow'}
                    size="sm"
                  >
                    {ticket.status}
                  </GlassBadge>
                  <GlassBadge
                    variant={ticket.priority === 'urgent' || ticket.priority === 'high' ? 'red' : 'lavender'}
                    size="sm"
                  >
                    {ticket.priority}
                  </GlassBadge>
                </div>
                <span className="text-xs text-[#0A0A0A]/30">
                  {ticket.createdAt.toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm font-medium text-[#0A0A0A] mb-1">{ticket.subject}</p>
              <p className="text-xs text-[#0A0A0A]/50 truncate">{ticket.lastMessage}</p>
              {ticket.unread > 0 && (
                <div className="mt-2 flex items-center gap-1 text-xs text-[#2ECC71]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71]" />
                  {ticket.unread} new message{ticket.unread > 1 ? 's' : ''}
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}

      {/* FAQ Tab */}
      {activeTab === 'faq' && (
        <div className="space-y-2">
          {faqs.map((faq) => (
            <GlassCard key={faq.id} className="p-0 overflow-hidden">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                className="w-full p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F7F9F4] flex items-center justify-center text-[#0A0A0A]/60">
                  {faq.icon}
                </div>
                <span className="flex-1 text-left text-sm font-medium text-[#0A0A0A]">{faq.question}</span>
                {expandedFaq === faq.id ? (
                  <ChevronUp className="w-5 h-5 text-[#0A0A0A]/30" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#0A0A0A]/30" />
                )}
              </motion.button>
              <AnimatePresence>
                {expandedFaq === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-0">
                      <p className="text-sm text-[#0A0A0A]/70 pl-13">{faq.answer}</p>
                      <button className="mt-3 text-xs text-[#A8E6CF] flex items-center gap-1">
                        Get more help <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          ))}
        </div>
      )}

      {/* New Ticket Modal */}
      <AnimatePresence>
        {showTicketForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 flex items-end"
            onClick={() => setShowTicketForm(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full bg-white rounded-t-3xl flex flex-col"
              style={{ maxHeight: '92vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex-shrink-0 px-5 pt-4 pb-3 border-b border-gray-100">
                <div className="w-12 h-1 bg-[#0A0A0A]/20 rounded-full mx-auto mb-4" />
                <h2 className="text-xl font-bold text-[#0A0A0A]">Create Support Ticket</h2>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-[#0A0A0A] mb-2 block">Subject</label>
                    <input
                      type="text"
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                      placeholder="Brief description of your issue"
                      className="w-full px-4 py-3 bg-[#F7F9F4] rounded-xl text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#0A0A0A] mb-2 block">Priority</label>
                    <div className="flex gap-2">
                      {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => setTicketForm({ ...ticketForm, priority: p })}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                            ticketForm.priority === p
                              ? 'bg-[#0A0A0A] text-white'
                              : 'bg-[#F7F9F4] text-[#0A0A0A]/60'
                          }`}
                        >
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#0A0A0A] mb-2 block">Message</label>
                    <textarea
                      value={ticketForm.message}
                      onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                      placeholder="Describe your issue in detail..."
                      rows={4}
                      className="w-full px-4 py-3 bg-[#F7F9F4] rounded-xl text-sm outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Fixed Footer - ALWAYS VISIBLE */}
              <div
                className="flex-shrink-0 px-5 py-4 border-t border-gray-100 bg-white"
                style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 16px), 24px)' }}
              >
                <div className="flex gap-3">
                  <GlassButton variant="ghost" className="flex-1" onClick={() => setShowTicketForm(false)}>
                    Cancel
                  </GlassButton>
                  <GlassButton
                    variant="gradient"
                    className="flex-1"
                    onClick={submitTicket}
                    disabled={!ticketForm.subject || !ticketForm.message}
                  >
                    Submit Ticket
                  </GlassButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Send, Sparkles, Shield, TrendingUp, AlertTriangle, FileText, Search, Loader2 } from 'lucide-react';
import * as api from '@/lib/api-live';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  data?: any;
}

const suggestedPrompts = [
  { icon: Shield, label: 'Summarize high-risk customers', query: 'Show me the 10 highest-risk members with pending KYC issues' },
  { icon: TrendingUp, label: 'Revenue analysis', query: 'Analyze this month\'s revenue and compare to last month' },
  { icon: AlertTriangle, label: 'Open fraud cases', query: 'What are the open critical fraud alerts and their risk scores?' },
  { icon: FileText, label: 'Pending KYC', query: 'List all pending KYC applications and their risk scores' },
  { icon: Search, label: 'Customer search', query: 'Find all members with account balances over $100,000' },
  { icon: Sparkles, label: 'Operational recommendations', query: 'What operational actions would you recommend based on current metrics?' },
];

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'Hello! I\'m your AI Operations Assistant. I can help you analyze customer data, draft replies, highlight fraud risks, generate reports, and explain audit events. What would you like to know?',
      timestamp: new Date(),
      suggestions: suggestedPrompts.slice(0, 3).map(p => p.label),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMsg: Message = {
      id: String(messages.length),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };
    setMessages([...messages, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(async () => {
      const response = await generateResponse(messageText);
      setMessages((prev) => [...prev, response]);
      setLoading(false);
    }, 800);
  };

  const generateResponse = async (query: string): Promise<Message> => {
    const lower = query.toLowerCase();
    const id = String(messages.length + 1);

    if (lower.includes('high-risk') || lower.includes('risk')) {
      const result: any = await api.membersApi.getAll();
      const members = (result.data || []).slice(0, 5);
      return {
        id, role: 'assistant', timestamp: new Date(),
        content: `I found ${members.length} high-risk members based on the risk score and KYC status:`,
        data: { type: 'table', rows: members.map((m: any) => ({ name: `${m.firstName} ${m.lastName}`, risk: m.riskScore, kyc: m.kycStatus, balance: `$${m.totalBalance.toLocaleString()}` })) },
        suggestions: ['Show their recent transactions', 'Lock accounts', 'Request KYC docs'],
      };
    }

    if (lower.includes('revenue')) {
      const result: any = await api.dashboardApi.getStats();
      const stats = result.data;
      return {
        id, role: 'assistant', timestamp: new Date(),
        content: `**Revenue Analysis (Current Month)**\n\n• Daily revenue: $${stats.dailyRevenue.toLocaleString()}\n• Monthly revenue: $${stats.monthlyRevenue.toLocaleString()}\n• Total deposits: $${stats.totalDeposits.toLocaleString()}\n• Total withdrawals: $${(stats.totalWithdrawals).toLocaleString()}\n• Net flow: $${(stats.totalDeposits - stats.totalWithdrawals).toLocaleString()}\n\nThe revenue is trending up due to increased transaction volume and successful loan disbursements.`,
        suggestions: ['Compare to last quarter', 'Break down by transaction type', 'Show revenue by region'],
      };
    }

    if (lower.includes('fraud') || lower.includes('alert')) {
      const result: any = await api.fraudApi.getAll();
      const alerts = (result.data || []).filter((f: any) => f.status === 'open' || f.status === 'investigating').slice(0, 5);
      return {
        id, role: 'assistant', timestamp: new Date(),
        content: `**Open Fraud Alerts (${alerts.length})**\n\n${alerts.map((a: any) => `• [${a.severity.toUpperCase()}] ${a.memberName} — ${a.description} (Risk: ${a.riskScore})`).join('\n')}`,
        data: { type: 'list', items: alerts },
        suggestions: ['Investigate top 3', 'Block related IPs', 'Resolve all low-severity'],
      };
    }

    if (lower.includes('kyc')) {
      const result: any = await api.kycApi.getAll();
      const apps = (result.data || []).filter((k: any) => k.status === 'pending' || k.status === 'under_review').slice(0, 5);
      return {
        id, role: 'assistant', timestamp: new Date(),
        content: `**${apps.length} KYC applications awaiting review**\n\n${apps.map((a: any) => `• ${a.memberName} — ${a.type} (Risk: ${a.riskScore})`).join('\n')}`,
        suggestions: ['Auto-approve low-risk', 'Request docs from high-risk', 'Bulk reject duplicates'],
      };
    }

    if (lower.includes('audit')) {
      const result: any = await api.auditApi.getAll();
      const logs = (result.data || []).slice(0, 5);
      return {
        id, role: 'assistant', timestamp: new Date(),
        content: `**Recent Audit Events (${logs.length} shown)**\n\n${logs.map((l: any) => `• ${l.adminName} (${l.adminRole}) → ${l.action} on ${l.targetName} (${new Date(l.timestamp).toLocaleString()})`).join('\n')}`,
        suggestions: ['Filter by admin', 'Export to CSV', 'Find failed actions'],
      };
    }

    if (lower.includes('recommend') || lower.includes('action') || lower.includes('should')) {
      const dashResult: any = await api.dashboardApi.getStats();
      const stats = dashResult.data;
      return {
        id, role: 'assistant', timestamp: new Date(),
        content: `**Operational Recommendations**\n\nBased on current metrics:\n\n1. **Address ${stats.pendingKYC} pending KYC** — these block account growth. Consider auto-approving low-risk applications (score < 30).\n\n2. **Investigate ${stats.openFraudAlerts} open fraud alerts** — especially ${stats.criticalFraudAlerts} critical. Average response time is impacting customer trust.\n\n3. **${stats.frozenAccounts} frozen accounts** — review whether they should be reactivated or closed. Each frozen account is lost revenue.\n\n4. **Daily revenue: $${stats.dailyRevenue.toLocaleString()}** — review failed transactions (${stats.failedTransactions}) for revenue leakage.\n\n5. **Customer support backlog: ${stats.openTickets} tickets** with ${stats.urgentTickets} urgent. Consider automated responses for low-complexity queries.`,
        suggestions: ['Generate KYC report', 'List critical fraud', 'Create support playbook'],
      };
    }

    return {
      id, role: 'assistant', timestamp: new Date(),
      content:
        'I can help with: customer summaries, fraud analysis, KYC status, revenue reporting, audit trail explanation, and operational recommendations. Try one of the suggestions below, or ask me anything about the data.\n\n' +
        '__Note__: this is currently a keyword-matcher that returns canned responses. To enable a real LLM (OpenAI / Anthropic / Gemini), set VITE_OPENAI_API_KEY (or similar) in admin-portal/.env.local and replace the `generateResponse` function below with a streaming fetch to the provider.',
      suggestions: suggestedPrompts.slice(0, 3).map(p => p.label),
    };
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">AI Operations Assistant</h1>
          <p className="text-sm text-slate-400">Subject to your role permissions · All queries are logged for audit</p>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl flex flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  m.role === 'user' ? 'bg-slate-700' : 'bg-gradient-to-br from-violet-500 to-fuchsia-500'
                }`}>
                  {m.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                <div className={`flex-1 max-w-2xl ${m.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block px-4 py-3 rounded-2xl text-left whitespace-pre-wrap ${
                    m.role === 'user' ? 'bg-blue-500/20 text-white' : 'bg-slate-700/50 text-slate-100'
                  }`}>
                    {m.content}
                  </div>
                  {m.data?.type === 'table' && (
                    <div className="mt-2 bg-slate-900/50 border border-slate-700 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-800/50 text-slate-400">
                          <tr>
                            {Object.keys(m.data.rows[0] || {}).map((k) => (
                              <th key={k} className="px-3 py-2 text-left">{k}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {m.data.rows.map((row: any, i: number) => (
                            <tr key={i} className="border-t border-slate-700/50">
                              {Object.values(row).map((v, j) => (
                                <td key={j} className="px-3 py-2 text-slate-300">{String(v)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {m.suggestions && m.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {m.suggestions.map((s, i) => (
                        <button key={i} onClick={() => send(s)}
                          className="px-3 py-1.5 text-xs bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-full text-slate-200">
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="px-4 py-3 bg-slate-700/50 rounded-2xl flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                  <span className="text-slate-300 text-sm">Analyzing data...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Suggestions row */}
        {messages.length === 1 && (
          <div className="px-6 py-4 border-t border-slate-700">
            <p className="text-xs text-slate-500 mb-2">Try asking:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {suggestedPrompts.map((p, i) => (
                <button key={i} onClick={() => { setInput(p.query); send(p.query); }}
                  className="flex items-center gap-2 p-2.5 bg-slate-700/30 hover:bg-slate-700/60 border border-slate-700 rounded-lg text-left">
                  <p.icon className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span className="text-xs text-slate-200">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ask about customers, transactions, fraud, revenue, KYC..."
              className="flex-1 px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
            <button onClick={() => send()} disabled={!input.trim() || loading}
              className="px-4 py-2.5 bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Terminal, 
  Plus, 
  Trash2, 
  Shield, 
  Activity, 
  Cpu, 
  Zap, 
  RefreshCw,
  LogOut,
  Settings as SettingsIcon,
  LayoutDashboard,
  Server,
  TerminalSquare,
  ChevronRight,
  Lock,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Rule {
  id: string;
  name: string;
  protocol: string;
  local_port: number;
  remote_addr: string;
}

const API_BASE = window.location.origin;

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [rules, setRules] = useState<Rule[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [newRule, setNewRule] = useState({ name: '', protocol: 'tcp', local_port: 0, remote_addr: '' });
  const [status, setStatus] = useState('IDLE');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('Overview');
  
  // System info state
  const [sysInfo, setSysInfo] = useState({ cpu_usage: '0.0%', version: 'Detecting...' });

  // Password change state
  const [passForm, setPassForm] = useState({ old: '', new: '', confirm: '' });
  const [passStatus, setPassStatus] = useState<'IDLE' | 'SAVING' | 'SUCCESS' | 'ERROR'>('IDLE');

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('gost_token');
    if (token) setIsLoggedIn(true);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchRules();
      fetchSysInfo();
      connectWebSocket();
      const interval = setInterval(fetchSysInfo, 1000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, currentTab]);

  const fetchSysInfo = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/sys/info`);
      setSysInfo(res.data);
    } catch (e) { console.error(e); }
  };

  const connectWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    ws.onmessage = (event) => setLogs((prev) => [...prev, event.data].slice(-200));
    ws.onclose = () => setTimeout(connectWebSocket, 3000);
  };

  const fetchRules = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/rules`);
      setRules(res.data || []);
    } catch (e) { console.error(e); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/login`, { password });
      localStorage.setItem('gost_token', 'dummy-token');
      setIsLoggedIn(true);
    } catch (e) { alert('Authentication failed.'); }
  };

  const addRule = async () => {
    if (!newRule.name || !newRule.local_port || !newRule.remote_addr) {
      alert('Please fill in all required fields.');
      return;
    }
    setStatus('SYNCING');
    try {
      await axios.post(`${API_BASE}/api/rules`, newRule);
      setNewRule({ name: '', protocol: 'tcp', local_port: 0, remote_addr: '' });
      setIsModalOpen(false);
      fetchRules();
      setTimeout(() => setStatus('IDLE'), 1000);
    } catch (e) { 
      alert('Failed to create rule.');
      setStatus('IDLE');
    }
  };

  const deleteRule = async (id: string) => {
    setStatus('SYNCING');
    try {
      await axios.delete(`${API_BASE}/api/rules/${id}`);
      fetchRules();
      setTimeout(() => setStatus('IDLE'), 1000);
    } catch (e) { 
      alert('Failed to delete rule.');
      setStatus('IDLE');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.new !== passForm.confirm) {
      alert('New passwords do not match.');
      return;
    }
    setPassStatus('SAVING');
    try {
      await axios.post(`${API_BASE}/api/settings/password`, {
        old_password: passForm.old,
        new_password: passForm.new
      });
      setPassStatus('SUCCESS');
      setPassForm({ old: '', new: '', confirm: '' });
      setTimeout(() => setPassStatus('IDLE'), 3000);
    } catch (e: any) {
      alert(e.response?.data?.error || 'Failed to update password.');
      setPassStatus('ERROR');
      setTimeout(() => setPassStatus('IDLE'), 3000);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712] relative overflow-hidden font-sans text-sm text-slate-300">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand/10 blur-[100px] rounded-full pointer-events-none" />
        <form onSubmit={handleLogin} className="w-full max-w-xs glass-card rounded-[2rem] p-10 space-y-8 relative z-10 border-white/5 shadow-2xl">
          <div className="flex flex-col items-center space-y-5 text-center">
            <div className="w-16 h-16 bg-gradient-to-tr from-brand to-pink-500 rounded-2xl flex items-center justify-center shadow-xl shadow-brand/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white italic">GOST Manager</h1>
              <p className="text-slate-500 text-[10px] mt-2 tracking-widest uppercase font-bold opacity-60">Control Center Login</p>
            </div>
          </div>
          <input
            type="password"
            placeholder="ACCESS KEY"
            className="w-full glass-input p-3 text-center text-white outline-none placeholder:text-slate-700"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl text-xs uppercase tracking-widest">
            Enter Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row p-4 md:p-6 gap-6 relative font-sans selection:bg-brand/30 text-sm text-slate-300">
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand/5 blur-[160px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-500/5 blur-[160px] rounded-full pointer-events-none" />

      {/* Sidebar */}
      <aside className="w-full md:w-64 glass-card rounded-[2rem] p-8 flex flex-col z-20 border-white/5 shadow-2xl shrink-0">
        <div className="flex-grow space-y-12">
          <div className="flex items-center space-x-4 px-2 cursor-pointer" onClick={() => setCurrentTab('Overview')}>
            <div className="w-12 h-12 bg-gradient-to-br from-brand to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand/20 shrink-0">
              <Server className="w-6 h-6" />
            </div>
            <div className="flex flex-col leading-[0.8]">
              <span className="font-black text-xl tracking-tighter text-white uppercase italic">Gost</span>
              <span className="font-bold text-[10px] tracking-[0.3em] text-brand uppercase opacity-80 mt-1">Manager</span>
            </div>
          </div>
          
          <nav className="space-y-1.5">
            {[
              { label: 'Overview', icon: LayoutDashboard },
              { label: 'Forwarding', icon: Activity },
              { label: 'Logs', icon: TerminalSquare },
              { label: 'Settings', icon: SettingsIcon },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => setCurrentTab(item.label)}
                className={cn(
                  "w-full flex items-center space-x-4 px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-300",
                  currentTab === item.label 
                    ? "bg-white/10 text-white border border-white/10 shadow-xl" 
                    : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
                )}
              >
                <item.icon className={cn("w-4 h-4", currentTab === item.label ? "text-brand" : "")} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-brand/5 border border-brand/10">
             <div className="text-[9px] font-black text-brand uppercase tracking-[0.2em] mb-1.5 opacity-60">Engine Status</div>
             <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Node Cluster</span>
                <span className="text-[10px] font-bold text-green-400 uppercase tracking-tighter animate-pulse">Operational</span>
             </div>
          </div>
          <button 
            onClick={() => { localStorage.removeItem('gost_token'); setIsLoggedIn(false); }}
            className="w-full text-slate-600 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center space-x-3 group"
          >
            <LogOut className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            <span>Logout Session</span>
          </button>
        </div>
      </aside>

      <main className="flex-grow space-y-6 z-20 min-w-0 h-[calc(100vh-3rem)] overflow-hidden flex flex-col">
        {/* Dynamic Content Header */}
        <div className="shrink-0 flex items-center space-x-2 text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em] mb-2 px-2">
           <LayoutDashboard className="w-3 h-3 text-brand/50" />
           <ChevronRight className="w-3 h-3 opacity-30" />
           <span className="text-white tracking-[0.3em]">{currentTab}</span>
        </div>

        {currentTab === 'Overview' && (
          <div className="flex-grow space-y-6 overflow-y-auto pr-2 custom-scroll">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Active Rules', val: rules.length, icon: Activity },
                { label: 'CPU Usage', val: sysInfo.cpu_usage, icon: Cpu },
                { label: 'Sync Status', val: status === 'SYNCING' ? 'PROCESSING' : 'STABLE', icon: RefreshCw },
                { label: 'Engine Core', val: sysInfo.version, icon: Zap },
              ].map((s, i) => (
                <div key={i} className="glass-card rounded-[1.5rem] p-5 border-white/5 group hover:border-brand/20 transition-all shadow-xl">
                  <div className="flex items-center space-x-3 text-slate-500 mb-1.5">
                    <s.icon className={cn("w-4 h-4 text-brand/40", s.val === 'PROCESSING' ? "animate-spin" : "")} />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">{s.label}</span>
                  </div>
                  <div className="text-xl font-bold text-white tracking-tight">{s.val}</div>
                </div>
              ))}
            </div>

            <div className="glass-card rounded-[2rem] overflow-hidden flex flex-col min-h-[400px] border-white/5 shadow-inner bg-white/[0.01]">
              <div className="p-8 flex justify-between items-center shrink-0 border-b border-white/5">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight italic">Quick Rules</h2>
                  <p className="text-slate-500 text-[10px] mt-1 opacity-60">High-priority proxy channels.</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-white text-black px-6 py-2.5 rounded-xl text-[11px] font-black hover:scale-[1.03] active:scale-[0.97] transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
                >
                  + Create Rule
                </button>
              </div>

              <div className="flex-grow px-4 overflow-x-auto text-[11px]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-600 text-[9px] font-black uppercase tracking-[0.2em]">
                      <th className="px-8 py-5">Label</th>
                      <th className="px-8 py-5">Mode</th>
                      <th className="px-8 py-5">Inbound</th>
                      <th className="px-8 py-5">Destination</th>
                      <th className="px-8 py-5 text-right">_cmd</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {rules.slice(0, 5).map((rule) => (
                      <tr key={rule.id} className="group hover:bg-white/[0.01] transition-all duration-300">
                        <td className="px-8 py-5 font-bold text-white tracking-tight">{rule.name || 'Unnamed'}</td>
                        <td className="px-8 py-5">
                          <span className="text-[8px] font-black px-2 py-0.5 rounded-lg bg-brand/10 text-brand border border-brand/20 tracking-widest uppercase">
                            {rule.protocol}
                          </span>
                        </td>
                        <td className="px-8 py-5 font-mono text-xs font-bold text-slate-300">{rule.local_port}</td>
                        <td className="px-8 py-5 font-mono text-xs text-slate-500 group-hover:text-brand/60 transition-colors">{rule.remote_addr}</td>
                        <td className="px-8 py-5 text-right">
                          <button 
                            onClick={() => deleteRule(rule.id)}
                            className="p-2 text-slate-700 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rules.length === 0 && (
                  <div className="py-24 text-center text-slate-600 italic text-sm opacity-40 uppercase tracking-widest">The registry is empty</div>
                )}
              </div>
            </div>

            <div className="glass-card rounded-[1.5rem] p-7 flex flex-col space-y-4 border-white/5 shadow-xl bg-black/20 mb-8">
              <div className="flex items-center justify-between px-2 text-slate-500">
                <div className="flex items-center space-x-3 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  <Terminal className="w-4 h-4 text-brand" />
                  <span>Flux Console Preview</span>
                </div>
                <div className="flex items-center space-x-2">
                   <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                   <span className="text-[9px] font-black text-green-600">LIVE</span>
                </div>
              </div>
              <div ref={scrollRef} className="h-32 overflow-y-auto font-mono text-[9px] leading-relaxed text-slate-500 space-y-1.5 px-2 custom-scroll">
                {logs.slice(-20).map((log, i) => (
                  <div key={i} className="flex space-x-3 items-start group">
                    <span className="text-brand/30 select-none font-black text-[8px] mt-0.5">#</span>
                    <span className="group-hover:text-slate-300 transition-colors">{log}</span>
                  </div>
                ))}
                <div className="animate-pulse text-brand shadow-brand font-black">_</div>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'Forwarding' && (
          <div className="flex-grow flex flex-col glass-card rounded-[2.5rem] overflow-hidden border-white/5 shadow-2xl bg-white/[0.01]">
            <div className="p-8 border-b border-white/5 flex justify-between items-center shrink-0">
               <h2 className="text-xl font-bold text-white italic tracking-tight uppercase">Forwarding Registry</h2>
               <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-brand text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.03] transition-all shadow-xl"
                >
                  + Add Entry
                </button>
            </div>
            <div className="flex-grow overflow-y-auto px-6 py-4 custom-scroll">
               <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-600 text-[9px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                      <th className="px-6 py-4">Rule Identity</th>
                      <th className="px-6 py-4 text-center">Mode</th>
                      <th className="px-6 py-4">Inbound Port</th>
                      <th className="px-6 py-4">Destination Target</th>
                      <th className="px-6 py-4 text-right">Status</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {rules.map((rule) => (
                      <tr key={rule.id} className="group hover:bg-white/[0.01] transition-all">
                        <td className="px-6 py-5 text-white font-bold">{rule.name}</td>
                        <td className="px-6 py-5 text-center">
                           <span className="px-2 py-0.5 bg-brand/10 border border-brand/20 text-brand text-[8px] font-black rounded uppercase">{rule.protocol}</span>
                        </td>
                        <td className="px-6 py-5 text-slate-300 font-mono">{rule.local_port}</td>
                        <td className="px-6 py-5 text-slate-500 font-mono italic">{rule.remote_addr}</td>
                        <td className="px-6 py-5 text-right text-[9px] font-bold text-slate-400">
                           <div className="flex items-center justify-end space-x-2">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                              <span>OPERATIONAL</span>
                           </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                           <button onClick={() => deleteRule(rule.id)} className="p-2 text-slate-700 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
               {rules.length === 0 && <div className="py-32 text-center text-slate-600 italic uppercase tracking-widest opacity-30">No active mappings</div>}
            </div>
          </div>
        )}

        {currentTab === 'Logs' && (
          <div className="flex-grow glass-card rounded-[2.5rem] overflow-hidden flex flex-col border-white/5 shadow-2xl bg-black/40">
             <div className="p-8 border-b border-white/5 flex justify-between items-center shrink-0">
                <div className="flex items-center space-x-4">
                   <TerminalSquare className="w-6 h-6 text-brand" />
                   <h2 className="text-xl font-bold text-white italic tracking-tight uppercase">Flux Terminal</h2>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                   <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                   <span className="text-[8px] font-black text-green-500 uppercase tracking-[0.2em]">Synchronized Stream</span>
                </div>
             </div>
             <div ref={scrollRef} className="flex-grow overflow-y-auto p-10 font-mono text-[10px] leading-relaxed text-slate-400 space-y-1.5 custom-scroll bg-black/20">
                {logs.map((log, i) => (
                  <div key={i} className="flex space-x-6 items-start group hover:bg-white/[0.02] p-1 rounded transition-all">
                    <span className="text-brand/20 select-none font-bold w-12 shrink-0">{i.toString().padStart(4, '0')}</span>
                    <span className="text-slate-500/40 select-none">|</span>
                    <span className="group-hover:text-slate-200 transition-colors">{log}</span>
                  </div>
                ))}
                <div className="animate-pulse text-brand pt-4 font-black tracking-widest">_ WAITING_FOR_FLUX</div>
             </div>
          </div>
        )}

        {currentTab === 'Settings' && (
          <div className="flex-grow glass-card rounded-[3rem] p-12 space-y-12 border-white/5 shadow-2xl overflow-y-auto custom-scroll bg-white/[0.01]">
             <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white italic tracking-tight uppercase">System Settings</h2>
                <p className="text-slate-500 text-[10px] tracking-widest font-bold opacity-60">Control node configuration and security.</p>
             </div>
             
             <div className="max-w-xl space-y-8">
                {/* Password Change Form */}
                <form onSubmit={handleChangePassword} className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-8 relative overflow-hidden group shadow-2xl">
                   <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="relative space-y-6">
                      <div className="flex items-center space-x-4 border-b border-white/5 pb-6">
                         <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
                            <Lock className="w-5 h-5 text-brand" />
                         </div>
                         <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Security Credentials</h3>
                      </div>

                      <div className="space-y-4">
                         <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Current Master Key</label>
                            <input 
                               type="password" 
                               className="w-full glass-input p-3.5 text-white outline-none"
                               value={passForm.old}
                               onChange={(e) => setPassForm({...passForm, old: e.target.value})}
                               required
                            />
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                               <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">New Key</label>
                               <input 
                                  type="password" 
                                  className="w-full glass-input p-3.5 text-white outline-none"
                                  value={passForm.new}
                                  onChange={(e) => setPassForm({...passForm, new: e.target.value})}
                                  required
                               />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Confirm New Key</label>
                               <input 
                                  type="password" 
                                  className="w-full glass-input p-3.5 text-white outline-none"
                                  value={passForm.confirm}
                                  onChange={(e) => setPassForm({...passForm, confirm: e.target.value})}
                                  required
                               />
                            </div>
                         </div>
                      </div>

                      <button 
                         type="submit"
                         disabled={passStatus === 'SAVING'}
                         className={cn(
                            "w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-3 shadow-xl",
                            passStatus === 'SAVING' ? "bg-white/5 text-slate-600" : 
                            passStatus === 'SUCCESS' ? "bg-green-500 text-black" :
                            "bg-white text-black hover:bg-brand hover:text-white"
                         )}
                      >
                         {passStatus === 'SAVING' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 
                          passStatus === 'SUCCESS' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                          <KeyRound className="w-3.5 h-3.5" />}
                         <span>{passStatus === 'SAVING' ? 'Encrypting...' : passStatus === 'SUCCESS' ? 'Cipher Updated' : 'Rewrite Master Key'}</span>
                      </button>
                   </div>
                </form>

                {/* Info Card */}
                <div className="p-8 rounded-[2rem] bg-brand/5 border border-brand/10 space-y-4 shadow-xl">
                   <h3 className="text-[10px] font-black text-brand uppercase tracking-widest flex items-center space-x-3">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Cluster Metadata</span>
                   </h3>
                   <div className="grid grid-cols-2 gap-4 text-[10px] font-bold">
                      <div className="space-y-1">
                         <div className="text-slate-600 uppercase tracking-tighter">Environment</div>
                         <div className="text-white">DOCKER_V3_ALPINE</div>
                      </div>
                      <div className="space-y-1">
                         <div className="text-slate-600 uppercase tracking-tighter">Engine Version</div>
                         <div className="text-white">{sysInfo.version}</div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </main>

      {/* New Rule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="w-full max-w-md glass-card rounded-[2.5rem] p-12 space-y-10 animate-in zoom-in-95 duration-500 shadow-[0_0_100px_rgba(167,139,250,0.15)] border-white/5">
             <div className="flex justify-between items-center border-b border-white/5 pb-6">
                <h3 className="text-xl font-bold text-white italic">Add Forwarding Rule</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white p-1 hover:bg-white/5 rounded-full transition-all">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
             </div>
             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-4">Rule Name</label>
                   <input
                    placeholder="e.g., MySQL Proxy"
                    className="w-full glass-input p-3.5 text-white text-sm font-medium"
                    value={newRule.name}
                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-4">Protocol</label>
                    <select
                      className="w-full glass-input p-3.5 text-white text-xs appearance-none cursor-pointer"
                      value={newRule.protocol}
                      onChange={(e) => setNewRule({ ...newRule, protocol: e.target.value })}
                    >
                      <option value="tcp">TCP_FLOW</option>
                      <option value="udp">UDP_PULSE</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-4">Local Port</label>
                    <input
                      type="number"
                      placeholder="Port"
                      className="w-full glass-input p-3.5 text-white font-mono text-sm"
                      value={newRule.local_port || ''}
                      onChange={(e) => setNewRule({ ...newRule, local_port: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-4">Remote Address</label>
                   <input
                    placeholder="host:port"
                    className="w-full glass-input p-3.5 text-white font-mono text-sm"
                    value={newRule.remote_addr}
                    onChange={(e) => setNewRule({ ...newRule, remote_addr: e.target.value })}
                  />
                </div>
             </div>
             <button
              onClick={addRule}
              className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-brand hover:text-white transition-all shadow-2xl hover:shadow-brand/20 active:scale-95 text-xs uppercase tracking-widest"
             >
              Save Rule
             </button>
          </div>
        </div>
      )}
    </div>
  );
}

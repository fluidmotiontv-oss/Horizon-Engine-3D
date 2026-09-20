import { ThreeBackground } from './components/ThreeBackground';
import { ScriptEditor } from './components/ScriptEditor';
import { RenderQueue } from './components/RenderQueue';
import { AssetBrowser } from './components/AssetBrowser';
import { SystemPerformance } from './components/SystemPerformance';
import { InstallButton } from './components/InstallButton';
import { Cpu, Box, Database, Zap, Gauge, Shield, Globe } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  return (
    <div className="min-h-screen text-slate-200 selection:bg-blue-500/30 selection:text-blue-200">
      <ThreeBackground />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/50 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              <Zap className="text-white fill-white" size={18} />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white uppercase italic">Horizon Engine</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Dragon 9 Sovereign Framework</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-8">
            <a href="#" className="text-xs font-bold uppercase tracking-widest text-blue-400 border-b-2 border-blue-600 pb-1 mt-1">Dashboard</a>
            <a href="#" className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors">Nodes</a>
            <a href="#" className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors">Library</a>
            <a href="#" className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors">Settings</a>
          </nav>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                <Globe size={12} className="text-blue-400" />
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Mesh Mesh Alpha</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <Shield size={12} className="text-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Quantum Encrypted</span>
              </div>
            </div>
            <InstallButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Render Status Widgets */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Gauge className="text-blue-500" size={16} />
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Real-time Telemetry</h2>
          </div>
          <RenderQueue />
          <SystemPerformance />
        </section>

        {/* Main Workspace */}
        <section className="grid grid-cols-1 gap-8">
          <div className="bg-slate-900/20 backdrop-blur-sm border border-slate-800/50 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-3">
                <Cpu className="text-blue-500" size={20} />
                Automation Core
              </h2>
            </div>
            <ScriptEditor />
          </div>

          <div className="bg-slate-900/20 backdrop-blur-sm border border-slate-800/50 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-3">
                <Database className="text-amber-500" size={20} />
                Output Repositories
              </h2>
            </div>
            <AssetBrowser />
          </div>
        </section>

        {/* Footer Info */}
        <footer className="pt-12 pb-8 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-800/30">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest text-center md:text-left">
            Dragon 9 Framework // Sovereign ISP Mesh // antiX Linux Nodes // UTC-7
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest flex items-center gap-2">
              <Box size={12} /> Horizon Engine Core
            </span>
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
              v1.1.2-SOVEREIGN-MESH
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Cpu, MemoryStick as Memory, Zap, Thermometer, AlertTriangle, Flame, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RenderStatus } from '../types';

export function SystemPerformance() {
  const [status, setStatus] = useState<RenderStatus | null>(null);
  const [forceOverheat, setForceOverheat] = useState(false);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'STATUS_UPDATE') {
        setStatus(message.data);
      }
    };

    return () => ws.close();
  }, []);

  if (!status || !status.performance) return null;

  const { cpu, memory, gpu, temp } = status.performance;
  const effectiveTemp = forceOverheat ? Math.max(88.5, temp) : temp;
  const isOverheating = effectiveTemp > 85;

  const MetricCard = ({ 
    label, 
    value, 
    icon: Icon, 
    color, 
    unit = '%',
    isAlert = false
  }: { 
    label: string; 
    value: number; 
    icon: any; 
    color: string; 
    unit?: string;
    isAlert?: boolean;
  }) => (
    <div className={`flex flex-col gap-3 p-4 bg-slate-900/40 border transition-all duration-300 rounded-2xl ${
      isAlert 
        ? 'border-rose-500/80 bg-rose-950/30 shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-pulse' 
        : 'border-slate-800'
    }`}>
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${
          isAlert 
            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' 
            : `bg-${color}-600/10 text-${color}-400`
        }`}>
          <Icon size={16} className={isAlert ? 'animate-bounce' : ''} />
        </div>
        <div className="flex items-center gap-1.5">
          {isAlert && (
            <span className="px-1.5 py-0.5 bg-rose-600/30 border border-rose-500/50 text-rose-300 text-[9px] font-bold uppercase tracking-wider rounded">
              OVERHEAT
            </span>
          )}
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
        </div>
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className={`text-2xl font-mono font-bold ${isAlert ? 'text-rose-400' : 'text-slate-100'}`}>
          {value.toFixed(1)}<span className="text-sm text-slate-500 ml-0.5">{unit}</span>
        </span>
        <div className="h-10 w-24 flex items-end gap-1">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(20, Math.random() * 100)}%` }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse', delay: i * 0.05 }}
              className={`w-full rounded-t-sm ${isAlert ? 'bg-rose-500/50' : `bg-${color}-500/30`}`}
            />
          ))}
        </div>
      </div>
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${Math.min(100, (value / (unit === '°C' ? 100 : 100)) * 100)}%` }}
          className="h-full transition-all duration-700"
          style={{
            backgroundColor: isAlert 
              ? '#f43f5e' 
              : color === 'blue' ? '#3b82f6' : color === 'emerald' ? '#10b981' : color === 'amber' ? '#f59e0b' : color === 'rose' ? '#f43f5e' : '#6366f1',
            boxShadow: isAlert ? '0 0 12px #f43f5e' : undefined
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Node Overheat Banner */}
      <AnimatePresence>
        {isOverheating && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="p-4 bg-rose-950/80 border-2 border-rose-600/90 rounded-2xl shadow-[0_0_30px_rgba(244,63,94,0.35)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-600/30 text-rose-400 rounded-xl border border-rose-500/50 flex-shrink-0">
                <Flame className="animate-bounce" size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-rose-600 text-white font-bold text-[10px] uppercase tracking-wider rounded">
                    NODE OVERHEAT
                  </span>
                  <h4 className="text-sm font-bold text-rose-200 uppercase tracking-wide">
                    Thermal Safety Threshold Exceeded
                  </h4>
                </div>
                <p className="text-xs text-rose-300/90 mt-1">
                  Node CPU temperature at <strong className="font-mono text-white text-sm">{effectiveTemp.toFixed(1)}°C</strong> exceeds safety limit (<span className="text-rose-200">85.0°C</span>). Fan boost and thermal throttling active.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-auto">
              <span className="text-[11px] font-mono font-bold text-rose-300 bg-rose-900/60 border border-rose-700/60 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <AlertTriangle size={14} className="text-rose-400 animate-pulse" />
                THROTTLING 85°C+
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="CPU Load" value={cpu} icon={Cpu} color="blue" />
        <MetricCard label="VRAM Usage" value={memory} icon={Memory} color="emerald" />
        <MetricCard label="GPU Compute" value={gpu} icon={Zap} color="amber" />
        <MetricCard 
          label="Thermal Profile" 
          value={effectiveTemp} 
          icon={isOverheating ? Flame : Thermometer} 
          color={isOverheating ? 'rose' : 'rose'} 
          unit="°C"
          isAlert={isOverheating}
        />
      </div>

      {/* Quick Test Overheat Toggle Bar */}
      <div className="flex justify-end items-center gap-2 pt-1">
        <button
          onClick={() => setForceOverheat(!forceOverheat)}
          className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
            forceOverheat 
              ? 'bg-rose-600 text-white border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]' 
              : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:text-slate-300 hover:border-slate-700'
          }`}
        >
          <ShieldAlert size={12} />
          {forceOverheat ? 'Test Overheat Active (89°C)' : 'Simulate 85°C+ Thermal Spike'}
        </button>
      </div>
    </div>
  );
}

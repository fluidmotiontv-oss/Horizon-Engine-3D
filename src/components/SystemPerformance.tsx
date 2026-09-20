import { useState, useEffect } from 'react';
import { Cpu, MemoryStick as Memory, Zap, Thermometer, Gauge } from 'lucide-react';
import { motion } from 'motion/react';
import { RenderStatus } from '../types';

export function SystemPerformance() {
  const [status, setStatus] = useState<RenderStatus | null>(null);

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

  const MetricCard = ({ 
    label, 
    value, 
    icon: Icon, 
    color, 
    unit = '%' 
  }: { 
    label: string; 
    value: number; 
    icon: any; 
    color: string; 
    unit?: string 
  }) => (
    <div className="flex flex-col gap-3 p-4 bg-slate-900/40 border border-slate-800 rounded-2xl">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg bg-${color}-600/10 text-${color}-400`}>
          <Icon size={16} />
        </div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="text-2xl font-mono font-bold text-slate-100">
          {value.toFixed(0)}<span className="text-sm text-slate-500 ml-0.5">{unit}</span>
        </span>
        <div className="h-10 w-24 flex items-end gap-1">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(20, Math.random() * 100)}%` }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse', delay: i * 0.05 }}
              className={`w-full rounded-t-sm bg-${color}-500/30`}
            />
          ))}
        </div>
      </div>
      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${value}%` }}
          className={`h-full bg-${color}-500 shadow-[0_0_10px_rgba(var(--${color}-500-rgb),0.5)] transition-all duration-1000`}
          style={{
            backgroundColor: color === 'blue' ? '#3b82f6' : color === 'emerald' ? '#10b981' : color === 'amber' ? '#f59e0b' : color === 'rose' ? '#f43f5e' : '#6366f1'
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard label="CPU Load" value={cpu} icon={Cpu} color="blue" />
      <MetricCard label="VRAM Usage" value={memory} icon={Memory} color="emerald" />
      <MetricCard label="GPU Compute" value={gpu} icon={Zap} color="amber" />
      <MetricCard label="Thermal Profile" value={temp} icon={Thermometer} color="rose" unit="°C" />
    </div>
  );
}

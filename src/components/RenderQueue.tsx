import { useState, useEffect } from 'react';
import { Activity, Server, Clock, CheckCircle, AlertCircle, X, Trash2, List } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RenderStatus } from '../types';

export function RenderQueue() {
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

  const handleCancel = async (id: string) => {
    await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
  };

  const handleClearCompleted = async () => {
    await fetch('/api/jobs/clear-completed', { method: 'POST' });
  };

  if (!status) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Jobs */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex items-center gap-4"
        >
          <div className="p-3 bg-blue-600/20 rounded-xl text-blue-400">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Pipeline</p>
            <p className="text-2xl font-bold text-slate-100">{status.activeJobs}</p>
          </div>
        </motion.div>

        {/* Render Progress */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-4 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <Clock size={12} /> Progress
            </p>
            <span className="text-xs font-mono text-emerald-400">{status.progress.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${status.progress}%` }}
              className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            />
          </div>
        </motion.div>

        {/* Frame Status */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex items-center gap-4"
        >
          <div className="p-3 bg-amber-600/20 rounded-xl text-amber-400">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Frame Cache</p>
            <p className="text-2xl font-bold text-slate-100">{status.currentFrame} / {status.totalFrames}</p>
          </div>
        </motion.div>

        {/* Node Status */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex items-center gap-4"
        >
          <div className={`p-3 rounded-xl ${status.nodeStatus === 'OK' ? 'bg-emerald-600/20 text-emerald-400' : 'bg-rose-600/20 text-rose-400'}`}>
            <Server size={20} />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Node Integrity</p>
            <p className={`text-2xl font-bold ${status.nodeStatus === 'OK' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {status.nodeStatus}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Batch Queue Table */}
      <div className="bg-slate-900/20 backdrop-blur-sm border border-slate-800/50 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <List size={14} /> Sequential Batch Queue
          </h3>
          <button 
            onClick={handleClearCompleted}
            className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-2"
          >
            <Trash2 size={12} /> Clear Completed
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800/50">
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">Script Name</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">Progress</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              <AnimatePresence mode='popLayout'>
                {status.queue.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-600 text-sm italic">
                      Queue is currently empty.
                    </td>
                  </tr>
                ) : (
                  status.queue.map((job) => (
                    <motion.tr 
                      key={job.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-slate-300">{job.scriptName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {job.status === 'rendering' ? (
                            <span className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                              <Activity size={12} className="animate-pulse" /> Rendering
                            </span>
                          ) : job.status === 'completed' ? (
                            <span className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                              <CheckCircle size={12} /> Completed
                            </span>
                          ) : (
                            <span className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                              <Clock size={12} /> Pending
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-1 w-24 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div 
                              animate={{ width: `${job.progress}%` }}
                              className={`h-full ${job.status === 'rendering' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-emerald-500'}`}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">{job.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleCancel(job.id)}
                          className="p-2 text-slate-600 hover:text-rose-400 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

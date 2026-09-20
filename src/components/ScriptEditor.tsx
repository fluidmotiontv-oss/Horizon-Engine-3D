import { useState, useEffect } from 'react';
import { Play, Save, Cpu, Sparkles, Terminal, ChevronDown, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BlenderScript } from '../types';
import { RENDER_PRESETS } from '../presets';

export function ScriptEditor() {
  const [scripts, setScripts] = useState<BlenderScript[]>([]);
  const [activeScript, setActiveScript] = useState<BlenderScript | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  useEffect(() => {
    fetchScripts();
  }, []);

  const fetchScripts = async () => {
    try {
      const res = await fetch('/api/scripts');
      const data = await res.json();
      setScripts(data);
      if (data.length > 0 && !activeScript) setActiveScript(data[0]);
    } catch (err) {
      console.error('Failed to fetch scripts');
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.script) {
        setActiveScript({ name: 'generated_script.py', content: data.script });
      }
    } catch (err) {
      console.error('Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!activeScript) return;
    setIsSaving(true);
    try {
      await fetch('/api/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activeScript),
      });
      fetchScripts();
    } catch (err) {
      console.error('Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const injectPreset = (code: string) => {
    if (!activeScript) return;
    setActiveScript({
      ...activeScript,
      content: activeScript.content + '\n' + code
    });
    setShowPresets(false);
  };

  const handleExecute = async () => {
    if (!activeScript) return;
    try {
      await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptName: activeScript.name }),
      });
    } catch (err) {
      console.error('Failed to queue job');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[700px]">
      {/* Sidebar - Script List */}
      <div className="lg:col-span-1 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 overflow-y-auto">
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
          <Terminal size={14} /> Script Hub
        </h3>
        <div className="space-y-2">
          {scripts.map((s) => (
            <button
              key={s.name}
              onClick={() => setActiveScript(s)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activeScript?.name === s.name 
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' 
                  : 'text-slate-400 hover:bg-slate-800 border border-transparent'
              }`}
            >
              {s.name}
            </button>
          ))}
          <button 
            onClick={() => setActiveScript({ name: 'new_script.py', content: '' })}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            + Create New
          </button>
        </div>
      </div>

      {/* Main Editor */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        {/* Gemini Prompt Bar */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-3 flex gap-3">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe a Blender scene to generate a script..."
            className="flex-1 bg-transparent border-none outline-none text-slate-200 text-sm px-2"
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            {isGenerating ? 'Synthesizing...' : 'Generate'}
          </button>
        </div>

        {/* Editor Area */}
        <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <span className="font-mono">{activeScript?.name || 'untitled.py'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowPresets(!showPresets)}
                  className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-xs font-bold transition-colors px-2 py-1 rounded hover:bg-slate-800"
                >
                  <Layers size={14} /> Presets <ChevronDown size={12} className={showPresets ? 'rotate-180' : ''} />
                </button>
                
                <AnimatePresence>
                  {showPresets && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                      {RENDER_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => injectPreset(preset.code)}
                          className="w-full text-left px-4 py-2 text-xs text-slate-400 hover:bg-blue-600 hover:text-white transition-colors border-b border-slate-800 last:border-none"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving || !activeScript}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-xs font-bold transition-colors"
              >
                <Save size={14} /> Save
              </button>
              <button 
                onClick={handleExecute}
                disabled={!activeScript}
                className="flex items-center gap-2 bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 hover:bg-emerald-600/30 px-3 py-1 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
              >
                <Play size={14} /> Execute Render
              </button>
            </div>
          </div>
          <textarea
            value={activeScript?.content || ''}
            onChange={(e) => setActiveScript(prev => prev ? { ...prev, content: e.target.value } : null)}
            className="flex-1 p-6 font-mono text-sm bg-transparent text-emerald-500/90 outline-none resize-none"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}

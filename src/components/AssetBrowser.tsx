import { useState, useEffect } from 'react';
import { Image as ImageIcon, Film, Download, ExternalLink, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RenderAsset } from '../types';

export function AssetBrowser() {
  const [assets, setAssets] = useState<RenderAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/renders');
      const data = await res.json();
      setAssets(data);
    } catch (err) {
      console.error('Failed to fetch assets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <ImageIcon size={14} /> Local Asset Vault
        </h3>
        <button 
          onClick={fetchAssets}
          className="text-slate-500 hover:text-slate-300 transition-colors"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {assets.length === 0 ? (
        <div className="bg-slate-900/30 border border-slate-800 border-dashed rounded-2xl p-12 text-center">
          <Film size={48} className="mx-auto text-slate-700 mb-4" />
          <p className="text-slate-500 text-sm">No renders detected in local storage.</p>
          <p className="text-slate-600 text-xs mt-1">Execute a script to generate assets.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <AnimatePresence mode='popLayout'>
            {assets.map((asset) => (
              <motion.div
                key={asset.name}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative aspect-square bg-slate-900 rounded-xl border border-slate-800 overflow-hidden"
              >
                {asset.name.match(/\.(mp4|webm)$/i) ? (
                  <video 
                    src={asset.url} 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                    muted
                    loop
                    onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                    onMouseLeave={(e) => (e.target as HTMLVideoElement).pause()}
                  />
                ) : (
                  <img 
                    src={asset.url} 
                    alt={asset.name}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                  />
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <p className="text-[10px] font-mono text-slate-300 truncate mb-2">{asset.name}</p>
                  <div className="flex gap-2">
                    <a 
                      href={asset.url} 
                      download 
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                    >
                      <Download size={12} />
                    </a>
                    <a 
                      href={asset.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

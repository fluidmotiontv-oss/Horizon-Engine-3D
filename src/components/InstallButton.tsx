import React, { useState } from 'react';
import { Download, Monitor, Shield, Box } from 'lucide-react';
import { usePWAInstall } from '../usePWAInstall';
import { motion, AnimatePresence } from 'motion/react';

export const InstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  const handleSovereignSetup = () => {
    setIsInstalling(true);
    // Mock sovereign setup download
    const scriptContent = `#!/bin/bash
echo "Initiating Dragon 9 Sovereign Node Setup..."
echo "Configuring antiX Linux desktop nodes..."
echo "Establishing Cloudflare Tunnel pipelines..."
echo "Deploying Horizon Engine PWA wrapper..."
echo "Done. Sovereign 3D Ecosystem established."
`;
    const blob = new Blob([scriptContent], { type: 'text/x-shellscript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dragon9_sovereign_setup.sh';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      setIsInstalling(false);
    }, 2000);
  };

  // If already running as an installed PWA, show a status indicator instead of install button
  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <Monitor size={14} className="text-blue-400" />
        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Local Runtime Active</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* PWA Install for Chromium / Android */}
      {isInstallable && (
        <button
          onClick={install}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]"
        >
          <Monitor size={14} />
          Install to PC
        </button>
      )}

      {/* Sovereign Setup Fallback */}
      <button
        onClick={handleSovereignSetup}
        disabled={isInstalling}
        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-1.5 rounded-xl text-xs font-bold transition-all border border-slate-700"
      >
        {isInstalling ? (
          <div className="w-3 h-3 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
        ) : (
          <Shield size={14} className="text-blue-400" />
        )}
        {isInstalling ? 'Configuring Node...' : 'Sovereign Setup'}
      </button>

      {/* iOS Safari Guide */}
      {isIOS && (
        <>
          <button
            onClick={() => setShowIOSGuide(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-1.5 rounded-xl text-xs font-bold transition-all border border-slate-700"
          >
            <Download size={14} />
            Install on iOS
          </button>

          <AnimatePresence>
            {showIOSGuide && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl"
                >
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Box className="text-blue-500" /> Install on iPhone
                  </h3>
                  <div className="mt-4 space-y-4 text-sm text-slate-400">
                    <p className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white">1</span>
                      <span>Tap the <strong>Share</strong> button in the Safari toolbar.</span>
                    </p>
                    <p className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white">2</span>
                      <span>Scroll down and tap <strong>Add to Home Screen</strong>.</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setShowIOSGuide(false)}
                    className="mt-8 w-full rounded-xl bg-blue-600 py-2 text-sm font-bold text-white hover:bg-blue-500 transition-colors"
                  >
                    Got it
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

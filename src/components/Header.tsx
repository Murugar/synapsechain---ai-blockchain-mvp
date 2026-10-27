import React from 'react';
import { Layers, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  activeTab: 'explorer' | 'studio' | 'validators' | 'mempool' | 'audit';
  setActiveTab: (tab: 'explorer' | 'studio' | 'validators' | 'mempool' | 'audit') => void;
  onOpenFaucet: () => void;
  isTampered: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenFaucet,
  isTampered,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single line, no subtitle chips) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Layers className="w-4 h-4" />
          </div>
          <button
            onClick={() => setActiveTab('explorer')}
            className="text-left font-bold text-lg tracking-tight text-white hover:text-emerald-400 transition-colors whitespace-nowrap"
          >
            SynapseChain
          </button>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            · AI Layer-1 MVP
          </span>
          {isTampered && (
            <span className="text-xs font-mono text-red-400 bg-red-950/60 border border-red-800/80 px-2 py-0.5 rounded">
              Chain Integrity Alert
            </span>
          )}
        </div>

        {/* Zone 2: 4-5 Navigation links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => setActiveTab('explorer')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'explorer'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Block Explorer
          </button>
          <button
            onClick={() => setActiveTab('studio')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'studio'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            AI Smart Contract Studio
          </button>
          <button
            onClick={() => setActiveTab('validators')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'validators'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            AI Validator Consensus
          </button>
          <button
            onClick={() => setActiveTab('mempool')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'mempool'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Mempool & Sentinel
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'audit'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Ledger Audit & Proofs
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenFaucet}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-colors whitespace-nowrap shrink-0 shadow-sm shadow-emerald-950"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Testnet Faucet</span>
          </button>
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="md:hidden border-t border-slate-800/80 px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('explorer')}
          className={`px-2.5 py-1 text-xs whitespace-nowrap rounded ${
            activeTab === 'explorer' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
          }`}
        >
          Explorer
        </button>
        <button
          onClick={() => setActiveTab('studio')}
          className={`px-2.5 py-1 text-xs whitespace-nowrap rounded ${
            activeTab === 'studio' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
          }`}
        >
          AI Studio
        </button>
        <button
          onClick={() => setActiveTab('validators')}
          className={`px-2.5 py-1 text-xs whitespace-nowrap rounded ${
            activeTab === 'validators' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
          }`}
        >
          Validators
        </button>
        <button
          onClick={() => setActiveTab('mempool')}
          className={`px-2.5 py-1 text-xs whitespace-nowrap rounded ${
            activeTab === 'mempool' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
          }`}
        >
          Mempool
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-2.5 py-1 text-xs whitespace-nowrap rounded ${
            activeTab === 'audit' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
          }`}
        >
          Ledger Audit
        </button>
      </div>
    </header>
  );
};

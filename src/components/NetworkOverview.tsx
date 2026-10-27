import React from 'react';
import { Pickaxe, ShieldCheck, RefreshCw, Zap, Server, Activity, AlertTriangle } from 'lucide-react';
import { NetworkStats } from '../types.ts';

interface NetworkOverviewProps {
  stats: NetworkStats | null;
  onMineBlock: () => void;
  isMining: boolean;
  onVerifyChain: () => void;
  isVerifying: boolean;
  isTampered: boolean;
  onResetChain: () => void;
  autoMining: boolean;
  setAutoMining: (val: boolean) => void;
}

export const NetworkOverview: React.FC<NetworkOverviewProps> = ({
  stats,
  onMineBlock,
  isMining,
  onVerifyChain,
  isVerifying,
  isTampered,
  onResetChain,
  autoMining,
  setAutoMining,
}) => {
  return (
    <div className="space-y-4">
      {/* Visual Hero & Architecture Card */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span>Proof-of-Intelligence Consensus</span>
              <span aria-hidden="true">·</span>
              <span>Gemini 3.8 Flash Prover</span>
              <span aria-hidden="true">·</span>
              <span>SHA-256 State Tree</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white text-balance">
              Autonomous AI Layer-1 Blockchain Architecture
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              SynapseChain introduces Proof of Intelligence (PoI), uniting cryptographic Merkle proof verification
              with autonomous AI validator nodes. Deploy natural-language smart contracts, run real-time MEV mempool audits,
              and execute zero-compromise state machine transitions.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={onMineBlock}
                disabled={isMining}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded transition-colors shadow-sm"
              >
                <Pickaxe className={`w-3.5 h-3.5 ${isMining ? 'animate-spin' : ''}`} />
                <span>{isMining ? 'Forging Block...' : 'Mine Next Block'}</span>
              </button>

              <button
                onClick={onVerifyChain}
                disabled={isVerifying}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded transition-colors border ${
                  isTampered
                    ? 'bg-red-950/70 border-red-700 text-red-300 hover:bg-red-900/70'
                    : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700'
                }`}
              >
                {isTampered ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>{isVerifying ? 'Verifying Tree...' : isTampered ? 'Tamper Detected! Audit Chain' : 'Verify Ledger Integrity'}</span>
              </button>

              <label className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800/50 border border-slate-700/60 rounded cursor-pointer hover:bg-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={autoMining}
                  onChange={(e) => setAutoMining(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 w-3.5 h-3.5 bg-slate-900"
                />
                <span>Auto-Mine (15s Slot)</span>
              </label>

              <button
                onClick={onResetChain}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded border border-transparent hover:border-slate-800 transition-colors ml-auto"
                title="Reset blockchain to genesis"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Genesis</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-lg overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
              <img
                src="/src/assets/images/ai_blockchain_node_visual_1793082211539.jpg"
                alt="SynapseChain AI Validator Node Cluster"
                className="w-full h-48 sm:h-56 object-cover object-center"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback container in case image load fails
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-slate-300">
                <span className="flex items-center gap-1">
                  <Server className="w-3 h-3 text-emerald-400" />
                  <span>Validator Cluster Topology</span>
                </span>
                <span className="text-emerald-400">BFT Quorum 5/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* High-Density Telemetry Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
          <div className="text-[11px] font-medium text-slate-400">Block Height</div>
          <div className="text-xl font-bold font-mono text-white tabular-nums mt-1">
            #{stats ? stats.latestBlockHeight : '0'}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Total Blocks: {stats ? stats.chainLength : 0}
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
          <div className="text-[11px] font-medium text-slate-400">Transactions</div>
          <div className="text-xl font-bold font-mono text-white tabular-nums mt-1">
            {stats ? stats.totalTransactions : 0}
          </div>
          <div className="text-[10px] text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
            <Activity className="w-2.5 h-2.5" />
            <span>{stats ? stats.networkTPS : '22.4'} TPS</span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
          <div className="text-[11px] font-medium text-slate-400">Mempool Queue</div>
          <div className="text-xl font-bold font-mono text-white tabular-nums mt-1">
            {stats ? stats.mempoolPendingCount : 0}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Pending verification
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
          <div className="text-[11px] font-medium text-slate-400">Active AI Validators</div>
          <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums mt-1">
            {stats ? stats.activeValidatorsCount : 5} / 5
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            BFT Consensus Active
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
          <div className="text-[11px] font-medium text-slate-400">Base Gas Price</div>
          <div className="text-xl font-bold font-mono text-white tabular-nums mt-1 flex items-baseline gap-1">
            <span>{stats ? stats.gasPriceGwei : 18}</span>
            <span className="text-xs font-normal text-slate-400">Gwei</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
            <Zap className="w-2.5 h-2.5 text-amber-400" />
            <span>AI Dynamic Fee</span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
          <div className="text-[11px] font-medium text-slate-400">Ledger Invariant</div>
          <div
            className={`text-sm font-semibold font-mono mt-1.5 flex items-center gap-1.5 ${
              isTampered ? 'text-red-400' : 'text-emerald-400'
            }`}
          >
            {isTampered ? (
              <>
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="truncate">Broken Link</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span className="truncate">Cryptographically Sound</span>
              </>
            )}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
            {isTampered ? 'State discrepancy detected' : 'Merkle root certified'}
          </div>
        </div>
      </div>
    </div>
  );
};

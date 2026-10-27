import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, RefreshCw, GitCommit, CheckCircle2, XCircle, ArrowDown, Droplets, Wallet, Layers } from 'lucide-react';
import { Block, Account } from '../types.ts';

interface LedgerAuditTabProps {
  chain: Block[];
  accounts: Account[];
  onVerifyChain: () => void;
  isVerifying: boolean;
  isTampered: boolean;
  tamperMessage: string | null;
  onSimulateTamper: (blockIndex: number) => void;
  onResetChain: () => void;
  onFaucetClaim: (address: string) => void;
}

export const LedgerAuditTab: React.FC<LedgerAuditTabProps> = ({
  chain,
  accounts,
  onVerifyChain,
  isVerifying,
  isTampered,
  tamperMessage,
  onSimulateTamper,
  onResetChain,
  onFaucetClaim,
}) => {
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number>(
    chain.length > 1 ? 1 : 0
  );
  const [targetTamperBlock, setTargetTamperBlock] = useState<number>(1);
  const [faucetLoadingAddress, setFaucetLoadingAddress] = useState<string | null>(null);

  const selectedBlock = chain[selectedBlockIndex] || chain[0];

  const handleClaim = async (addr: string) => {
    setFaucetLoadingAddress(addr);
    try {
      await onFaucetClaim(addr);
    } finally {
      setFaucetLoadingAddress(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Audit Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Cryptographic State Verification</span>
            <span aria-hidden="true">·</span>
            <span>SHA-256 Merkle Ledger</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Ledger Integrity & Merkle Proof Visualizer</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Test blockchain immutability in real time: audit cryptographic hash trees, simulate ledger tampering, and verify state roots.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onVerifyChain}
            disabled={isVerifying}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded transition-colors shadow-sm"
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'Auditing SHA-256 Hashes...' : 'Run Full Chain Audit'}</span>
          </button>
        </div>
      </div>

      {/* Chain Status Callout */}
      {isTampered ? (
        <div className="p-4 rounded-xl border border-red-500/60 bg-red-950/30 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>CRYPTOGRAPHIC DISCREPANCY DETECTED!</span>
            </div>
            <span className="text-xs font-mono text-red-300 bg-red-950 px-2 py-0.5 rounded border border-red-800">
              Chain Compromised
            </span>
          </div>
          <p className="text-xs text-red-200">
            {tamperMessage || 'Block transactions have been mutated without valid cryptographic consensus. Merkle Root validation failed.'}
          </p>
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={onResetChain}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-600 rounded transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restore Pristine Consensus Ledger</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-lg border border-emerald-500/40 bg-emerald-950/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-semibold text-slate-100">All {chain.length} Blocks Verified:</span>
            <span className="text-slate-300 font-mono">Merkle Trees & Hash links 100% Valid</span>
          </div>
          <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">
            Latest Hash: {chain[chain.length - 1]?.hash.slice(0, 16)}...
          </span>
        </div>
      )}

      {/* Split Section: Merkle Tree & Immutability Test */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Merkle Tree Visualizer */}
        <div className="lg:col-span-7 rounded-lg border border-slate-800 bg-slate-900/50 p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <GitCommit className="w-4 h-4 text-emerald-400" />
                <span>SHA-256 Merkle Tree Structure</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Hierarchical pairwise hashing ensuring zero transaction tampering
              </p>
            </div>

            {/* Block Selector */}
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="text-slate-400">Block:</span>
              <select
                value={selectedBlockIndex}
                onChange={(e) => setSelectedBlockIndex(Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs font-mono focus:outline-none focus:border-emerald-500"
              >
                {chain.map((b) => (
                  <option key={b.index} value={b.index}>
                    #{b.index} ({b.transactions.length} txs)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Visual Merkle Tree Graph */}
          {selectedBlock && (
            <div className="space-y-4 py-2">
              {/* Level 0: Merkle Root */}
              <div className="flex flex-col items-center">
                <div className="w-full max-w-md p-3 rounded bg-emerald-950/60 border border-emerald-500/60 text-center space-y-1 font-mono text-xs">
                  <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                    Block #{selectedBlock.index} Merkle Root
                  </div>
                  <div className="text-white text-[11px] break-all">
                    {selectedBlock.merkleRoot}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Calculated from {selectedBlock.transactions.length} leaf hashes
                  </div>
                </div>

                <ArrowDown className="w-4 h-4 text-emerald-500 my-1 animate-pulse" />
              </div>

              {/* Leaf Nodes (Transactions) */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span>Leaf Nodes (Transaction Hashes):</span>
                  <span>{selectedBlock.transactions.length} Verified Leaves</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedBlock.transactions.map((tx, idx) => (
                    <div
                      key={tx.id}
                      className="p-2.5 rounded bg-slate-950 border border-slate-800 font-mono text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>LEAF {idx + 1}</span>
                        <span className="text-emerald-400 font-bold">{tx.amount} AIX</span>
                      </div>
                      <div className="text-slate-200 text-[11px] truncate">
                        Hash: {tx.id.slice(0, 16)}...
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {tx.from.slice(0, 6)}... &rarr; {tx.to.slice(0, 6)}...
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Immutability Tamper Simulator */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">
                Immutability & Tamper Resistance Lab
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Blockchains are immutable because changing even 1 byte in a past transaction invalidates its Merkle Root and cascades down the entire hash chain.
            </p>

            <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-3 text-xs">
              <label className="block text-[11px] text-slate-400">Select Block to Maliciously Mutate:</label>
              <select
                value={targetTamperBlock}
                onChange={(e) => setTargetTamperBlock(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-red-500"
              >
                {chain.map((b) => (
                  <option key={b.index} value={b.index}>
                    Block #{b.index} ({b.transactions.length} txs)
                  </option>
                ))}
              </select>

              <button
                onClick={() => onSimulateTamper(targetTamperBlock)}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-600 rounded transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Simulate Silent Ledger Tamper</span>
              </button>
            </div>
          </div>

          {/* Testnet Faucet & Account Balances */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Wallet Balances & Faucet</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">100 AIX / drop</span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {accounts.map((acc) => (
                <div
                  key={acc.address}
                  className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800 text-xs font-mono"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-200 truncate">{acc.label}</div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {acc.address.slice(0, 10)}...{acc.address.slice(-6)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-emerald-400 tabular-nums">
                      {acc.balance.toLocaleString()} AIX
                    </span>
                    {!acc.isContract && (
                      <button
                        onClick={() => handleClaim(acc.address)}
                        disabled={faucetLoadingAddress === acc.address}
                        className="px-2 py-1 text-[10px] text-white bg-slate-800 hover:bg-emerald-600 rounded border border-slate-700 transition-colors"
                        title="Claim 100 testnet AIX"
                      >
                        <Droplets className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

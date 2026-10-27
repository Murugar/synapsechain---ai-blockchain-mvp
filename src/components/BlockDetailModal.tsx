import React from 'react';
import { X, Hash, Clock, Cpu, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { Block, Transaction } from '../types.ts';

interface BlockDetailModalProps {
  block: Block | null;
  onClose: () => void;
  onSelectTransaction: (tx: Transaction) => void;
}

export const BlockDetailModal: React.FC<BlockDetailModalProps> = ({
  block,
  onClose,
  onSelectTransaction,
}) => {
  if (!block) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-sm">
              #{block.index}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Block #{block.index} Cryptographic Inspector</h2>
              <div className="text-xs text-slate-400 font-mono">
                {new Date(block.timestamp).toLocaleString()}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cryptographic Headers */}
        <div className="space-y-2 text-xs font-mono">
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-slate-400 text-[10px]">BLOCK HASH (SHA-256)</div>
            <div className="text-emerald-400 break-all select-all font-semibold">{block.hash}</div>
          </div>

          <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-slate-400 text-[10px]">PREVIOUS BLOCK HASH</div>
            <div className="text-slate-300 break-all select-all">{block.previousHash}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-slate-400 text-[10px]">MERKLE ROOT</div>
              <div className="text-slate-300 break-all text-[11px]">{block.merkleRoot}</div>
            </div>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-slate-400 text-[10px]">STATE ROOT</div>
              <div className="text-slate-300 break-all text-[11px]">{block.stateRoot}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <div className="text-slate-400 text-[10px]">NONCE</div>
              <div className="text-slate-200 font-bold tabular-nums">{block.nonce}</div>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <div className="text-slate-400 text-[10px]">DIFFICULTY</div>
              <div className="text-slate-200 font-bold tabular-nums">{block.difficulty}</div>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <div className="text-slate-400 text-[10px]">TRANSACTIONS</div>
              <div className="text-slate-200 font-bold tabular-nums">{block.transactions.length}</div>
            </div>
          </div>
        </div>

        {/* AI Proof of Intelligence Attestation */}
        <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-500/40 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>AI Consensus Proof (Slot #{block.index})</span>
            </div>
            <span className="font-mono text-emerald-400 font-bold">
              {(block.aiAttestation.confidence * 100).toFixed(2)}% Confidence
            </span>
          </div>

          <p className="text-slate-300 italic bg-slate-950/50 p-2.5 rounded border border-slate-800/80">
            "{block.aiAttestation.consensusProof}"
          </p>

          <div className="space-y-1">
            <div className="text-[11px] text-slate-400 font-mono">Attested Invariants:</div>
            {block.aiAttestation.verifiedInvariants.map((inv, i) => (
              <div key={i} className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{inv}</span>
              </div>
            ))}
          </div>

          <div className="pt-1 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>Validator: {block.validator.name} ({block.validator.model})</span>
            <span>Sig: {block.validator.signature.slice(0, 16)}...</span>
          </div>
        </div>

        {/* Included Transactions List */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-300 font-mono">
            Included Transactions ({block.transactions.length})
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {block.transactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => {
                  onClose();
                  onSelectTransaction(tx);
                }}
                className="p-2.5 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Hash className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-300 truncate">{tx.id.slice(0, 16)}...</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                    {tx.type}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-slate-400 hidden sm:inline">
                    {tx.from.slice(0, 6)}... &rarr; {tx.to.slice(0, 6)}...
                  </span>
                  <span className="font-bold text-emerald-400 tabular-nums">{tx.amount} AIX</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Close action */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

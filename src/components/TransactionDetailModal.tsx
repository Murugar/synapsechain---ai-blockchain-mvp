import React from 'react';
import { X, Hash, ArrowRight, ShieldCheck, CheckCircle2, FileCode } from 'lucide-react';
import { Transaction } from '../types.ts';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
}) => {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-4 text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Hash className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Transaction Details</h2>
              <div className="text-xs text-slate-400 font-mono">
                Status: {transaction.status.toUpperCase()}
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

        {/* Transaction Hash */}
        <div className="p-2.5 rounded bg-slate-950 border border-slate-800 font-mono text-xs space-y-1">
          <div className="text-[10px] text-slate-400">TRANSACTION HASH (TXID)</div>
          <div className="text-emerald-400 break-all select-all font-semibold">
            {transaction.id}
          </div>
        </div>

        {/* Transfer Pathway */}
        <div className="p-3 rounded bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-[10px] text-slate-400">FROM</div>
              <div className="text-slate-200 break-all">{transaction.from}</div>
            </div>
          </div>

          <div className="flex items-center justify-center my-1">
            <ArrowRight className="w-4 h-4 text-emerald-500" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-[10px] text-slate-400">TO</div>
              <div className="text-slate-200 break-all">{transaction.to}</div>
            </div>
          </div>
        </div>

        {/* Amounts & Metrics */}
        <div className="grid grid-cols-3 gap-2 font-mono text-xs">
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
            <div className="text-[10px] text-slate-400">AMOUNT</div>
            <div className="text-emerald-400 font-bold tabular-nums text-sm mt-0.5">
              {transaction.amount} AIX
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
            <div className="text-[10px] text-slate-400">GAS FEE</div>
            <div className="text-slate-200 font-bold tabular-nums text-sm mt-0.5">
              {transaction.fee} AIX
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
            <div className="text-[10px] text-slate-400">TYPE</div>
            <div className="text-slate-200 font-semibold text-xs mt-1">
              {transaction.type}
            </div>
          </div>
        </div>

        {/* AI Security Risk Analysis */}
        {transaction.aiRisk && (
          <div className="p-3 rounded bg-slate-950 border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center justify-between font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>AI Sentinel Pre-Verification</span>
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                  transaction.aiRisk.score === 'low'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}
              >
                RISK: {transaction.aiRisk.score.toUpperCase()}
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {transaction.aiRisk.summary}
            </p>
          </div>
        )}

        {/* Payload / Contract Data if present */}
        {transaction.data && (
          <div className="p-3 rounded bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <FileCode className="w-3 h-3 text-emerald-400" />
              <span>CONTRACT EXECUTION PAYLOAD:</span>
            </div>
            <pre className="text-slate-300 text-[11px] overflow-x-auto p-2 bg-slate-900 rounded max-h-36">
              {JSON.stringify(transaction.data, null, 2)}
            </pre>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

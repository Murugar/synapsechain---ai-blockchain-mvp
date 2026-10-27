import React, { useState } from 'react';
import { Send, Sparkles, ShieldAlert, ShieldCheck, ArrowRight, Pickaxe, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { Account, Transaction, MempoolAnalysis } from '../types.ts';

interface MempoolTabProps {
  mempool: Transaction[];
  accounts: Account[];
  onTransactionCreated: (tx: Transaction) => void;
  onMineBlock: () => void;
  isMining: boolean;
}

export const MempoolTab: React.FC<MempoolTabProps> = ({
  mempool,
  accounts,
  onTransactionCreated,
  onMineBlock,
  isMining,
}) => {
  // Natural language intent
  const [naturalPrompt, setNaturalPrompt] = useState(
    'Send 60 AIX from Vitalik to Bob Autonomous Agent with priority gas'
  );
  const [isParsingIntent, setIsParsingIntent] = useState(false);

  // Manual Tx Form
  const userAccounts = accounts.filter((a) => !a.isContract);
  const [fromAddress, setFromAddress] = useState(
    userAccounts[1]?.address || '0xVitalik71cA642142277dFa06A2664E742E9439b93'.toLowerCase()
  );
  const [toAddress, setToAddress] = useState(
    userAccounts[3]?.address || '0xAlice42880c98fE4076e71cA642142277dFa06A266'.toLowerCase()
  );
  const [amount, setAmount] = useState<number>(50);
  const [fee, setFee] = useState<number>(0.02);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txSuccessMessage, setTxSuccessMessage] = useState<string | null>(null);

  // AI Mempool Sentinel State
  const [isGuarding, setIsGuarding] = useState(false);
  const [guardAnalysis, setGuardAnalysis] = useState<MempoolAnalysis | null>(null);

  // Parse natural language intent
  const handleParseIntent = async () => {
    if (!naturalPrompt.trim()) return;
    setIsParsingIntent(true);
    setTxSuccessMessage(null);

    try {
      const res = await fetch('/api/blockchain/ai/parse-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: naturalPrompt }),
      });
      const data = await res.json();
      if (data.success && data.intent) {
        if (data.intent.from) setFromAddress(data.intent.from.toLowerCase());
        if (data.intent.to) setToAddress(data.intent.to.toLowerCase());
        if (data.intent.amount) setAmount(Number(data.intent.amount));
        if (data.intent.fee) setFee(Number(data.intent.fee));
        setTxSuccessMessage(`AI parsed intent: ${data.intent.explanation}`);
      }
    } catch (err: any) {
      console.error('Failed to parse intent:', err);
    } finally {
      setIsParsingIntent(false);
    }
  };

  // Submit Transaction
  const handleSubmitTx = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTxSuccessMessage(null);

    try {
      const res = await fetch('/api/blockchain/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: fromAddress,
          to: toAddress,
          amount: Number(amount),
          fee: Number(fee),
          type: 'transfer',
        }),
      });
      const data = await res.json();
      if (data.success) {
        onTransactionCreated(data.transaction);
        setTxSuccessMessage(`Transaction ${data.transaction.id.slice(0, 16)}... staged into mempool!`);
      } else {
        alert(`Transaction failed: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Error submitting transaction: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Run AI Mempool Guard
  const handleRunMempoolGuard = async () => {
    setIsGuarding(true);
    try {
      const res = await fetch('/api/blockchain/ai/mempool-guard', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setGuardAnalysis(data.analysis);
      }
    } catch (err: any) {
      console.error('Failed to run guard:', err);
    } finally {
      setIsGuarding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mempool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <Layers className="w-3.5 h-3.5" />
            <span>Mempool Transaction Pool</span>
            <span aria-hidden="true">·</span>
            <span>AI MEV Anomaly Guard</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Pending Transactions & AI Sentinel</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Stage transactions with natural language, inspect the queue for front-running/sandwich vectors, and forge blocks.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRunMempoolGuard}
            disabled={isGuarding || mempool.length === 0}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800/80 disabled:opacity-50 rounded transition-colors"
          >
            <ShieldAlert className={`w-3.5 h-3.5 ${isGuarding ? 'animate-spin' : ''}`} />
            <span>{isGuarding ? 'Analyzing MEV...' : 'Scan Mempool with AI'}</span>
          </button>

          <button
            onClick={onMineBlock}
            disabled={isMining || mempool.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded transition-colors shadow-sm"
          >
            <Pickaxe className={`w-3.5 h-3.5 ${isMining ? 'animate-spin' : ''}`} />
            <span>{isMining ? 'Forging Block...' : `Mine ${mempool.length} Pending`}</span>
          </button>
        </div>
      </div>

      {/* Natural Language Transaction Parser */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="font-semibold text-white">Natural Language Transaction Composer</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={naturalPrompt}
            onChange={(e) => setNaturalPrompt(e.target.value)}
            placeholder="e.g. Send 80 AIX from Vitalik to Alice with high fee"
            className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="button"
            onClick={handleParseIntent}
            disabled={isParsingIntent}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 rounded transition-colors shrink-0 flex items-center justify-center gap-1.5"
          >
            <Sparkles className={`w-3 h-3 ${isParsingIntent ? 'animate-spin' : ''}`} />
            <span>{isParsingIntent ? 'Parsing...' : 'AI Parse & Stage'}</span>
          </button>
        </div>

        {txSuccessMessage && (
          <div className="text-xs font-mono text-emerald-400 bg-emerald-950/40 p-2 rounded border border-emerald-800/80">
            {txSuccessMessage}
          </div>
        )}
      </div>

      {/* Grid: Manual Tx Composer & Mempool Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Transaction Form */}
        <div className="lg:col-span-5 rounded-lg border border-slate-800 bg-slate-900/50 p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-400" />
              <span>Broadcast Transaction</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Layer-1 Transfer</span>
          </div>

          <form onSubmit={handleSubmitTx} className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">From (Sender Account)</label>
              <select
                value={fromAddress}
                onChange={(e) => setFromAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
              >
                {userAccounts.map((acc) => (
                  <option key={acc.address} value={acc.address}>
                    {acc.label} ({acc.balance.toLocaleString()} AIX)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">To (Recipient Account)</label>
              <select
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
              >
                {accounts.map((acc) => (
                  <option key={acc.address} value={acc.address}>
                    {acc.label} ({acc.address.slice(0, 10)}...)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Amount (AIX)</label>
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Fee (AIX)</label>
                <input
                  type="number"
                  step="any"
                  value={fee}
                  onChange={(e) => setFee(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Signing & Staging...' : 'Sign & Submit to Mempool'}</span>
            </button>
          </form>
        </div>

        {/* Right: Mempool Queue & Sentinel Analysis */}
        <div className="lg:col-span-7 space-y-4">
          {/* AI Sentinel Analysis Box (if run) */}
          {guardAnalysis && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-950/20 p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-white">AI Mempool MEV Audit</span>
                </div>
                <span className="font-mono text-amber-300 font-bold">
                  Status: {guardAnalysis.status} ({guardAnalysis.riskLevel} Risk)
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded border border-slate-800">
                {guardAnalysis.recommendedAction}
              </p>
            </div>
          )}

          {/* Pending Queue */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                Pending Transactions Queue ({mempool.length})
              </h3>
              <span className="text-xs font-mono text-slate-400">
                Total Fees: {mempool.reduce((acc, t) => acc + t.fee, 0).toFixed(3)} AIX
              </span>
            </div>

            {mempool.length > 0 ? (
              <div className="space-y-2">
                {mempool.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 rounded bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300 font-semibold truncate">
                          {tx.id.slice(0, 16)}...
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {tx.type}
                        </span>
                      </div>
                      <span className="font-bold text-emerald-400 tabular-nums">
                        {tx.amount} AIX
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>From: {tx.from.slice(0, 8)}...</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span>To: {tx.to.slice(0, 8)}...</span>
                      <span>Fee: {tx.fee} AIX</span>
                    </div>

                    {tx.aiRisk && (
                      <div className="text-[10px] text-slate-400 bg-slate-900/60 p-1.5 rounded flex items-center justify-between">
                        <span>AI Pre-Check: {tx.aiRisk.summary}</span>
                        <span
                          className={`font-semibold ${
                            tx.aiRisk.score === 'low' ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          Risk: {tx.aiRisk.score.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs rounded border border-dashed border-slate-800">
                <p>Mempool is currently empty.</p>
                <p className="text-[11px] text-slate-400 mt-1">Submit a transaction above to queue it for the next block.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

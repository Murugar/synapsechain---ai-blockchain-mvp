import React, { useState } from 'react';
import { Search, ChevronRight, Hash, Clock, Cpu, FileCode, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Block, Transaction } from '../types.ts';

interface ExplorerTabProps {
  chain: Block[];
  onSelectBlock: (block: Block) => void;
  onSelectTransaction: (tx: Transaction) => void;
}

export const ExplorerTab: React.FC<ExplorerTabProps> = ({
  chain,
  onSelectBlock,
  onSelectTransaction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'contract' | 'transfer'>('all');

  const reversedChain = [...chain].reverse();

  // Search filter
  const filteredBlocks = reversedChain.filter((block) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    if (block.index.toString() === q) return true;
    if (block.hash.toLowerCase().includes(q)) return true;
    if (block.validator.name.toLowerCase().includes(q)) return true;
    return block.transactions.some(
      (tx) =>
        tx.id.toLowerCase().includes(q) ||
        tx.from.toLowerCase().includes(q) ||
        tx.to.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Search Bar & Scope Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Block #, Tx Hash, Account Address (0x...), or Validator..."
            className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-4 py-2 text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded border border-slate-800 shrink-0">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              selectedFilter === 'all'
                ? 'bg-slate-800 text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Blocks ({chain.length})
          </button>
          <button
            onClick={() => setSelectedFilter('contract')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              selectedFilter === 'contract'
                ? 'bg-slate-800 text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Contract Executions
          </button>
          <button
            onClick={() => setSelectedFilter('transfer')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              selectedFilter === 'transfer'
                ? 'bg-slate-800 text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Standard Transfers
          </button>
        </div>
      </div>

      {/* Block Stream List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
          <span>Sequential Block Feed</span>
          <span>Showing {filteredBlocks.length} verified blocks</span>
        </div>

        {filteredBlocks.map((block, idx) => {
          const nextBlockInChain = chain[block.index + 1];
          const isLatest = idx === 0;

          // Filter txs if sub-filter active
          const displayedTxs = block.transactions.filter((tx) => {
            if (selectedFilter === 'contract') return tx.type.startsWith('contract');
            if (selectedFilter === 'transfer') return tx.type === 'transfer' || tx.type === 'validator_reward';
            return true;
          });

          return (
            <div
              key={block.hash}
              className={`rounded-lg border bg-slate-900/50 p-4 transition-all hover:border-slate-700 ${
                isLatest ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-slate-800'
              }`}
            >
              {/* Block Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-slate-800/80 border border-slate-700 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] text-slate-400 font-mono">BLOCK</span>
                    <span className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
                      #{block.index}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white font-mono">
                        {block.hash.slice(0, 16)}...{block.hash.slice(-8)}
                      </span>
                      {isLatest && (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-1.5 py-0.2 rounded">
                          LATEST
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span className="font-mono tabular-nums">
                          {new Date(block.timestamp).toLocaleTimeString()}
                        </span>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1 font-mono text-slate-300">
                        <Cpu className="w-3 h-3 text-emerald-400" />
                        <span>{block.validator.name}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-slate-300 font-mono tabular-nums">
                      {block.transactions.length} Transactions
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Nonce: {block.nonce} · Diff: {block.difficulty}
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectBlock(block)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors border border-slate-700 shrink-0"
                  >
                    <span>Inspect Block</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Cryptographic Linkage & AI Attestation Banner */}
              <div className="mt-3 grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                <div className="md:col-span-5 bg-slate-950/80 rounded p-2.5 border border-slate-800/80 font-mono space-y-1">
                  <div className="text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Cryptographic Linkage</span>
                    <span className="text-emerald-400 text-[10px]">SHA-256</span>
                  </div>
                  <div className="text-[11px] text-slate-300 truncate">
                    <span className="text-slate-400">Prev Hash: </span>
                    {block.previousHash.slice(0, 20)}...
                  </div>
                  <div className="text-[11px] text-slate-300 truncate">
                    <span className="text-slate-400">Merkle Root: </span>
                    {block.merkleRoot.slice(0, 20)}...
                  </div>
                </div>

                <div className="md:col-span-7 bg-slate-950/80 rounded p-2.5 border border-slate-800/80 space-y-1">
                  <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Proof of Intelligence Consensus</span>
                    </span>
                    <span className="font-mono text-emerald-400">
                      {(block.aiAttestation.confidence * 100).toFixed(2)}% Conf
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 italic line-clamp-2">
                    "{block.aiAttestation.consensusProof}"
                  </p>
                </div>
              </div>

              {/* Embedded Transactions Preview */}
              {displayedTxs.length > 0 && (
                <div className="mt-3 border-t border-slate-800/60 pt-2 space-y-1.5">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-1">
                    Block Transactions ({displayedTxs.length})
                  </div>
                  <div className="space-y-1">
                    {displayedTxs.map((tx) => (
                      <div
                        key={tx.id}
                        onClick={() => onSelectTransaction(tx)}
                        className="group flex items-center justify-between gap-3 p-2 rounded bg-slate-950/40 hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-700/60 cursor-pointer text-xs font-mono"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Hash className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 shrink-0" />
                          <span className="text-slate-300 truncate">
                            {tx.id.slice(0, 14)}...
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded ${
                              tx.type === 'contract_deploy'
                                ? 'bg-purple-950 text-purple-300 border border-purple-800/60'
                                : tx.type === 'contract_call'
                                ? 'bg-blue-950 text-blue-300 border border-blue-800/60'
                                : tx.type === 'validator_reward'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-400 shrink-0">
                          <span className="text-slate-400 hidden sm:inline">
                            {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-300">
                            {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                          </span>
                          <span className="font-bold text-emerald-400 tabular-nums ml-2">
                            {tx.amount} AIX
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredBlocks.length === 0 && (
          <div className="text-center py-12 rounded-lg border border-dashed border-slate-800 text-slate-400">
            <p className="text-sm font-medium">No blocks matching "{searchQuery}"</p>
            <p className="text-xs text-slate-400 mt-1">Try searching for a block number like "0", "1", or an address.</p>
          </div>
        )}
      </div>
    </div>
  );
};

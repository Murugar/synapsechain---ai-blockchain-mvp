/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { NetworkOverview } from './components/NetworkOverview.tsx';
import { ExplorerTab } from './components/ExplorerTab.tsx';
import { SmartContractStudioTab } from './components/SmartContractStudioTab.tsx';
import { ValidatorNetworkTab } from './components/ValidatorNetworkTab.tsx';
import { MempoolTab } from './components/MempoolTab.tsx';
import { LedgerAuditTab } from './components/LedgerAuditTab.tsx';
import { BlockDetailModal } from './components/BlockDetailModal.tsx';
import { TransactionDetailModal } from './components/TransactionDetailModal.tsx';
import { FaucetModal } from './components/FaucetModal.tsx';
import { Block, Transaction, ValidatorNode, Account, NetworkStats } from './types.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<'explorer' | 'studio' | 'validators' | 'mempool' | 'audit'>('explorer');

  // Blockchain core state
  const [chain, setChain] = useState<Block[]>([]);
  const [mempool, setMempool] = useState<Transaction[]>([]);
  const [validators, setValidators] = useState<ValidatorNode[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [stats, setStats] = useState<NetworkStats | null>(null);

  // Status flags
  const [isLoading, setIsLoading] = useState(true);
  const [isMining, setIsMining] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isTampered, setIsTampered] = useState(false);
  const [tamperMessage, setTamperMessage] = useState<string | null>(null);
  const [autoMining, setAutoMining] = useState(false);

  // Modals
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isFaucetOpen, setIsFaucetOpen] = useState(false);

  // Fetch full blockchain state
  const fetchChainState = useCallback(async () => {
    try {
      const res = await fetch('/api/blockchain/chain');
      const data = await res.json();
      if (data.success) {
        setChain(data.chain);
        setMempool(data.mempool);
        setValidators(data.validators);
        setAccounts(data.accounts);
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching blockchain state:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChainState();
  }, [fetchChainState]);

  // Auto-mining ticker (15s slot interval if toggled)
  useEffect(() => {
    if (!autoMining) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/blockchain/mine', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
        const data = await res.json();
        if (data.success) {
          fetchChainState();
        }
      } catch (err) {
        console.error('Auto-mining error:', err);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [autoMining, fetchChainState]);

  // Mine Block manually
  const handleMineBlock = async () => {
    setIsMining(true);
    try {
      const res = await fetch('/api/blockchain/mine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        await fetchChainState();
      } else {
        alert(`Mining failed: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Mining error: ${err.message}`);
    } finally {
      setIsMining(false);
    }
  };

  // Full Chain Cryptographic Audit
  const handleVerifyChain = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch('/api/blockchain/verify', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        if (!data.audit.isValid) {
          setIsTampered(true);
          setTamperMessage(data.audit.errorReason || 'Cryptographic discrepancy detected in chain.');
        } else {
          setIsTampered(false);
          setTamperMessage(null);
        }
      }
    } catch (err: any) {
      console.error('Verification error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  // Simulate Ledger Tamper
  const handleSimulateTamper = async (blockIndex: number) => {
    try {
      const res = await fetch('/api/blockchain/tamper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockIndex }),
      });
      const data = await res.json();
      if (data.success) {
        setIsTampered(true);
        setTamperMessage(data.result.message);
        await fetchChainState();
        // Switch to audit tab so the user sees the Merkle divergence
        setActiveTab('audit');
      }
    } catch (err: any) {
      alert(`Tamper simulation error: ${err.message}`);
    }
  };

  // Reset Chain
  const handleResetChain = async () => {
    try {
      const res = await fetch('/api/blockchain/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setIsTampered(false);
        setTamperMessage(null);
        await fetchChainState();
      }
    } catch (err: any) {
      alert(`Reset error: ${err.message}`);
    }
  };

  // Faucet Claim
  const handleFaucetClaim = async (address: string, amount: number = 100) => {
    const res = await fetch('/api/blockchain/faucet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, amount }),
    });
    const data = await res.json();
    if (data.success) {
      await fetchChainState();
    } else {
      throw new Error(data.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenFaucet={() => setIsFaucetOpen(true)}
        isTampered={isTampered}
      />

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Network Telemetry & Architecture Visual Header */}
        <NetworkOverview
          stats={stats}
          onMineBlock={handleMineBlock}
          isMining={isMining}
          onVerifyChain={handleVerifyChain}
          isVerifying={isVerifying}
          isTampered={isTampered}
          onResetChain={handleResetChain}
          autoMining={autoMining}
          setAutoMining={setAutoMining}
        />

        {/* Tab Viewport */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 font-mono text-xs">
            <span>Loading SynapseChain cryptographic state...</span>
          </div>
        ) : (
          <div className="min-h-[500px]">
            {activeTab === 'explorer' && (
              <ExplorerTab
                chain={chain}
                onSelectBlock={(b) => setSelectedBlock(b)}
                onSelectTransaction={(t) => setSelectedTransaction(t)}
              />
            )}

            {activeTab === 'studio' && (
              <SmartContractStudioTab
                accounts={accounts}
                onContractDeployed={() => fetchChainState()}
                onTransactionCreated={() => fetchChainState()}
                onRefreshChain={fetchChainState}
              />
            )}

            {activeTab === 'validators' && (
              <ValidatorNetworkTab
                validators={validators}
                latestBlockIndex={stats?.latestBlockHeight || 0}
              />
            )}

            {activeTab === 'mempool' && (
              <MempoolTab
                mempool={mempool}
                accounts={accounts}
                onTransactionCreated={() => fetchChainState()}
                onMineBlock={handleMineBlock}
                isMining={isMining}
              />
            )}

            {activeTab === 'audit' && (
              <LedgerAuditTab
                chain={chain}
                accounts={accounts}
                onVerifyChain={handleVerifyChain}
                isVerifying={isVerifying}
                isTampered={isTampered}
                tamperMessage={tamperMessage}
                onSimulateTamper={handleSimulateTamper}
                onResetChain={handleResetChain}
                onFaucetClaim={(addr) => handleFaucetClaim(addr, 100)}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SynapseChain · AI-Powered Blockchain MVP</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>SHA-256 Merkle Ledger</span>
            <span aria-hidden="true">·</span>
            <span>Proof of Intelligence</span>
            <span aria-hidden="true">·</span>
            <span>Gemini 3.8 Flash Sentinel</span>
          </div>
        </div>
      </footer>

      {/* Deep Modals */}
      <BlockDetailModal
        block={selectedBlock}
        onClose={() => setSelectedBlock(null)}
        onSelectTransaction={(tx) => setSelectedTransaction(tx)}
      />

      <TransactionDetailModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />

      <FaucetModal
        isOpen={isFaucetOpen}
        onClose={() => setIsFaucetOpen(false)}
        accounts={accounts}
        onClaim={handleFaucetClaim}
      />
    </div>
  );
}

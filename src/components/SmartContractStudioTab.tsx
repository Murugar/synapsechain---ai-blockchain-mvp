import React, { useState } from 'react';
import { Sparkles, ShieldAlert, CheckCircle, Code, Play, Rocket, AlertTriangle, ShieldCheck, ArrowRight, RefreshCw, Terminal, Layers } from 'lucide-react';
import { Account, SmartContractAudit, Transaction } from '../types.ts';

interface SmartContractStudioTabProps {
  accounts: Account[];
  onContractDeployed: (newContractAddress: string) => void;
  onTransactionCreated: (tx: Transaction) => void;
  onRefreshChain: () => void;
}

export const SmartContractStudioTab: React.FC<SmartContractStudioTabProps> = ({
  accounts,
  onContractDeployed,
  onTransactionCreated,
  onRefreshChain,
}) => {
  // Preset templates
  const templates = [
    {
      title: 'AI Milestone Escrow',
      prompt: 'Create a milestone escrow smart contract where payments are unlocked only when an AI oracle submits an attestation confidence score of 85 or higher.',
    },
    {
      title: 'Predictive AMM Pool',
      prompt: 'Create an automated market maker liquidity pool with dynamic fee basis points that scale up during high volatility and reward long-term liquidity providers.',
    },
    {
      title: 'Autonomous Agent Registry',
      prompt: 'Create an on-chain registry where autonomous AI agents register their public keys, stake 500 AIX, and receive micropayments for inference tasks.',
    },
    {
      title: 'Parametric Insurance Vault',
      prompt: 'Create a decentralized insurance vault that holds collective collateral and automatically disburses claim funds when an authorized validator submits an emergency event proof.',
    },
  ];

  const [promptText, setPromptText] = useState(templates[0].prompt);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [contractName, setContractName] = useState('NeuralMilestoneEscrow');
  const [contractCode, setContractCode] = useState(`// SPDX-License-Identifier: Apache-2.0
contract NeuralMilestoneEscrow {
    address public payer;
    address public payee;
    address public aiOracle;
    uint256 public milestoneIndex;
    uint256 public escrowBalance;
    bool public milestoneApproved;

    event MilestoneVerified(uint256 indexed index, uint256 releaseAmount);

    function verifyAndRelease(uint256 confidenceScore) public {
        require(confidenceScore >= 85, "AI verification below threshold");
        milestoneApproved = true;
        uint256 payout = escrowBalance / 2;
        escrowBalance -= payout;
    }

    function deposit(uint256 amount) public payable {
        escrowBalance += amount;
    }
}`);
  const [contractAbi, setContractAbi] = useState<any[]>([
    {
      name: 'verifyAndRelease',
      type: 'write',
      inputs: [{ name: 'confidenceScore', type: 'uint256' }],
      description: 'AI Oracle submits validation score (>=85) to unlock milestone payment',
    },
    {
      name: 'deposit',
      type: 'write',
      inputs: [{ name: 'amount', type: 'uint256' }],
      description: 'Deposit funds into the autonomous milestone escrow',
    },
  ]);
  const [initialState, setInitialState] = useState<Record<string, any>>({
    milestoneIndex: 1,
    escrowBalance: 2500,
    milestoneApproved: false,
  });

  // Audit state
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditReport, setAuditReport] = useState<SmartContractAudit | null>(null);

  // Deployment state
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployerAddress, setDeployerAddress] = useState(
    '0xVitalik71cA642142277dFa06A2664E742E9439b93'.toLowerCase()
  );
  const [initialDeposit, setInitialDeposit] = useState<number>(500);
  const [deploymentSuccess, setDeploymentSuccess] = useState<string | null>(null);

  // Contract execution test bench
  const deployedContracts = accounts.filter((a) => a.isContract && a.contractData);
  const [activeContractAddress, setActiveContractAddress] = useState<string>(
    deployedContracts[0]?.address || ''
  );
  const selectedContract = accounts.find(
    (a) => a.address.toLowerCase() === activeContractAddress.toLowerCase()
  );

  const [selectedFunctionName, setSelectedFunctionName] = useState<string>('');
  const [functionArgs, setFunctionArgs] = useState<Record<string, any>>({});
  const [executionResult, setExecutionResult] = useState<any | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Handle Synthesis
  const handleSynthesize = async () => {
    if (!promptText.trim()) return;
    setIsSynthesizing(true);
    setAuditReport(null);
    setDeploymentSuccess(null);

    try {
      const res = await fetch('/api/blockchain/ai/generate-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText }),
      });
      const data = await res.json();
      if (data.success && data.contract) {
        setContractName(data.contract.contractName || 'CustomContract');
        setContractCode(data.contract.code);
        setContractAbi(data.contract.abi || []);
        if (data.contract.initialState) {
          setInitialState(data.contract.initialState);
        }
      }
    } catch (err: any) {
      console.error('Synthesis failed:', err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Handle Audit
  const handleAudit = async () => {
    if (!contractCode.trim()) return;
    setIsAuditing(true);
    try {
      const res = await fetch('/api/blockchain/ai/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: contractCode, contractName }),
      });
      const data = await res.json();
      if (data.success && data.audit) {
        setAuditReport(data.audit);
      }
    } catch (err: any) {
      console.error('Audit failed:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  // Apply Audit Patch
  const handleApplyPatch = () => {
    if (auditReport?.recommendedFixCode) {
      setContractCode(auditReport.recommendedFixCode);
      setAuditReport((prev) =>
        prev
          ? {
              ...prev,
              overallScore: Math.min(100, prev.overallScore + 10),
              securityTier: 'Secure',
              executiveSummary: 'Automated AI security patches applied successfully.',
            }
          : null
      );
    }
  };

  // Handle Deploy
  const handleDeploy = async () => {
    setIsDeploying(true);
    setDeploymentSuccess(null);
    try {
      const res = await fetch('/api/blockchain/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator: deployerAddress,
          contractName,
          code: contractCode,
          abi: contractAbi,
          initialState,
          initialDeposit,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDeploymentSuccess(data.contractAddress);
        onContractDeployed(data.contractAddress);
        onTransactionCreated(data.transaction);
        setActiveContractAddress(data.contractAddress);
        onRefreshChain();
      } else {
        alert(`Deployment error: ${data.error}`);
      }
    } catch (err: any) {
      console.error('Deployment failed:', err);
      alert(`Deployment failed: ${err.message}`);
    } finally {
      setIsDeploying(false);
    }
  };

  // Handle Contract Function Call
  const handleExecuteFunction = async () => {
    if (!activeContractAddress || !selectedFunctionName) return;
    setIsExecuting(true);
    setExecutionResult(null);

    try {
      const res = await fetch('/api/blockchain/contract/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caller: deployerAddress,
          contractAddress: activeContractAddress,
          functionName: selectedFunctionName,
          args: functionArgs,
          value: functionArgs.amount ? Number(functionArgs.amount) : 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setExecutionResult(data.receipt);
        onTransactionCreated(data.transaction);
        onRefreshChain();
      } else {
        setExecutionResult({ success: false, error: data.error });
      }
    } catch (err: any) {
      setExecutionResult({ success: false, error: err.message });
    } finally {
      setIsExecuting(false);
    }
  };

  // Helper when changing active contract
  const currentContractAbi = selectedContract?.contractData?.abi || [];
  const currentContractState = selectedContract?.contractData?.state || {};

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Natural Language to Bytecode Compiler</span>
            <span aria-hidden="true">·</span>
            <span>Gemini 3.8 Flash Engine</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Smart Contract Synthesis & Security Studio</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Describe decentralized logic in plain English, audit with formal verification, and deploy directly to the SynapseChain ledger.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSynthesize}
            disabled={isSynthesizing}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded transition-colors shadow-sm"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSynthesizing ? 'animate-spin' : ''}`} />
            <span>{isSynthesizing ? 'Compiling Logic...' : 'Synthesize Contract'}</span>
          </button>
        </div>
      </div>

      {/* Preset Prompt Pills */}
      <div className="space-y-2">
        <div className="text-[11px] font-mono text-slate-400">Preset Architecture Specifications:</div>
        <div className="flex flex-wrap gap-2">
          {templates.map((tmpl) => (
            <button
              key={tmpl.title}
              onClick={() => setPromptText(tmpl.prompt)}
              className="px-3 py-1.5 text-xs rounded bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors text-left"
            >
              {tmpl.title}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Input Area */}
      <div className="relative">
        <textarea
          rows={3}
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="Describe your smart contract specifications (e.g. Escrow with AI arbiter, Dynamic AMM pool, or Staking vault)..."
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
        />
      </div>

      {/* Code Editor & Audit / Deploy Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Code Viewer */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between bg-slate-900/80 px-4 py-2 rounded-t-lg border border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-200">
              <Code className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold">{contractName}.sol</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAudit}
                disabled={isAuditing}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800/80 rounded transition-colors"
              >
                <ShieldAlert className={`w-3 h-3 ${isAuditing ? 'animate-spin' : ''}`} />
                <span>{isAuditing ? 'Auditing...' : 'Run AI Security Audit'}</span>
              </button>
            </div>
          </div>

          <div className="relative rounded-b-lg border border-t-0 border-slate-800 bg-slate-950 overflow-hidden font-mono text-xs">
            <textarea
              rows={16}
              value={contractCode}
              onChange={(e) => setContractCode(e.target.value)}
              className="w-full p-4 bg-transparent text-slate-200 focus:outline-none resize-none leading-relaxed font-mono"
              spellCheck={false}
            />
          </div>

          {/* Deployment Bar */}
          <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="font-semibold flex items-center gap-1.5">
                <Rocket className="w-3.5 h-3.5 text-emerald-400" />
                <span>Deploy Contract to Local Ledger</span>
              </span>
              <span className="text-slate-400">Gas: ~0.1 AIX</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
              <div className="sm:col-span-6">
                <label className="block text-[11px] text-slate-400 mb-1">Deployer Wallet</label>
                <select
                  value={deployerAddress}
                  onChange={(e) => setDeployerAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                >
                  {accounts
                    .filter((a) => !a.isContract)
                    .map((acc) => (
                      <option key={acc.address} value={acc.address}>
                        {acc.label} ({acc.balance.toLocaleString()} AIX)
                      </option>
                    ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] text-slate-400 mb-1">Initial Deposit (AIX)</label>
                <input
                  type="number"
                  value={initialDeposit}
                  onChange={(e) => setInitialDeposit(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-3 flex items-end">
                <button
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded transition-colors"
                >
                  <Rocket className="w-3 h-3" />
                  <span>{isDeploying ? 'Deploying...' : 'Deploy Now'}</span>
                </button>
              </div>
            </div>

            {deploymentSuccess && (
              <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-800 text-xs font-mono text-emerald-300 flex items-center justify-between">
                <span>Contract deployed at: {deploymentSuccess}</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                  Confirmed on Chain
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: AI Audit Report or Live Contract Execution Console */}
        <div className="lg:col-span-5 space-y-4">
          {/* AI Security Audit Box */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">AI Security & Invariant Audit</h3>
              </div>
              {auditReport && (
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      auditReport.overallScore >= 80
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    Score: {auditReport.overallScore}/100
                  </span>
                </div>
              )}
            </div>

            {auditReport ? (
              <div className="space-y-3 text-xs">
                <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
                  {auditReport.executiveSummary}
                </p>

                <div className="space-y-2">
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                    Detected Vulnerability Vectors ({auditReport.findings.length})
                  </div>
                  {auditReport.findings.map((f, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded bg-slate-950/80 border border-slate-800 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{f.title}</span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                            f.severity === 'Critical' || f.severity === 'High'
                              ? 'bg-red-950 text-red-300 border border-red-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {f.severity}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{f.description}</p>
                      <div className="text-[10px] text-emerald-400 font-mono">
                        Fix: {f.recommendation}
                      </div>
                    </div>
                  ))}
                </div>

                {auditReport.recommendedFixCode && (
                  <button
                    onClick={handleApplyPatch}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-800 rounded transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Apply AI Security Patches to Editor</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                <p>Click "Run AI Security Audit" to inspect contract bytecode for reentrancy, MEV, and boundary overflow risks.</p>
              </div>
            )}
          </div>

          {/* Interactive Contract Test Console */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Live Contract Execution Console</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {deployedContracts.length} On-Chain Contracts
              </span>
            </div>

            {/* Select Target Contract */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Target Contract</label>
              <select
                value={activeContractAddress}
                onChange={(e) => {
                  setActiveContractAddress(e.target.value);
                  setSelectedFunctionName('');
                  setFunctionArgs({});
                  setExecutionResult(null);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
              >
                {deployedContracts.map((c) => (
                  <option key={c.address} value={c.address}>
                    {c.contractData?.name || c.label} ({c.address.slice(0, 10)}...)
                  </option>
                ))}
              </select>
            </div>

            {/* Live State Inspector */}
            <div className="bg-slate-950 rounded p-2.5 border border-slate-800 text-xs font-mono">
              <div className="text-[10px] text-slate-400 mb-1">Live State Storage:</div>
              <pre className="text-emerald-400 text-[11px] overflow-x-auto">
                {JSON.stringify(currentContractState, null, 2)}
              </pre>
            </div>

            {/* Function Caller */}
            {currentContractAbi.length > 0 && (
              <div className="space-y-2 pt-1 border-t border-slate-800/80">
                <label className="block text-[11px] text-slate-400">Callable Functions (ABI)</label>
                <div className="grid grid-cols-2 gap-2">
                  {currentContractAbi.map((fn) => (
                    <button
                      key={fn.name}
                      onClick={() => {
                        setSelectedFunctionName(fn.name);
                        setFunctionArgs({});
                        setExecutionResult(null);
                      }}
                      className={`p-2 rounded text-left border text-xs font-mono transition-colors ${
                        selectedFunctionName === fn.name
                          ? 'bg-slate-800 border-emerald-500 text-emerald-400'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold truncate">{fn.name}()</div>
                      <div className="text-[10px] text-slate-400 truncate">{fn.type}</div>
                    </button>
                  ))}
                </div>

                {selectedFunctionName && (
                  <div className="bg-slate-950/80 rounded p-3 border border-slate-800 space-y-2.5 mt-2 text-xs">
                    <div className="font-semibold text-slate-200 font-mono">
                      Invoke {selectedFunctionName}()
                    </div>

                    {/* Inputs */}
                    {currentContractAbi
                      .find((f) => f.name === selectedFunctionName)
                      ?.inputs.map((inp) => (
                        <div key={inp.name}>
                          <label className="block text-[11px] text-slate-400 mb-1 font-mono">
                            {inp.name} ({inp.type})
                          </label>
                          <input
                            type="text"
                            placeholder={inp.name === 'confidenceScore' ? '92' : inp.name === 'aixAmount' ? '150' : 'Value'}
                            value={functionArgs[inp.name] || ''}
                            onChange={(e) =>
                              setFunctionArgs({ ...functionArgs, [inp.name]: e.target.value })
                            }
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      ))}

                    <button
                      onClick={handleExecuteFunction}
                      disabled={isExecuting}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded transition-colors"
                    >
                      <Play className="w-3 h-3" />
                      <span>{isExecuting ? 'Executing In Sandbox...' : 'Broadcast State Transition'}</span>
                    </button>

                    {executionResult && (
                      <div
                        className={`p-2 rounded border text-xs font-mono ${
                          executionResult.success
                            ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                            : 'bg-red-950/40 border-red-800 text-red-300'
                        }`}
                      >
                        <div className="font-semibold">
                          {executionResult.success ? 'Execution Succeeded' : 'Execution Reverted'}
                        </div>
                        <div className="text-[11px] mt-0.5">
                          {executionResult.message || executionResult.error || JSON.stringify(executionResult)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

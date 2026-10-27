import React, { useState } from 'react';
import { Cpu, ShieldCheck, CheckCircle2, Lock, Radio, Vote, Sparkles, RefreshCw, Server } from 'lucide-react';
import { ValidatorNode, AIAttestation } from '../types.ts';

interface ValidatorNetworkTabProps {
  validators: ValidatorNode[];
  latestBlockIndex: number;
}

export const ValidatorNetworkTab: React.FC<ValidatorNetworkTabProps> = ({
  validators,
  latestBlockIndex,
}) => {
  const [isRequestingAttestation, setIsRequestingAttestation] = useState(false);
  const [attestationResult, setAttestationResult] = useState<AIAttestation | null>(null);

  const handleRequestConsensus = async () => {
    setIsRequestingAttestation(true);
    try {
      const res = await fetch('/api/blockchain/ai/validator-consensus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockIndex: latestBlockIndex + 1 }),
      });
      const data = await res.json();
      if (data.success && data.attestation) {
        setAttestationResult(data.attestation);
      }
    } catch (err: any) {
      console.error('Failed to get validator consensus:', err);
    } finally {
      setIsRequestingAttestation(false);
    }
  };

  const totalStake = validators.reduce((acc, v) => acc + v.stake, 0);

  return (
    <div className="space-y-6">
      {/* Topology Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <Radio className="w-3.5 h-3.5" />
            <span>Proof of Intelligence (PoI) Distributed Network</span>
            <span aria-hidden="true">·</span>
            <span>BFT Quorum &gt; 66.7%</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Autonomous AI Validator Cluster</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            5 autonomous intelligence nodes jointly reach consensus on state machine transitions, validating smart contract formal proofs and block validity.
          </p>
        </div>

        <button
          onClick={handleRequestConsensus}
          disabled={isRequestingAttestation}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded transition-colors shadow-sm shrink-0"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isRequestingAttestation ? 'animate-spin' : ''}`} />
          <span>{isRequestingAttestation ? 'Executing PoI Quorum...' : 'Simulate Consensus Round'}</span>
        </button>
      </div>

      {/* Consensus Attestation Result Card */}
      {attestationResult && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">
                Slot #{latestBlockIndex + 1} Proof of Intelligence Certified
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              {(attestationResult.confidence * 100).toFixed(2)}% Confidence
            </span>
          </div>

          <p className="text-xs text-slate-200 bg-slate-950/60 p-3 rounded border border-slate-800 italic">
            "{attestationResult.consensusProof}"
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div className="bg-slate-950/60 p-3 rounded border border-slate-800 space-y-1.5">
              <div className="text-[11px] text-slate-400">Verified Cryptographic Invariants:</div>
              <ul className="space-y-1 text-slate-300">
                {attestationResult.verifiedInvariants.map((inv, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{inv}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-950/60 p-3 rounded border border-slate-800 space-y-1.5">
              <div className="text-[11px] text-slate-400">Validator Signatures (5/5 Quorum):</div>
              <div className="space-y-1 text-slate-400 text-[11px]">
                {validators.map((v, i) => (
                  <div key={v.id} className="flex items-center justify-between">
                    <span className="text-slate-300">{v.name}</span>
                    <span className="text-emerald-400">SIGNED [0x{v.id.slice(4, 12)}...]</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validator Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {validators.map((val, idx) => {
          const stakePercent = ((val.stake / totalStake) * 100).toFixed(1);

          return (
            <div
              key={val.id}
              className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 space-y-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 shrink-0">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{val.name}</h3>
                    <div className="text-[11px] text-slate-400 font-mono">{val.model}</div>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {val.status.toUpperCase()}
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950/70 p-2.5 rounded border border-slate-800/80 text-xs font-mono">
                <div>
                  <div className="text-[10px] text-slate-400">Stake</div>
                  <div className="font-bold text-slate-200 tabular-nums">
                    {(val.stake / 1000).toFixed(0)}k AIX
                  </div>
                  <div className="text-[9px] text-emerald-400">{stakePercent}% pool</div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400">Uptime</div>
                  <div className="font-bold text-slate-200 tabular-nums">{val.uptime}%</div>
                  <div className="text-[9px] text-slate-400">Slashing 0%</div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400">Validated</div>
                  <div className="font-bold text-slate-200 tabular-nums">
                    {val.blocksValidated} blks
                  </div>
                  <div className="text-[9px] text-slate-400">Rep: {val.reputation}</div>
                </div>
              </div>

              {/* Latest Attestation Note */}
              <div className="text-xs bg-slate-950/40 p-2.5 rounded border border-slate-800/60 space-y-1">
                <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
                  <span>Last Invariant Attestation</span>
                  <Vote className="w-3 h-3 text-slate-400" />
                </div>
                <p className="text-[11px] text-slate-300 italic line-clamp-2">
                  "{val.lastAttestation}"
                </p>
              </div>

              {/* Node ID */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                <span>Node ID: {val.id}</span>
                <span className="text-emerald-400">Vote Weight: {stakePercent}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

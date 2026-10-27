import React, { useState } from 'react';
import { X, Droplets, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Account } from '../types.ts';

interface FaucetModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onClaim: (address: string, amount: number) => Promise<void>;
}

export const FaucetModal: React.FC<FaucetModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onClaim,
}) => {
  const userAccounts = accounts.filter((a) => !a.isContract);
  const [selectedAddress, setSelectedAddress] = useState<string>(
    userAccounts[1]?.address || ''
  );
  const [amount, setAmount] = useState<number>(100);
  const [isClaiming, setIsClaiming] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddress) return;
    setIsClaiming(true);
    setSuccessMessage(null);

    try {
      await onClaim(selectedAddress, amount);
      setSuccessMessage(`Successfully disbursed ${amount} AIX to selected account!`);
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1400);
    } catch (err: any) {
      alert(`Faucet error: ${err.message}`);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full shadow-2xl p-6 space-y-4 text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Testnet Faucet</h2>
              <div className="text-xs text-slate-400">Direct emission from Genesis Reserve</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleClaimSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Target Account</label>
            <select
              value={selectedAddress}
              onChange={(e) => setSelectedAddress(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
            >
              {userAccounts.map((acc) => (
                <option key={acc.address} value={acc.address}>
                  {acc.label} ({acc.balance.toLocaleString()} AIX)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Token Amount (AIX)</label>
            <div className="grid grid-cols-3 gap-2">
              {[50, 100, 500].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setAmount(val)}
                  className={`py-1.5 text-xs font-mono rounded border transition-colors ${
                    amount === val
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-400 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  +{val} AIX
                </button>
              ))}
            </div>
          </div>

          {successMessage && (
            <div className="p-2.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-400 font-mono text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 rounded transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isClaiming}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded transition-colors"
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>{isClaiming ? 'Disbursing...' : 'Claim Tokens'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

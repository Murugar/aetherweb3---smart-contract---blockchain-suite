import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { 
  TrendingUp, 
  Lock, 
  Unlock, 
  Coins, 
  Sparkles, 
  ShieldCheck, 
  Info,
  Clock,
  ArrowRight
} from 'lucide-react';

export const VaultView: React.FC = () => {
  const { 
    account, 
    balances, 
    executeContractTransaction, 
    isTransacting,
    refreshAll 
  } = useWeb3();

  const [stakeAmount, setStakeAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [activeAction, setActiveAction] = useState<'stake' | 'withdraw'>('stake');
  const [liveRewardDisplay, setLiveRewardDisplay] = useState('0.000000');

  // Real-time ticking counter for pending rewards
  useEffect(() => {
    if (!balances || parseFloat(balances.stakedAthBalance) <= 0) {
      setLiveRewardDisplay('0.000000');
      return;
    }

    let basePending = parseFloat(balances.pendingRewardsAth);
    const staked = parseFloat(balances.stakedAthBalance);
    // 14.80% APY per second = staked * 0.148 / 31536000
    const perSecond = (staked * 0.148) / 31536000;

    const interval = setInterval(() => {
      basePending += perSecond;
      setLiveRewardDisplay(basePending.toFixed(6));
    }, 1000);

    return () => clearInterval(interval);
  }, [balances]);

  const handleStake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return;
    try {
      await executeContractTransaction('aether-vault', 'stake', [stakeAmount]);
      setStakeAmount('');
      refreshAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    try {
      await executeContractTransaction('aether-vault', 'withdraw', [withdrawAmount]);
      setWithdrawAmount('');
      refreshAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClaim = async () => {
    try {
      await executeContractTransaction('aether-vault', 'claimRewards', []);
      refreshAll();
    } catch (err) {
      console.error(err);
    }
  };

  const stakedNum = balances ? parseFloat(balances.stakedAthBalance) : 0;
  const athNum = balances ? parseFloat(balances.athBalance) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-2">
            <span>SMART CONTRACT VAULT</span>
            <span aria-hidden="true">·</span>
            <span>NON-CUSTODIAL LIQUIDITY</span>
            <span aria-hidden="true">·</span>
            <span>AUDITED PROTOCOL</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Aether High-Yield Staking Pool
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Stake ATH governance tokens into the automated yield distributor contract to accrue continuous passive APY rewards computed per-second on-chain.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-right">
            <div className="text-xs text-slate-400">Fixed APY Rate</div>
            <div className="text-2xl font-black font-mono text-emerald-400">14.80%</div>
            <div className="text-[11px] text-slate-500 font-mono">1480 basis points</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Staking Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Metrics & Pending Rewards (1 col) */}
        <div className="space-y-6">
          {/* Pending Rewards Card */}
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Unclaimed Rewards
              </span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>

            <div>
              <div className="text-3xl font-bold font-mono text-emerald-400 tabular-nums">
                {liveRewardDisplay} <span className="text-xs text-slate-400 font-sans">ATH</span>
              </div>
              <div className="text-xs text-slate-400 mt-1 font-mono">
                ≈ ${(parseFloat(liveRewardDisplay) * 4.25).toFixed(4)} USD
              </div>
            </div>

            <button
              onClick={handleClaim}
              disabled={isTransacting || parseFloat(liveRewardDisplay) <= 0}
              className="w-full py-2.5 px-4 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Coins className="w-3.5 h-3.5" />
              Harvest & Claim Rewards
            </button>
          </div>

          {/* User Position Stats */}
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Your Vault Position
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Active Staked:</span>
                <span className="font-mono text-white font-medium">{stakedNum.toFixed(2)} sATH</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Position Value:</span>
                <span className="font-mono text-slate-200">${(stakedNum * 4.25).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Wallet Available:</span>
                <span className="font-mono text-slate-200">{athNum.toFixed(2)} ATH</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Pool Share:</span>
                <span className="font-mono text-slate-200">
                  {stakedNum > 0 ? ((stakedNum / 125000) * 100).toFixed(3) : '0.000'}%
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Lock Period:</span>
                <span className="text-emerald-400 font-medium">None (Instant Unlock)</span>
              </div>
            </div>
          </div>

          {/* Protocol Security Audit Info */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-1.5 text-slate-200 font-medium">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Smart Contract Verified</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              Deploy Address: <code className="text-cyan-400 font-mono">0x3B9270a6c23D6983A76F3d964f47C596b797b5e4</code>
            </p>
            <p className="leading-relaxed text-[11px] text-slate-400">
              Rewards are calculated using time delta formula <code className="text-slate-300">(staked * bps * seconds) / (10000 * 31536000)</code> with unchecked arithmetic gas optimization.
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Staking & Withdrawal Form (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 sm:p-8 rounded-xl bg-slate-900 border border-slate-800 space-y-6">
            {/* Segmented Control for Stake / Withdraw */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 max-w-xs">
              <button
                onClick={() => setActiveAction('stake')}
                className={`flex-1 py-2 px-4 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  activeAction === 'stake'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                Stake ATH
              </button>
              <button
                onClick={() => setActiveAction('withdraw')}
                className={`flex-1 py-2 px-4 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  activeAction === 'withdraw'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Unlock className="w-3.5 h-3.5" />
                Withdraw
              </button>
            </div>

            {/* Form */}
            {activeAction === 'stake' ? (
              <form onSubmit={handleStake} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      Amount to Stake (ATH)
                    </label>
                    <span className="text-xs text-slate-400 font-mono">
                      Available: {athNum.toFixed(2)} ATH
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="100.0"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 pr-16"
                    />
                    <button
                      type="button"
                      onClick={() => setStakeAmount(athNum.toString())}
                      className="absolute right-2.5 top-2.5 px-2.5 py-1 text-xs font-semibold text-cyan-400 bg-cyan-950 hover:bg-cyan-900 rounded"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Estimated Annual Yield:</span>
                    <span className="font-mono text-emerald-400 font-medium">
                      +{(parseFloat(stakeAmount || '0') * 0.148).toFixed(2)} ATH / year
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Estimated Monthly Yield:</span>
                    <span className="font-mono text-emerald-400 font-medium">
                      +{((parseFloat(stakeAmount || '0') * 0.148) / 12).toFixed(2)} ATH / mo
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Lock Requirement:</span>
                    <span className="text-slate-300 font-medium">No lock period</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isTransacting || !stakeAmount || parseFloat(stakeAmount) <= 0}
                  className="w-full py-3 px-4 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  {isTransacting ? 'Confirming Stake on Blockchain...' : 'Deposit & Stake in Vault'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      Amount to Withdraw (sATH)
                    </label>
                    <span className="text-xs text-slate-400 font-mono">
                      Staked: {stakedNum.toFixed(2)} sATH
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="50.0"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 pr-16"
                    />
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(stakedNum.toString())}
                      className="absolute right-2.5 top-2.5 px-2.5 py-1 text-xs font-semibold text-cyan-400 bg-cyan-950 hover:bg-cyan-900 rounded"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Tokens Returned to Wallet:</span>
                    <span className="font-mono text-white font-medium">
                      {parseFloat(withdrawAmount || '0').toFixed(2)} ATH
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Accrued Yield Action:</span>
                    <span className="text-slate-300 font-medium">Preserved in reward debt accumulator</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isTransacting || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
                  className="w-full py-3 px-4 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  {isTransacting ? 'Broadcasting Withdrawal...' : 'Withdraw Staked Tokens'}
                </button>
              </form>
            )}
          </div>

          {/* Staking Economics Visualizer */}
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-white">How Aether Staking Mechanics Work</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
                <div className="text-cyan-400 font-semibold">1. Non-Custodial Deposit</div>
                <p className="text-slate-400 leading-relaxed">
                  Your ATH tokens are transferred directly into the audited AetherVault contract. You retain full cryptographic ownership.
                </p>
              </div>
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
                <div className="text-emerald-400 font-semibold">2. Per-Second Accrual</div>
                <p className="text-slate-400 leading-relaxed">
                  Rewards accrue every single block based on the 1480 basis points annual reward rate formula without needing gas to trigger.
                </p>
              </div>
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
                <div className="text-indigo-400 font-semibold">3. Instant Liquidity</div>
                <p className="text-slate-400 leading-relaxed">
                  Withdraw principal tokens or harvest yield anytime with single-transaction confirmation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { 
  Send, 
  Flame, 
  PlusCircle, 
  Droplets, 
  Layers, 
  ExternalLink, 
  Check, 
  Zap,
  ArrowUpRight,
  TrendingUp,
  Cpu
} from 'lucide-react';

export const DashboardView: React.FC<{ onSwitchTab: (tab: string) => void }> = ({ onSwitchTab }) => {
  const { 
    account, 
    balances, 
    network, 
    transactions, 
    requestFaucetTokens, 
    executeContractTransaction, 
    isTransacting 
  } = useWeb3();

  // Transfer Form State
  const [transferRecipient, setTransferRecipient] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  
  // Mint & Burn Form State
  const [mintAmount, setMintAmount] = useState('100');
  const [burnAmount, setBurnAmount] = useState('10');

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferRecipient || !transferAmount) return;
    try {
      await executeContractTransaction('aether-token', 'transfer', [transferRecipient, transferAmount]);
      setTransferRecipient('');
      setTransferAmount('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleMint = async () => {
    if (!mintAmount) return;
    try {
      await executeContractTransaction('aether-token', 'mint', [account, mintAmount]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBurn = async () => {
    if (!burnAmount) return;
    try {
      await executeContractTransaction('aether-token', 'burn', [burnAmount]);
    } catch (err) {
      console.error(err);
    }
  };

  const ethVal = balances ? parseFloat(balances.ethBalance) * 2850 : 0;
  const athVal = balances ? parseFloat(balances.athBalance) * 4.25 : 0;
  const stakedVal = balances ? parseFloat(balances.stakedAthBalance) * 4.25 : 0;
  const totalUsd = ethVal + athVal + stakedVal;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Visual Section with Image and Overlay */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900">
        <div className="absolute inset-0">
          <img
            src="/src/assets/images/hero_web3_cryptography_1793080527899.jpg"
            alt="Cryptographic Web3 Blockchain Visualization"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span>ETHEREUM SEPOLIA EVM</span>
            <span aria-hidden="true">·</span>
            <span>WEB3.JS V4 CLIENT</span>
            <span aria-hidden="true">·</span>
            <span>VERIFIED SOLIDITY SUITE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight font-sans">
            Next-Generation Web3 Protocol & Smart Contract Hub
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Interact with live Solidity smart contracts, manage non-custodial or sandbox developer keypairs, stake into high-yield DeFi vaults, and settle trustless multi-signature milestone escrows.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSwitchTab('contracts')}
              className="px-5 py-2.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-2"
            >
              <Cpu className="w-4 h-4" />
              Contract Studio & IDE
            </button>
            <button
              onClick={() => onSwitchTab('vault')}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              DeFi Staking Vault (14.8% APY)
            </button>
            <button
              onClick={requestFaucetTokens}
              className="px-4 py-2.5 text-xs font-medium text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/60 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Droplets className="w-3.5 h-3.5" />
              Claim Faucet (+1.5 ETH, +250 ATH)
            </button>
          </div>
        </div>
      </div>

      {/* 4-Column Portfolio KPI Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-medium text-slate-400 mb-1">Total Portfolio Value</div>
          <div className="text-2xl font-bold font-mono tracking-tight text-white">
            ${totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Real-time on-chain valuation</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-medium text-slate-400 mb-1">Native Gas Currency</div>
          <div className="text-2xl font-bold font-mono tracking-tight text-cyan-400">
            {balances ? `${parseFloat(balances.ethBalance).toFixed(4)}` : '0.0000'} <span className="text-xs text-slate-400 font-sans">ETH</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            ≈ ${(balances ? parseFloat(balances.ethBalance) * 2850 : 0).toFixed(2)} USD
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-medium text-slate-400 mb-1">Aether Governance Balance</div>
          <div className="text-2xl font-bold font-mono tracking-tight text-white">
            {balances ? `${parseFloat(balances.athBalance).toFixed(2)}` : '0.00'} <span className="text-xs text-slate-400 font-sans">ATH</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            ERC-20 Token ($4.25 / ATH)
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-medium text-slate-400 mb-1">Staked in AetherVault</div>
          <div className="text-2xl font-bold font-mono tracking-tight text-emerald-400">
            {balances ? `${parseFloat(balances.stakedAthBalance).toFixed(2)}` : '0.00'} <span className="text-xs text-slate-400 font-sans">sATH</span>
          </div>
          <div className="mt-2 text-xs text-emerald-400/90 font-mono">
            +{balances ? parseFloat(balances.pendingRewardsAth).toFixed(4) : '0.0000'} ATH Unclaimed
          </div>
        </div>
      </div>

      {/* Two Column Layout: Token Management and Network Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Token Operations (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Transfer ERC-20 */}
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">Transfer Aether Token ($ATH)</h3>
                <p className="text-xs text-slate-400">Execute on-chain ERC-20 transfer through smart contract</p>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                ATH Token
              </span>
            </div>

            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Recipient Ethereum Address
                </label>
                <input
                  type="text"
                  value={transferRecipient}
                  onChange={(e) => setTransferRecipient(e.target.value)}
                  placeholder="0x71C95911E9A5D330f4D621842EC243EE1343292e"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-medium text-slate-300">Amount (ATH)</label>
                    <span className="text-xs text-slate-400 font-mono">
                      Bal: {balances ? parseFloat(balances.athBalance).toFixed(2) : '0'} ATH
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      placeholder="50.0"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 pr-16"
                    />
                    <button
                      type="button"
                      onClick={() => balances && setTransferAmount(balances.athBalance)}
                      className="absolute right-2 top-2 px-2 py-1 text-[10px] font-semibold text-cyan-400 bg-cyan-950 hover:bg-cyan-900 rounded"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isTransacting || !transferRecipient || !transferAmount}
                    className="w-full h-[38px] flex items-center justify-center gap-2 px-4 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isTransacting ? 'Confirming...' : 'Transfer Tokens'}
                  </button>
                </div>
              </div>
            </form>

            {/* Quick Token Mint & Burn Tools */}
            <div className="pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-950/80 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-200">Testnet Mint</div>
                  <div className="text-[11px] text-slate-400">Mint 100 ATH directly</div>
                </div>
                <button
                  onClick={handleMint}
                  disabled={isTransacting}
                  className="px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800/80 rounded-md transition-colors flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Mint +100
                </button>
              </div>

              <div className="p-3.5 bg-slate-950/80 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-200">Deflationary Burn</div>
                  <div className="text-[11px] text-slate-400">Burn 10 ATH permanently</div>
                </div>
                <button
                  onClick={handleBurn}
                  disabled={isTransacting}
                  className="px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-950 hover:bg-rose-900 border border-rose-800/80 rounded-md transition-colors flex items-center gap-1.5"
                >
                  <Flame className="w-3.5 h-3.5" />
                  Burn 10 ATH
                </button>
              </div>
            </div>
          </div>

          {/* Recent On-Chain Transactions */}
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">Recent Transactions</h3>
                <p className="text-xs text-slate-400">Latest confirmed blockchain executions</p>
              </div>
              <button
                onClick={() => onSwitchTab('explorer')}
                className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>Full Ledger</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 font-medium">Tx Hash</th>
                    <th className="py-2.5 font-medium">Method</th>
                    <th className="py-2.5 font-medium">Block</th>
                    <th className="py-2.5 font-medium text-right">Gas Used</th>
                    <th className="py-2.5 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {transactions.slice(0, 4).map((tx) => (
                    <tr key={tx.hash} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 text-cyan-400 font-medium">
                        {tx.hash.slice(0, 8)}...{tx.hash.slice(-4)}
                      </td>
                      <td className="py-2.5 text-slate-300 font-sans font-medium">
                        {tx.methodName || 'Contract Call'}
                      </td>
                      <td className="py-2.5 text-slate-400">#{tx.blockNumber}</td>
                      <td className="py-2.5 text-right text-slate-400 tabular-nums">
                        {tx.gasUsed.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right font-sans">
                        <span className="text-emerald-400 font-medium">Confirmed</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Node & Network Status (1 col) */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Node Telemetry</h3>
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Web3 Active</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Chain:</span>
                <span className="text-slate-200 font-medium">{network?.chainName || 'Ethereum Sepolia'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">EVM Chain ID:</span>
                <span className="font-mono text-cyan-400 font-medium">{network?.chainId || 11155111}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Current Block Height:</span>
                <span className="font-mono text-white font-medium">#{network?.blockNumber || '19842580'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Gas Price:</span>
                <span className="font-mono text-slate-200 font-medium">{network?.gasPriceGwei || '15.4'} Gwei</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Connected Peers:</span>
                <span className="font-mono text-slate-200 font-medium">{network?.peerCount || 38} nodes</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Treasury Relayer:</span>
                <span className="font-mono text-xs text-slate-300">
                  {network?.treasuryAddress ? `${network.treasuryAddress.slice(0, 6)}...${network.treasuryAddress.slice(-4)}` : '0x...'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="text-slate-300 font-medium">Node Architecture</div>
              <p className="leading-relaxed">
                Transactions are validated and signed via Web3.js backend relayer, executing standard Solidity smart contracts with state immutability.
              </p>
            </div>
          </div>

          {/* Quick Links Card */}
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Smart Contract Suites
            </h4>
            <div className="space-y-2">
              <button
                onClick={() => onSwitchTab('contracts')}
                className="w-full text-left p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <span className="font-medium text-white block">Aether Governance Token</span>
                  <span className="text-[11px] text-slate-400">ERC-20 standard with burn mechanics</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-cyan-400" />
              </button>

              <button
                onClick={() => onSwitchTab('vault')}
                className="w-full text-left p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <span className="font-medium text-white block">Aether Yield Vault</span>
                  <span className="text-[11px] text-slate-400">14.80% APY automated compounding</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              </button>

              <button
                onClick={() => onSwitchTab('escrow')}
                className="w-full text-left p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <span className="font-medium text-white block">OmniEscrow MultiSig</span>
                  <span className="text-[11px] text-slate-400">Trustless milestone releases</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-indigo-400" />
              </button>

              <button
                onClick={() => onSwitchTab('nfts')}
                className="w-full text-left p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <span className="font-medium text-white block">Genesis Artifacts</span>
                  <span className="text-[11px] text-slate-400">ERC-721 on-chain collectibles</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-purple-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

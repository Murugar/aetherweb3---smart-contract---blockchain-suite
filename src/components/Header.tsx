import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { 
  Wallet, 
  ExternalLink, 
  Droplets, 
  ChevronDown, 
  Key, 
  Check, 
  Copy,
  Layers
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenWalletModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenWalletModal }) => {
  const { account, balances, network, walletType, requestFaucetTokens } = useWeb3();
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const copyAddress = () => {
    if (!account) return;
    navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'vault', label: 'Vault Staking' },
    { id: 'contracts', label: 'Smart Contracts' },
    { id: 'escrow', label: 'OmniEscrow' },
    { id: 'nfts', label: 'Genesis NFTs' },
    { id: 'explorer', label: 'Explorer' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark & Network marker */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white font-sans whitespace-nowrap">
              Aether<span className="text-cyan-400">Web3</span>
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 pl-3 border-l border-slate-800">
            <span>Sepolia EVM</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="font-mono text-slate-400">#{network?.blockNumber || '19842580'}</span>
          </div>
        </div>

        {/* Zone 2: 5 clean single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`whitespace-nowrap transition-colors py-1 ${
                  isActive 
                    ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action lockup */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={requestFaucetTokens}
            title="Request 1.5 ETH and 250 ATH Test Tokens"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 rounded-lg hover:bg-cyan-900/40 transition-colors whitespace-nowrap"
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Faucet</span>
          </button>

          {account ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800/90 border border-slate-700/80 rounded-lg text-xs transition-colors whitespace-nowrap"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-mono text-slate-200">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
                <span className="text-slate-400 text-[11px] font-mono border-l border-slate-700 pl-2">
                  {balances ? `${parseFloat(balances.ethBalance).toFixed(2)} ETH` : '...'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
                  <div className="text-[11px] font-medium text-slate-400 mb-1">Connected Account</div>
                  <div className="flex items-center justify-between bg-slate-950/80 p-2 rounded-lg border border-slate-800 mb-3">
                    <span className="font-mono text-xs text-slate-200 truncate pr-2">
                      {account}
                    </span>
                    <button
                      onClick={copyAddress}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Copy Address"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs mb-3 text-slate-300">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Wallet Mode:</span>
                      <span className="font-medium text-cyan-400 capitalize">{walletType}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Native Balance:</span>
                      <span className="font-mono font-medium">{balances?.ethBalance || '0.00'} ETH</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">ATH Governance:</span>
                      <span className="font-mono font-medium">{balances?.athBalance || '0.00'} ATH</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex flex-col gap-1.5">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenWalletModal();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Key className="w-3.5 h-3.5" />
                      Manage Wallet & Keys
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenWalletModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-cyan-500/20"
            >
              <Wallet className="w-3.5 h-3.5" />
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="md:hidden border-t border-slate-800/80 px-4 py-2 flex items-center gap-2 overflow-x-auto">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`text-xs px-3 py-1 rounded-md whitespace-nowrap transition-colors ${
              activeTab === item.id 
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};

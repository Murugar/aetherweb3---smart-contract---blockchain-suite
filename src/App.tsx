import React, { useState } from 'react';
import { Web3Provider, useWeb3 } from './context/Web3Context';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { VaultView } from './components/VaultView';
import { ContractsView } from './components/ContractsView';
import { EscrowView } from './components/EscrowView';
import { NFTView } from './components/NFTView';
import { ExplorerView } from './components/ExplorerView';
import { WalletModal } from './components/WalletModal';
import { ToastContainer } from './components/ToastContainer';
import { Layers, Shield, Terminal, BookOpen, Github } from 'lucide-react';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const { network } = useWeb3();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <DashboardView onSwitchTab={setActiveTab} />}
        {activeTab === 'vault' && <VaultView />}
        {activeTab === 'contracts' && <ContractsView />}
        {activeTab === 'escrow' && <EscrowView />}
        {activeTab === 'nfts' && <NFTView />}
        {activeTab === 'explorer' && <ExplorerView />}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Layers className="w-3 h-3" />
            </div>
            <span className="font-semibold text-slate-300">AetherWeb3 Blockchain Suite</span>
            <span>·</span>
            <span>Sepolia EVM Chain ID {network?.chainId || 11155111}</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('contracts')}
              className="hover:text-slate-300 transition-colors"
            >
              Verified Contracts
            </button>
            <button
              onClick={() => setActiveTab('explorer')}
              className="hover:text-slate-300 transition-colors"
            >
              On-Chain Explorer
            </button>
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="hover:text-slate-300 transition-colors"
            >
              Signer Console
            </button>
          </div>
        </div>
      </footer>

      {/* Wallet Management Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />

      {/* Global Transaction Toast Alerts */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <Web3Provider>
      <AppContent />
    </Web3Provider>
  );
}

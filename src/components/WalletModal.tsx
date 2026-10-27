import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { 
  X, 
  Key, 
  Wallet, 
  Copy, 
  Check, 
  RefreshCw, 
  Droplets, 
  ShieldCheck, 
  Eye, 
  EyeOff,
  Terminal
} from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { 
    account, 
    privateKey, 
    walletType, 
    connectInjectedWallet, 
    createSandboxWallet, 
    requestFaucetTokens,
    signMessage,
    isConnecting 
  } = useWeb3();

  const [copiedAddr, setCopiedAddr] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  // Signing playground state
  const [signInput, setSignInput] = useState('Verify identity for AetherWeb3 session at ' + new Date().toISOString());
  const [signatureResult, setSignatureResult] = useState<{ signature: string; verified: boolean; recoveredAddress: string } | null>(null);
  const [isSigning, setIsSigning] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, isAddr: boolean) => {
    navigator.clipboard.writeText(text);
    if (isAddr) {
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 2000);
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleSign = async () => {
    if (!signInput.trim()) return;
    setIsSigning(true);
    try {
      const res = await signMessage(signInput);
      setSignatureResult(res);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Wallet Management & Connectivity</h3>
              <p className="text-xs text-slate-400">Node.js Web3.js backend & browser provider bridge</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Active Provider Mode */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Choose Connection Method
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={createSandboxWallet}
                disabled={isConnecting}
                className={`p-4 rounded-xl border text-left transition-all ${
                  walletType === 'sandbox'
                    ? 'bg-cyan-950/40 border-cyan-500/80 ring-1 ring-cyan-500/50'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-white">Sandbox Dev Wallet</span>
                  <Key className="w-4 h-4 text-cyan-400" />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Generated via Web3.js backend. Pre-funded with test ETH & ATH.
                </p>
              </button>

              <button
                onClick={connectInjectedWallet}
                disabled={isConnecting}
                className={`p-4 rounded-xl border text-left transition-all ${
                  walletType === 'injected'
                    ? 'bg-indigo-950/40 border-indigo-500/80 ring-1 ring-indigo-500/50'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-white">Browser Extension</span>
                  <Wallet className="w-4 h-4 text-indigo-400" />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Connect MetaMask, Coinbase, Rabby or any EIP-1193 Web3 provider.
                </p>
              </button>
            </div>
          </div>

          {/* Current Keypair Details */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Public Address (EVM)</span>
              <span className="text-[11px] font-mono text-cyan-400">SECP256K1</span>
            </div>
            <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <code className="text-xs font-mono text-slate-200 truncate pr-2">
                {account || 'No account active'}
              </code>
              <button
                onClick={() => copyToClipboard(account, true)}
                className="p-1 text-slate-400 hover:text-white"
                title="Copy Address"
              >
                {copiedAddr ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Private Key (if available in sandbox mode) */}
            {privateKey && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Private Key (Sandbox Only)</span>
                  <button
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {showPrivateKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPrivateKey ? 'Hide' : 'Reveal'}</span>
                  </button>
                </div>
                <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <code className="text-xs font-mono text-slate-200 truncate pr-2">
                    {showPrivateKey ? privateKey : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                  </code>
                  <button
                    onClick={() => copyToClipboard(privateKey, false)}
                    className="p-1 text-slate-400 hover:text-white"
                    title="Copy Private Key"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={requestFaucetTokens}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900/60 border border-cyan-800/60 rounded-lg transition-colors"
              >
                <Droplets className="w-3.5 h-3.5" />
                Request +1.5 ETH & +250 ATH
              </button>
              <button
                onClick={createSandboxWallet}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Generate New Keypair
              </button>
            </div>
          </div>

          {/* Cryptographic Signature Playground */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-white">Cryptographic Message Signing & Verification</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">personal_sign</span>
            </div>

            <div>
              <textarea
                value={signInput}
                onChange={(e) => setSignInput(e.target.value)}
                rows={2}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
                placeholder="Enter plaintext message to sign with private key..."
              />
            </div>

            <button
              onClick={handleSign}
              disabled={isSigning || !account}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors font-sans"
            >
              <ShieldCheck className="w-4 h-4" />
              {isSigning ? 'Signing & Verifying...' : 'Sign Message with Active Key'}
            </button>

            {signatureResult && (
              <div className="mt-3 p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Verified on Node.js Web3.js
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Signature (ECDSA):</span>
                  <div className="p-1.5 bg-slate-950 rounded text-[11px] text-cyan-300 break-all border border-slate-800">
                    {signatureResult.signature}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Recovered Address:</span>
                  <div className="p-1.5 bg-slate-950 rounded text-[11px] text-slate-200 break-all border border-slate-800">
                    {signatureResult.recoveredAddress}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Web3.js v4.16 Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { EscrowAgreement } from '../types/web3';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Send, 
  AlertTriangle, 
  Scale, 
  ArrowRight,
  Shield,
  FileCheck
} from 'lucide-react';

export const EscrowView: React.FC = () => {
  const { 
    account, 
    balances, 
    executeContractCall, 
    executeContractTransaction, 
    isTransacting,
    refreshAll 
  } = useWeb3();

  const [agreements, setAgreements] = useState<EscrowAgreement[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sellerAddr, setSellerAddr] = useState('');
  const [milestoneDesc, setMilestoneDesc] = useState('Web3 Smart Contract Verification Deliverable');
  const [depositEth, setDepositEth] = useState('0.5');
  const [loading, setLoading] = useState(false);

  const fetchAgreements = async () => {
    try {
      setLoading(true);
      const res = await executeContractCall('omni-escrow', 'getAgreements', []);
      if (Array.isArray(res)) {
        setAgreements(res);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgreements();
  }, []);

  const handleCreateAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerAddr || !depositEth) return;

    try {
      await executeContractTransaction(
        'omni-escrow',
        'createAgreement',
        [sellerAddr, account, milestoneDesc],
        depositEth
      );
      setShowCreateModal(false);
      setSellerAddr('');
      fetchAgreements();
      refreshAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (agreementId: number) => {
    try {
      await executeContractTransaction('omni-escrow', 'approveMilestone', [agreementId]);
      fetchAgreements();
      refreshAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDispute = async (agreementId: number) => {
    try {
      await executeContractTransaction('omni-escrow', 'raiseDispute', [agreementId]);
      fetchAgreements();
      refreshAll();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1.5">
            <span>OMNIESCROW MULTISIG V2</span>
            <span aria-hidden="true">·</span>
            <span>TRUSTLESS MILESTONES</span>
            <span aria-hidden="true">·</span>
            <span>ARBITRATION ENGINE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Decentralized Milestone Escrow
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Lock native ETH in escrow smart contracts with multi-party cryptographic release, buyer satisfaction proofs, and decentralized dispute settlement.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Escrow Deal
        </button>
      </div>

      {/* Escrow Agreements Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">Active Milestone Agreements</h3>
          <span className="text-xs text-slate-400 font-mono">
            {agreements.length} Total Contracts
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {agreements.map((item) => {
            const isCompleted = item.state === 'Completed';
            const isDisputed = item.state === 'Disputed';
            const isFunded = item.state === 'Funded';

            return (
              <div
                key={item.id}
                className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                      Escrow #{item.id}
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {item.milestoneDescription}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : isDisputed
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                      }`}
                    >
                      {item.state}
                    </span>
                    <span className="font-mono font-bold text-sm text-white">
                      {item.amount} ETH
                    </span>
                  </div>
                </div>

                {/* Parties Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 space-y-1">
                    <span className="text-slate-500 font-sans block text-[11px]">Buyer (Depositor)</span>
                    <span className="text-slate-200 truncate block">
                      {item.buyer.slice(0, 10)}...{item.buyer.slice(-6)}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-sans">
                      Approval: {item.buyerApproved ? 'Signed (Approved)' : 'Pending'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 space-y-1">
                    <span className="text-slate-500 font-sans block text-[11px]">Seller (Recipient)</span>
                    <span className="text-slate-200 truncate block">
                      {item.seller.slice(0, 10)}...{item.seller.slice(-6)}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-sans">
                      Approval: {item.sellerApproved ? 'Signed (Delivered)' : 'Pending'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 space-y-1">
                    <span className="text-slate-500 font-sans block text-[11px]">Arbiter (Resolver)</span>
                    <span className="text-slate-200 truncate block">
                      {item.arbiter.slice(0, 10)}...{item.arbiter.slice(-6)}
                    </span>
                    <span className="text-[10px] text-emerald-400 block font-sans">
                      Autonomous Arbiter
                    </span>
                  </div>
                </div>

                {/* Action Toolbar */}
                {!isCompleted && (
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/60">
                    <div className="text-xs text-slate-400">
                      Requires dual confirmation to disburse {item.amount} ETH to seller.
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDispute(item.id)}
                        disabled={isTransacting || isDisputed}
                        className="px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/60 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Raise Dispute
                      </button>

                      <button
                        onClick={() => handleApprove(item.id)}
                        disabled={isTransacting}
                        className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Sign Milestone Approval
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Agreement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Create New Escrow Agreement</h3>
                <p className="text-xs text-slate-400">Lock native ETH in conditional trustless escrow</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateAgreement} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Seller / Beneficiary Address
                </label>
                <input
                  type="text"
                  value={sellerAddr}
                  onChange={(e) => setSellerAddr(e.target.value)}
                  placeholder="0x2546BcD3c84621e976D8185a91A922aE77ECEc30"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Milestone Specification
                </label>
                <input
                  type="text"
                  value={milestoneDesc}
                  onChange={(e) => setMilestoneDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-300">Escrow Value (ETH)</label>
                  <span className="text-xs text-slate-400 font-mono">
                    Balance: {balances?.ethBalance || '0'} ETH
                  </span>
                </div>
                <input
                  type="number"
                  step="any"
                  value={depositEth}
                  onChange={(e) => setDepositEth(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTransacting}
                  className="px-5 py-2 rounded-lg text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isTransacting ? 'Depositing...' : 'Deposit & Fund Escrow'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

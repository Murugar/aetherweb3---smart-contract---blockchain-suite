import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { BlockchainTransaction, BlockRecord } from '../types/web3';
import { 
  Boxes, 
  ArrowRightLeft, 
  ExternalLink, 
  Copy, 
  Check, 
  Search, 
  CheckCircle2, 
  Clock, 
  Layers, 
  X,
  FileText
} from 'lucide-react';

export const ExplorerView: React.FC = () => {
  const { blocks, transactions, network } = useWeb3();
  const [activeTab, setActiveTab] = useState<'txs' | 'blocks'>('txs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState<BlockchainTransaction | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  const filteredTransactions = transactions.filter(tx => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      tx.hash.toLowerCase().includes(q) ||
      tx.from.toLowerCase().includes(q) ||
      tx.to.toLowerCase().includes(q) ||
      (tx.methodName && tx.methodName.toLowerCase().includes(q))
    );
  });

  const filteredBlocks = blocks.filter(b => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return b.hash.toLowerCase().includes(q) || b.number.toString().includes(q);
  });

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1.5">
            <span>SEPOLIA EVM ON-CHAIN LEDGER</span>
            <span aria-hidden="true">·</span>
            <span>REAL-TIME BLOCK MONITOR</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Blockchain Ledger & Transaction Explorer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Audit confirmed blocks, verified transactions, gas consumption, and emitted event logs.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
            <span className="text-slate-500">Block:</span> #{network?.blockNumber || '19842580'}
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
            <span className="text-slate-500">Gas:</span> {network?.gasPriceGwei || '15.4'} Gwei
          </div>
        </div>
      </div>

      {/* Search & Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('txs')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'txs'
                ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Transactions ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab('blocks')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'blocks'
                ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            Mined Blocks ({blocks.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hash, address, block..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Transactions Table */}
      {activeTab === 'txs' && (
        <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-medium">Tx Hash</th>
                  <th className="py-3 px-4 font-medium">Method</th>
                  <th className="py-3 px-4 font-medium">Block</th>
                  <th className="py-3 px-4 font-medium">From</th>
                  <th className="py-3 px-4 font-medium">To</th>
                  <th className="py-3 px-4 font-medium text-right">Value</th>
                  <th className="py-3 px-4 font-medium text-right">Gas Used</th>
                  <th className="py-3 px-4 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredTransactions.map((tx) => (
                  <tr
                    key={tx.hash}
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 text-cyan-400 font-medium">
                      {tx.hash.slice(0, 10)}...{tx.hash.slice(-6)}
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-sans font-medium">
                      <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
                        {tx.methodName || 'Contract Call'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">#{tx.blockNumber}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {tx.to ? `${tx.to.slice(0, 6)}...${tx.to.slice(-4)}` : 'Deploy'}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-200 tabular-nums">
                      {tx.value !== '0' ? `${tx.value} ETH` : '0 ETH'}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 tabular-nums">
                      {tx.gasUsed.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <span className="text-emerald-400 font-medium flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Blocks Table */}
      {activeTab === 'blocks' && (
        <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-medium">Block Height</th>
                  <th className="py-3 px-4 font-medium">Block Hash</th>
                  <th className="py-3 px-4 font-medium">Miner / Validator</th>
                  <th className="py-3 px-4 font-medium text-center">Txns</th>
                  <th className="py-3 px-4 font-medium text-right">Gas Used / Limit</th>
                  <th className="py-3 px-4 font-medium text-right">Base Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredBlocks.map((b) => (
                  <tr key={b.number} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 text-cyan-400 font-bold">#{b.number}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {b.hash.slice(0, 12)}...{b.hash.slice(-8)}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {b.miner.slice(0, 8)}...{b.miner.slice(-6)}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-200">{b.txCount}</td>
                    <td className="py-3 px-4 text-right text-slate-400 tabular-nums">
                      {(b.gasUsed / 1000000).toFixed(2)}M / 30M
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300 tabular-nums">
                      {b.baseFeeGwei} Gwei
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Transaction Details</h3>
              </div>
              <button onClick={() => setSelectedTx(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-slate-500 font-sans">Transaction Hash:</span>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400">{selectedTx.hash}</span>
                  <button onClick={() => copyText(selectedTx.hash)} className="text-slate-400 hover:text-white">
                    {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-500 font-sans block text-[11px] mb-1">Status</span>
                  <span className="text-emerald-400 font-bold font-sans">Confirmed (Included in Block)</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-500 font-sans block text-[11px] mb-1">Block Number</span>
                  <span className="text-white font-bold">#{selectedTx.blockNumber}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">From Sender:</span>
                  <span className="text-slate-200">{selectedTx.from}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">To Contract:</span>
                  <span className="text-slate-200">{selectedTx.to}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Method Executed:</span>
                  <span className="text-cyan-400 font-bold">{selectedTx.methodName || 'transfer'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Gas Used:</span>
                  <span className="text-slate-200">{selectedTx.gasUsed.toLocaleString()} units</span>
                </div>
              </div>

              {/* Event Logs */}
              {selectedTx.logs && selectedTx.logs.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-xs font-semibold font-sans text-slate-300">
                    Decoded Event Logs ({selectedTx.logs.length})
                  </span>
                  {selectedTx.logs.map((log, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                      <div className="text-emerald-400 font-bold">event {log.event}</div>
                      <pre className="text-[11px] text-slate-300 overflow-x-auto">
                        {JSON.stringify(log.decodedArgs, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

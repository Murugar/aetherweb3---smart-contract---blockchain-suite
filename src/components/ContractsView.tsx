import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { SmartContract } from '../types/web3';
import { 
  Code2, 
  Play, 
  FileCode, 
  Copy, 
  Check, 
  ExternalLink, 
  Layers, 
  Plus, 
  Terminal, 
  Flame,
  Cpu,
  Search
} from 'lucide-react';

export const ContractsView: React.FC = () => {
  const { 
    contracts, 
    account, 
    executeContractCall, 
    executeContractTransaction, 
    deployCustomContract, 
    isTransacting 
  } = useWeb3();

  const [selectedContractId, setSelectedContractId] = useState<string>(contracts[0]?.id || 'aether-token');
  const [activeTab, setActiveTab] = useState<'methods' | 'source' | 'abi'>('methods');
  const [methodSearch, setMethodSearch] = useState('');
  
  // Method input arguments state: { [methodName]: string[] }
  const [methodInputs, setMethodInputs] = useState<Record<string, string[]>>({});
  const [callResults, setCallResults] = useState<Record<string, any>>({});
  const [runningMethod, setRunningMethod] = useState<string | null>(null);

  // Deploy custom contract modal state
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [newContractName, setNewContractName] = useState('PaymentSplitter');
  const [newContractCategory, setNewContractCategory] = useState('Payment Protocol');
  const [newContractSource, setNewContractSource] = useState(`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PaymentSplitter {
    address[] public payees;
    uint256[] public shares;
    uint256 public totalShares;

    event PaymentReleased(address to, uint256 amount);

    constructor() {
        payees.push(msg.sender);
        shares.push(100);
        totalShares = 100;
    }

    function release(address payable account) public {
        uint256 payment = address(this).balance;
        account.transfer(payment);
        emit PaymentReleased(account, payment);
    }
}`);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedAddr, setCopiedAddr] = useState(false);

  const selectedContract = contracts.find(c => c.id === selectedContractId) || contracts[0];

  const handleInputChange = (methodName: string, argIndex: number, value: string) => {
    setMethodInputs(prev => {
      const current = prev[methodName] ? [...prev[methodName]] : [];
      current[argIndex] = value;
      return { ...prev, [methodName]: current };
    });
  };

  const handleExecute = async (fn: any) => {
    if (!selectedContract) return;
    const methodName = fn.name;
    const inputs = methodInputs[methodName] || [];
    const isView = fn.stateMutability === 'view' || fn.stateMutability === 'pure';

    setRunningMethod(methodName);
    try {
      if (isView) {
        const res = await executeContractCall(selectedContract.id, methodName, inputs);
        setCallResults(prev => ({ ...prev, [methodName]: { success: true, data: res, timestamp: Date.now() } }));
      } else {
        const res = await executeContractTransaction(selectedContract.id, methodName, inputs);
        setCallResults(prev => ({ ...prev, [methodName]: { success: true, data: res, timestamp: Date.now() } }));
      }
    } catch (err: any) {
      setCallResults(prev => ({ ...prev, [methodName]: { success: false, error: err.message, timestamp: Date.now() } }));
    } finally {
      setRunningMethod(null);
    }
  };

  const handleDeployNew = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Generate synthetic ABI for custom contract
      const syntheticAbi = [
        { type: 'function', name: 'release', inputs: [{ name: 'account', type: 'address' }], outputs: [], stateMutability: 'nonpayable' },
        { type: 'function', name: 'totalShares', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' }
      ];
      await deployCustomContract(newContractName, newContractCategory, newContractSource, syntheticAbi);
      setShowDeployModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text: string, isCode: boolean) => {
    navigator.clipboard.writeText(text);
    if (isCode) {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 2000);
    }
  };

  const filteredFunctions = (selectedContract?.abi || []).filter(item => {
    if (item.type !== 'function') return false;
    if (!methodSearch) return true;
    return item.name?.toLowerCase().includes(methodSearch.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1.5">
            <span>WEB3.JS SMART CONTRACT STUDIO</span>
            <span aria-hidden="true">·</span>
            <span>EVM BYTECODE & ABI</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Smart Contract Inspector & Execution IDE
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Call on-chain read queries or sign state-mutating transactions directly through Web3.js backend connectivity.
          </p>
        </div>

        <button
          onClick={() => setShowDeployModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Deploy New Contract
        </button>
      </div>

      {/* Contract Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {contracts.map(c => {
          const isSelected = c.id === selectedContractId;
          return (
            <button
              key={c.id}
              onClick={() => {
                setSelectedContractId(c.id);
                setCallResults({});
              }}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap border transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-slate-800 text-cyan-400 border-cyan-500/50 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>{c.name}</span>
              {c.symbol && <span className="text-[11px] font-mono text-slate-500">({c.symbol})</span>}
            </button>
          );
        })}
      </div>

      {/* Active Contract Details Bar */}
      {selectedContract && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-bold text-white">{selectedContract.name}</h3>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-800/80">
                {selectedContract.category}
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">{selectedContract.description}</p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
              <span className="text-slate-500">Address:</span>
              <span className="text-slate-200">{selectedContract.address.slice(0, 10)}...{selectedContract.address.slice(-6)}</span>
              <button
                onClick={() => copyToClipboard(selectedContract.address, false)}
                className="text-slate-400 hover:text-white p-0.5"
                title="Copy Address"
              >
                {copiedAddr ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>

            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 hidden sm:block">
              Solidity {selectedContract.solidityVersion}
            </div>
          </div>
        </div>
      )}

      {/* Mode Navigation: Methods vs Source vs ABI */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('methods')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'methods'
                ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            ABI Method Execution ({filteredFunctions.length})
          </button>
          <button
            onClick={() => setActiveTab('source')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'source'
                ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Solidity Source Code
          </button>
          <button
            onClick={() => setActiveTab('abi')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'abi'
                ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Raw ABI JSON
          </button>
        </div>

        {activeTab === 'methods' && (
          <div className="relative w-48 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={methodSearch}
              onChange={(e) => setMethodSearch(e.target.value)}
              placeholder="Filter methods..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>
        )}
      </div>

      {/* Main Content Pane */}
      {selectedContract && activeTab === 'methods' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredFunctions.map((fn: any) => {
            const isView = fn.stateMutability === 'view' || fn.stateMutability === 'pure';
            const methodName = fn.name;
            const result = callResults[methodName];
            const isExecuting = runningMethod === methodName;

            return (
              <div
                key={methodName}
                className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">
                        {methodName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        ({(fn.inputs || []).map((inp: any) => `${inp.type} ${inp.name}`).join(', ')})
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${
                        isView
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                          : 'bg-indigo-950 text-indigo-400 border border-indigo-800/60'
                      }`}
                    >
                      {isView ? 'READ (FREE)' : 'WRITE (TX)'}
                    </span>
                  </div>

                  {/* Input Arguments Fields */}
                  {fn.inputs && fn.inputs.length > 0 && (
                    <div className="space-y-2 pt-2">
                      {fn.inputs.map((inp: any, idx: number) => (
                        <div key={idx} className="space-y-1">
                          <label className="text-[11px] font-mono text-slate-400 flex justify-between">
                            <span>{inp.name || `param_${idx}`} ({inp.type})</span>
                          </label>
                          <input
                            type="text"
                            value={(methodInputs[methodName] && methodInputs[methodName][idx]) || ''}
                            onChange={(e) => handleInputChange(methodName, idx, e.target.value)}
                            placeholder={inp.type.includes('address') ? (account || '0x...') : inp.type.includes('uint') ? '100' : 'value'}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-700 focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/60">
                  <button
                    onClick={() => handleExecute(fn)}
                    disabled={isExecuting || isTransacting}
                    className={`w-full py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      isView
                        ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                        : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold'
                    } disabled:opacity-50`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    {isExecuting ? 'Processing...' : isView ? 'Query State' : 'Submit Transaction'}
                  </button>

                  {/* Result Box */}
                  {result && (
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono">
                      <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                        <span>Response:</span>
                        <span className={result.success ? 'text-emerald-400' : 'text-rose-400'}>
                          {result.success ? 'Success' : 'Error'}
                        </span>
                      </div>
                      <div className="text-slate-200 max-h-32 overflow-y-auto break-all">
                        {result.success 
                          ? typeof result.data === 'object'
                            ? JSON.stringify(result.data, null, 2)
                            : String(result.data)
                          : result.error
                        }
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Solidity Source View */}
      {selectedContract && activeTab === 'source' && (
        <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-slate-950 border-b border-slate-800 text-xs">
            <span className="font-mono text-slate-400">
              {selectedContract.name}.sol
            </span>
            <button
              onClick={() => copyToClipboard(selectedContract.sourceCode, true)}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy Source'}</span>
            </button>
          </div>
          <pre className="p-5 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed max-h-[500px]">
            {selectedContract.sourceCode}
          </pre>
        </div>
      )}

      {/* Raw ABI View */}
      {selectedContract && activeTab === 'abi' && (
        <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-slate-950 border-b border-slate-800 text-xs">
            <span className="font-mono text-slate-400">
              Contract Application Binary Interface (ABI)
            </span>
            <button
              onClick={() => copyToClipboard(JSON.stringify(selectedContract.abi, null, 2), true)}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy ABI</span>
            </button>
          </div>
          <pre className="p-5 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed max-h-[500px]">
            {JSON.stringify(selectedContract.abi, null, 2)}
          </pre>
        </div>
      )}

      {/* Deploy Custom Contract Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Deploy Custom Smart Contract</h3>
                <p className="text-xs text-slate-400">Compile and deploy arbitrary Solidity contracts to Sepolia EVM</p>
              </div>
              <button onClick={() => setShowDeployModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleDeployNew} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Contract Name</label>
                  <input
                    type="text"
                    value={newContractName}
                    onChange={(e) => setNewContractName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Category / Type</label>
                  <input
                    type="text"
                    value={newContractCategory}
                    onChange={(e) => setNewContractCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-sans text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Solidity Code (v0.8.20)</label>
                <textarea
                  value={newContractSource}
                  onChange={(e) => setNewContractSource(e.target.value)}
                  rows={10}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeployModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTransacting}
                  className="px-5 py-2 rounded-lg text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {isTransacting ? 'Deploying...' : 'Deploy to Blockchain'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

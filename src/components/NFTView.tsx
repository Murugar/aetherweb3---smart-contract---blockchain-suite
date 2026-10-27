import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { NFTItem } from '../types/web3';
import { 
  Sparkles, 
  ExternalLink, 
  Check, 
  Copy, 
  Layers, 
  ShieldCheck, 
  Plus,
  Coins
} from 'lucide-react';

const ARTIFACT_PRESETS = [
  {
    name: 'Aether Prism #001',
    rarity: 'Mythic',
    image: '/src/assets/images/nft_genesis_prism_1793080527683.jpg',
    uri: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/1.json',
    description: 'Hyper-dense crystalline polyhedral prism refracting cryptographic zero-knowledge wavelengths.'
  },
  {
    name: 'Chronos Relic #002',
    rarity: 'Legendary',
    image: '/src/assets/images/nft_chronos_relic_1793080529448.jpg',
    uri: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/2.json',
    description: 'Precision celestial astrolabe with concentric orbital rings maintaining temporal consensus.'
  },
  {
    name: 'Orb of Equilibrium #003',
    rarity: 'Rare',
    image: '/src/assets/images/nft_equilibrium_orb_1793080529097.jpg',
    uri: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/3.json',
    description: 'Quantum levitating sphere encased in smoked obsidian glass with luminous plasma filaments.'
  }
];

export const NFTView: React.FC = () => {
  const { 
    account, 
    balances, 
    executeContractCall, 
    executeContractTransaction, 
    isTransacting,
    refreshAll 
  } = useWeb3();

  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [selectedPreset, setSelectedPreset] = useState(0);

  const fetchNFTs = async () => {
    try {
      const res = await executeContractCall('genesis-nft', 'getAllNFTs', []);
      if (Array.isArray(res)) {
        setNfts(res);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNFTs();
  }, []);

  const handleMint = async () => {
    try {
      const preset = ARTIFACT_PRESETS[selectedPreset];
      await executeContractTransaction('genesis-nft', 'mint', [preset.uri], '0.05');
      fetchNFTs();
      refreshAll();
    } catch (err) {
      console.error(err);
    }
  };

  const getImageForToken = (tokenId: number) => {
    if (tokenId === 1) return '/src/assets/images/nft_genesis_prism_1793080527683.jpg';
    if (tokenId === 2) return '/src/assets/images/nft_chronos_relic_1793080529448.jpg';
    if (tokenId === 3) return '/src/assets/images/nft_equilibrium_orb_1793080529097.jpg';
    return ARTIFACT_PRESETS[(tokenId - 1) % ARTIFACT_PRESETS.length].image;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/40 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400 mb-1.5">
            <span>GENESIS ARTIFACTS COLLECTION</span>
            <span aria-hidden="true">·</span>
            <span>ERC-721 SMART CONTRACT</span>
            <span aria-hidden="true">·</span>
            <span>IPFS METADATA</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Cryptographic Digital Artifacts
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Immutable non-fungible tokens minted directly to the Ethereum Sepolia blockchain with verifiable on-chain ownership records.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-right">
            <div className="text-xs text-slate-400">Mint Fee</div>
            <div className="text-xl font-bold font-mono text-purple-400">0.05 ETH</div>
            <div className="text-[11px] text-slate-500 font-mono">Max Supply: 5,000</div>
          </div>
        </div>
      </div>

      {/* Minting Terminal & Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Minting Form Card (1 col) */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Mint New Artifact</h3>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-medium text-slate-300 block">
              Choose Artifact Archetype
            </label>
            <div className="space-y-2">
              {ARTIFACT_PRESETS.map((preset, idx) => (
                <button
                  key={preset.name}
                  onClick={() => setSelectedPreset(idx)}
                  className={`w-full p-3 rounded-lg border text-left transition-all flex items-center gap-3 ${
                    selectedPreset === idx
                      ? 'bg-purple-950/50 border-purple-500/80 ring-1 ring-purple-500/50'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <img
                    src={preset.image}
                    alt={preset.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-md object-cover border border-slate-800"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{preset.name}</div>
                    <div className="text-[11px] text-purple-400">{preset.rarity} Tier</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Smart Contract:</span>
              <span className="font-mono text-slate-200">GenesisArtifacts.sol</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Required Gas:</span>
              <span className="font-mono text-slate-200">~89,000 units</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Cost:</span>
              <span className="font-mono text-purple-400 font-medium">0.05 ETH</span>
            </div>
          </div>

          <button
            onClick={handleMint}
            disabled={isTransacting}
            className="w-full py-2.5 px-4 text-xs font-semibold text-slate-950 bg-purple-400 hover:bg-purple-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {isTransacting ? 'Minting on Chain...' : 'Mint Selected Artifact (0.05 ETH)'}
          </button>
        </div>

        {/* Minted Artifacts Grid (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Minted Artifacts Ledger</h3>
            <span className="text-xs text-slate-400 font-mono">
              {nfts.length} Minted Tokens
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {nfts.map((nft) => {
              const isOwner = account && nft.owner.toLowerCase() === account.toLowerCase();
              const imgUrl = getImageForToken(nft.tokenId);

              return (
                <div
                  key={nft.tokenId}
                  className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all group"
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-950">
                    <img
                      src={imgUrl}
                      alt={nft.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-950/80 backdrop-blur-md text-purple-300 border border-purple-500/30">
                        {nft.rarity}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">{nft.name}</h4>
                      <span className="text-xs font-mono text-cyan-400">#{nft.tokenId}</span>
                    </div>

                    <div className="space-y-1 text-xs font-mono">
                      <div className="flex justify-between text-slate-400">
                        <span>Owner:</span>
                        <span className="text-slate-200">
                          {isOwner ? (
                            <span className="text-emerald-400 font-sans font-semibold">You</span>
                          ) : (
                            `${nft.owner.slice(0, 6)}...${nft.owner.slice(-4)}`
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>URI:</span>
                        <span className="text-slate-500 truncate max-w-[140px]">{nft.tokenURI}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export interface NetworkInfo {
  chainId: number;
  chainName: string;
  blockNumber: number;
  gasPriceGwei: string;
  baseFeeGwei: string;
  peerCount: number;
  treasuryAddress: string;
  treasuryEth: string;
  totalContracts: number;
}

export interface WalletBalances {
  address: string;
  ethBalance: string;
  athBalance: string;
  stakedAthBalance: string;
  pendingRewardsAth: string;
  nftCount: number;
  nfts: NFTItem[];
}

export interface SmartContract {
  id: string;
  name: string;
  symbol?: string;
  category: 'ERC-20 Token' | 'DeFi Vault' | 'MultiSig Escrow' | 'ERC-721 NFT' | string;
  address: string;
  deployedAtBlock: number;
  solidityVersion: string;
  description: string;
  sourceCode: string;
  abi: Array<{
    type: 'function' | 'event' | 'constructor';
    name?: string;
    inputs?: Array<{ name: string; type: string; indexed?: boolean }>;
    outputs?: Array<{ name: string; type: string }>;
    stateMutability?: 'pure' | 'view' | 'nonpayable' | 'payable';
    anonymous?: boolean;
  }>;
}

export interface BlockchainTransaction {
  hash: string;
  blockNumber: number;
  from: string;
  to: string;
  value: string;
  gasUsed: number;
  gasPriceGwei: string;
  timestamp: number;
  status: 'confirmed' | 'failed';
  methodName?: string;
  contractId?: string;
  contractAddress?: string;
  logs: Array<{
    event: string;
    topics: string[];
    data: string;
    decodedArgs: Record<string, any>;
  }>;
}

export interface BlockRecord {
  number: number;
  hash: string;
  parentHash: string;
  timestamp: number;
  miner: string;
  txCount: number;
  gasUsed: number;
  gasLimit: number;
  baseFeeGwei: string;
}

export interface EscrowAgreement {
  id: number;
  buyer: string;
  seller: string;
  arbiter: string;
  amount: string;
  milestoneDescription: string;
  state: 'AwaitingDeposit' | 'Funded' | 'Completed' | 'Disputed' | 'Refunded';
  buyerApproved: boolean;
  sellerApproved: boolean;
  createdAt: number;
}

export interface NFTItem {
  tokenId: number;
  owner: string;
  tokenURI: string;
  name: string;
  rarity: 'Common' | 'Rare' | 'Legendary' | 'Mythic';
  mintedAt: number;
}

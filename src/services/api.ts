import { 
  NetworkInfo, 
  WalletBalances, 
  SmartContract, 
  BlockchainTransaction, 
  BlockRecord 
} from '../types/web3';

const BASE_URL = '';

export async function fetchNetworkInfo(): Promise<NetworkInfo> {
  const res = await fetch(`${BASE_URL}/api/network`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch network');
  return data.data;
}

export async function fetchWalletBalances(address: string): Promise<WalletBalances> {
  const res = await fetch(`${BASE_URL}/api/wallet/balance/${address}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch balance');
  return data.data;
}

export async function createDevAccount(): Promise<{
  address: string;
  privateKey: string;
  ethBalance: string;
  athBalance: string;
}> {
  const res = await fetch(`${BASE_URL}/api/wallet/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to create account');
  return data.data;
}

export async function requestFaucet(recipient: string, ethAmount: string = '1.5', athAmount: string = '250') {
  const res = await fetch(`${BASE_URL}/api/wallet/faucet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipient, ethAmount, athAmount })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Faucet request failed');
  return data.data;
}

export async function verifySignature(message: string, signature: string, expectedAddress?: string) {
  const res = await fetch(`${BASE_URL}/api/wallet/verify-signature`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, signature, expectedAddress })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Signature verification failed');
  return data.data;
}

export async function fetchContracts(): Promise<SmartContract[]> {
  const res = await fetch(`${BASE_URL}/api/contracts`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch contracts');
  return data.data;
}

export async function callContractMethod(contractId: string, method: string, params: any[] = [], caller?: string) {
  const res = await fetch(`${BASE_URL}/api/contracts/call`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contractId, method, params, caller })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Contract call failed');
  return data.data;
}

export async function executeContractTransaction(payload: {
  contractId: string;
  method: string;
  params: any[];
  sender: string;
  valueEth?: string;
}) {
  const res = await fetch(`${BASE_URL}/api/contracts/transact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Transaction failed');
  return data.data;
}

export async function deployContract(payload: {
  name: string;
  category: string;
  sourceCode: string;
  abi: any[];
  initialParams?: any[];
  deployer: string;
}) {
  const res = await fetch(`${BASE_URL}/api/contracts/deploy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Contract deployment failed');
  return data.data;
}

export async function fetchTransactions(): Promise<BlockchainTransaction[]> {
  const res = await fetch(`${BASE_URL}/api/transactions`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch transactions');
  return data.data;
}

export async function fetchBlocks(): Promise<BlockRecord[]> {
  const res = await fetch(`${BASE_URL}/api/blocks`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch blocks');
  return data.data;
}

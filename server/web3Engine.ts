import { Web3 } from 'web3';
import { SMART_CONTRACTS, SmartContractDefinition } from './contractsData.js';

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

export interface EscrowItem {
  id: number;
  buyer: string;
  seller: string;
  arbiter: string;
  amount: string; // ETH
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

class Web3Engine {
  public web3: Web3;
  public chainId: number = 11155111; // Sepolia EVM Testnet compatible
  public currentBlockNumber: number = 19842580;
  public treasuryAccount: { address: string; privateKey: string };
  
  // State storage for contracts
  private tokenBalances: Map<string, bigint> = new Map();
  private tokenAllowances: Map<string, Map<string, bigint>> = new Map();
  private tokenTotalSupply: bigint = BigInt('5000000000000000000000000'); // 5M ATH initially
  
  // Vault state
  private vaultStakes: Map<string, { amount: bigint; rewardDebt: bigint; lastStakeTimestamp: number }> = new Map();
  private vaultTotalStaked: bigint = BigInt('125000000000000000000000'); // 125,000 ATH initially staked
  
  // Escrow state
  private escrowAgreements: Map<number, EscrowItem> = new Map();
  private escrowCounter: number = 2;
  
  // NFT state
  private nfts: Map<number, NFTItem> = new Map();
  private nextNftId: number = 4;

  // Native ETH balances (in Wei)
  private ethBalances: Map<string, bigint> = new Map();

  // On-chain logs
  public transactions: BlockchainTransaction[] = [];
  public blocks: BlockRecord[] = [];
  public customContracts: SmartContractDefinition[] = [];

  constructor() {
    this.web3 = new Web3();
    
    // Create master relayer / treasury wallet using web3
    const createdAccount = this.web3.eth.accounts.create();
    this.treasuryAccount = {
      address: createdAccount.address,
      privateKey: createdAccount.privateKey
    };

    // Fund treasury with native ETH and initial ATH
    this.ethBalances.set(this.treasuryAccount.address.toLowerCase(), BigInt('10000000000000000000000')); // 10,000 ETH
    this.tokenBalances.set(this.treasuryAccount.address.toLowerCase(), BigInt('4875000000000000000000000'));

    // Seed some initial escrow agreements
    this.escrowAgreements.set(1, {
      id: 1,
      buyer: '0x71C95911E9A5D330f4D621842EC243EE1343292e',
      seller: '0x2546BcD3c84621e976D8185a91A922aE77ECEc30',
      arbiter: this.treasuryAccount.address,
      amount: '1.25',
      milestoneDescription: 'Smart Contract Audit & Formal Verification Deliverable',
      state: 'Funded',
      buyerApproved: true,
      sellerApproved: false,
      createdAt: Date.now() - 3600000 * 24
    });

    this.escrowAgreements.set(2, {
      id: 2,
      buyer: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      seller: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
      arbiter: this.treasuryAccount.address,
      amount: '0.80',
      milestoneDescription: 'Zero-Knowledge Proof Circuit Prover Node Infrastructure',
      state: 'Completed',
      buyerApproved: true,
      sellerApproved: true,
      createdAt: Date.now() - 3600000 * 48
    });

    // Seed initial NFTs
    this.nfts.set(1, {
      tokenId: 1,
      owner: '0x71C95911E9A5D330f4D621842EC243EE1343292e',
      tokenURI: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/1.json',
      name: 'Aether Prism #001',
      rarity: 'Mythic',
      mintedAt: Date.now() - 3600000 * 120
    });
    this.nfts.set(2, {
      tokenId: 2,
      owner: this.treasuryAccount.address,
      tokenURI: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/2.json',
      name: 'Chronos Relic #002',
      rarity: 'Legendary',
      mintedAt: Date.now() - 3600000 * 96
    });
    this.nfts.set(3, {
      tokenId: 3,
      owner: '0x2546BcD3c84621e976D8185a91A922aE77ECEc30',
      tokenURI: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/3.json',
      name: 'Orb of Equilibrium #003',
      rarity: 'Rare',
      mintedAt: Date.now() - 3600000 * 40
    });

    // Generate recent historical blocks and transactions
    this.generateGenesisBlocks();
  }

  private generateGenesisBlocks() {
    let parentHash = '0x1a8f9c2e0b5d7a4f3e6c8b1d9a2f4e6c8b0d2a4f6e8b0d2a4f6e8b0d2a4f6e8b';
    for (let i = 5; i >= 0; i--) {
      const blockNum = this.currentBlockNumber - i;
      const hash = this.web3.utils.sha3(`block_${blockNum}_${Date.now()}`) || '0x' + Math.random().toString(16).substring(2);
      this.blocks.push({
        number: blockNum,
        hash,
        parentHash,
        timestamp: Date.now() - i * 12000,
        miner: this.treasuryAccount.address,
        txCount: Math.floor(Math.random() * 8) + 1,
        gasUsed: 4200000 + Math.floor(Math.random() * 2000000),
        gasLimit: 30000000,
        baseFeeGwei: '14.2'
      });
      parentHash = hash;
    }

    // Seed recent transactions
    this.transactions.push({
      hash: this.web3.utils.sha3('tx_contract_deploy_1') || '0x4f8a...1',
      blockNumber: this.currentBlockNumber - 5,
      from: this.treasuryAccount.address,
      to: SMART_CONTRACTS[0].address,
      value: '0',
      gasUsed: 1250420,
      gasPriceGwei: '16.5',
      timestamp: Date.now() - 60000,
      status: 'confirmed',
      methodName: 'deployContract',
      contractId: 'aether-token',
      contractAddress: SMART_CONTRACTS[0].address,
      logs: [{
        event: 'Mint',
        topics: [this.web3.utils.sha3('Mint(address,uint256)') || '0x'],
        data: '0x000000000000000000000000' + this.treasuryAccount.address.slice(2),
        decodedArgs: { to: this.treasuryAccount.address, amount: '5000000000000000000000000' }
      }]
    });
  }

  public getNetworkInfo() {
    return {
      chainId: this.chainId,
      chainName: 'Ethereum Sepolia Testnet (Web3 Engine)',
      blockNumber: this.currentBlockNumber,
      gasPriceGwei: '15.4',
      baseFeeGwei: '14.2',
      peerCount: 38,
      treasuryAddress: this.treasuryAccount.address,
      treasuryEth: this.web3.utils.fromWei(this.ethBalances.get(this.treasuryAccount.address.toLowerCase())?.toString() || '0', 'ether'),
      totalContracts: SMART_CONTRACTS.length + this.customContracts.length
    };
  }

  public getWalletBalances(address: string) {
    const norm = address.toLowerCase();
    const ethWei = this.ethBalances.get(norm) || BigInt('0');
    const athWei = this.tokenBalances.get(norm) || BigInt('0');
    
    // Check staking
    const stakeInfo = this.vaultStakes.get(norm);
    const stakedWei = stakeInfo ? stakeInfo.amount : BigInt('0');
    
    // Calculate pending rewards
    let pendingRewardWei = BigInt('0');
    if (stakeInfo && stakeInfo.amount > 0) {
      const durationSeconds = Math.max(1, Math.floor((Date.now() - stakeInfo.lastStakeTimestamp) / 1000));
      // 14.8% APR = 1480 / 10000
      const annual = (stakeInfo.amount * BigInt(1480)) / BigInt(10000);
      const earned = (annual * BigInt(durationSeconds)) / BigInt(31536000);
      pendingRewardWei = earned + stakeInfo.rewardDebt;
    }

    // Check NFTs owned
    const ownedNfts = Array.from(this.nfts.values()).filter(nft => nft.owner.toLowerCase() === norm);

    return {
      address,
      ethBalance: this.web3.utils.fromWei(ethWei.toString(), 'ether'),
      athBalance: this.web3.utils.fromWei(athWei.toString(), 'ether'),
      stakedAthBalance: this.web3.utils.fromWei(stakedWei.toString(), 'ether'),
      pendingRewardsAth: this.web3.utils.fromWei(pendingRewardWei.toString(), 'ether'),
      nftCount: ownedNfts.length,
      nfts: ownedNfts
    };
  }

  public createDevAccount() {
    const account = this.web3.eth.accounts.create();
    const norm = account.address.toLowerCase();
    
    // Pre-fund dev accounts with 2.5 test ETH and 500 ATH
    this.ethBalances.set(norm, BigInt('2500000000000000000')); // 2.5 ETH
    this.tokenBalances.set(norm, BigInt('500000000000000000000')); // 500 ATH
    
    // Record faucet funding transaction
    this.recordTx({
      from: this.treasuryAccount.address,
      to: account.address,
      value: '2.5',
      methodName: 'faucetProvision',
      logs: []
    });

    return {
      address: account.address,
      privateKey: account.privateKey,
      ethBalance: '2.5',
      athBalance: '500.0'
    };
  }

  public requestFaucet(recipientAddress: string, ethAmount: string = '1.5', athAmount: string = '250') {
    if (!this.web3.utils.isAddress(recipientAddress)) {
      throw new Error(`Invalid EVM recipient address: ${recipientAddress}`);
    }

    const norm = recipientAddress.toLowerCase();
    const ethToAdd = BigInt(this.web3.utils.toWei(ethAmount, 'ether'));
    const athToAdd = BigInt(this.web3.utils.toWei(athAmount, 'ether'));

    const currentEth = this.ethBalances.get(norm) || BigInt('0');
    const currentAth = this.tokenBalances.get(norm) || BigInt('0');

    this.ethBalances.set(norm, currentEth + ethToAdd);
    this.tokenBalances.set(norm, currentAth + athToAdd);

    const tx = this.recordTx({
      from: this.treasuryAccount.address,
      to: recipientAddress,
      value: ethAmount,
      methodName: 'requestFaucet',
      logs: [
        {
          event: 'Transfer',
          topics: [this.web3.utils.sha3('Transfer(address,address,uint256)') || '0x'],
          data: this.web3.utils.padLeft(recipientAddress, 64),
          decodedArgs: {
            from: this.treasuryAccount.address,
            to: recipientAddress,
            valueAth: athAmount,
            valueEth: ethAmount
          }
        }
      ]
    });

    return {
      success: true,
      txHash: tx.hash,
      recipient: recipientAddress,
      ethGranted: ethAmount,
      athGranted: athAmount,
      blockNumber: tx.blockNumber
    };
  }

  public callContractMethod(contractId: string, methodName: string, params: any[] = [], callerAddress?: string) {
    const contract = [...SMART_CONTRACTS, ...this.customContracts].find(c => c.id === contractId || c.address.toLowerCase() === contractId.toLowerCase());
    if (!contract) {
      throw new Error(`Contract not found for ID/address: ${contractId}`);
    }

    const caller = (callerAddress || this.treasuryAccount.address).toLowerCase();

    // Route view / pure calls based on contract
    if (contract.id === 'aether-token') {
      if (methodName === 'name') return 'Aether Token';
      if (methodName === 'symbol') return 'ATH';
      if (methodName === 'decimals') return 18;
      if (methodName === 'totalSupply') return this.web3.utils.fromWei(this.tokenTotalSupply.toString(), 'ether');
      if (methodName === 'balanceOf') {
        const queryAddr = (params[0] || caller).toLowerCase();
        const bal = this.tokenBalances.get(queryAddr) || BigInt(0);
        return { raw: bal.toString(), formatted: this.web3.utils.fromWei(bal.toString(), 'ether') };
      }
      if (methodName === 'allowance') {
        const owner = (params[0] || caller).toLowerCase();
        const spender = (params[1] || '').toLowerCase();
        const allowMap = this.tokenAllowances.get(owner);
        const allow = allowMap ? (allowMap.get(spender) || BigInt(0)) : BigInt(0);
        return { raw: allow.toString(), formatted: this.web3.utils.fromWei(allow.toString(), 'ether') };
      }
    } else if (contract.id === 'aether-vault') {
      if (methodName === 'totalStaked') {
        return { raw: this.vaultTotalStaked.toString(), formatted: this.web3.utils.fromWei(this.vaultTotalStaked.toString(), 'ether') };
      }
      if (methodName === 'rewardRateBasisPoints') return 1480; // 14.8% APY
      if (methodName === 'calculateReward') {
        const queryAddr = (params[0] || caller).toLowerCase();
        const s = this.vaultStakes.get(queryAddr);
        if (!s || s.amount === BigInt(0)) return '0.000000';
        const dur = Math.max(1, Math.floor((Date.now() - s.lastStakeTimestamp) / 1000));
        const annual = (s.amount * BigInt(1480)) / BigInt(10000);
        const earned = (annual * BigInt(dur)) / BigInt(31536000);
        const total = earned + s.rewardDebt;
        return this.web3.utils.fromWei(total.toString(), 'ether');
      }
    } else if (contract.id === 'omni-escrow') {
      if (methodName === 'agreementCounter') return this.escrowCounter;
      if (methodName === 'getAgreements') {
        return Array.from(this.escrowAgreements.values());
      }
      if (methodName === 'agreements') {
        const id = Number(params[0] || 1);
        return this.escrowAgreements.get(id) || null;
      }
    } else if (contract.id === 'genesis-nft') {
      if (methodName === 'name') return 'Genesis Artifacts';
      if (methodName === 'symbol') return 'GART';
      if (methodName === 'nextTokenId') return this.nextNftId;
      if (methodName === 'balanceOf') {
        const queryAddr = (params[0] || caller).toLowerCase();
        const count = Array.from(this.nfts.values()).filter(n => n.owner.toLowerCase() === queryAddr).length;
        return count;
      }
      if (methodName === 'ownerOf') {
        const id = Number(params[0] || 1);
        const item = this.nfts.get(id);
        return item ? item.owner : '0x0000000000000000000000000000000000000000';
      }
      if (methodName === 'getAllNFTs') {
        return Array.from(this.nfts.values());
      }
    }

    return { result: 'Method executed (view/pure)', params };
  }

  public executeTransaction(contractId: string, methodName: string, params: any[] = [], senderAddress: string, valueEth: string = '0') {
    const contract = [...SMART_CONTRACTS, ...this.customContracts].find(c => c.id === contractId || c.address.toLowerCase() === contractId.toLowerCase());
    if (!contract) {
      throw new Error(`Contract not found: ${contractId}`);
    }

    const sender = senderAddress.toLowerCase();
    const logs: any[] = [];
    let gasUsed = 45000;

    if (contract.id === 'aether-token') {
      if (methodName === 'transfer') {
        const recipient = (params[0] || '').toLowerCase();
        const amountWei = BigInt(this.web3.utils.toWei(params[1]?.toString() || '0', 'ether'));
        const senderBal = this.tokenBalances.get(sender) || BigInt(0);

        if (senderBal < amountWei) {
          throw new Error(`ERC20: transfer amount (${this.web3.utils.fromWei(amountWei.toString(), 'ether')} ATH) exceeds balance`);
        }

        this.tokenBalances.set(sender, senderBal - amountWei);
        const recipBal = this.tokenBalances.get(recipient) || BigInt(0);
        this.tokenBalances.set(recipient, recipBal + amountWei);

        logs.push({
          event: 'Transfer',
          topics: [this.web3.utils.sha3('Transfer(address,address,uint256)') || '0x'],
          data: '0x',
          decodedArgs: { from: sender, to: recipient, value: params[1]?.toString() }
        });
        gasUsed = 51200;
      } else if (methodName === 'approve') {
        const spender = (params[0] || '').toLowerCase();
        const amountWei = BigInt(this.web3.utils.toWei(params[1]?.toString() || '0', 'ether'));

        if (!this.tokenAllowances.has(sender)) {
          this.tokenAllowances.set(sender, new Map());
        }
        this.tokenAllowances.get(sender)!.set(spender, amountWei);

        logs.push({
          event: 'Approval',
          topics: [this.web3.utils.sha3('Approval(address,address,uint256)') || '0x'],
          data: '0x',
          decodedArgs: { owner: sender, spender, value: params[1]?.toString() }
        });
        gasUsed = 46000;
      } else if (methodName === 'mint') {
        const to = (params[0] || sender).toLowerCase();
        const amountWei = BigInt(this.web3.utils.toWei(params[1]?.toString() || '100', 'ether'));
        this.tokenTotalSupply += amountWei;
        const cur = this.tokenBalances.get(to) || BigInt(0);
        this.tokenBalances.set(to, cur + amountWei);

        logs.push({
          event: 'Mint',
          topics: [this.web3.utils.sha3('Mint(address,uint256)') || '0x'],
          data: '0x',
          decodedArgs: { to, amount: params[1]?.toString() }
        });
        gasUsed = 62000;
      } else if (methodName === 'burn') {
        const amountWei = BigInt(this.web3.utils.toWei(params[0]?.toString() || '0', 'ether'));
        const cur = this.tokenBalances.get(sender) || BigInt(0);
        if (cur < amountWei) throw new Error('ERC20: burn amount exceeds balance');
        this.tokenBalances.set(sender, cur - amountWei);
        this.tokenTotalSupply -= amountWei;

        logs.push({
          event: 'Burn',
          topics: [this.web3.utils.sha3('Burn(address,uint256)') || '0x'],
          data: '0x',
          decodedArgs: { from: sender, amount: params[0]?.toString() }
        });
        gasUsed = 48000;
      }
    } else if (contract.id === 'aether-vault') {
      if (methodName === 'stake') {
        const amountWei = BigInt(this.web3.utils.toWei(params[0]?.toString() || '0', 'ether'));
        const curAth = this.tokenBalances.get(sender) || BigInt(0);
        if (curAth < amountWei) throw new Error('Insufficient ATH token balance to stake');

        // Deduct ATH
        this.tokenBalances.set(sender, curAth - amountWei);
        
        // Update Stake
        const currentStake = this.vaultStakes.get(sender) || { amount: BigInt(0), rewardDebt: BigInt(0), lastStakeTimestamp: Date.now() };
        
        // Harvest any intermediate yield to debt
        if (currentStake.amount > BigInt(0)) {
          const duration = Math.max(1, Math.floor((Date.now() - currentStake.lastStakeTimestamp) / 1000));
          const annual = (currentStake.amount * BigInt(1480)) / BigInt(10000);
          currentStake.rewardDebt += (annual * BigInt(duration)) / BigInt(31536000);
        }

        currentStake.amount += amountWei;
        currentStake.lastStakeTimestamp = Date.now();
        this.vaultStakes.set(sender, currentStake);
        this.vaultTotalStaked += amountWei;

        logs.push({
          event: 'Staked',
          topics: [this.web3.utils.sha3('Staked(address,uint256)') || '0x'],
          data: '0x',
          decodedArgs: { user: sender, amount: params[0]?.toString() }
        });
        gasUsed = 78500;
      } else if (methodName === 'claimRewards') {
        const currentStake = this.vaultStakes.get(sender);
        if (!currentStake || currentStake.amount === BigInt(0)) {
          throw new Error('No active stake to claim rewards from');
        }

        const duration = Math.max(1, Math.floor((Date.now() - currentStake.lastStakeTimestamp) / 1000));
        const annual = (currentStake.amount * BigInt(1480)) / BigInt(10000);
        const reward = (annual * BigInt(duration)) / BigInt(31536000) + currentStake.rewardDebt;

        if (reward <= BigInt(0)) throw new Error('No rewards accumulated yet');

        // Grant reward in ATH tokens
        const curAth = this.tokenBalances.get(sender) || BigInt(0);
        this.tokenBalances.set(sender, curAth + reward);
        
        // Reset reward debt
        currentStake.rewardDebt = BigInt(0);
        currentStake.lastStakeTimestamp = Date.now();
        this.vaultStakes.set(sender, currentStake);

        const rewardEth = this.web3.utils.fromWei(reward.toString(), 'ether');
        logs.push({
          event: 'RewardClaimed',
          topics: [this.web3.utils.sha3('RewardClaimed(address,uint256)') || '0x'],
          data: '0x',
          decodedArgs: { user: sender, reward: rewardEth }
        });
        gasUsed = 64200;
      } else if (methodName === 'withdraw') {
        const amountWei = BigInt(this.web3.utils.toWei(params[0]?.toString() || '0', 'ether'));
        const currentStake = this.vaultStakes.get(sender);
        if (!currentStake || currentStake.amount < amountWei) {
          throw new Error('Withdrawal amount exceeds staked balance');
        }

        currentStake.amount -= amountWei;
        this.vaultTotalStaked -= amountWei;
        currentStake.lastStakeTimestamp = Date.now();
        this.vaultStakes.set(sender, currentStake);

        // Return ATH tokens
        const curAth = this.tokenBalances.get(sender) || BigInt(0);
        this.tokenBalances.set(sender, curAth + amountWei);

        logs.push({
          event: 'Withdrawn',
          topics: [this.web3.utils.sha3('Withdrawn(address,uint256)') || '0x'],
          data: '0x',
          decodedArgs: { user: sender, amount: params[0]?.toString() }
        });
        gasUsed = 82100;
      }
    } else if (contract.id === 'omni-escrow') {
      if (methodName === 'createAgreement') {
        this.escrowCounter++;
        const seller = (params[0] || '').toLowerCase();
        const arbiter = (params[1] || this.treasuryAccount.address).toLowerCase();
        const milestoneDesc = params[2] || 'Milestone agreement';
        const depositEth = valueEth || '0.5';

        // Check if buyer has ETH
        const buyerEth = this.ethBalances.get(sender) || BigInt(0);
        const depositWei = BigInt(this.web3.utils.toWei(depositEth, 'ether'));
        if (buyerEth < depositWei) {
          throw new Error(`Insufficient ETH balance (${depositEth} ETH needed for escrow deposit)`);
        }
        this.ethBalances.set(sender, buyerEth - depositWei);

        const newAgreement: EscrowItem = {
          id: this.escrowCounter,
          buyer: sender,
          seller,
          arbiter,
          amount: depositEth,
          milestoneDescription: milestoneDesc,
          state: 'Funded',
          buyerApproved: true,
          sellerApproved: false,
          createdAt: Date.now()
        };
        this.escrowAgreements.set(this.escrowCounter, newAgreement);

        logs.push({
          event: 'AgreementCreated',
          topics: [this.web3.utils.sha3('AgreementCreated(uint256,address,address,uint256)') || '0x'],
          data: '0x',
          decodedArgs: { agreementId: this.escrowCounter, buyer: sender, seller, amount: depositEth }
        });
        gasUsed = 94000;
      } else if (methodName === 'approveMilestone') {
        const id = Number(params[0]);
        const agreement = this.escrowAgreements.get(id);
        if (!agreement) throw new Error(`Escrow agreement #${id} not found`);

        if (sender === agreement.buyer.toLowerCase()) agreement.buyerApproved = true;
        if (sender === agreement.seller.toLowerCase()) agreement.sellerApproved = true;

        if (agreement.buyerApproved && agreement.sellerApproved) {
          agreement.state = 'Completed';
          // Release ETH to seller
          const sellerNorm = agreement.seller.toLowerCase();
          const sellerBal = this.ethBalances.get(sellerNorm) || BigInt(0);
          const amtWei = BigInt(this.web3.utils.toWei(agreement.amount, 'ether'));
          this.ethBalances.set(sellerNorm, sellerBal + amtWei);

          logs.push({
            event: 'FundsReleased',
            topics: [this.web3.utils.sha3('FundsReleased(uint256,address,uint256)') || '0x'],
            data: '0x',
            decodedArgs: { agreementId: id, recipient: agreement.seller, amount: agreement.amount }
          });
        }
        gasUsed = 68000;
      } else if (methodName === 'raiseDispute') {
        const id = Number(params[0]);
        const agreement = this.escrowAgreements.get(id);
        if (!agreement) throw new Error(`Escrow agreement #${id} not found`);
        agreement.state = 'Disputed';

        logs.push({
          event: 'DisputeRaised',
          topics: [this.web3.utils.sha3('DisputeRaised(uint256,address)') || '0x'],
          data: '0x',
          decodedArgs: { agreementId: id, raisedBy: sender }
        });
        gasUsed = 49000;
      }
    } else if (contract.id === 'genesis-nft') {
      if (methodName === 'mint') {
        const feeEth = '0.05';
        const feeWei = BigInt(this.web3.utils.toWei(feeEth, 'ether'));
        const senderEth = this.ethBalances.get(sender) || BigInt(0);
        if (senderEth < feeWei) throw new Error(`Insufficient ETH: 0.05 ETH mint fee required`);
        this.ethBalances.set(sender, senderEth - feeWei);

        const tokenId = this.nextNftId++;
        const uri = params[0] || `ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/${tokenId}.json`;
        const rarities: ('Common' | 'Rare' | 'Legendary' | 'Mythic')[] = ['Common', 'Rare', 'Legendary', 'Mythic'];
        const randomRarity = rarities[Math.floor(Math.random() * rarities.length)];
        
        const newNft: NFTItem = {
          tokenId,
          owner: sender,
          tokenURI: uri,
          name: `Aether Artifact #${tokenId.toString().padStart(3, '0')}`,
          rarity: randomRarity,
          mintedAt: Date.now()
        };
        this.nfts.set(tokenId, newNft);

        logs.push({
          event: 'Minted',
          topics: [this.web3.utils.sha3('Minted(address,uint256,string)') || '0x'],
          data: '0x',
          decodedArgs: { minter: sender, tokenId, uri }
        });
        gasUsed = 89000;
      }
    }

    const tx = this.recordTx({
      from: sender,
      to: contract.address,
      value: valueEth,
      gasUsed,
      methodName,
      contractId: contract.id,
      contractAddress: contract.address,
      logs
    });

    return {
      success: true,
      transactionHash: tx.hash,
      blockNumber: tx.blockNumber,
      gasUsed,
      gasPriceGwei: tx.gasPriceGwei,
      logs,
      state: 'confirmed'
    };
  }

  public deployCustomContract(name: string, category: any, sourceCode: string, abi: any[], initialParams: any[], deployerAddress: string) {
    const deployer = deployerAddress.toLowerCase();
    const newAddress = this.web3.eth.accounts.create().address;
    const contractId = 'custom-' + name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString().slice(-4);
    
    const newContractDef: SmartContractDefinition = {
      id: contractId,
      name,
      category,
      address: newAddress,
      deployedAtBlock: this.currentBlockNumber + 1,
      solidityVersion: '^0.8.20',
      description: `Custom user-deployed verified smart contract on Aether Sepolia EVM.`,
      sourceCode,
      abi
    };

    this.customContracts.push(newContractDef);

    const tx = this.recordTx({
      from: deployer,
      to: newAddress,
      value: '0',
      gasUsed: 1420000,
      methodName: 'deployContract',
      contractId,
      contractAddress: newAddress,
      logs: [{
        event: 'ContractDeployed',
        topics: [this.web3.utils.sha3('ContractDeployed(address,string)') || '0x'],
        data: '0x',
        decodedArgs: { address: newAddress, name }
      }]
    });

    return {
      success: true,
      contract: newContractDef,
      txHash: tx.hash,
      blockNumber: tx.blockNumber
    };
  }

  public verifySignature(message: string, signature: string, expectedAddress?: string) {
    try {
      const recoveredAddress = this.web3.eth.accounts.recover(message, signature);
      const matches = expectedAddress ? recoveredAddress.toLowerCase() === expectedAddress.toLowerCase() : true;
      return {
        valid: true,
        recoveredAddress,
        matchesExpected: matches
      };
    } catch (err: any) {
      return {
        valid: false,
        error: err.message || 'Signature recovery failed'
      };
    }
  }

  private recordTx(details: {
    from: string;
    to: string;
    value: string;
    gasUsed?: number;
    methodName?: string;
    contractId?: string;
    contractAddress?: string;
    logs?: any[];
  }): BlockchainTransaction {
    this.currentBlockNumber += 1;
    const hash = this.web3.utils.sha3(`tx_${this.currentBlockNumber}_${Date.now()}_${Math.random()}`) || '0x' + Math.random().toString(16).slice(2);
    
    const tx: BlockchainTransaction = {
      hash,
      blockNumber: this.currentBlockNumber,
      from: details.from,
      to: details.to,
      value: details.value || '0',
      gasUsed: details.gasUsed || 21000,
      gasPriceGwei: '15.5',
      timestamp: Date.now(),
      status: 'confirmed',
      methodName: details.methodName,
      contractId: details.contractId,
      contractAddress: details.contractAddress,
      logs: details.logs || []
    };

    this.transactions.unshift(tx);

    // Append new mined block
    const blockHash = this.web3.utils.sha3(`block_${this.currentBlockNumber}`) || '0x' + Math.random().toString(16).slice(2);
    const parentBlock = this.blocks[0];
    this.blocks.unshift({
      number: this.currentBlockNumber,
      hash: blockHash,
      parentHash: parentBlock ? parentBlock.hash : '0x0000000000000000000000000000000000000000',
      timestamp: Date.now(),
      miner: this.treasuryAccount.address,
      txCount: 1,
      gasUsed: tx.gasUsed,
      gasLimit: 30000000,
      baseFeeGwei: '14.5'
    });

    if (this.transactions.length > 100) this.transactions.pop();
    if (this.blocks.length > 50) this.blocks.pop();

    return tx;
  }
}

export const web3Engine = new Web3Engine();

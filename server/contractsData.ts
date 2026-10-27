/**
 * Smart Contract ABIs, Solidity Sources, and Initial Deployment Configurations
 */

export interface SmartContractDefinition {
  id: string;
  name: string;
  symbol?: string;
  category: 'ERC-20 Token' | 'DeFi Vault' | 'MultiSig Escrow' | 'ERC-721 NFT';
  address: string;
  deployedAtBlock: number;
  solidityVersion: string;
  sourceCode: string;
  abi: Array<{
    type: 'function' | 'event' | 'constructor';
    name?: string;
    inputs?: Array<{ name: string; type: string; indexed?: boolean }>;
    outputs?: Array<{ name: string; type: string }>;
    stateMutability?: 'pure' | 'view' | 'nonpayable' | 'payable';
    anonymous?: boolean;
  }>;
  description: string;
}

export const SMART_CONTRACTS: SmartContractDefinition[] = [
  {
    id: 'aether-token',
    name: 'Aether Governance Token',
    symbol: 'ATH',
    category: 'ERC-20 Token',
    address: '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318',
    deployedAtBlock: 19842100,
    solidityVersion: '^0.8.20',
    description: 'Utility & governance token powering the Aether decentralized ecosystem with built-in deflationary burn mechanics and staking distribution.',
    sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AetherToken (ATH)
 * @dev High-performance ERC-20 token with permit and governance mechanics.
 */
contract AetherToken {
    string public name = "Aether Token";
    string public symbol = "ATH";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    uint256 public constant MAX_SUPPLY = 10_000_000 * 10**18;
    
    address public owner;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "AetherToken: Caller is not the owner");
        _;
    }

    constructor(uint256 initialSupply) {
        owner = msg.sender;
        _mint(msg.sender, initialSupply);
    }

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    function transfer(address recipient, uint256 amount) external returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    function allowance(address tokenOwner, address spender) external view returns (uint256) {
        return _allowances[tokenOwner][spender];
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool) {
        uint256 currentAllowance = _allowances[sender][msg.sender];
        require(currentAllowance >= amount, "ERC20: transfer amount exceeds allowance");
        unchecked {
            _approve(sender, msg.sender, currentAllowance - amount);
        }
        _transfer(sender, recipient, amount);
        return true;
    }

    function mint(address to, uint256 amount) external onlyOwner returns (bool) {
        require(totalSupply + amount <= MAX_SUPPLY, "AetherToken: Max supply exceeded");
        _mint(to, amount);
        return true;
    }

    function burn(uint256 amount) external returns (bool) {
        _burn(msg.sender, amount);
        return true;
    }

    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(sender != address(0), "ERC20: transfer from zero address");
        require(recipient != address(0), "ERC20: transfer to zero address");
        require(_balances[sender] >= amount, "ERC20: transfer amount exceeds balance");

        unchecked {
            _balances[sender] -= amount;
            _balances[recipient] += amount;
        }
        emit Transfer(sender, recipient, amount);
    }

    function _mint(address account, uint256 amount) internal {
        require(account != address(0), "ERC20: mint to zero address");
        totalSupply += amount;
        _balances[account] += amount;
        emit Mint(account, amount);
        emit Transfer(address(0), account, amount);
    }

    function _burn(address account, uint256 amount) internal {
        require(_balances[account] >= amount, "ERC20: burn amount exceeds balance");
        unchecked {
            _balances[account] -= amount;
            totalSupply -= amount;
        }
        emit Burn(account, amount);
        emit Transfer(account, address(0), amount);
    }
}`,
    abi: [
      {
        type: 'function',
        name: 'name',
        inputs: [],
        outputs: [{ name: '', type: 'string' }],
        stateMutability: 'view'
      },
      {
        type: 'function',
        name: 'symbol',
        inputs: [],
        outputs: [{ name: '', type: 'string' }],
        stateMutability: 'view'
      },
      {
        type: 'function',
        name: 'decimals',
        inputs: [],
        outputs: [{ name: '', type: 'uint8' }],
        stateMutability: 'view'
      },
      {
        type: 'function',
        name: 'totalSupply',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
      },
      {
        type: 'function',
        name: 'balanceOf',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: 'balance', type: 'uint256' }],
        stateMutability: 'view'
      },
      {
        type: 'function',
        name: 'allowance',
        inputs: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' }
        ],
        outputs: [{ name: 'remaining', type: 'uint256' }],
        stateMutability: 'view'
      },
      {
        type: 'function',
        name: 'transfer',
        inputs: [
          { name: 'recipient', type: 'address' },
          { name: 'amount', type: 'uint256' }
        ],
        outputs: [{ name: 'success', type: 'bool' }],
        stateMutability: 'nonpayable'
      },
      {
        type: 'function',
        name: 'approve',
        inputs: [
          { name: 'spender', type: 'address' },
          { name: 'amount', type: 'uint256' }
        ],
        outputs: [{ name: 'success', type: 'bool' }],
        stateMutability: 'nonpayable'
      },
      {
        type: 'function',
        name: 'transferFrom',
        inputs: [
          { name: 'sender', type: 'address' },
          { name: 'recipient', type: 'address' },
          { name: 'amount', type: 'uint256' }
        ],
        outputs: [{ name: 'success', type: 'bool' }],
        stateMutability: 'nonpayable'
      },
      {
        type: 'function',
        name: 'mint',
        inputs: [
          { name: 'to', type: 'address' },
          { name: 'amount', type: 'uint256' }
        ],
        outputs: [{ name: 'success', type: 'bool' }],
        stateMutability: 'nonpayable'
      },
      {
        type: 'function',
        name: 'burn',
        inputs: [{ name: 'amount', type: 'uint256' }],
        outputs: [{ name: 'success', type: 'bool' }],
        stateMutability: 'nonpayable'
      },
      {
        type: 'event',
        name: 'Transfer',
        inputs: [
          { name: 'from', type: 'address', indexed: true },
          { name: 'to', type: 'address', indexed: true },
          { name: 'value', type: 'uint256', indexed: false }
        ],
        anonymous: false
      },
      {
        type: 'event',
        name: 'Approval',
        inputs: [
          { name: 'owner', type: 'address', indexed: true },
          { name: 'spender', type: 'address', indexed: true },
          { name: 'value', type: 'uint256', indexed: false }
        ],
        anonymous: false
      }
    ]
  },
  {
    id: 'aether-vault',
    name: 'Aether Yield & Staking Vault',
    symbol: 'sATH',
    category: 'DeFi Vault',
    address: '0x3B9270a6c23D6983A76F3d964f47C596b797b5e4',
    deployedAtBlock: 19842250,
    solidityVersion: '^0.8.20',
    description: 'Dynamic liquidity staking pool distributing continuous yield APY to stakers with automated reward compounding and time-lock multipliers.',
    sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title AetherVault
 * @notice Yield-generating staking contract for Aether ecosystem assets.
 */
contract AetherVault {
    IERC20 public immutable stakingToken;
    
    uint256 public totalStaked;
    uint256 public rewardRateBasisPoints = 1480; // 14.80% APY
    uint256 public constant SECONDS_IN_YEAR = 31536000;
    
    struct StakeInfo {
        uint256 amount;
        uint256 rewardDebt;
        uint256 lastStakeTimestamp;
    }
    
    mapping(address => StakeInfo) public stakes;
    
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);

    constructor(address _stakingToken) {
        stakingToken = IERC20(_stakingToken);
    }

    function calculateReward(address user) public view returns (uint256) {
        StakeInfo memory s = stakes[user];
        if (s.amount == 0) return 0;
        uint256 duration = block.timestamp - s.lastStakeTimestamp;
        uint256 annualReward = (s.amount * rewardRateBasisPoints) / 10000;
        return (annualReward * duration) / SECONDS_IN_YEAR + s.rewardDebt;
    }

    function stake(uint256 amount) external {
        require(amount > 0, "Cannot stake 0");
        stakes[msg.sender].rewardDebt = calculateReward(msg.sender);
        stakes[msg.sender].lastStakeTimestamp = block.timestamp;
        stakes[msg.sender].amount += amount;
        totalStaked += amount;
        
        require(stakingToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        emit Staked(msg.sender, amount);
    }

    function claimRewards() public returns (uint256) {
        uint256 pending = calculateReward(msg.sender);
        require(pending > 0, "No rewards to claim");
        
        stakes[msg.sender].rewardDebt = 0;
        stakes[msg.sender].lastStakeTimestamp = block.timestamp;
        
        require(stakingToken.transfer(msg.sender, pending), "Reward payout failed");
        emit RewardClaimed(msg.sender, pending);
        return pending;
    }

    function withdraw(uint256 amount) external {
        require(amount > 0, "Cannot withdraw 0");
        require(stakes[msg.sender].amount >= amount, "Insufficient staked balance");
        
        uint256 pending = calculateReward(msg.sender);
        stakes[msg.sender].amount -= amount;
        totalStaked -= amount;
        stakes[msg.sender].rewardDebt = pending;
        stakes[msg.sender].lastStakeTimestamp = block.timestamp;

        require(stakingToken.transfer(msg.sender, amount), "Withdrawal transfer failed");
        emit Withdrawn(msg.sender, amount);
    }
}`,
    abi: [
      {
        type: 'function',
        name: 'totalStaked',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
      },
      {
        type: 'function',
        name: 'rewardRateBasisPoints',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
      },
      {
        type: 'function',
        name: 'calculateReward',
        inputs: [{ name: 'user', type: 'address' }],
        outputs: [{ name: 'reward', type: 'uint256' }],
        stateMutability: 'view'
      },
      {
        type: 'function',
        name: 'stake',
        inputs: [{ name: 'amount', type: 'uint256' }],
        outputs: [],
        stateMutability: 'nonpayable'
      },
      {
        type: 'function',
        name: 'claimRewards',
        inputs: [],
        outputs: [{ name: 'claimed', type: 'uint256' }],
        stateMutability: 'nonpayable'
      },
      {
        type: 'function',
        name: 'withdraw',
        inputs: [{ name: 'amount', type: 'uint256' }],
        outputs: [],
        stateMutability: 'nonpayable'
      },
      {
        type: 'event',
        name: 'Staked',
        inputs: [
          { name: 'user', type: 'address', indexed: true },
          { name: 'amount', type: 'uint256', indexed: false }
        ]
      },
      {
        type: 'event',
        name: 'Withdrawn',
        inputs: [
          { name: 'user', type: 'address', indexed: true },
          { name: 'amount', type: 'uint256', indexed: false }
        ]
      },
      {
        type: 'event',
        name: 'RewardClaimed',
        inputs: [
          { name: 'user', type: 'address', indexed: true },
          { name: 'reward', type: 'uint256', indexed: false }
        ]
      }
    ]
  },
  {
    id: 'omni-escrow',
    name: 'OmniEscrow MultiSig Settlement',
    category: 'MultiSig Escrow',
    address: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    deployedAtBlock: 19842410,
    solidityVersion: '^0.8.20',
    description: 'Decentralized trustless escrow with multi-signature arbitration, milestone confirmations, and automated conditional disbursement.',
    sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title OmniEscrow
 * @dev Milestone-driven escrow contract with dual-signature or arbiter resolution.
 */
contract OmniEscrow {
    enum EscrowState { AwaitingDeposit, Funded, Completed, Disputed, Refunded }

    struct EscrowAgreement {
        address buyer;
        address seller;
        address arbiter;
        uint256 amount;
        string milestoneDescription;
        EscrowState state;
        bool buyerApproved;
        bool sellerApproved;
    }

    uint256 public agreementCounter;
    mapping(uint256 => EscrowAgreement) public agreements;

    event AgreementCreated(uint256 indexed agreementId, address indexed buyer, address indexed seller, uint256 amount);
    event AgreementFunded(uint256 indexed agreementId, uint256 amount);
    event FundsReleased(uint256 indexed agreementId, address recipient, uint256 amount);
    event DisputeRaised(uint256 indexed agreementId, address raisedBy);
    event DisputeResolved(uint256 indexed agreementId, address favoredParty);

    function createAgreement(address _seller, address _arbiter, string calldata _milestone) external payable returns (uint256) {
        agreementCounter++;
        agreements[agreementCounter] = EscrowAgreement({
            buyer: msg.sender,
            seller: _seller,
            arbiter: _arbiter,
            amount: msg.value,
            milestoneDescription: _milestone,
            state: msg.value > 0 ? EscrowState.Funded : EscrowState.AwaitingDeposit,
            buyerApproved: false,
            sellerApproved: false
        });
        emit AgreementCreated(agreementCounter, msg.sender, _seller, msg.value);
        return agreementCounter;
    }

    function approveMilestone(uint256 agreementId) external {
        EscrowAgreement storage a = agreements[agreementId];
        require(a.state == EscrowState.Funded, "Agreement not funded");
        
        if (msg.sender == a.buyer) {
            a.buyerApproved = true;
        } else if (msg.sender == a.seller) {
            a.sellerApproved = true;
        } else {
            revert("Not a participant");
        }

        if (a.buyerApproved && a.sellerApproved) {
            a.state = EscrowState.Completed;
            payable(a.seller).transfer(a.amount);
            emit FundsReleased(agreementId, a.seller, a.amount);
        }
    }

    function raiseDispute(uint256 agreementId) external {
        EscrowAgreement storage a = agreements[agreementId];
        require(msg.sender == a.buyer || msg.sender == a.seller, "Unauthorized");
        require(a.state == EscrowState.Funded, "Cannot dispute in current state");
        a.state = EscrowState.Disputed;
        emit DisputeRaised(agreementId, msg.sender);
    }

    function resolveDispute(uint256 agreementId, bool releaseToSeller) external {
        EscrowAgreement storage a = agreements[agreementId];
        require(msg.sender == a.arbiter, "Only arbiter can resolve");
        require(a.state == EscrowState.Disputed, "Not in dispute");

        if (releaseToSeller) {
            a.state = EscrowState.Completed;
            payable(a.seller).transfer(a.amount);
            emit DisputeResolved(agreementId, a.seller);
        } else {
            a.state = EscrowState.Refunded;
            payable(a.buyer).transfer(a.amount);
            emit DisputeResolved(agreementId, a.buyer);
        }
    }
}`,
    abi: [
      {
        type: 'function',
        name: 'agreementCounter',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
      },
      {
        type: 'function',
        name: 'createAgreement',
        inputs: [
          { name: '_seller', type: 'address' },
          { name: '_arbiter', type: 'address' },
          { name: '_milestone', type: 'string' }
        ],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'payable'
      },
      {
        type: 'function',
        name: 'approveMilestone',
        inputs: [{ name: 'agreementId', type: 'uint256' }],
        outputs: [],
        stateMutability: 'nonpayable'
      },
      {
        type: 'function',
        name: 'raiseDispute',
        inputs: [{ name: 'agreementId', type: 'uint256' }],
        outputs: [],
        stateMutability: 'nonpayable'
      },
      {
        type: 'function',
        name: 'resolveDispute',
        inputs: [
          { name: 'agreementId', type: 'uint256' },
          { name: 'releaseToSeller', type: 'bool' }
        ],
        outputs: [],
        stateMutability: 'nonpayable'
      }
    ]
  },
  {
    id: 'genesis-nft',
    name: 'Genesis Artifacts NFT',
    symbol: 'GART',
    category: 'ERC-721 NFT',
    address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    deployedAtBlock: 19842550,
    solidityVersion: '^0.8.20',
    description: 'On-chain dynamic NFT collection with cryptographic provenance, verifiable rarity tier metadata, and native royalty support.',
    sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GenesisArtifacts (ERC-721)
 * @notice Cryptographic artifacts minted on-chain with immutable metadata.
 */
contract GenesisArtifacts {
    string public name = "Genesis Artifacts";
    string public symbol = "GART";
    uint256 public nextTokenId = 1;
    uint256 public constant MAX_SUPPLY = 5000;
    uint256 public mintFee = 0.05 ether;
    
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => string) private _tokenURIs;
    
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Minted(address indexed minter, uint256 indexed tokenId, string uri);

    function ownerOf(uint256 tokenId) external view returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "Nonexistent token");
        return owner;
    }

    function balanceOf(address owner) external view returns (uint256) {
        require(owner != address(0), "Zero address query");
        return _balances[owner];
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(_owners[tokenId] != address(0), "Nonexistent token");
        return _tokenURIs[tokenId];
    }

    function mint(string calldata uri) external payable returns (uint256) {
        require(nextTokenId <= MAX_SUPPLY, "Max supply reached");
        require(msg.value >= mintFee, "Insufficient fee");

        uint256 tokenId = nextTokenId++;
        _owners[tokenId] = msg.sender;
        _balances[msg.sender] += 1;
        _tokenURIs[tokenId] = uri;

        emit Minted(msg.sender, tokenId, uri);
        emit Transfer(address(0), msg.sender, tokenId);
        return tokenId;
    }
}`,
    abi: [
      {
        type: 'function',
        name: 'name',
        inputs: [],
        outputs: [{ name: '', type: 'string' }],
        stateMutability: 'view'
      },
      {
        type: 'function',
        name: 'symbol',
        inputs: [],
        outputs: [{ name: '', type: 'string' }],
        stateMutability: 'view'
      },
      {
        type: 'function',
        name: 'nextTokenId',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
      },
      {
        type: 'function',
        name: 'ownerOf',
        inputs: [{ name: 'tokenId', type: 'uint256' }],
        outputs: [{ name: '', type: 'address' }],
        stateMutability: 'view'
      },
      {
        type: 'function',
        name: 'balanceOf',
        inputs: [{ name: 'owner', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
      },
      {
        type: 'function',
        name: 'tokenURI',
        inputs: [{ name: 'tokenId', type: 'uint256' }],
        outputs: [{ name: '', type: 'string' }],
        stateMutability: 'view'
      },
      {
        type: 'function',
        name: 'mint',
        inputs: [{ name: 'uri', type: 'string' }],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'payable'
      }
    ]
  }
];

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { web3Engine } from './server/web3Engine.js';
import { SMART_CONTRACTS } from './server/contractsData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // -------------------------------------------------------------
  // API Routes: Web3.js Blockchain Integration
  // -------------------------------------------------------------

  // 1. Network & Node Status
  app.get('/api/network', (_req, res) => {
    try {
      const info = web3Engine.getNetworkInfo();
      res.json({ success: true, data: info });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Wallet Balances & Assets
  app.get('/api/wallet/balance/:address', (req, res) => {
    try {
      const { address } = req.params;
      const data = web3Engine.getWalletBalances(address);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 3. Create fresh EVM wallet account
  app.post('/api/wallet/create', (_req, res) => {
    try {
      const account = web3Engine.createDevAccount();
      res.json({ success: true, data: account });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. Testnet Faucet request
  app.post('/api/wallet/faucet', (req, res) => {
    try {
      const { recipient, ethAmount, athAmount } = req.body;
      if (!recipient) {
        return res.status(400).json({ success: false, error: 'Recipient address required' });
      }
      const receipt = web3Engine.requestFaucet(recipient, ethAmount || '1.5', athAmount || '250');
      res.json({ success: true, data: receipt });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 5. Cryptographic Signature Verification
  app.post('/api/wallet/verify-signature', (req, res) => {
    try {
      const { message, signature, expectedAddress } = req.body;
      if (!message || !signature) {
        return res.status(400).json({ success: false, error: 'message and signature are required' });
      }
      const result = web3Engine.verifySignature(message, signature, expectedAddress);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 6. Contracts Catalog & Details
  app.get('/api/contracts', (_req, res) => {
    try {
      const allContracts = [...SMART_CONTRACTS, ...web3Engine.customContracts];
      res.json({ success: true, data: allContracts });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 7. Read Contract (call view/pure methods)
  app.post('/api/contracts/call', (req, res) => {
    try {
      const { contractId, method, params, caller } = req.body;
      if (!contractId || !method) {
        return res.status(400).json({ success: false, error: 'contractId and method are required' });
      }
      const result = web3Engine.callContractMethod(contractId, method, params || [], caller);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 8. Execute Contract Transaction (state mutation)
  app.post('/api/contracts/transact', (req, res) => {
    try {
      const { contractId, method, params, sender, valueEth } = req.body;
      if (!contractId || !method || !sender) {
        return res.status(400).json({ success: false, error: 'contractId, method, and sender are required' });
      }
      const result = web3Engine.executeTransaction(contractId, method, params || [], sender, valueEth || '0');
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 9. Deploy Custom Smart Contract
  app.post('/api/contracts/deploy', (req, res) => {
    try {
      const { name, category, sourceCode, abi, initialParams, deployer } = req.body;
      if (!name || !sourceCode || !deployer) {
        return res.status(400).json({ success: false, error: 'name, sourceCode, and deployer address are required' });
      }
      const result = web3Engine.deployCustomContract(
        name,
        category || 'Custom Smart Contract',
        sourceCode,
        abi || [],
        initialParams || [],
        deployer
      );
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 10. Transaction History Ledger
  app.get('/api/transactions', (_req, res) => {
    try {
      res.json({ success: true, data: web3Engine.transactions });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 11. Recent Blocks
  app.get('/api/blocks', (_req, res) => {
    try {
      res.json({ success: true, data: web3Engine.blocks });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // -------------------------------------------------------------
  // Vite Integration (Dev Middleware vs Production Static Build)
  // -------------------------------------------------------------
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Web3 Backend] Server running on http://0.0.0.0:${PORT}`);
    console.log(`[Web3 Backend] Connected to Web3.js Engine (Sepolia EVM Chain ID: 11155111)`);
    console.log(`[Web3 Backend] Relayer Treasury: ${web3Engine.treasuryAccount.address}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

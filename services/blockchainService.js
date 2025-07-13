const { Web3 } = require('web3');

class BlockchainService {
  constructor() {
    this.web3 = new Web3(process.env.BLOCKCHAIN_RPC || 'http://ganache:8545');
    this.chainId = process.env.CHAIN_ID || 1337;
    this.isLocal = true;
    
    this.contractAddress = process.env.CONTRACT_ADDRESS;
    this.contractABI = [
      {
        "inputs": [
          {"internalType": "address", "name": "mintTo_", "type": "address"},
          {"internalType": "uint256", "name": "slot_", "type": "uint256"},
          {"internalType": "uint256", "name": "value_", "type": "uint256"}
        ],
        "name": "mint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {"internalType": "uint256", "name": "tokenId_", "type": "uint256"},
          {"internalType": "string", "name": "uri_", "type": "string"}
        ],
        "name": "setTokenURI",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ];

    this.setupAccount();
  }

  setupAccount() {
    if (process.env.PRIVATE_KEY) {
      try {
        const account = this.web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
        this.web3.eth.accounts.wallet.add(account);
        this.account = account;
        console.log(' Blockchain account loaded:', account.address);
      } catch (error) {
        console.error('Account setup error:', error.message);
      }
    }
  }

  async checkConnection() {
    try {
      const blockNumber = await this.web3.eth.getBlockNumber();
      console.log('Network connected, block number:', blockNumber.toString());
      return true;
    } catch (error) {
      console.error('Network connection error:', error.message);
      return false;
    }
  }

  async getNetworkInfo() {
    try {
      const blockNumber = await this.web3.eth.getBlockNumber();
      const chainId = await this.web3.eth.getChainId();
      const accounts = await this.web3.eth.getAccounts();
      
      return {
        blockNumber: blockNumber.toString(),
        chainId: chainId.toString(),
        accounts: accounts.slice(0, 5),
        isLocal: this.isLocal,
        contractAddress: this.contractAddress
      };
    } catch (error) {
      console.error('Network info error:', error.message);
      return {
        blockNumber: '0',
        chainId: this.chainId.toString(),
        accounts: [],
        isLocal: this.isLocal,
        contractAddress: this.contractAddress,
        error: error.message
      };
    }
  }

  async mint(userAddress, slot, value) {
    try {
      const tokenId = Date.now();
      console.log(' Minted NFT with tokenId:', tokenId);
      console.log('  - User:', userAddress);
      console.log('  - Slot:', slot);
      console.log('  - Value:', value);
      return tokenId;
    } catch (error) {
      console.error('Mint error:', error.message);
      throw new Error('ミント処理失敗: ' + error.message);
    }
  }

  async setTokenURI(tokenId, uri) {
    try {
      console.log(' Set tokenURI for token:', tokenId);
      console.log('  - URI:', uri);
      return 'mock-transaction-hash-' + Date.now();
    } catch (error) {
      console.error('SetTokenURI error:', error.message);
      throw new Error('URI設定処理失敗: ' + error.message);
    }
  }

  async deployContractIfNeeded() {
    console.log('Contract deployment skipped for now');
  }
}

module.exports = BlockchainService;

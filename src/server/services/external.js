const axios = require('axios');
const { ethers } = require('ethers');

// ---------------------- Blockchain Service ----------------------
class BlockchainService {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.contracts = new Map();
    this.initializeProvider();
  }

  initializeProvider() {
    try {
      const rpcUrl = process.env.ETHEREUM_RPC_URL || 'http://localhost:8545';
      this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      console.log('Blockchain provider initialized');
    } catch (error) {
      console.error('Failed to initialize blockchain provider:', error);
    }
  }

  async getNetworkInfo() {
    if (!this.provider) throw new Error('Provider not initialized');
    const network = await this.provider.getNetwork();
    const blockNumber = await this.provider.getBlockNumber();
    const gasPrice = await this.provider.getGasPrice();

    return {
      chainId: network.chainId,
      name: network.name,
      blockNumber,
      gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei')
    };
  }

  async getBalance(address) {
    if (!this.provider) throw new Error('Provider not initialized');
    const balance = await this.provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  }

  async deployContract(contractFactory, constructorArgs = []) {
    if (!this.wallet) throw new Error('Wallet not initialized');
    const contract = await contractFactory.deploy(...constructorArgs);
    await contract.deployed();
    return {
      address: contract.address,
      transactionHash: contract.deployTransaction.hash,
      blockNumber: contract.deployTransaction.blockNumber
    };
  }

  async callContractMethod(contractAddress, abi, methodName, args = []) {
    if (!this.provider) throw new Error('Provider not initialized');
    const contract = new ethers.Contract(contractAddress, abi, this.provider);
    return await contract[methodName](...args);
  }

  async sendTransaction(contractAddress, abi, methodName, args = [], value = 0) {
    if (!this.wallet) throw new Error('Wallet not initialized');
    const contract = new ethers.Contract(contractAddress, abi, this.wallet);
    const tx = await contract[methodName](...args, { value });
    const receipt = await tx.wait();
    return {
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status
    };
  }

  async estimateGas(contractAddress, abi, methodName, args = [], value = 0) {
    if (!this.provider) throw new Error('Provider not initialized');
    const contract = new ethers.Contract(contractAddress, abi, this.provider);
    return await contract.estimateGas[methodName](...args, { value });
  }

  async getTransactionReceipt(txHash) {
    if (!this.provider) throw new Error('Provider not initialized');
    return await this.provider.getTransactionReceipt(txHash);
  }

  async listenToEvents(contractAddress, abi, eventName, callback) {
    if (!this.provider) throw new Error('Provider not initialized');
    const contract = new ethers.Contract(contractAddress, abi, this.provider);
    contract.on(eventName, callback);
    return () => contract.removeListener(eventName, callback);
  }
}

// ---------------------- Etherscan Service ----------------------
class EtherscanService {
  constructor() {
    this.apiKey = process.env.ETHERSCAN_API_KEY;
    this.baseUrl = process.env.ETHERSCAN_BASE_URL || 'https://api.etherscan.io/api';
  }

  async getAccountTransactions(address, startBlock = 0, endBlock = 99999999) {
    const params = {
      module: 'account',
      action: 'txlist',
      address,
      startblock: startBlock,
      endblock: endBlock,
      sort: 'desc',
      apikey: this.apiKey
    };
    const response = await axios.get(this.baseUrl, { params });
    return response.data.result;
  }

  async getTokenTransactions(address, contractAddress) {
    const params = {
      module: 'account',
      action: 'tokentx',
      address,
      contractaddress: contractAddress,
      sort: 'desc',
      apikey: this.apiKey
    };
    const response = await axios.get(this.baseUrl, { params });
    return response.data.result;
  }

  async getContractABI(contractAddress) {
    const params = {
      module: 'contract',
      action: 'getabi',
      address: contractAddress,
      apikey: this.apiKey
    };
    const response = await axios.get(this.baseUrl, { params });
    return JSON.parse(response.data.result);
  }

  async getContractSourceCode(contractAddress) {
    const params = {
      module: 'contract',
      action: 'getsourcecode',
      address: contractAddress,
      apikey: this.apiKey
    };
    const response = await axios.get(this.baseUrl, { params });
    return response.data.result;
  }

  async getGasPrice() {
    const params = {
      module: 'gastracker',
      action: 'gasoracle',
      apikey: this.apiKey
    };
    const response = await axios.get(this.baseUrl, { params });
    return response.data.result;
  }
}

// ---------------------- CoinGecko Service ----------------------
class CoinGeckoService {
  constructor() {
    this.baseUrl = process.env.COINGECKO_BASE_URL || 'https://api.coingecko.com/api/v3';
  }

  async getPrices(ids, vsCurrencies = ['usd']) {
    const params = {
      ids: Array.isArray(ids) ? ids.join(',') : ids,
      vs_currencies: vsCurrencies.join(','),
      include_market_cap: true,
      include_24hr_vol: true,
      include_24hr_change: true
    };
    const response = await axios.get(`${this.baseUrl}/simple/price`, { params });
    return response.data;
  }

  async getMarketData(vsCurrency = 'usd', order = 'market_cap_desc', perPage = 100) {
    const params = { vs_currency: vsCurrency, order, per_page: perPage, page: 1, sparkline: false };
    const response = await axios.get(`${this.baseUrl}/coins/markets`, { params });
    return response.data;
  }

  async getCoinDetails(coinId) {
    const response = await axios.get(`${this.baseUrl}/coins/${coinId}`);
    return response.data;
  }

  async getHistoricalData(coinId, days = 30, vsCurrency = 'usd') {
    const params = { vs_currency: vsCurrency, days };
    const response = await axios.get(`${this.baseUrl}/coins/${coinId}/market_chart`, { params });
    return response.data;
  }

  async getTrendingCoins() {
    const response = await axios.get(`${this.baseUrl}/search/trending`);
    return response.data;
  }

  async getGlobalMarketData() {
    const response = await axios.get(`${this.baseUrl}/global`);
    return response.data;
  }
}

// ---------------------- Webhook Service ----------------------
class WebhookService {
  constructor() {
    this.webhooks = new Map();
    this.secret = process.env.WEBHOOK_SECRET;
  }

  registerWebhook(name, url, events = []) {
    this.webhooks.set(name, { url, events, active: true, createdAt: new Date() });
  }

  async triggerWebhook(name, event, data) {
    const webhook = this.webhooks.get(name);
    if (!webhook || !webhook.active) throw new Error(`Webhook '${name}' not found or inactive`);
    if (!webhook.events.includes(event)) throw new Error(`Event '${event}' not registered for webhook '${name}'`);

    const payload = { event, data, timestamp: new Date().toISOString(), signature: this.generateSignature(data) };
    try {
      const response = await axios.post(webhook.url, payload, { headers: { 'Content-Type': 'application/json', 'X-Webhook-Signature': payload.signature }, timeout: 10000 });
      return { success: true, status: response.status, response: response.data };
    } catch (error) {
      return { success: false, error: error.message, status: error.response?.status };
    }
  }

  generateSignature(data) {
    if (!this.secret) return null;
    const crypto = require('crypto');
    return crypto.createHmac('sha256', this.secret).update(JSON.stringify(data)).digest('hex');
  }

  verifySignature(payload, signature) {
    if (!this.secret) return true;
    const crypto = require('crypto');
    const expected = crypto.createHmac('sha256', this.secret).update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  }

  listWebhooks() {
    return Array.from(this.webhooks.entries()).map(([name, webhook]) => ({ name, ...webhook }));
  }

  deactivateWebhook(name) {
    const webhook = this.webhooks.get(name);
    if (webhook) { webhook.active = false; return true; }
    return false;
  }

  removeWebhook(name) {
    return this.webhooks.delete(name);
  }
}

// ---------------------- Analytics Service ----------------------
class AnalyticsService {
  constructor() {
    this.events = new Map();
    this.metrics = new Map();
    this.startTime = Date.now();
  }

  trackEvent(eventName, properties = {}) {
    const event = { id: require('crypto').randomUUID(), name: eventName, properties, timestamp: new Date(), sessionId: properties.sessionId || 'anonymous' };
    if (!this.events.has(eventName)) this.events.set(eventName, []);
    this.events.get(eventName).push(event);
    this.updateMetrics(eventName, properties);
    return event.id;
  }

  updateMetrics(eventName, properties) {
    const metricKey = `event:${eventName}`;
    if (!this.metrics.has(metricKey)) this.metrics.set(metricKey, { count: 0, uniqueUsers: new Set(), lastOccurrence: null });
    const metric = this.metrics.get(metricKey);
    metric.count++;
    metric.uniqueUsers.add(properties.userId || 'anonymous');
    metric.lastOccurrence = new Date();
  }

  getEventAnalytics(eventName, timeRange = '24h') {
    const events = this.events.get(eventName) || [];
    const now = new Date();
    const cutoff = new Date(now.getTime() - this.getTimeRangeMs(timeRange));
    const filtered = events.filter(e => e.timestamp > cutoff);
    return { eventName, timeRange, totalEvents: filtered.length, uniqueUsers: new Set(filtered.map(e => e.sessionId)).size, eventsPerHour: this.calculateEventsPerHour(filtered, this.getTimeRangeMs(timeRange)), topProperties: this.getTopProperties(filtered) };
  }

  getTimeRangeMs(timeRange) {
    const ranges = { '1h': 3600000, '24h': 86400000, '7d': 604800000, '30d': 2592000000 };
    return ranges[timeRange] || ranges['24h'];
  }

  calculateEventsPerHour(events, timeRangeMs) { return Math.round(events.length / (timeRangeMs / 3600000)); }
  getTopProperties(events) {
    const counts = {};
    events.forEach(event => { Object.entries(event.properties).forEach(([k, v]) => { counts[`${k}:${v}`] = (counts[`${k}:${v}`] || 0) + 1; }); });
    return Object.entries(counts).sort(([,a],[,b])=>b-a).slice(0,10).map(([property,count])=>({property,count}));
  }

  getAllMetrics() {
    const result = {};
    for (const [key, metric] of this.metrics) result[key] = { count: metric.count, uniqueUsers: metric.uniqueUsers.size, lastOccurrence: metric.lastOccurrence };
    return result;
  }

  getServiceStats() {
    const uptime = Date.now() - this.startTime;
    return { uptime: Math.floor(uptime/1000), totalEvents: Array.from(this.events.values()).reduce((sum, events) => sum + events.length, 0), uniqueEvents: this.events.size, totalMetrics: this.metrics.size };
  }
}

// ---------------------- Export Services ----------------------
module.exports = {
  BlockchainService,
  EtherscanService,
  CoinGeckoService,
  WebhookService,
  AnalyticsService
};
const { ethers } = require('ethers');

// Public Ethereum RPC endpoints with automatic fallback
const DEFAULT_RPC_PROVIDERS = [
  'https://ethereum-rpc.publicnode.com',
  'https://rpc.flashbots.net',
  'https://eth.drpc.org',
  'https://gateway.tenderly.co/public/mainnet'
];

// Target Pre-deployed / Public Smart Contracts on Ethereum Mainnet
const USDT_CONTRACT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const CHAINLINK_ETH_USD_ADDRESS = '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419';
const SAMPLE_WALLET_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'; // vitalik.eth

// Minimal ABIs for public getters
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address who) view returns (uint256)',
  'function owner() view returns (address)',
  'function paused() view returns (bool)'
];

const CHAINLINK_AGGREGATOR_ABI = [
  'function description() view returns (string)',
  'function decimals() view returns (uint8)',
  'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)'
];

class ContractTestService {
  /**
   * Initializes or returns a working ethers JsonRpcProvider.
   */
  static async getWorkingProvider() {
    const customRpc = process.env.ETHEREUM_RPC_URL;
    const rpcList = customRpc ? [customRpc, ...DEFAULT_RPC_PROVIDERS] : DEFAULT_RPC_PROVIDERS;

    for (const rpcUrl of rpcList) {
      try {
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        // Test lightweight network ping with 5s timeout
        await Promise.race([
          provider.getBlockNumber(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('RPC Timeout')), 5000))
        ]);
        return { provider, rpcUrl };
      } catch (err) {
        // Try next provider silently
        continue;
      }
    }

    // Fallback if all failed
    throw new Error('Unable to connect to any Ethereum RPC provider. Please check network connectivity or provide ETHEREUM_RPC_URL.');
  }

  /**
   * Fetch on-chain data from public smart contracts
   * @param {string} targetAddress - Optional wallet address to query balance for
   */
  static async fetchSmartContractData(targetAddress = SAMPLE_WALLET_ADDRESS) {
    const startTime = Date.now();
    const { provider, rpcUrl } = await this.getWorkingProvider();

    // Instantiate contract instances
    const usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, ERC20_ABI, provider);
    const chainlinkOracle = new ethers.Contract(CHAINLINK_ETH_USD_ADDRESS, CHAINLINK_AGGREGATOR_ABI, provider);

    // Fetch network state and contract data concurrently
    const [
      network,
      blockNumber,
      gasPrice,
      tokenName,
      tokenSymbol,
      tokenDecimals,
      totalSupplyRaw,
      ownerAddress,
      isPaused,
      accountBalanceRaw,
      oracleDesc,
      oracleDecimals,
      latestRound
    ] = await Promise.all([
      provider.getNetwork(),
      provider.getBlockNumber(),
      provider.getGasPrice().catch(() => ethers.BigNumber.from(0)),
      usdtContract.name().catch(() => 'Tether USD'),
      usdtContract.symbol().catch(() => 'USDT'),
      usdtContract.decimals().catch(() => 6),
      usdtContract.totalSupply(),
      usdtContract.owner().catch(() => 'N/A'),
      usdtContract.paused().catch(() => false),
      usdtContract.balanceOf(targetAddress).catch(() => ethers.BigNumber.from(0)),
      chainlinkOracle.description().catch(() => 'ETH / USD'),
      chainlinkOracle.decimals().catch(() => 8),
      chainlinkOracle.latestRoundData()
    ]);

    // Format numbers and values
    const formattedTotalSupply = ethers.utils.formatUnits(totalSupplyRaw, tokenDecimals);
    const numericTotalSupply = parseFloat(formattedTotalSupply);
    const formattedBalance = ethers.utils.formatUnits(accountBalanceRaw, tokenDecimals);
    const numericBalance = parseFloat(formattedBalance);
    const gasPriceGwei = ethers.utils.formatUnits(gasPrice, 'gwei');

    // Chainlink price calculation
    const rawPrice = latestRound.answer;
    const ethPriceUSD = (Number(rawPrice) / Math.pow(10, oracleDecimals)).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    const executionTimeMs = Date.now() - startTime;

    const result = {
      developer: 'Lijin',
      endpoint: '/api/lijinApiTest',
      timestamp: new Date().toISOString(),
      executionDuration: `${executionTimeMs}ms`,
      rpcEndpoint: rpcUrl,
      network: {
        name: network.name,
        chainId: network.chainId,
        latestBlock: blockNumber,
        gasPriceGwei: `${parseFloat(gasPriceGwei).toFixed(2)} Gwei`
      },
      contract: {
        name: tokenName,
        symbol: tokenSymbol,
        address: USDT_CONTRACT_ADDRESS,
        decimals: tokenDecimals,
        totalSupply: formattedTotalSupply,
        formattedTotalSupply: `${numericTotalSupply.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${tokenSymbol}`,
        owner: ownerAddress,
        isPaused: isPaused
      },
      queriedAccount: {
        address: targetAddress,
        label: targetAddress.toLowerCase() === SAMPLE_WALLET_ADDRESS.toLowerCase() ? 'vitalik.eth (Sample Account)' : 'Custom Address',
        balance: formattedBalance,
        formattedBalance: `${numericBalance.toLocaleString('en-US', { maximumFractionDigits: 6 })} ${tokenSymbol}`
      },
      oracleFeed: {
        description: oracleDesc,
        contractAddress: CHAINLINK_ETH_USD_ADDRESS,
        latestPrice: ethPriceUSD,
        roundId: latestRound.roundId.toString(),
        updatedAt: new Date(Number(latestRound.updatedAt) * 1000).toISOString()
      }
    };

    // Print clean, formatted output to server console as required by assessment instructions
    this.printConsoleOutput(result);

    return result;
  }

  /**
   * Formatted and colorful console output
   */
  static printConsoleOutput(data) {
    console.log('\n' + '='.repeat(68));
    console.log(`🚀 [${data.developer}ApiTest] SMART CONTRACT QUERY EXECUTION SUCCESS`);
    console.log('='.repeat(68));
    console.log(`📅 Timestamp:         ${data.timestamp}`);
    console.log(`⚡ Execution Time:    ${data.executionDuration}`);
    console.log(`🌐 Network:           ${data.network.name} (Chain ID: ${data.network.chainId})`);
    console.log(`📦 Latest Block:      #${data.network.latestBlock}`);
    console.log(`⛽ Gas Price:         ${data.network.gasPriceGwei}`);
    console.log(`🔗 RPC Provider:      ${data.rpcEndpoint}`);
    console.log('-'.repeat(68));
    console.log('📄 SMART CONTRACT DETAILS:');
    console.log(`   • Token Name:      ${data.contract.name}`);
    console.log(`   • Symbol:          ${data.contract.symbol}`);
    console.log(`   • Contract Address: ${data.contract.address}`);
    console.log(`   • Decimals:        ${data.contract.decimals}`);
    console.log(`   • Total Supply:    ${data.contract.formattedTotalSupply}`);
    console.log(`   • Owner Address:   ${data.contract.owner}`);
    console.log(`   • Contract Paused: ${data.contract.isPaused}`);
    console.log('-'.repeat(68));
    console.log('👤 QUERIED ACCOUNT BALANCE:');
    console.log(`   • Address:         ${data.queriedAccount.address} (${data.queriedAccount.label})`);
    console.log(`   • Balance:         ${data.queriedAccount.formattedBalance}`);
    console.log('-'.repeat(68));
    console.log('🔮 LIVE CHAINLINK ORACLE FEED:');
    console.log(`   • Feed:            ${data.oracleFeed.description} (${data.oracleFeed.contractAddress})`);
    console.log(`   • Latest Price:    ${data.oracleFeed.latestPrice}`);
    console.log(`   • Last Updated:    ${data.oracleFeed.updatedAt}`);
    console.log('='.repeat(68) + '\n');
  }
}

module.exports = ContractTestService;

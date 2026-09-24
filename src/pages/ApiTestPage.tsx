import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, CheckCircle2, Globe, Cpu, Coins, ShieldCheck, ArrowUpRight, Copy, Check } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

interface SmartContractData {
  developer: string;
  endpoint: string;
  timestamp: string;
  executionDuration: string;
  rpcEndpoint: string;
  network: {
    name: string;
    chainId: number;
    latestBlock: number;
    gasPriceGwei: string;
  };
  contract: {
    name: string;
    symbol: string;
    address: string;
    decimals: number;
    totalSupply: string;
    formattedTotalSupply: string;
    owner: string;
    isPaused: boolean;
  };
  queriedAccount: {
    address: string;
    label: string;
    balance: string;
    formattedBalance: string;
  };
  oracleFeed: {
    description: string;
    contractAddress: string;
    latestPrice: string;
    roundId: string;
    updatedAt: string;
  };
}

export const ApiTestPage: React.FC = () => {
  const [data, setData] = useState<SmartContractData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [customAddress, setCustomAddress] = useState<string>('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
  const [copied, setCopied] = useState<boolean>(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const fetchData = async (addressQuery?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = addressQuery 
        ? `${API_BASE}/api/lijinApiTest?address=${encodeURIComponent(addressQuery)}&format=json`
        : `${API_BASE}/api/lijinApiTest?format=json`;

      const res = await axios.get(url);
      if (res.data && res.data.data) {
        setData(res.data.data);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (err: any) {
      console.error('Failed to fetch smart contract data:', err);
      setError(err.response?.data?.error || err.message || 'Failed to connect to backend API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCustomQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (customAddress.trim()) {
      fetchData(customAddress.trim());
    }
  };

  const copyToClipboard = () => {
    if (data) {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 mb-8 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-600/20 text-blue-400 text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold border border-blue-500/30">
                Assessment Deliverable
              </span>
              <span className="text-xs text-slate-400 font-mono">/api/lijinApiTest</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Smart Contract Explorer
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Live on-chain data retrieval from Ethereum Mainnet via <span className="text-slate-200 font-mono">ethers.js</span>
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 px-3.5 py-1.5 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Connected to Ethereum Mainnet</span>
          </div>
        </div>

        {loading && !data && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Querying Ethereum Mainnet smart contracts...</p>
          </div>
        )}

        {error && (
          <div className="bg-rose-950/40 border border-rose-500/30 text-rose-300 p-4 rounded-xl mb-8 text-sm">
            <p className="font-semibold">Query Error</p>
            <p className="text-xs mt-1 text-rose-400">{error}</p>
            <button 
              onClick={() => fetchData()}
              className="mt-3 bg-rose-600/30 hover:bg-rose-600/50 text-white text-xs px-3 py-1.5 rounded-lg transition"
            >
              Retry
            </button>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Token Card */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur shadow-xl hover:border-slate-700 transition">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  <Coins className="w-4 h-4 text-blue-400" />
                  <span>ERC-20 Token</span>
                </div>
                <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  {data.contract.symbol}
                </div>
                <p className="text-xs text-slate-400 mt-0.5 mb-4">{data.contract.name}</p>

                <div className="space-y-2 text-xs divide-y divide-slate-800/60">
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-400">Total Supply</span>
                    <span className="font-semibold text-slate-200">{data.contract.formattedTotalSupply}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-400">Decimals</span>
                    <span className="font-mono text-slate-300">{data.contract.decimals}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-400">Status</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${data.contract.isPaused ? 'bg-amber-900/40 text-amber-300' : 'bg-emerald-900/40 text-emerald-300'}`}>
                      {data.contract.isPaused ? 'Paused' : 'Active'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 items-center">
                    <span className="text-slate-400">Etherscan</span>
                    <a 
                      href={`https://etherscan.io/token/${data.contract.address}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono text-[11px]"
                    >
                      {data.contract.address.slice(0, 6)}...{data.contract.address.slice(-4)}
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Chainlink Oracle Card */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur shadow-xl hover:border-slate-700 transition">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span>Chainlink Oracle</span>
                </div>
                <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                  {data.oracleFeed.latestPrice}
                </div>
                <p className="text-xs text-slate-400 mt-0.5 mb-4">{data.oracleFeed.description} Price Feed</p>

                <div className="space-y-2 text-xs divide-y divide-slate-800/60">
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-400">Round ID</span>
                    <span className="font-mono text-slate-300 text-[11px]">{data.oracleFeed.roundId.slice(0, 10)}...</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-400">Last Updated</span>
                    <span className="text-slate-300">{new Date(data.oracleFeed.updatedAt).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 items-center">
                    <span className="text-slate-400">Contract</span>
                    <a 
                      href={`https://etherscan.io/address/${data.oracleFeed.contractAddress}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono text-[11px]"
                    >
                      {data.oracleFeed.contractAddress.slice(0, 6)}...{data.oracleFeed.contractAddress.slice(-4)}
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Network Card */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur shadow-xl hover:border-slate-700 transition">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>Network Sync</span>
                </div>
                <div className="text-2xl font-black text-slate-100 font-mono">
                  #{data.network.latestBlock.toLocaleString()}
                </div>
                <p className="text-xs text-slate-400 mt-0.5 mb-4">{data.network.name} (Chain ID {data.network.chainId})</p>

                <div className="space-y-2 text-xs divide-y divide-slate-800/60">
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-400">Gas Price</span>
                    <span className="font-mono text-emerald-400 font-semibold">{data.network.gasPriceGwei}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-400">Query Time</span>
                    <span className="font-mono text-slate-300">{data.executionDuration}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-400">RPC Status</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Healthy
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Balance Query Card */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur shadow-xl">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Account Balance Lookup</span>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs text-slate-400">Queried Address:</span>
                    <p className="font-mono text-xs md:text-sm text-slate-200 break-all">{data.queriedAccount.address}</p>
                    <span className="text-[11px] text-purple-400 font-medium">{data.queriedAccount.label}</span>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-xs text-slate-400">USDT Balance:</span>
                    <p className="text-lg md:text-xl font-extrabold text-cyan-400 font-mono">
                      {data.queriedAccount.formattedBalance}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCustomQuery} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  placeholder="Enter any Ethereum address (0x...)"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500 transition"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Query Balance</span>
                </button>
              </form>
            </div>

            {/* Raw JSON Block */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur shadow-xl">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-mono text-slate-400 font-semibold uppercase">API JSON Payload</span>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
                </button>
              </div>
              <pre className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 text-[11px] font-mono text-slate-400 overflow-x-auto max-h-72 leading-relaxed">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ApiTestPage;

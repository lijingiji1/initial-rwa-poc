/**
 * Generates modern, responsive Web3 UI HTML for the smart contract test endpoint.
 */
function renderApiTestHtml(data) {
  const jsonString = JSON.stringify({ success: true, message: 'Smart contract on-chain data fetched and logged successfully', data }, null, 2);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.developer}ApiTest • Web3 Smart Contract Explorer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-primary: #0a0d14;
      --bg-secondary: #101622;
      --card-bg: rgba(22, 30, 46, 0.75);
      --card-border: rgba(255, 255, 255, 0.08);
      --accent-blue: #3b82f6;
      --accent-cyan: #06b6d4;
      --accent-green: #10b981;
      --accent-purple: #8b5cf6;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --text-dim: #64748b;
      --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-primary);
      background-image: 
        radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.12) 0px, transparent 50%),
        radial-gradient(at 100% 0%, rgba(6, 182, 212, 0.12) 0px, transparent 50%),
        radial-gradient(at 50% 100%, rgba(139, 92, 246, 0.08) 0px, transparent 50%);
      color: var(--text-main);
      font-family: var(--font-sans);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      padding: 24px 16px;
    }

    .container {
      max-width: 1100px;
      margin: 0 auto;
      width: 100%;
    }

    /* Header */
    header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--card-border);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-badge {
      background: linear-gradient(135deg, #3b82f6, #06b6d4);
      color: white;
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 20px;
      box-shadow: 0 4px 14px rgba(59, 130, 246, 0.35);
    }

    .brand-text h1 {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--text-main);
    }

    .brand-text p {
      font-size: 13px;
      color: var(--text-muted);
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 9999px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
      font-size: 13px;
      font-weight: 600;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 10px #10b981;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.85); }
    }

    /* Grid Layout */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .card {
      background: var(--card-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 22px;
      transition: transform 0.2s ease, border-color 0.2s ease;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    }

    .card:hover {
      border-color: rgba(255, 255, 255, 0.16);
      transform: translateY(-2px);
    }

    .card-title {
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .card-icon {
      font-size: 18px;
    }

    .key-metric {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text-main);
      margin-bottom: 12px;
    }

    .key-metric.gradient {
      background: linear-gradient(135deg, #60a5fa, #22d3ee);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .key-metric.green {
      background: linear-gradient(135deg, #34d399, #10b981);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* Detail Rows */
    .detail-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13.5px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .detail-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .detail-label {
      color: var(--text-muted);
    }

    .detail-value {
      font-weight: 600;
      color: var(--text-main);
      text-align: right;
    }

    .mono {
      font-family: var(--font-mono);
      font-size: 12.5px;
    }

    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
    }

    .badge-blue { background: rgba(59, 130, 246, 0.15); color: #93c5fd; }
    .badge-green { background: rgba(16, 185, 129, 0.15); color: #6ee7b7; }
    .badge-purple { background: rgba(139, 92, 246, 0.15); color: #c4b5fd; }

    /* Interactive Query Form */
    .query-box {
      margin-top: 14px;
      display: flex;
      gap: 8px;
    }

    .query-input {
      flex: 1;
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid var(--card-border);
      color: var(--text-main);
      font-family: var(--font-mono);
      font-size: 12px;
      padding: 10px 14px;
      border-radius: 8px;
      outline: none;
      transition: border-color 0.2s;
    }

    .query-input:focus {
      border-color: var(--accent-blue);
    }

    .query-btn {
      background: linear-gradient(135deg, #2563eb, #0284c7);
      color: white;
      border: none;
      font-weight: 600;
      font-size: 13px;
      padding: 10px 18px;
      border-radius: 8px;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .query-btn:hover {
      opacity: 0.9;
    }

    /* JSON Viewer */
    .json-section {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 20px;
      margin-top: 8px;
    }

    .json-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
    }

    .json-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-action {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: var(--text-main);
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-action:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    pre.json-code {
      background: #06090e;
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      padding: 16px;
      font-family: var(--font-mono);
      font-size: 12px;
      color: #94a3b8;
      overflow-x: auto;
      max-height: 380px;
      line-height: 1.5;
    }

    footer {
      margin-top: 40px;
      text-align: center;
      font-size: 12px;
      color: var(--text-dim);
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="brand">
        <div class="logo-badge">W3</div>
        <div class="brand-text">
          <h1>${data.developer}ApiTest • Web3 Smart Contract Explorer</h1>
          <p>Ethereum Mainnet On-Chain Data &amp; Live Oracle Integration</p>
        </div>
      </div>
      <div class="status-pill">
        <span class="status-dot"></span>
        <span>Connected to Ethereum Mainnet</span>
      </div>
    </header>

    <!-- Top Stats Grid -->
    <div class="grid">
      <!-- USDT Smart Contract Card -->
      <div class="card">
        <div class="card-title">
          <span class="card-icon">🪙</span>
          <span>Smart Contract Token</span>
        </div>
        <div class="key-metric gradient">${data.contract.symbol} <span style="font-size: 18px; color: var(--text-muted); font-weight: 400;">(${data.contract.name})</span></div>
        <div class="detail-list">
          <div class="detail-row">
            <span class="detail-label">Contract Address</span>
            <span class="detail-value mono"><a href="https://etherscan.io/token/${data.contract.address}" target="_blank" style="color: #60a5fa; text-decoration: none;">${data.contract.address.substring(0, 10)}...${data.contract.address.substring(34)} ↗</a></span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Total Supply</span>
            <span class="detail-value" style="font-weight: 700; color: #38bdf8;">${data.contract.formattedTotalSupply}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Decimals</span>
            <span class="detail-value">${data.contract.decimals}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Contract Owner</span>
            <span class="detail-value mono">${data.contract.owner.substring(0, 8)}...${data.contract.owner.substring(36)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status</span>
            <span class="detail-value"><span class="badge ${data.contract.isPaused ? 'badge-purple' : 'badge-green'}">${data.contract.isPaused ? 'Paused' : 'Active'}</span></span>
          </div>
        </div>
      </div>

      <!-- Live Chainlink Oracle Card -->
      <div class="card">
        <div class="card-title">
          <span class="card-icon">🔮</span>
          <span>Live Chainlink Oracle</span>
        </div>
        <div class="key-metric green">${data.oracleFeed.latestPrice}</div>
        <div class="detail-list">
          <div class="detail-row">
            <span class="detail-label">Feed Pair</span>
            <span class="detail-value"><span class="badge badge-blue">${data.oracleFeed.description}</span></span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Oracle Contract</span>
            <span class="detail-value mono"><a href="https://etherscan.io/address/${data.oracleFeed.contractAddress}" target="_blank" style="color: #60a5fa; text-decoration: none;">${data.oracleFeed.contractAddress.substring(0, 10)}... ↗</a></span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Round ID</span>
            <span class="detail-value mono">${data.oracleFeed.roundId.substring(0, 12)}...</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Last Updated</span>
            <span class="detail-value">${new Date(data.oracleFeed.updatedAt).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      <!-- Network & RPC Card -->
      <div class="card">
        <div class="card-title">
          <span class="card-icon">🌐</span>
          <span>Network &amp; RPC Sync</span>
        </div>
        <div class="key-metric">#${data.network.latestBlock.toLocaleString()}</div>
        <div class="detail-list">
          <div class="detail-row">
            <span class="detail-label">Network</span>
            <span class="detail-value">${data.network.name} (Chain ID ${data.network.chainId})</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Gas Price</span>
            <span class="detail-value">${data.network.gasPriceGwei}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Latency / Query Time</span>
            <span class="detail-value" style="color: #34d399;">${data.executionDuration}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">RPC Endpoint</span>
            <span class="detail-value mono" style="font-size: 11.5px; max-width: 170px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${data.rpcEndpoint}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Account Balance & Interactive Query Section -->
    <div class="card" style="margin-bottom: 24px;">
      <div class="card-title">
        <span class="card-icon">👤</span>
        <span>Live Account Balance Query</span>
      </div>
      <div class="detail-list">
        <div class="detail-row">
          <span class="detail-label">Queried Account</span>
          <span class="detail-value mono"><strong>${data.queriedAccount.address}</strong> <span class="badge badge-purple" style="margin-left: 6px;">${data.queriedAccount.label}</span></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">USDT Token Balance</span>
          <span class="detail-value" style="font-size: 16px; font-weight: 700; color: #38bdf8;">${data.queriedAccount.formattedBalance}</span>
        </div>
      </div>

      <form class="query-box" method="GET" action="/api/lijinApiTest">
        <input 
          class="query-input" 
          type="text" 
          name="address" 
          placeholder="Enter any Ethereum address to check its live USDT balance (0x...)" 
          value="${data.queriedAccount.address}"
        />
        <button class="query-btn" type="submit">Query Live Balance</button>
      </form>
    </div>

    <!-- Raw JSON Inspector -->
    <div class="json-section">
      <div class="json-header">
        <div class="json-title">
          <span>📦</span>
          <span>Raw API JSON Output (Format: application/json)</span>
        </div>
        <div style="display: flex; gap: 8px;">
          <a href="/api/lijinApiTest?format=json" class="btn-action" target="_blank" style="text-decoration: none;">View Raw JSON ↗</a>
          <button class="btn-action" onclick="copyJson()">Copy JSON</button>
        </div>
      </div>
      <pre class="json-code" id="jsonBlock"><code>${escapeHtml(jsonString)}</code></pre>
    </div>

    <footer>
      <p>Engineering Assessment • Built by ${data.developer} • Endpoint: <code>${data.endpoint}</code></p>
    </footer>
  </div>

  <script>
    function copyJson() {
      const text = document.getElementById('jsonBlock').innerText;
      navigator.clipboard.writeText(text).then(() => {
        alert('JSON copied to clipboard!');
      });
    }
  </script>
</body>
</html>`;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = { renderApiTestHtml };

const http = require('http');
const app = require('../src/server/server');

async function runTests() {
  console.log('🧪 Starting Assessment Automated Verification Tests...\n');

  const server = http.createServer(app);
  const PORT = 3099;

  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`📡 [Temporary Test Runner] Running on http://localhost:${PORT}`);
  console.log(`ℹ️ (This test server will automatically close when tests complete)\n`);

  try {
    // -------------------------------------------------------------
    // Test 1: GET /api/lijinApiTest (Default Smart Contract Query)
    // -------------------------------------------------------------
    console.log('▶️ TEST 1: Querying default smart contract data via GET /api/lijinApiTest');
    const res1 = await fetch(`http://localhost:${PORT}/api/lijinApiTest`);
    const json1 = await res1.json();

    if (res1.status !== 200) {
      throw new Error(`Expected HTTP 200, got ${res1.status}: ${JSON.stringify(json1)}`);
    }
    if (!json1.success) {
      throw new Error(`Expected success: true, got ${json1.success}`);
    }
    if (json1.data.contract.symbol !== 'USDT') {
      throw new Error(`Expected symbol 'USDT', got ${json1.data.contract.symbol}`);
    }
    console.log('✅ TEST 1 PASSED: Successfully retrieved USDT token details & Chainlink oracle feed.\n');

    // -------------------------------------------------------------
    // Test 2: GET /lijinApiTest (Root route alias)
    // -------------------------------------------------------------
    console.log('▶️ TEST 2: Querying root alias GET /lijinApiTest');
    const res2 = await fetch(`http://localhost:${PORT}/lijinApiTest`);
    const json2 = await res2.json();

    if (res2.status !== 200 || !json2.success) {
      throw new Error(`Root alias failed with status ${res2.status}`);
    }
    console.log('✅ TEST 2 PASSED: Root alias /lijinApiTest functions properly.\n');

    // -------------------------------------------------------------
    // Test 3: GET /api/lijinApiTest with custom wallet address
    // -------------------------------------------------------------
    const testWallet = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'; // vitalik.eth
    console.log(`▶️ TEST 3: Querying custom balance for ${testWallet}`);
    const res3 = await fetch(`http://localhost:${PORT}/api/lijinApiTest?address=${testWallet}`);
    const json3 = await res3.json();

    if (res3.status !== 200 || json3.data.queriedAccount.address.toLowerCase() !== testWallet.toLowerCase()) {
      throw new Error(`Custom address query failed: ${JSON.stringify(json3)}`);
    }
    console.log(`✅ TEST 3 PASSED: Queried account balance: ${json3.data.queriedAccount.formattedBalance}\n`);

    // -------------------------------------------------------------
    // Test 4: Validation with invalid address
    // -------------------------------------------------------------
    console.log('▶️ TEST 4: Verifying error handling for invalid Ethereum address');
    const res4 = await fetch(`http://localhost:${PORT}/api/lijinApiTest?address=invalid-address-123`);
    const json4 = await res4.json();

    if (res4.status !== 400 || json4.success !== false) {
      throw new Error(`Expected 400 Bad Request for invalid address, got ${res4.status}`);
    }
    console.log('✅ TEST 4 PASSED: Invalid address rejected with 400 Bad Request.\n');

    // -------------------------------------------------------------
    // Test 5: POST /api/lijinApiTest
    // -------------------------------------------------------------
    console.log('▶️ TEST 5: POST /api/lijinApiTest with body payload');
    const res5 = await fetch(`http://localhost:${PORT}/api/lijinApiTest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: testWallet })
    });
    const json5 = await res5.json();

    if (res5.status !== 200 || !json5.success) {
      throw new Error(`POST request failed with status ${res5.status}`);
    }
    console.log('✅ TEST 5 PASSED: POST endpoint functions properly.\n');

    console.log('🎉 ALL 5 VERIFICATION TESTS PASSED SUCCESSFULLY!\n');
    console.log('💡 To run the live server and view the Web3 UI in your browser:');
    console.log('👉 Run: node src/server/server.js');
    console.log('👉 Then open: http://localhost:3001 (or http://localhost:3001/api/lijinApiTest)\n');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    process.exit(process.exitCode || 0);
  }
}

runTests();

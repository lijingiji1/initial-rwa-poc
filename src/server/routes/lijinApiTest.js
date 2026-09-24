const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const ContractTestService = require('../services/contractTestService');
const { renderApiTestHtml } = require('../views/apiTestHtml');

/**
 * @route   GET /api/lijinApiTest
 * @route   GET /lijinApiTest
 * @desc    Fetch live smart contract data from Ethereum Mainnet (USDT & Chainlink Price Feed)
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { address, format } = req.query;

    // Validate optional address if provided
    if (address && !ethers.utils.isAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Ethereum address format provided in query parameter "address".'
      });
    }

    const data = await ContractTestService.fetchSmartContractData(address || undefined);

    // If request comes from a browser and format !== 'json', render interactive UI
    const isBrowserRequest = req.headers.accept && req.headers.accept.includes('text/html') && format !== 'json';
    if (isBrowserRequest) {
      return res.status(200).send(renderApiTestHtml(data));
    }

    // Default API JSON response
    res.status(200).json({
      success: true,
      message: 'Smart contract on-chain data fetched and logged successfully',
      data
    });
  } catch (error) {
    console.error('❌ [lijinApiTest] Error querying smart contract:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch smart contract data from Ethereum blockchain',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/lijinApiTest
 * @desc    Fetch live smart contract data with custom target address in payload
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { address } = req.body || {};

    if (address && !ethers.utils.isAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Ethereum address format provided in request body.'
      });
    }

    const data = await ContractTestService.fetchSmartContractData(address || undefined);

    res.status(200).json({
      success: true,
      message: 'Smart contract on-chain data fetched and logged successfully',
      data
    });
  } catch (error) {
    console.error('❌ [lijinApiTest] Error querying smart contract:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch smart contract data from Ethereum blockchain',
      details: error.message
    });
  }
});

module.exports = router;

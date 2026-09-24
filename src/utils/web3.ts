import { ethers, Contract, Signer, BigNumber, Event } from 'ethers';
import { Provider } from '@ethersproject/providers';

// ABI for RWABToken.sol
const RWABTokenABI = [
  // ERC-1155 functions
  'function balanceOf(address account, uint256 id) view returns (uint256)',
  'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data) external',
  // Token management
  'function mint(address to, uint256 id, uint256 amount, string tokenUri, bytes data) external',
  'function mintBatch(address to, uint256[] ids, uint256[] amounts, string[] uris, bytes data) external',
  'function burn(address account, uint256 id, uint256 amount) external',
  'function burnBatch(address account, uint256[] ids, uint256[] amounts) external',
  'function setURI(uint256 tokenId, string newuri) external',
  'function uri(uint256 tokenId) view returns (string)',
  // Compliance and identity
  'function setIdentityRegistry(address _identityRegistry) external',
  'function setCompliance(address _compliance) external',
  'function identityRegistry() view returns (address)',
  'function compliance() view returns (address)',
  // Freezing
  'function freezeToken(uint256 tokenId) external',
  'function unfreezeToken(uint256 tokenId) external',
  'function freezeWallet(address wallet, uint256 tokenId) external',
  'function unfreezeWallet(address wallet, uint256 tokenId) external',
  'function tokenFrozen(uint256 tokenId) view returns (bool)',
  'function walletFrozen(address wallet, uint256 tokenId) view returns (bool)',
  // Forced transfers and recovery
  'function forcedTransfer(address from, address to, uint256 id, uint256 amount, bytes data) external',
  'function recover(address lostWallet, address newWallet, uint256 id, uint256 amount) external',
  // Pausing
  'function pause() external',
  'function unpause() external',
  'function paused() view returns (bool)',
  // Interface support
  'function supportsInterface(bytes4 interfaceId) view returns (bool)',
  // Roles
  'function hasRole(bytes32 role, address account) view returns (bool)',
  'function grantRole(bytes32 role, address account) external',
  // Events
  'event TokenMetadataUpdated(uint256 indexed tokenId, string uri)',
  'event TokenFrozen(uint256 indexed tokenId)',
  'event TokenUnfrozen(uint256 indexed tokenId)',
  'event TokensFrozen(address indexed wallet, uint256 indexed id)',
  'event TokensUnfrozen(address indexed wallet, uint256 indexed id)',
  'event TokensBurned(address indexed account, uint256 indexed id, uint256 amount)',
  'event IdentityRegistryAdded(address indexed identityRegistry)',
  'event ComplianceAdded(address indexed compliance)',
  'event RecoverySuccess(address indexed lostWallet, address indexed newWallet, address indexed investorId)',
];

// ABI for RWABKYC.sol
const RWABKYCABI = [
  // KYC submission
  'function submitKYC(string governmentId, string proofOfAddress, string[] additionalDocs, string nationality) external',
  'function updateDocuments(string governmentId, string proofOfAddress, string[] additionalDocs, string nationality) external',
  // Verification
  'function verifyKYC(address user, bool idVerified, bool addressVerified, uint8 riskLevel) external',
  'function batchVerifyKYC(address[] users, bool[] idVerifieds, bool[] addressVerifieds, uint8[] riskLevels) external',
  'function rejectKYC(address user) external',
  'function batchRejectKYC(address[] users) external',
  // Configuration
  'function updateVerificationRequirements(bool requireId, bool requireAddress, bool requireAdditionalDocs, uint256 minDocsCount) external',
  // Fund withdrawal
  'function withdrawFunds(address token, address recipient, uint256 amount) external',
  // IIdentityRegistry
  'function isVerified(address userAddress) view returns (bool)',
  'function identity(address userAddress) view returns (bytes32)',
  // View functions
  'function getKYCStatus(address user) view returns (uint8)',
  'function getKYCData(address user) view returns (tuple(address user, uint8 status, bytes32 identityId, bool idVerified, bool addressVerified, string governmentId, string proofOfAddress, string[] additionalDocs, string nationality, uint8 riskLevel, uint256 verificationDate, uint256 lastReviewDate, address verifiedBy))',
  'function getUserHistory(address user) view returns (tuple(address user, uint8 status, bytes32 identityId, bool idVerified, bool addressVerified, string governmentId, string proofOfAddress, string[] additionalDocs, string nationality, uint8 riskLevel, uint256 verificationDate, uint256 lastReviewDate, address verifiedBy)[])',
  'function getAllPendingUsers() view returns (address[])',
  'function getVerificationRequirements() view returns (tuple(bool requireId, bool requireAddress, bool requireAdditionalDocs, uint256 minDocsCount))',
  // Pausing
  'function pause() external',
  'function unpause() external',
  'function paused() view returns (bool)',
  // Roles
  'function hasRole(bytes32 role, address account) view returns (bool)',
  'function grantRole(bytes32 role, address account) external',
  // Events
  'event KYCSubmitted(address indexed user, bytes32 indexed identityId)',
  'event KYCVerified(address indexed user, address indexed validator, bytes32 indexed identityId)',
  'event KYCRejected(address indexed user, address indexed validator, bytes32 indexed identityId)',
  'event DocumentsUpdated(address indexed user, bytes32 indexed identityId)',
  'event BatchKYCVerified(address[] indexed users, address indexed validator)',
  'event BatchKYCRejected(address[] indexed users, address indexed validator)',
  'event VerificationRequirementsUpdated(bool requireId, bool requireAddress, bool requireAdditionalDocs, uint256 minDocsCount)',
  'event FundsWithdrawn(address indexed token, address indexed recipient, uint256 amount)',
];

// ABI for RWABMarketplace.sol
const RWABMarketplaceABI = [
  // Asset management
  'function createAsset(string title, string description, string category, uint256 price, uint8 tokenizationType, uint256 totalTokens, uint256 pricePerToken, uint8 listingType, uint256 auctionEndTime, address royaltyReceiver, uint96 royaltyFraction) external returns (uint256)',
  'function validateAsset(uint256 assetId) external',
  'function rejectAsset(uint256 assetId) external',
  // Listing management
  'function createListing(uint256 assetId, address paymentToken, uint256 price, uint256 tokenAmount, uint8 listingType, uint256 auctionEndTime) external returns (uint256)',
  'function batchCreateListings(uint256[] assetIds, address[] paymentTokens, uint256[] prices, uint256[] tokenAmounts, uint8[] listingTypes, uint256[] auctionEndTimes) external returns (uint256[])',
  'function cancelListing(uint256 listingId) external',
  // Purchase and auction
  'function buyListing(uint256 listingId) external payable',
  'function placeBid(uint256 listingId) external payable',
  'function finalizeAuction(uint256 listingId) external',
  // Admin functions
  'function addPaymentToken(address token) external',
  'function removePaymentToken(address token) external',
  'function updatePlatformFee(uint256 newFeeRate) external',
  'function updateFeeCollector(address newFeeCollector) external',
  'function withdrawFunds(address token, address recipient, uint256 amount) external',
  // View functions
  'function getAssetDetails(uint256 assetId) view returns (uint256 id, address owner, string title, string description, string category, uint8 status, uint256 price, uint8 tokenizationType, uint256 totalTokens, uint256 availableTokens, uint256 pricePerToken, uint8 listingType, bool isVerified, uint256 createdAt, uint256 updatedAt, uint256 auctionEndTime, address royaltyReceiver, uint96 royaltyFraction)',
  'function getListingDetails(uint256 listingId) view returns (uint256 id, uint256 assetId, address seller, address paymentToken, uint256 price, uint256 tokenAmount, uint8 listingType, bool active, uint256 createdAt, uint256 auctionEndTime)',
  'function getBids(uint256 listingId) view returns (tuple(address bidder, uint256 amount, uint256 timestamp)[])',
  'function getUserAssets(address user) view returns (uint256[])',
  'function getUserListings(address user) view returns (uint256[])',
  'function getAllActiveListings() view returns (uint256[])',
  'function identityRegistry() view returns (address)',
  'function compliance() view returns (address)',
  'function feeCollector() view returns (address)',
  'function platformFeeRate() view returns (uint256)',
  'function supportedPaymentTokens(address token) view returns (bool)',
  // Pausing
  'function pause() external',
  'function unpause() external',
  'function paused() view returns (bool)',
  // Interface support
  'function supportsInterface(bytes4 interfaceId) view returns (bool)',
  // Roles
  'function hasRole(bytes32 role, address account) view returns (bool)',
  'function grantRole(bytes32 role, address account) external',
  // Events
  'event AssetCreated(uint256 indexed assetId, address indexed owner, string title)',
  'event AssetValidated(uint256 indexed assetId, address indexed validator)',
  'event AssetRejected(uint256 indexed assetId, address indexed validator)',
  'event ListingCreated(uint256 indexed listingId, uint256 indexed assetId, address indexed seller)',
  'event BatchListingCreated(uint256[] indexed listingIds, uint256[] indexed assetIds)',
  'event ListingCanceled(uint256 indexed listingId)',
  'event ListingSold(uint256 indexed listingId, address indexed buyer, uint256 price)',
  'event BidPlaced(uint256 indexed listingId, address indexed bidder, uint256 amount)',
  'event RoyaltyPaid(uint256 indexed assetId, address indexed recipient, uint256 amount, address paymentToken)',
  'event PlatformFeeUpdated(uint256 newFeeRate)',
  'event FeeCollectorUpdated(address indexed newFeeCollector)',
  'event PaymentTokenAdded(address indexed token)',
  'event PaymentTokenRemoved(address indexed token)',
  'event FundsWithdrawn(address indexed token, address indexed recipient, uint256 amount)',
];

// Interface for KYC data
interface KYCData {
  user: string;
  status: number;
  identityId: string;
  idVerified: boolean;
  addressVerified: boolean;
  governmentId: string;
  proofOfAddress: string;
  additionalDocs: string[];
  nationality: string;
  riskLevel: number;
  verificationDate: number;
  lastReviewDate: number;
  verifiedBy: string;
}

// Interface for asset details
interface AssetDetails {
  id: number;
  owner: string;
  title: string;
  description: string;
  category: string;
  status: number;
  price: BigNumber;
  tokenizationType: number;
  totalTokens: number;
  availableTokens: number;
  pricePerToken: BigNumber;
  listingType: number;
  isVerified: boolean;
  createdAt: number;
  updatedAt: number;
  auctionEndTime: number;
  royaltyReceiver: string;
  royaltyFraction: number;
}

// Interface for listing details
interface ListingDetails {
  id: number;
  assetId: number;
  seller: string;
  paymentToken: string;
  price: BigNumber;
  tokenAmount: number;
  listingType: number;
  active: boolean;
  createdAt: number;
  auctionEndTime: number;
}

// Interface for bid details
interface BidDetails {
  bidder: string;
  amount: BigNumber;
  timestamp: number;
}

// Main SDK class
export class RWABSDK {
  private provider: Provider;
  private signer: Signer | null;
  private tokenContract: Contract;
  private kycContract: Contract;
  private marketplaceContract: Contract;

  constructor(
    tokenAddress: string,
    kycAddress: string,
    marketplaceAddress: string,
    provider: Provider,
    signer?: Signer
  ) {
    this.provider = provider;
    this.signer = signer || null;
    this.tokenContract = new Contract(tokenAddress, RWABTokenABI, signer || provider);
    this.kycContract = new Contract(kycAddress, RWABKYCABI, signer || provider);
    this.marketplaceContract = new Contract(marketplaceAddress, RWABMarketplaceABI, signer || provider);
  }

  // Connect a signer (e.g., MetaMask)
  async connectSigner(signer: Signer): Promise<void> {
    this.signer = signer;
    this.tokenContract = this.tokenContract.connect(signer);
    this.kycContract = this.kycContract.connect(signer);
    this.marketplaceContract = this.marketplaceContract.connect(signer);
  }

  // Utility to check if the user has a specific role
  async hasRole(contract: 'token' | 'kyc' | 'marketplace', role: string, account: string): Promise<boolean> {
    const contractInstance = {
      token: this.tokenContract,
      kyc: this.kycContract,
      marketplace: this.marketplaceContract,
    }[contract];
    const roleHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(role));
    return contractInstance.hasRole(roleHash, account);
  }

  // Grant a role to an account
  async grantRole(contract: 'token' | 'kyc' | 'marketplace', role: string, account: string): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const contractInstance = {
      token: this.tokenContract,
      kyc: this.kycContract,
      marketplace: this.marketplaceContract,
    }[contract];
    const roleHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(role));
    const tx = await contractInstance.grantRole(roleHash, account);
    await tx.wait();
  }

  // KYC Functions
  async submitKYC(
    governmentId: string,
    proofOfAddress: string,
    additionalDocs: string[],
    nationality: string
  ): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.kycContract.submitKYC(governmentId, proofOfAddress, additionalDocs, nationality);
    await tx.wait();
  }

  async updateDocuments(
    governmentId: string,
    proofOfAddress: string,
    additionalDocs: string[],
    nationality: string
  ): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.kycContract.updateDocuments(governmentId, proofOfAddress, additionalDocs, nationality);
    await tx.wait();
  }

  async verifyKYC(
    user: string,
    idVerified: boolean,
    addressVerified: boolean,
    riskLevel: number
  ): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.kycContract.verifyKYC(user, idVerified, addressVerified, riskLevel);
    await tx.wait();
  }

  async batchVerifyKYC(
    users: string[],
    idVerifieds: boolean[],
    addressVerifieds: boolean[],
    riskLevels: number[]
  ): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.kycContract.batchVerifyKYC(users, idVerifieds, addressVerifieds, riskLevels);
    await tx.wait();
  }

  async rejectKYC(user: string): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.kycContract.rejectKYC(user);
    await tx.wait();
  }

  async batchRejectKYC(users: string[]): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.kycContract.batchRejectKYC(users);
    await tx.wait();
  }

  async updateVerificationRequirements(
    requireId: boolean,
    requireAddress: boolean,
    requireAdditionalDocs: boolean,
    minDocsCount: number
  ): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.kycContract.updateVerificationRequirements(
      requireId,
      requireAddress,
      requireAdditionalDocs,
      minDocsCount
    );
    await tx.wait();
  }

  async withdrawKYCFunds(token: string, recipient: string, amount: BigNumber): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.kycContract.withdrawFunds(token, recipient, amount);
    await tx.wait();
  }

  async isVerified(user: string): Promise<boolean> {
    return this.kycContract.isVerified(user);
  }

  async getIdentity(userAddress: string): Promise<string> {
    return this.kycContract.identity(userAddress);
  }

  async getKYCStatus(user: string): Promise<number> {
    return this.kycContract.getKYCStatus(user);
  }

  async getKYCData(user: string): Promise<KYCData> {
    return this.kycContract.getKYCData(user);
  }

  async getUserHistory(user: string): Promise<KYCData[]> {
    return this.kycContract.getUserHistory(user);
  }

  async getAllPendingUsers(): Promise<string[]> {
    return this.kycContract.getAllPendingUsers();
  }

  async getVerificationRequirements(): Promise<{
    requireId: boolean;
    requireAddress: boolean;
    requireAdditionalDocs: boolean;
    minDocsCount: number;
  }> {
    return this.kycContract.getVerificationRequirements();
  }

  async pauseKYC(): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.kycContract.pause();
    await tx.wait();
  }

  async unpauseKYC(): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.kycContract.unpause();
    await tx.wait();
  }

  async isKYCPaused(): Promise<boolean> {
    return this.kycContract.paused();
  }

  // Token Functions
  async mintToken(
    to: string,
    id: number,
    amount: number,
    tokenUri: string,
    data: string = '0x'
  ): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.tokenContract.mint(to, id, amount, tokenUri, data);
    await tx.wait();
  }

  async mintBatchTokens(
    to: string,
    ids: number[],
    amounts: number[],
    uris: string[],
    data: string = '0x'
  ): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.tokenContract.mintBatch(to, ids, amounts, uris, data);
    await tx.wait();
  }

  async burnToken(account: string, id: number, amount: number): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.tokenContract.burn(account, id, amount);
    await tx.wait();
  }

  async burnBatchTokens(account: string, ids: number[], amounts: number[]): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.tokenContract.burnBatch(account, ids, amounts);
    await tx.wait();
  }

  async setTokenURI(tokenId: number, uri: string): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.tokenContract.setURI(tokenId, uri);
    await tx.wait();
  }

  async getTokenURI(tokenId: number): Promise<string> {
    return this.tokenContract.uri(tokenId);
  }

  async balanceOf(account: string, id: number): Promise<BigNumber> {
    return this.tokenContract.balanceOf(account, id);
  }

  async safeTransferFrom(
    from: string,
    to: string,
    id: number,
    amount: number,
    data: string = '0x'
  ): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.tokenContract.safeTransferFrom(from, to, id, amount, data);
    await tx.wait();
  }

  async setIdentityRegistry(identityRegistry: string): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.tokenContract.setIdentityRegistry(identityRegistry);
    await tx.wait();
  }

  async setCompliance(compliance: string): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.tokenContract.setCompliance(compliance);
    await tx.wait();
  }

  async getIdentityRegistry(): Promise<string> {
    return this.tokenContract.identityRegistry();
  }

  async getCompliance(): Promise<string> {
    return this.tokenContract.compliance();
  }

  async freezeToken(tokenId: number): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.tokenContract.freezeToken(tokenId);
    await tx.wait();
  }

  async unfreezeToken(tokenId: number): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.tokenContract.unfreezeToken(tokenId);
    await tx.wait();
  }

  async freezeWallet(wallet: string, tokenId: number): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.tokenContract.freezeWallet(wallet, tokenId);
    await tx.wait();
  }

  async unfreezeWallet(wallet: string, tokenId: number): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.tokenContract.unfreezeWallet(wallet, tokenId);
    await tx.wait();
  }

  async isTokenFrozen(tokenId: number): Promise<boolean> {
    return this.tokenContract.tokenFrozen(tokenId);
  }

  async isWalletFrozen(wallet: string, tokenId: number): Promise<boolean> {
    return this.tokenContract.walletFrozen(wallet, tokenId);
  }

  async forcedTransfer(
    from: string,
    to: string,
    id: number,
    amount: number,
    data: string = '0x'
  ): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.tokenContract.forcedTransfer(from, to, id, amount, data);
    await tx.wait();
  }

  async recover(lostWallet: string, newWallet: string, id: number, amount: number): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.tokenContract.recover(lostWallet, newWallet, id, amount);
    await tx.wait();
  }

  async pauseToken(): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.tokenContract.pause();
    await tx.wait();
  }

  async unpauseToken(): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.tokenContract.unpause();
    await tx.wait();
  }

  async isTokenPaused(): Promise<boolean> {
    return this.tokenContract.paused();
  }

  async supportsTokenInterface(interfaceId: string): Promise<boolean> {
    return this.tokenContract.supportsInterface(interfaceId);
  }

  // Marketplace Functions
  async createAsset(
    title: string,
    description: string,
    category: string,
    price: BigNumber,
    tokenizationType: number,
    totalTokens: number,
    pricePerToken: BigNumber,
    listingType: number,
    auctionEndTime: number,
    royaltyReceiver: string,
    royaltyFraction: number
  ): Promise<number> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.marketplaceContract.createAsset(
      title,
      description,
      category,
      price,
      tokenizationType,
      totalTokens,
      pricePerToken,
      listingType,
      auctionEndTime,
      royaltyReceiver,
      royaltyFraction
    );
    const receipt = await tx.wait();
    const event = receipt.events?.find((e: Event) => e.event === 'AssetCreated');
    return event?.args?.assetId.toNumber();
  }

  async validateAsset(assetId: number): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.marketplaceContract.validateAsset(assetId);
    await tx.wait();
  }

  async rejectAsset(assetId: number): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.marketplaceContract.rejectAsset(assetId);
    await tx.wait();
  }

  async createListing(
    assetId: number,
    paymentToken: string,
    price: BigNumber,
    tokenAmount: number,
    listingType: number,
    auctionEndTime: number
  ): Promise<number> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.marketplaceContract.createListing(
      assetId,
      paymentToken,
      price,
      tokenAmount,
      listingType,
      auctionEndTime
    );
    const receipt = await tx.wait();
    const event = receipt.events?.find((e: Event) => e.event === 'ListingCreated');
    return event?.args?.listingId.toNumber();
  }

  async batchCreateListings(
    assetIds: number[],
    paymentTokens: string[],
    prices: BigNumber[],
    tokenAmounts: number[],
    listingTypes: number[],
    auctionEndTimes: number[]
  ): Promise<number[]> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.marketplaceContract.batchCreateListings(
      assetIds,
      paymentTokens,
      prices,
      tokenAmounts,
      listingTypes,
      auctionEndTimes
    );
    const receipt = await tx.wait();
    const event = receipt.events?.find((e: Event) => e.event === 'BatchListingCreated');
    return event?.args?.listingIds.map((id: BigNumber) => id.toNumber());
  }

  async cancelListing(listingId: number): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.marketplaceContract.cancelListing(listingId);
    await tx.wait();
  }

  async buyListing(listingId: number, value?: BigNumber): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const listing = await this.marketplaceContract.getListingDetails(listingId);
    const options = listing.paymentToken === ethers.constants.AddressZero && value ? { value } : {};
    const tx = await this.marketplaceContract.buyListing(listingId, options);
    await tx.wait();
  }

  async placeBid(listingId: number, amount: BigNumber): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.marketplaceContract.placeBid(listingId, { value: amount });
    await tx.wait();
  }

  async finalizeAuction(listingId: number): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.marketplaceContract.finalizeAuction(listingId);
    await tx.wait();
  }

  async addPaymentToken(token: string): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.marketplaceContract.addPaymentToken(token);
    await tx.wait();
  }

  async removePaymentToken(token: string): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.marketplaceContract.removePaymentToken(token);
    await tx.wait();
  }

  async updatePlatformFee(newFeeRate: number): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.marketplaceContract.updatePlatformFee(newFeeRate);
    await tx.wait();
  }

  async updateFeeCollector(newFeeCollector: string): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.marketplaceContract.updateFeeCollector(newFeeCollector);
    await tx.wait();
  }

  async withdrawMarketplaceFunds(token: string, recipient: string, amount: BigNumber): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.marketplaceContract.withdrawFunds(token, recipient, amount);
    await tx.wait();
  }

  async getAssetDetails(assetId: number): Promise<AssetDetails> {
    return this.marketplaceContract.getAssetDetails(assetId);
  }

  async getListingDetails(listingId: number): Promise<ListingDetails> {
    return this.marketplaceContract.getListingDetails(listingId);
  }

  async getBids(listingId: number): Promise<BidDetails[]> {
    return this.marketplaceContract.getBids(listingId);
  }

  async getUserAssets(user: string): Promise<number[]> {
    return this.marketplaceContract.getUserAssets(user);
  }

  async getUserListings(user: string): Promise<number[]> {
    return this.marketplaceContract.getUserListings(user);
  }

  async getAllActiveListings(): Promise<number[]> {
    return this.marketplaceContract.getAllActiveListings();
  }

  async getMarketplaceIdentityRegistry(): Promise<string> {
    return this.marketplaceContract.identityRegistry();
  }

  async getMarketplaceCompliance(): Promise<string> {
    return this.marketplaceContract.compliance();
  }

  async getFeeCollector(): Promise<string> {
    return this.marketplaceContract.feeCollector();
  }

  async getPlatformFeeRate(): Promise<number> {
    return this.marketplaceContract.platformFeeRate();
  }

  async isPaymentTokenSupported(token: string): Promise<boolean> {
    return this.marketplaceContract.supportedPaymentTokens(token);
  }

  async pauseMarketplace(): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.marketplaceContract.pause();
    await tx.wait();
  }

  async unpauseMarketplace(): Promise<void> {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.marketplaceContract.unpause();
    await tx.wait();
  }

  async isMarketplacePaused(): Promise<boolean> {
    return this.marketplaceContract.paused();
  }

  async supportsMarketplaceInterface(interfaceId: string): Promise<boolean> {
    return this.marketplaceContract.supportsInterface(interfaceId);
  }

  // Event Listeners
  listenToEvent(
    contract: 'token' | 'kyc' | 'marketplace',
    eventName: string,
    callback: (event: any) => void
  ): void {
    const contractInstance = {
      token: this.tokenContract,
      kyc: this.kycContract,
      marketplace: this.marketplaceContract,
    }[contract];
    contractInstance.on(eventName, callback);
  }

  removeEventListener(
    contract: 'token' | 'kyc' | 'marketplace',
    eventName: string,
    callback: (event: any) => void
  ): void {
    const contractInstance = {
      token: this.tokenContract,
      kyc: this.kycContract,
      marketplace: this.marketplaceContract,
    }[contract];
    contractInstance.off(eventName, callback);
  }
}


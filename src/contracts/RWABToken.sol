// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

// ERC-3643 Interfaces
interface IIdentityRegistry {
    function isVerified(address _userAddress) external view returns (bool);
    function identity(address _userAddress) external view returns (bytes32);
}

interface ICompliance {
    function canTransfer(address _from, address _to, uint256 _id, uint256 _amount) external view returns (bool);
    function transferred(address _from, address _to, uint256 _id, uint256 _amount) external;
}

interface IToken {
    event IdentityRegistryAdded(address indexed identityRegistry);
    event ComplianceAdded(address indexed compliance);
    event RecoverySuccess(address indexed lostWallet, address indexed newWallet, address indexed investorId);
    event TokensFrozen(address indexed wallet, uint256 indexed id);
    event TokensUnfrozen(address indexed wallet, uint256 indexed id);
    event TokensBurned(address indexed account, uint256 indexed id, uint256 amount);
}

contract RWABToken is 
    Initializable, 
    ERC1155Upgradeable, 
    AccessControlUpgradeable, 
    PausableUpgradeable, 
    UUPSUpgradeable, 
    IToken 
{
    using Strings for uint256;

    // Roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant FORCED_TRANSFER_ROLE = keccak256("FORCED_TRANSFER_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    // ERC-3643 Contracts
    IIdentityRegistry public identityRegistry;
    ICompliance public compliance;

    // Token metadata
    mapping(uint256 => string) private _tokenURIs;
    // Token freezing per ID (global, not per wallet)
    mapping(uint256 => bool) public tokenFrozen;
    // Wallet-specific freezing per token ID
    mapping(address => mapping(uint256 => bool)) public walletFrozen;

    // Storage gap for future upgrades
    uint256[50] private __gap;

    // Additional Events
    event TokenMetadataUpdated(uint256 indexed tokenId, string uri);
    event TokenFrozen(uint256 indexed tokenId);
    event TokenUnfrozen(uint256 indexed tokenId);
    event WalletFrozen(address indexed wallet, uint256 indexed tokenId);
    event WalletUnfrozen(address indexed wallet, uint256 indexed tokenId);

    /**
     * @dev Initializes the contract with ERC-1155, access control, pausability, and UUPS upgradeability.
     */
    function initialize() public initializer {
        __ERC1155_init("");
        __AccessControl_init();
        __Pausable_init();
        __UUPSUpgradeable_init();

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        _setupRole(PAUSER_ROLE, msg.sender);
        _setupRole(FORCED_TRANSFER_ROLE, msg.sender);
        _setupRole(COMPLIANCE_ROLE, msg.sender);
        _setupRole(UPGRADER_ROLE, msg.sender);
    }

    /**
     * @dev Authorizes contract upgrades, restricted to UPGRADER_ROLE.
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}

    /**
     * @dev Sets the identity registry contract address for ERC-3643 compliance.
     * @param _identityRegistry Address of the identity registry.
     */
    function setIdentityRegistry(address _identityRegistry) external onlyRole(COMPLIANCE_ROLE) {
        require(_identityRegistry != address(0), "Invalid identity registry");
        identityRegistry = IIdentityRegistry(_identityRegistry);
        emit IdentityRegistryAdded(_identityRegistry);
    }

    /**
     * @dev Sets the compliance contract address for ERC-3643 compliance.
     * @param _compliance Address of the compliance contract.
     */
    function setCompliance(address _compliance) external onlyRole(COMPLIANCE_ROLE) {
        require(_compliance != address(0), "Invalid compliance");
        compliance = ICompliance(_compliance);
        emit ComplianceAdded(_compliance);
    }

    /**
     * @dev Sets the URI for a specific token ID.
     * @param tokenId The token ID to update.
     * @param newuri The new URI.
     */
    function setURI(uint256 tokenId, string memory newuri) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _tokenURIs[tokenId] = newuri;
        emit TokenMetadataUpdated(tokenId, newuri);
    }

    /**
     * @dev Returns the URI for a token ID, falling back to the base URI if not set.
     * @param tokenId The token ID.
     * @return The token URI.
     */
    function uri(uint256 tokenId) public view virtual override returns (string memory) {
        string memory tokenURI = _tokenURIs[tokenId];
        return bytes(tokenURI).length > 0 ? tokenURI : super.uri(tokenId);
    }

    /**
     * @dev Mints new tokens to a verified address.
     * @param to Recipient address.
     * @param id Token ID to mint.
     * @param amount Amount to mint.
     * @param tokenUri Optional URI for the token.
     * @param data Additional data for the mint operation.
     */
    function mint(
        address to,
        uint256 id,
        uint256 amount,
        string memory tokenUri,
        bytes memory data
    ) public onlyRole(MINTER_ROLE) {
        require(address(identityRegistry) != address(0), "Identity registry not set");
        require(identityRegistry.isVerified(to), "Recipient not verified");
        _mint(to, id, amount, data);
        if (bytes(tokenUri).length > 0) {
            setURI(id, tokenUri);
        }
    }

    /**
     * @dev Mints multiple tokens in a batch to a verified address.
     * @param to Recipient address.
     * @param ids Array of token IDs.
     * @param amounts Array of amounts to mint.
     * @param uris Array of URIs for the tokens.
     * @param data Additional data for the mint operation.
     */
    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        string[] memory uris,
        bytes memory data
    ) public onlyRole(MINTER_ROLE) {
        require(address(identityRegistry) != address(0), "Identity registry not set");
        require(identityRegistry.isVerified(to), "Recipient not verified");
        require(ids.length == amounts.length && amounts.length == uris.length, "Array length mismatch");
        _mintBatch(to, ids, amounts, data);
        for (uint256 i = 0; i < ids.length; i++) {
            if (bytes(uris[i]).length > 0) {
                setURI(ids[i], uris[i]);
            }
        }
    }

    /**
     * @dev Burns tokens from an account.
     * @param account Account to burn from.
     * @param id Token ID to burn.
     * @param amount Amount to burn.
     */
    function burn(
        address account,
        uint256 id,
        uint256 amount
    ) public onlyRole(MINTER_ROLE) {
        require(balanceOf(account, id) >= amount, "Insufficient balance");
        _burn(account, id, amount);
        emit TokensBurned(account, id, amount);
    }

    /**
     * @dev Burns multiple tokens in a batch from an account.
     * @param account Account to burn from.
     * @param ids Array of token IDs.
     * @param amounts Array of amounts to burn.
     */
    function burnBatch(
        address account,
        uint256[] memory ids,
        uint256[] memory amounts
    ) public onlyRole(MINTER_ROLE) {
        require(ids.length == amounts.length, "Array length mismatch");
        for (uint256 i = 0; i < ids.length; i++) {
            require(balanceOf(account, ids[i]) >= amounts[i], "Insufficient balance");
        }
        _burnBatch(account, ids, amounts);
        for (uint256 i = 0; i < ids.length; i++) {
            emit TokensBurned(account, ids[i], amounts[i]);
        }
    }

    /**
     * @dev Freezes a token ID globally, preventing all transfers.
     * @param tokenId The token ID to freeze.
     */
    function freezeToken(uint256 tokenId) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!tokenFrozen[tokenId], "Token already frozen");
        tokenFrozen[tokenId] = true;
        emit TokenFrozen(tokenId);
    }

    /**
     * @dev Unfreezes a token ID globally.
     * @param tokenId The token ID to unfreeze.
     */
    function unfreezeToken(uint256 tokenId) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(tokenFrozen[tokenId], "Token not frozen");
        tokenFrozen[tokenId] = false;
        emit TokenUnfrozen(tokenId);
    }

    /**
     * @dev Freezes a wallet for a specific token ID, preventing transfers.
     * @param wallet The wallet to freeze.
     * @param tokenId The token ID.
     */
    function freezeWallet(address wallet, uint256 tokenId) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!walletFrozen[wallet][tokenId], "Wallet already frozen for token");
        walletFrozen[wallet][tokenId] = true;
        emit TokensFrozen(wallet, tokenId); // ERC-3643 required event
    }

    /**
     * @dev Unfreezes a wallet for a specific token ID.
     * @param wallet The wallet to unfreeze.
     * @param tokenId The token ID.
     */
    function unfreezeWallet(address wallet, uint256 tokenId) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(walletFrozen[wallet][tokenId], "Wallet not frozen for token");
        walletFrozen[wallet][tokenId] = false;
        emit TokensUnfrozen(wallet, tokenId); // ERC-3643 required event
    }

    /**
     * @dev Pauses all token transfers.
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpauses token transfers.
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Forces a transfer of tokens for compliance purposes.
     * @param from Sender address.
     * @param to Recipient address.
     * @param id Token ID.
     * @param amount Amount to transfer.
     * @param data Additional data.
     */
    function forcedTransfer(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public onlyRole(FORCED_TRANSFER_ROLE) {
        require(address(identityRegistry) != address(0), "Identity registry not set");
        require(address(compliance) != address(0), "Compliance not set");
        require(identityRegistry.isVerified(to), "Recipient not verified");
        require(balanceOf(from, id) >= amount, "Insufficient balance");
        require(!paused(), "Token transfer while paused");
        require(!tokenFrozen[id], "Token transfer while frozen");
        require(!walletFrozen[from][id], "Sender wallet frozen");
        require(!walletFrozen[to][id], "Recipient wallet frozen");

        _safeTransferFrom(from, to, id, amount, data);
        compliance.transferred(from, to, id, amount);
    }

    /**
     * @dev Recovers tokens from a lost wallet to a new verified wallet.
     * @param lostWallet The wallet to recover from.
     * @param newWallet The wallet to recover to.
     * @param id Token ID.
     * @param amount Amount to recover.
     */
    function recover(
        address lostWallet,
        address newWallet,
        uint256 id,
        uint256 amount
    ) public onlyRole(FORCED_TRANSFER_ROLE) {
        require(address(identityRegistry) != address(0), "Identity registry not set");
        require(address(compliance) != address(0), "Compliance not set");
        require(identityRegistry.isVerified(newWallet), "New wallet not verified");
        require(balanceOf(lostWallet, id) >= amount, "Insufficient balance");
        require(!paused(), "Token transfer while paused");
        require(!tokenFrozen[id], "Token transfer while frozen");
        require(!walletFrozen[lostWallet][id], "Lost wallet frozen");
        require(!walletFrozen[newWallet][id], "New wallet frozen");

        _safeTransferFrom(lostWallet, newWallet, id, amount, "");
        compliance.transferred(lostWallet, newWallet, id, amount);
        emit RecoverySuccess(lostWallet, newWallet, newWallet);
    }

    /**
     * @dev Validates transfers before execution, enforcing ERC-3643 compliance.
     */
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);

        // Skip checks for minting (from == address(0)) or burning (to == address(0))
        if (from != address(0) && to != address(0)) {
            require(address(identityRegistry) != address(0), "Identity registry not set");
            require(address(compliance) != address(0), "Compliance not set");
            require(!paused(), "Token transfer while paused");
            require(identityRegistry.isVerified(from), "Sender not verified");
            require(identityRegistry.isVerified(to), "Recipient not verified");

            for (uint256 i = 0; i < ids.length; i++) {
                require(!tokenFrozen[ids[i]], "Token transfer while frozen");
                require(!walletFrozen[from][ids[i]], "Sender wallet frozen");
                require(!walletFrozen[to][ids[i]], "Recipient wallet frozen");
                require(
                    compliance.canTransfer(from, to, ids[i], amounts[i]),
                    "Transfer not compliant"
                );
            }
        }
    }

    /**
     * @dev Notifies the compliance contract after a transfer.
     */
    function _afterTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override {
        super._afterTokenTransfer(operator, from, to, ids, amounts, data);

        // Notify compliance of transfer (except for minting or burning)
        if (from != address(0) && to != address(0) && address(compliance) != address(0)) {
            for (uint256 i = 0; i < ids.length; i++) {
                compliance.transferred(from, to, ids[i], amounts[i]);
            }
        }
    }

    /**
     * @dev Checks if the contract supports a given interface.
     * @param interfaceId The interface ID to check.
     * @return True if supported, false otherwise.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155Upgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
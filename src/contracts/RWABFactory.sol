// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "./RWABToken.sol";

contract RWABTokenFactory is Initializable, UUPSUpgradeable, AccessControlUpgradeable {
    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    // Implementation address for RWABToken
    address public implementation;
    bool private _implementationSet;

    // Events
    event TokenDeployed(
        address indexed tokenAddress,
        address indexed admin,
        string name,
        string symbol
    );
    event ImplementationSet(address indexed implementation);

    // Storage gap for future upgrades
    uint256[49] private __gap;

    /**
     * @dev Initializes the factory with admin, upgrader roles, and implementation address.
     * @param admin Address to receive admin and upgrader roles.
     * @param _implementation Address of the RWABToken implementation.
     */
    function initialize(address admin, address _implementation) public initializer {
        require(admin != address(0), "Invalid admin address");
        require(_implementation != address(0), "Invalid implementation address");
        require(!_implementationSet, "Implementation already set");

        __AccessControl_init();
        __UUPSUpgradeable_init();

        // Set implementation address
        implementation = _implementation;
        _implementationSet = true;

        // Setup roles
        _setupRole(ADMIN_ROLE, admin);
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(UPGRADER_ROLE, admin);
        _setRoleAdmin(UPGRADER_ROLE, ADMIN_ROLE);

        emit ImplementationSet(_implementation);
    }

    /**
     * @dev Authorizes contract upgrades, restricted to UPGRADER_ROLE.
     * @param newImplementation Address of the new implementation.
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}

    /**
     * @dev Deploys a new RWABToken instance using a minimal proxy.
     * @param admin Address to receive all roles in the deployed token.
     * @param name Name of the token (for event tracking).
     * @param symbol Symbol of the token (for event tracking).
     * @param identityRegistry Optional address of the identity registry.
     * @param compliance Optional address of the compliance contract.
     * @return Address of the deployed token.
     */
    function deployToken(
        address admin,
        string memory name,
        string memory symbol,
        address identityRegistry,
        address compliance
    ) external onlyRole(ADMIN_ROLE) returns (address) {
        require(admin != address(0), "Invalid admin address");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(symbol).length > 0, "Symbol cannot be empty");
        require(implementation != address(0), "Implementation not set");

        // Deploy minimal proxy using Clones
        address proxy = Clones.clone(implementation);

        // Initialize the proxy
        RWABToken(proxy).initialize();

        // Grant all roles to the admin
        RWABToken token = RWABToken(proxy);
        token.grantRole(token.DEFAULT_ADMIN_ROLE(), admin);
        token.grantRole(token.MINTER_ROLE(), admin);
        token.grantRole(token.PAUSER_ROLE(), admin);
        token.grantRole(token.FORCED_TRANSFER_ROLE(), admin);
        token.grantRole(token.COMPLIANCE_ROLE(), admin);
        token.grantRole(token.UPGRADER_ROLE(), admin);

        // Revoke factory's admin role
        token.revokeRole(token.DEFAULT_ADMIN_ROLE(), address(this));

        // Set identity registry and compliance if provided
        if (identityRegistry != address(0)) {
            token.setIdentityRegistry(identityRegistry);
        }
        if (compliance != address(0)) {
            token.setCompliance(compliance);
        }

        emit TokenDeployed(proxy, admin, name, symbol);
        return proxy;
    }

    /**
     * @dev Returns the implementation address.
     * @return Address of the RWABToken implementation.
     */
    function getImplementation() external view returns (address) {
        return implementation;
    }

    /**
     * @dev Checks if the contract supports a given interface.
     * @param interfaceId The interface ID to check.
     * @return True if supported, false otherwise.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
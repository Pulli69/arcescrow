// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockUSDC
 * @dev Mock USDC token for testing on Arc Testnet
 * This is only for development/testing purposes
 */
contract MockUSDC is ERC20 {
    constructor() ERC20("USD Coin", "USDC") {
        // Mint 1,000,000 USDC to deployer
        _mint(msg.sender, 1_000_000 * 10**6);
    }
    
    function decimals() public pure override returns (uint8) {
        return 6;
    }
    
    // Mint function for testing (remove in production)
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

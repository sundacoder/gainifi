// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title USYCVault
 * @dev Implementation of the GainiFi Yield Vault for Circle USYC (Yield-bearing USDC).
 * Follows the ERC4626 standard for tokenized vaults.
 */
contract USYCVault is ERC4626, Ownable {
    
    constructor(IERC20 asset, string memory name, string memory symbol) 
        ERC4626(asset) 
        ERC20(name, symbol) 
        Ownable(msg.sender)
    {}

    /**
     * @dev Function to simulate yield growth by updating the underlying assets.
     * In a real scenario, this would be updated by the manager or a reward distribution mechanism.
     */
    function depositYield(uint256 amount) external onlyOwner {
        IERC20(asset()).transferFrom(msg.sender, address(this), amount);
        // Assets are increased, sharing the yield among all share holders.
    }

    /**
     * @dev Returns the current price per share.
     */
    function pricePerShare() public view returns (uint256) {
        if (totalSupply() == 0) return 1e18;
        return convertToAssets(1e18);
    }
}

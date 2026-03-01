// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title NanoChannel
 * @dev Implementation of a unidirectional payment channel for nanopayments using EIP-712.
 * Allows users to stream USDC/EURC by signing vouchers that the recipient can settle on-chain.
 */
contract NanoChannel is EIP712, ReentrancyGuard {
    using ECDSA for bytes32;

    struct Channel {
        address sender;
        address recipient;
        address token;
        uint256 balance;
        uint256 expiration;
    }

    bytes32 public constant VOUCHER_TYPEHASH = keccak256("Voucher(uint256 channelId,uint256 amount)");

    mapping(uint256 => Channel) public channels;
    uint256 public nextChannelId;

    event ChannelOpened(uint256 indexed channelId, address indexed sender, address indexed recipient, address token, uint256 amount);
    event ChannelSettled(uint256 indexed channelId, uint256 amount);
    event ChannelExpired(uint256 indexed channelId);

    constructor() EIP712("NanoChannel", "1") {}

    function openChannel(address recipient, address token, uint256 amount, uint256 duration) external nonReentrant returns (uint256) {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be > 0");
        
        uint256 channelId = nextChannelId++;
        
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        channels[channelId] = Channel({
            sender: msg.sender,
            recipient: recipient,
            token: token,
            balance: amount,
            expiration: block.timestamp + duration
        });

        emit ChannelOpened(channelId, msg.sender, recipient, token, amount);
        return channelId;
    }

    function settle(uint256 channelId, uint256 amount, bytes calldata signature) external nonReentrant {
        Channel storage channel = channels[channelId];
        require(msg.sender == channel.recipient, "Only recipient can settle");
        require(amount <= channel.balance, "Amount exceeds channel balance");

        bytes32 structHash = keccak256(abi.encode(VOUCHER_TYPEHASH, channelId, amount));
        bytes32 hash = _hashTypedDataV4(structHash);
        address signer = hash.recover(signature);

        require(signer == channel.sender, "Invalid signature");

        uint256 balance = channel.balance;
        IERC20 token = IERC20(channel.token);

        delete channels[channelId];

        token.transfer(channel.recipient, amount);
        if (balance > amount) {
            token.transfer(channel.sender, balance - amount);
        }

        emit ChannelSettled(channelId, amount);
    }

    function claimTimeout(uint256 channelId) external nonReentrant {
        Channel storage channel = channels[channelId];
        require(block.timestamp >= channel.expiration, "Channel not expired yet");
        
        address sender = channel.sender;
        uint256 balance = channel.balance;
        address token = channel.token;

        delete channels[channelId];
        
        IERC20(token).transfer(sender, balance);
        
        emit ChannelExpired(channelId);
    }
}

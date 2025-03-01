// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title ZkSyncETHTransfer
 * @dev A simple contract to transfer ETH on zkSync Era Sepolia testnet
 */
contract ZkSyncETHTransfer {
    // Event emitted when ETH is transferred
    event ETHTransferred(address indexed from, address indexed to, uint256 amount);
    
    // Address to receive the ETH
    address public constant RECIPIENT = 0xBA23CfBaa92B5cc853cB57e1521aa99ee9B117B9;
    
    // Amount to transfer (0.0001 ETH)
    uint256 public constant TRANSFER_AMOUNT = 0.0001 ether;
    
    /**
     * @dev Transfer ETH to the recipient
     * @return success Whether the transfer was successful
     */
    function transferETH() external payable returns (bool success) {
        require(msg.value >= TRANSFER_AMOUNT, "Insufficient ETH sent");
        
        // Transfer ETH to the recipient
        (bool sent, ) = RECIPIENT.call{value: TRANSFER_AMOUNT}("");
        require(sent, "Failed to send ETH");
        
        // Refund excess ETH if any
        uint256 excess = msg.value - TRANSFER_AMOUNT;
        if (excess > 0) {
            (bool refunded, ) = msg.sender.call{value: excess}("");
            require(refunded, "Failed to refund excess ETH");
        }
        
        // Emit event
        emit ETHTransferred(msg.sender, RECIPIENT, TRANSFER_AMOUNT);
        
        return true;
    }
    
    /**
     * @dev Check if a transaction was successful by transaction hash
     * This is a view function that would be implemented client-side
     * @return status Whether the transaction was successful
     */
    function checkTransactionStatus() external pure returns (bool status) {
        // This is a placeholder. In reality, transaction status would be checked client-side
        return true;
    }
} 
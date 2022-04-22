// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IVendor.sol";

contract Vendor is IVendor, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    // @noticw token address
    IERC20 private immutable token;
    // @noticw default price for 1 Token
    uint256 public price = 0.008 ether;

    constructor(address token_) {
        require(token_ != address(0), "Vendor: Invalid token address");
        token = IERC20(token_);
    }

    /**
     * @dev get tokens by caller depending on how much wei was sent to contract
     * @notice return tokens amount that buy msg.sender
     * @notice before buy transfer tokens from owner to vendor contract address
     */
    function buyTokens()
        external
        payable
        override
        nonReentrant
        returns (uint256 amounts)
    {
        require(msg.value > 0, "Vendor: value cannot be low or equal zero");

        uint256 amountToBuy = msg.value / price;
        uint256 returnAmounts = msg.value % price;
        uint256 amountToPay = msg.value - returnAmounts;

        require(
            token.balanceOf(address(this)) >= amountToBuy,
            "Vendor: contract has not enough tokens in its balance"
        );

        token.safeTransfer(msg.sender, amountToBuy);

        emit BoughtToken(msg.sender, amountToPay, amountToBuy);

        if (returnAmounts != 0) {
            (bool success, ) = msg.sender.call{value: returnAmounts}("");
            require(success, "Vendor: Failed to return unused amounts");
        }

        return amountToBuy;
    }

    /**
     * @dev transfer amount of tokens back to the contract
     * @param _amount tokens amount that recipient wants to buy
     * @notice approve vendor contract
     */
    function sellTokens(uint256 _amount) external override nonReentrant {
        require(
            _amount > 0,
            "Vendor: specify an amount of token greater than zero"
        );

        uint256 userBalance = token.balanceOf(msg.sender);
        require(
            userBalance >= _amount,
            "Vendor: your balance is lower than the amount of tokens you want to sell"
        );

        uint256 amountToTransfer = _amount * price;
        uint256 ownerBalance = address(this).balance;

        require(
            ownerBalance >= amountToTransfer,
            "Vendor: contract has not enough funds to accept the sell request"
        );

        token.safeTransferFrom(msg.sender, address(this), _amount);

        emit SoldToken(msg.sender, _amount, amountToTransfer);

        (bool success, ) = msg.sender.call{value: amountToTransfer}("");
        require(success, "Vendor: failed to send ETH to the user");
    }

    /**
     * @dev - set price in wei for buy tokens
     * @param _price - token price
     * @return _newPrice - reurn new setted price
     */
    function setPrice(uint256 _price)
        external
        override
        onlyOwner
        returns (uint256 _newPrice)
    {
        require(_price > 0, "Vendor: price cannot be low or equal zero");
        price = _price;

        emit SettedPrice(price);

        return price;
    }

    /**
     * @dev allow the owner of the contract to withdraw eth
     */
    function withdraw() external override onlyOwner {
        uint256 contractBalance = address(this).balance;
        require(
            contractBalance > 0,
            "Vendor: contract has not balance to withdraw"
        );

        (bool success, ) = msg.sender.call{value: contractBalance}("");
        require(
            success,
            "Vendor: failed to send user balance back to the owner"
        );
    }
}

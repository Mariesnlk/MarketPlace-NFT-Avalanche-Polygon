// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IVendor.sol";

contract Vendor is IVendor, Ownable, ReentrancyGuard  {
    IERC20 public immutable token;
    uint256 public price;

    constructor(address token_) {
        require(token_ != address(0), "Invalid token address");
        token = IERC20(token_);
    }

    // before buy transfer tokens from owner to vendor contract address

    /** @dev - get tokens by caller depending on how much wei was sent to contract
     *
     * @return amounts - tokens amount that buy caller
     */
    function buyTokens() external payable override nonReentrant returns (uint256 amounts) {
        require(msg.value > 0, "Vendor: value cannot be low or equal zero");

        uint256 amountToBuy = msg.value / price;
        uint256 returnAmounts = msg.value % price;
        uint256 amountToPay = msg.value - returnAmounts;
        require(
            token.balanceOf(address(this)) >= amountToBuy,
            "Vendor: contract has not enough tokens in its balance"
        );

        token.transfer(msg.sender, amountToBuy);
        emit BoughtToken(msg.sender, amountToPay, amountToBuy);

        if (returnAmounts != 0) {
            (bool success, ) = msg.sender.call{value: returnAmounts}("");
            require(success, "Vendor: Failed to return unused amounts");
        }

        return amountToBuy;
    }

    // approve vendor contract

    /** @dev - transfer amount of tokens back to the contract
     *
     * @param _amount - tokens amount that recipient wants to buy
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

        token.transferFrom(msg.sender, address(this), _amount);
        emit SoldToken(msg.sender, _amount, amountToTransfer);

        (bool success, ) = msg.sender.call{value: amountToTransfer}("");
        require(success, "Vendor: failed to send ETH to the user");
    }

    /** @dev - set price in wei for buy tokens
     *
     * @param _price - token price
     *
     * @return _newPrice - reurn new setted price
     */
    function setPrice(uint256 _price)
        external
        override
        onlyOwner
        returns (uint256 _newPrice)
    {
        require(_price > 0, "VestingToken: price cannot be low or equal zero");
        price = _price;
        emit SettedPrice(price);

        return price;
    }

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
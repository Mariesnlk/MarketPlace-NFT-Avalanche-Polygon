// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/// @title Define interface for Vendor contract
interface IVendor {
    /**
     * @dev emitted when price to buy tokens is setted
     * @param price price of 1 token
     **/
    event SettedPrice(uint256 price);
    /**
     * @dev emitted when tokens are bought
     * @param buyer address of user who bids
     * @param amountOfEth the value that user bid for auction
     * @param amountOfTokens the value that user bid for auction
     **/
    event BoughtToken(
        address indexed buyer,
        uint256 amountOfEth,
        uint256 amountOfTokens
    );
    /**
     * @dev emitted when tokens sold back to contract
     * @param seller address of user who bids
     * @param amountOfTokens the value that user bid for auction
     * @param amountOfEth the value that user bid for auction
     **/
    event SoldToken(
        address indexed seller,
        uint256 amountOfTokens,
        uint256 amountOfEth
    );

    /**
     * @dev get tokens by caller depending on how much wei was sent to contract
     * @notice return tokens amount that buy msg.sender
     * @notice before buy transfer tokens from owner to vendor contract address
     */
    function buyTokens() external payable returns (uint256 amounts);

    /**
     * @dev transfer amount of tokens back to the contract
     * @param _amount tokens amount that recipient wants to buy
     * @notice approve vendor contract
     */
    function sellTokens(uint256 _amount) external;

    /**
     * @dev - set price in wei for buy tokens
     * @param _price - token price
     * @return _newPrice - reurn new setted price
     */
    function setPrice(uint256 _price) external returns (uint256 _newPrice);

    /**
     * @dev allow the owner of the contract to withdraw eth
     */
    function withdraw() external;
}

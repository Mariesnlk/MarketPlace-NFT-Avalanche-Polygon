// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IVendor {
    event SettedPrice(uint256 amount);
    event BoughtToken(
        address indexed buyer,
        uint256 amountOfEth,
        uint256 amountOfTokens
    );
    event SoldToken(
        address indexed seller,
        uint256 amountOfTokens,
        uint256 amountOfEth
    );

    /** @dev - get tokens by caller depending on how much wei was sent to contract
     *
     * @return amounts - tokens amount that buy caller
     */
    function buyTokens() external payable returns (uint256 amounts);

    /** @dev - transfer amount of tokens back to the contract
     *
     * @param _amount - tokens amount that recipient wants to buy
     */
    function sellTokens(uint256 _amount) external;

    /** @dev - set price in wei for buy tokens
     *
     * @param _price - token price
     *
     * @return _newPrice - reurn new setted price
     */
    function setPrice(uint256 _price) external returns (uint256 _newPrice);

    /** @dev - allow the owner of the contract to withdraw eth
     */
    function withdraw() external;
}
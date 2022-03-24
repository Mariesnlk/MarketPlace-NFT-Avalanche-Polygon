//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IAuction {
    /** A new bid was placed
     */
    event NewBid(address indexed bidder, uint256 bid);
    /** The auction winner withdrawed the token
     */
    event WithdrawToken(address indexed withdrawer);
    /** The auction owner withdrawed the funds
     */
    event WithdrawFunds(address indexed withdrawer, uint256 amount);
    /** The auction was cancelled
     */
    event AuctionCancelled();

    enum AuctionState {
        OPEN,
        CANCELLED,
        ENDED,
        DIRECT_BUY
    }

    struct Bid {
        address sender;
        uint256 bid;
    }

    /** @dev - Place a bid on the auction
     */
    function placeBid() external payable returns (bool);

    /** @dev - Withdraw the token after the auction is over
     */
    function withdrawToken() external returns (bool);

    /** @dev - Withdraw the funds after the auction is over
     */
    function withdrawFunds() external returns (bool);

    /** @dev - Cancel the auction
     */
    function cancelAuction() external returns (bool);

    /** @dev - Get the auction state
     */
    function getAuctionState() external view returns (uint256);

    /** @dev - Returns a list of all bids and addresses
     */
    function allBids()
        external
        view
        returns (address[] memory, uint256[] memory);
}

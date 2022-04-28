//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/// @title Define interface for Auction contract
interface IAuction {
    /**
     * @dev emitted when a new bid was placed
     * @param bidder address of user who bids
     * @param bid the value that user bid for auction
     **/
    event NewBid(address indexed bidder, uint256 bid);

    /**
     * @dev emitted when an auction winner withdrawed the token
     * @param withdrawer address that withdraw all tokens after auction
     **/
    event WithdrawToken(address indexed withdrawer);

    /**
     * @dev emitted when the auction owner withdrawed the funds
     * @param withdrawer address that withdraw the funds after auction
     * @param amount value that withdraw by auction`s owner
     **/
    event WithdrawFunds(address indexed withdrawer, uint256 amount);

    /**
     * @dev emitted when the auctionis canselled
     **/
    event AuctionCancelled();

    /**
     * @dev List of available states of auction
     * @param OPEN When the owner of the auction creates it
     * @param CANCELLED When the owner of the auction cancels it
     * @param ENDED When the auction time is over
     * @param DIRECT_BUY When tokens are withdraw after the auction is over
     **/
    // 0 - OPEN
    // 1 - CANCELLED
    // 2 - ENDED
    // 3 - DIRECT_BUY
    enum AuctionState {
        OPEN,
        CANCELLED,
        ENDED,
        DIRECT_BUY
    }

    /**
     * @dev Struct of a bid
     * @param sender address who passes a bid
     * @param bid amount that is passed
     **/
    struct Bid {
        address sender;
        uint256 bid;
    }

    /**
     * @dev Place a bid on the auction
     **/
    function placeBid() external payable returns (bool);

    /**
     * @dev Withdraw the token after the auction is over
     **/
    function withdrawToken() external;

    /**
     * @dev Withdraw the funds after the auction is over
     **/
    function withdrawFunds() external;

    /**
     * @dev Cancel the auction
     **/
    function cancelAuction() external returns (bool);

    /**
     * @dev Get a list of all bids and addresses
     **/
    function allBids()
        external
        view
        returns (address[] memory, uint256[] memory);

    /**
     * @dev Get the auction state
     **/
    function getAuctionState() external view returns (AuctionState);
}

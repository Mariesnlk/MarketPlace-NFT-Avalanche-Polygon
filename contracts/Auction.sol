//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IAuction.sol";

/// @title Auction contract
contract Auction is IAuction, ReentrancyGuard {
    /// @notice the block timestamp which marks the start of the auction
    uint256 public startTime;
    /// @notice the block timestamp which marks the end of the auction (in seconds)
    uint256 public endTime;
    /// @notice the address of the maximum bidder
    address public maxBidder;
    /// @notice the maximum bid
    uint256 public maxBid;
    /// @notice is the the auction is cancelled
    bool public isCancelled;
    /// @notice is the auction ended due to direct buy
    bool public isDirectBuy;
    /// @notice the minimum increment for the bid
    uint256 public minIncrement;
    /// @notice the address of the auction creator
    address public creator;
    /// @notice the id of the token
    uint256 public tokenId;
    /// @notice the price for a direct buy
    uint256 public directBuyPrice;
    /// @notice the starting price for the auction
    uint256 public startPrice;
    /// @notice NFT address
    IERC721 public nft;
    /// @notice array of the bids made by the bidders
    Bid[] public bids;

    constructor(
        address _creator,
        uint256 _endTime,
        uint256 _minIncrement,
        uint256 _directBuyPrice,
        uint256 _startPrice,
        address _nftAddress,
        uint256 _tokenId
    ) {
        require(
            msg.sender != address(0),
            "Auction: Creator of the auction can't be zero address"
        );
        require(
            _endTime > block.timestamp,
            "Auction: finish time of auction cannot be less than current time"
        );
        require(
            _minIncrement > 0,
            "Auction: min increment for bid cannot be less than 0"
        );
        require(
            _directBuyPrice > 0,
            "Auction: buy price cannot be less than 0"
        );
        require(
            _startPrice < _directBuyPrice,
            "Auction: start price is smaller than direct buy price"
        );
        require(
            _nftAddress != address(0),
            "Auction: NFT address can't be zero address"
        );
        require(_tokenId > 0, "Auction: token id cannot be less than 0");

        creator = _creator;
        startTime = block.timestamp;
        endTime = startTime + _endTime;
        minIncrement = _minIncrement;
        directBuyPrice = _directBuyPrice;
        startPrice = _startPrice;
        nft = IERC721(_nftAddress);
        tokenId = _tokenId;
        maxBidder = _creator;
    }

    /**
     * @dev Place a bid on the auction
     **/
    function placeBid() external payable override nonReentrant returns (bool) {
        require(
            msg.sender != creator,
            "Auction: the bidder cannot be the auction creator"
        );
        require(
            getAuctionState() == AuctionState.OPEN,
            "Auction: the auction must be open"
        );
        require(
            msg.value >= startPrice,
            "Auction: the bid must be greater than the start price"
        );
        require(
            msg.value > maxBid + minIncrement,
            "Aucton: the bid must be greater than the highest bid + minimum bid increment"
        );

        address lastHightestBidder = maxBidder;
        uint256 lastHighestBid = maxBid;
        maxBid = msg.value;
        maxBidder = msg.sender;

        if (msg.value >= directBuyPrice) {
            isDirectBuy = true;
        }

        bids.push(Bid(msg.sender, msg.value));

        if (lastHighestBid != 0) {
            // address(uint160(lastHightestBidder)).transfer(lastHighestBid); 
            // refund the previous bid to the previous highest bidder
            (bool success, ) = payable(lastHightestBidder).call{
                value: lastHighestBid
            }("");
            require(success, "Failed to transfer Ether");
        }

        emit NewBid(msg.sender, msg.value);

        return true;
    }

    /**
     * @dev Withdraw the token after the auction is over
     **/
    function withdrawToken() external override {
        require(
            getAuctionState() == AuctionState.ENDED ||
                getAuctionState() == AuctionState.DIRECT_BUY,
            "Auction: the auction must be ended by either a direct buy or timeout"
        );
        require(
            msg.sender == maxBidder,
            "Auction: only the highest bidder can withdraw the token"
        );

        nft.transferFrom(address(this), maxBidder, tokenId);

        emit WithdrawToken(maxBidder);
    }

    /**
     * @dev Withdraw the funds after the auction is over
     **/
    function withdrawFunds() external override nonReentrant {
        require(
            getAuctionState() == AuctionState.ENDED ||
                getAuctionState() == AuctionState.DIRECT_BUY,
            "Auction: The auction must be ended by either a direct buy or timeout"
        );
        require(
            msg.sender == creator,
            "Auction: Only the auction creator can withdraw the funds"
        );

        (bool success, ) = payable(msg.sender).call{value: maxBid}("");
        require(success, "Failed to transfer Ether");

        emit WithdrawFunds(msg.sender, maxBid);
    }

    /**
     * @dev Cancel the auction
     **/
    function cancelAuction() external override returns (bool) {
        require(
            msg.sender == creator,
            "Auction: only the auction creator can cancel the auction"
        );
        require(
            getAuctionState() == AuctionState.OPEN,
            "Auction: the auction must be open"
        );
        require(
            maxBid == 0,
            "Auction: the auction must not be cancelled if there is a bid"
        );

        isCancelled = true;

        // Transfer the NFT token to the auction creator
        nft.transferFrom(address(this), creator, tokenId);

        emit AuctionCancelled();

        return true;
    }

    /**
     * @dev Get a list of all bids and addresses
     **/
    function allBids()
        external
        view
        override
        returns (address[] memory, uint256[] memory)
    {
        address[] memory addressesOfBidders = new address[](bids.length);
        uint256[] memory bidsPrices = new uint256[](bids.length);
        for (uint256 i = 0; i < bids.length; i++) {
            addressesOfBidders[i] = bids[i].sender;
            bidsPrices[i] = bids[i].bid;
        }
        return (addressesOfBidders, bidsPrices);
    }

    /**
     * @dev Get the auction state
     **/
    function getAuctionState() public view override returns (AuctionState) {
        if (isCancelled) {
            return AuctionState.CANCELLED;
        } else if (isDirectBuy) {
            return AuctionState.DIRECT_BUY;
        } else if (block.timestamp >= endTime) {
            return AuctionState.ENDED;
        } else {
            return AuctionState.OPEN;
        }
    }
}

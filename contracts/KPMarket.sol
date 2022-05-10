//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./interfaces/IKPMarket.sol";
import "./users/interfaces/IUserRegistration.sol";

/// @title Market contract
contract KPMarket is IKPMarket, ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    /// @notice count of all nfts
    Counters.Counter private tokenIds;
    /// @notice count of sold nfts
    Counters.Counter private tokenSold;
    /// @notice NFT contract
    IERC721 public nftContract;
    /// @notice Token contract
    IERC20 public token;
    /// @notice UserRegistration contract to allowed only registered and login users to use some functions
    IUserRegistration public usersRegistration;
    /// @notice price that permit add nft to the market
    uint256 public listingPrice = 0.045 ether;
    /// @notice tokenId return which MarketToken - fetch which one it is
    mapping(uint256 => MarketNFT) public idToMarketToken;
    /// @notice token price to 1 ETH
    uint256 public TOKENS_PRICE = 50;

    //// TODO ERC2981: add implementation of the royalty standard, and the respective extensions for ERC721 and ERC1155

    constructor(address _token, address _usersRegistration) {
        require(_token != address(0), "KPMarket: invalid token address");
        token = IERC20(_token);
        require(_usersRegistration != address(0), "INVALID_ADDRESS");
        usersRegistration = IUserRegistration(_usersRegistration);
    }

    modifier onlyLogin() {
        require(usersRegistration.checkIsUserLogged(), "ONLY_LOGIN_USER");
        _;
    }

    /**
     * @notice set address to NFT contract
     */
    function setNFTContract(address _nftContract) external onlyOwner {
        require(
            _nftContract != address(0),
            "KPMarket: invalid nftContract address"
        );
        nftContract = IERC721(_nftContract);
    }

    /**
     * @notice set new price for ERC20 tokens
     * @dev only contract owner can do
     */
    function setTokensPrice(uint256 _price) external onlyOwner {
        require(_price > 0, "INVALD_VALUE");
        TOKENS_PRICE = _price;
    }

    /**
     * @notice set new value for listing price
     * @dev only owner can update
     */
    function updateListingPrice(uint256 _listingPrice)
        external
        payable
        onlyOwner
    {
        require(
            _listingPrice > 0,
            "KPMarket: listing price value should be more than 0."
        );
        listingPrice = _listingPrice;
    }

    /**
     * @notice add NFT to market
     * @param nftId id of the NFT
     * @param price price to sell
     * @dev function to put item up for sale
     */
    function createMarketNFT(uint256 nftId, uint256 price)
        external
        payable
        override
        nonReentrant
        returns (bool)
    {
        require(price > 0, "KPMarket: price must be at least one wei");
        require(
            msg.value == listingPrice,
            "KPMarket: price must be equal to listening price"
        );

        tokenIds.increment();
        uint256 itemId = tokenIds.current();
        uint256 priceInTokens = _calculatePriceInTokens(price);

        //putting nft up for sale
        idToMarketToken[itemId] = MarketNFT(
            itemId,
            address(nftContract),
            nftId,
            msg.sender,
            address(0),
            price,
            priceInTokens,
            0,
            false
        );

        // transer nft to market contract
        nftContract.transferFrom(msg.sender, address(this), nftId);

        emit MarketTokenCreated(
            itemId,
            address(nftContract),
            nftId,
            msg.sender,
            address(0),
            price,
            priceInTokens,
            0,
            false
        );

        return true;
    }

    /**
     * @notice reselle NFT by ETH or by ERC20 tokens
     * @param nftId id of the NFT
     * @param price to resell
     * @dev only NFT owner can resalle
     */
    function reselleNFT(uint256 nftId, uint256 price)
        external
        payable
        override
        onlyLogin
        returns (bool)
    {
        require(
            idToMarketToken[nftId].owner == msg.sender,
            "KPMarket: only item owner can perform this operation"
        );
        require(
            msg.value == listingPrice,
            "KPMarket: price must be equal to listing price"
        );
        idToMarketToken[nftId].sold = false;
        idToMarketToken[nftId].price = price;
        idToMarketToken[nftId].creator = msg.sender;
        // resale to market
        idToMarketToken[nftId].owner = address(this);

        tokenIds.decrement();

        nftContract.transferFrom(msg.sender, address(this), nftId);

        return true;
    }

    /**
     * @notice create selling of the NFT (user buy it) to market
     * @param nftId id of the NFT
     * @param tokens amount o MRSNLK tokens
     */
    function marketSaleNFT(uint256 nftId, uint256 tokens)
        external
        payable
        override
        nonReentrant
        onlyLogin
        returns (bool)
    {
        uint256 price = idToMarketToken[nftId].price;
        uint256 tokenId = idToMarketToken[nftId].tokenId;
        address creator = idToMarketToken[nftId].creator;

        require(
            msg.value == price,
            "KPMarket: please submit the asking price in order to continue"
        );

        // payable(owner).transfer(listingPrice);
        (bool result, ) = payable(msg.sender).call{value: listingPrice}("");
        require(result, "Failed to transfer Ether");

        if (tokens > 0) {
            token.transfer(creator, tokens);
        } else {
            // idToMarketToken[nftId].creator.transfer(msg.value);
            (bool success, ) = payable(creator).call{value: msg.value}("");
            require(success, "Failed to transfer Ether");
        }

        nftContract.transferFrom(address(this), msg.sender, tokenId);

        idToMarketToken[nftId].owner = msg.sender;
        idToMarketToken[nftId].sold = true;

        tokenSold.increment();

        return true;
    }

    /**
     * @notice get info list of unsoled NFT
     * @dev fetchMarketTokens
     */
    function getUnsoldNFTs()
        external
        view
        override
        onlyLogin
        returns (MarketNFT[] memory)
    {
        uint256 nftCount = tokenIds.current();
        uint256 unsoldItemCount = tokenIds.current() - tokenSold.current();
        uint256 currentIndex = 0;

        MarketNFT[] memory items = new MarketNFT[](unsoldItemCount);

        for (uint256 i = 0; i < nftCount; i++) {
            //if it is unsold item
            if (idToMarketToken[i + 1].owner == address(0)) {
                uint256 currentId = i + 1;
                MarketNFT storage currentItem = idToMarketToken[currentId];
                items[currentIndex] = currentItem;
                currentIndex++;
            }
        }

        return items;
    }

    /**
     * @notice get info list of NFT that owns msg.sender
     * @dev fetchMyNFTs
     */
    function getMyNFTs() external view override onlyLogin returns (MarketNFT[] memory) {
        uint256 totalNFTCount = tokenIds.current();
        //counter for each individual user
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalNFTCount; i++) {
            if (idToMarketToken[i + 1].owner == msg.sender) {
                itemCount++;
            }
        }

        MarketNFT[] memory items = new MarketNFT[](itemCount);

        for (uint256 i = 0; i < totalNFTCount; i++) {
            if (idToMarketToken[i + 1].owner == msg.sender) {
                uint256 currentId = idToMarketToken[i + 1].id;
                MarketNFT storage currentItem = idToMarketToken[currentId];
                items[currentIndex] = currentItem;
                currentIndex++;
            }
        }

        return items;
    }

    /**
     * @notice get info list of NFT that only added to market
     * @dev fetchItemsCreated
     */
    function getOnlyCreatedNFTs()
        external
        view
        override
        onlyLogin
        returns (MarketNFT[] memory)
    {
        uint256 totalNFTCount = tokenIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalNFTCount; i++) {
            if (idToMarketToken[i + 1].creator == msg.sender) {
                itemCount++;
            }
        }

        MarketNFT[] memory items = new MarketNFT[](itemCount);

        for (uint256 i = 0; i < totalNFTCount; i++) {
            if (idToMarketToken[i + 1].creator == msg.sender) {
                uint256 currentId = idToMarketToken[i + 1].id;
                MarketNFT storage currentItem = idToMarketToken[currentId];
                items[currentIndex] = currentItem;
                currentIndex++;
            }
        }

        return items;
    }

    function _calculatePriceInTokens(uint256 _price)
        internal
        view
        returns (uint256)
    {
        return _price * TOKENS_PRICE;
    }
}

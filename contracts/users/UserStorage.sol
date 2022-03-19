//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";

contract UserStorage {
    using Counters for Counters.Counter;

    Counters.Counter private latestUserId;

    struct Profile {
        uint256 id;
        bytes32 username;
        bytes32 firstName;
        bytes32 lastName;
        string bio;
        string email;
    }

    mapping(uint256 => Profile) private profiles;
    mapping(address => uint256) private addresses;
    mapping(bytes32 => uint256) private usernames;

    function createUser(
        address _address,
        bytes32 _username,
        bytes32 _firstName,
        bytes32 _lastName,
        string memory _bio,
        string memory _email
    ) external returns (uint256) {
        require(
            _address != address(0),
            "UserStorage: user address cannot be 0"
        );

        latestUserId.increment();

        uint256 userId = latestUserId.current();

        profiles[userId] = Profile(
            userId,
            _username,
            _firstName,
            _lastName,
            _bio,
            _email
        );

        addresses[_address] = userId;
        usernames[_username] = userId;

        return userId;
    }

    function getUserFromId(uint256 _userId)
        external
        view
        returns (
            uint256,
            bytes32,
            bytes32,
            bytes32
        )
    {
        return (
            profiles[_userId].id,
            profiles[_userId].username,
            profiles[_userId].firstName,
            profiles[_userId].lastName
        );
    }
}

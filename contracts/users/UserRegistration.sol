//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IUserRegistration.sol";

contract UserRegistratuin is IUserRegistratuin, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private usersIds;
    /// @notice address of the wallet => struct of user`s info
    mapping(address => UserDetail) private users;

    // TODO delete account
    // TODO update user`s info
    // TODO get all users

    /**
     * @dev allows user to register in dapp to get access to merket
     * @param _username nickname to login
     * @param _password password to login
     * @param _bio some more info about user (optional)
     * @notice valigation of username and password in FE, bio field can be empty
     **/
    function register(
        string memory _username,
        string memory _password,
        string memory _bio
    ) external override returns (bool) {
        require(
            msg.sender != address(0),
            "Registration: user address cannot be 0"
        );

        usersIds.increment();
        users[msg.sender].id = usersIds.current();
        users[msg.sender].username = _username;
        users[msg.sender].password = _password;
        users[msg.sender].bio = _bio;
        users[msg.sender].isUserLoggedIn = false;

        emit Registered(usersIds.current(), _username, msg.sender);

        return true;
    }

    /**
     * @dev allows registered user log in dapp
     * @param _username nickname to login
     * @param _password password to login
     **/
    function login(string memory _username, string memory _password)
        external
        override
        returns (bool)
    {
        if (
            (keccak256(abi.encodePacked(users[msg.sender].username)) ==
                keccak256(abi.encodePacked(_username))) &&
            (keccak256(abi.encodePacked(users[msg.sender].password)) ==
                keccak256(abi.encodePacked(_password)))
        ) {
            users[msg.sender].isUserLoggedIn = true;
            return users[msg.sender].isUserLoggedIn;
        } else {
            return false;
        }
    }

    /**
     * @dev checking if the user is logged in or not
     */
    function checkIsUserLogged() external view override returns (bool) {
        return users[msg.sender].isUserLoggedIn;
    }

    /**
     * @dev logout from dapp, all pages are invalid
     */
    function logout() external override {
        users[msg.sender].isUserLoggedIn = false;
    }

    /**
     * @dev get user username and bio
     * @notice this info will be display in the personal page
     */
    function getUser()
        external
        view
        override
        returns (string memory, string memory)
    {
        return (users[msg.sender].username, users[msg.sender].bio);
    }

    /**
     * @dev get a list of all registered users
     */
    function getAllUsers()
        external
        view
        override
        returns (address[] memory _users)
    {}
}

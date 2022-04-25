//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./interfaces/IUserRegistration.sol";

contract UserRegistratuin is IUserRegistratuin {

// TODO add getter without password param
    mapping(address => UserDetail) private user;

    // user registration function
    function register(
        string memory _username,
        string memory _password,
        string memory _bio
    ) external override returns (bool) {
        require(
            msg.sender != address(0),
            "Registration: user address cannot be 0"
        );

        user[msg.sender].username = _username;
        user[msg.sender].password = _password;
        user[msg.sender].bio = _bio;
        user[msg.sender].isUserLoggedIn = false;

        return true;
    }

    // user login function
    function login(string memory _password) external override returns (bool) {
        if (
            keccak256(abi.encodePacked(user[msg.sender].password)) ==
            keccak256(abi.encodePacked(_password))
        ) {
            user[msg.sender].isUserLoggedIn = true;
            return user[msg.sender].isUserLoggedIn;
        } else {
            return false;
        }
    }

    // check the user logged in or not
    function checkIsUserLogged() external view override returns (bool) {
        return user[msg.sender].isUserLoggedIn;
    }

    // logout the user
    function logout() external override {
        user[msg.sender].isUserLoggedIn = false;
    }

    // get user by address
    function getUser() external view override returns (string memory, string memory) {
        return (user[msg.sender].username, user[msg.sender].bio);
    }
}

//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract UserRegistratuin {
    struct UserDetail {
        uint256 id;
        string username;
        string password;
        string bio;
        bool isUserLoggedIn;
    }

    mapping(address => UserDetail) user;

    // user registration function
    function register(
        string memory _username,
        string memory _password,
        string memory _bio
    ) public returns (bool) {
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
    function login(string memory _password) external returns (bool) {
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
    function checkIsUserLogged() external view returns (bool) {
        return user[msg.sender].isUserLoggedIn;
    }

    // logout the user
    function logout() external {
        user[msg.sender].isUserLoggedIn = false;
    }

    // get user by address
    function getUser() external view returns (string memory, string memory) {
        return (user[msg.sender].username, user[msg.sender].bio);
    }
}

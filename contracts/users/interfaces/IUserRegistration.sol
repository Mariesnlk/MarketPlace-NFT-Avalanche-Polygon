//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IUserRegistratuin {
    struct UserDetail {
        uint256 id;
        string username;
        string password;
        string bio;
        bool isUserLoggedIn;
    }

    // user registration function
    function register(
        string memory _username,
        string memory _password,
        string memory _bio
    ) external returns (bool);

    // user login function
    function login(string memory _password) external returns (bool);

    // check the user logged in or not
    function checkIsUserLogged() external view returns (bool);

    // logout the user
    function logout() external;

    // get user by address
    function getUser() external view returns (string memory, string memory);
}

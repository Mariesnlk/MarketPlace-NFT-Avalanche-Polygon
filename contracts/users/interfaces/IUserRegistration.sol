//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/// @title Define interface for UserRegistration contract
interface IUserRegistration {
    /**
     * @dev struct of user info
     * @param id user`s id
     * @param username nickname to login
     * @param password password to login
     * @param bio some more info about user (optional)
     * @param isUserLoggedIn status of his actions
     **/
    struct UserDetail {
        uint256 id;
        string username;
        string password;
        string bio;
        bool isUserLoggedIn;
    }

    /**
     * @dev emmited wthen new user is registered
     * @param id user`s id
     * @param username user`s nickname
     * @param wallet user`s wallet address
     **/
    event Registered(uint256 id, string username, address indexed wallet);

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
    ) external returns (bool);

    /**
     * @dev allows registered user log in dapp
     * @param _username nickname to login
     * @param _password password to login
     **/
    function login(string memory _username, string memory _password)
        external
        returns (bool);

    /**
     * @dev checking if the user is logged in or not
     */
    function checkIsUserLogged() external view returns (bool);

    /**
     * @dev logout from dapp, all pages are invalid
     */
    function logout() external;

    /**
     * @dev get user username and bio
     * @notice this info will be display in the personal page
     */
    function getUser() external view returns (string memory, string memory);

    /**
     * @dev get a list of all registered users
     */
    function getAllUsers() external view returns (address[] memory _users);
}

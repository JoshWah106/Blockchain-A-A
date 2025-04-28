// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Auth {
    address public admin;

    mapping(address => string) private roles;

    event RoleAssigned(address indexed user, string role);

    constructor() {
        admin = msg.sender;
        roles[admin] = "admin";
    }

    modifier onlyAdmin() {
        //sole admin
        //require(msg.sender == admin, "Only admin can perform this action");
        
        //multi admin
        require(
         keccak256(bytes(roles[msg.sender])) == keccak256(bytes("admin")),
         "Only an account with admin role can perform this action"
       );

        _;
    }

    function assignRole(address _user, string memory _role) public onlyAdmin {
        require(_user != address(0), "Invalid address");
        roles[_user] = _role;
        emit RoleAssigned(_user, _role);
    }

    function getRole(address _user) public view returns (string memory) {
        return roles[_user];
    }

    function isAdmin(address _user) public view returns (bool) {
        return keccak256(bytes(roles[_user])) == keccak256(bytes("admin"));
    }
}

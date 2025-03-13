// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./lib/EthMessageHashing.sol";

contract Registry is Ownable {
    mapping(address => bool) public registeredSentients;
    mapping(address => bool) public registeredProcurers;

    constructor() Ownable(msg.sender) {}

    function registerSentient(address _sentient) external onlyOwner {
        registeredSentients[_sentient] = true;
    }

    function registerProcurer(address _procurer) external onlyOwner {
        registeredProcurers[_procurer] = true;
    }

    function queryRegistry(address _address) external view returns (bool) {
        return registeredSentients[_address] || registeredProcurers[_address];
    }
} 
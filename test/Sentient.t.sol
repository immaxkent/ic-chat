// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/Sentient.sol";

contract SentientTest is Test {
    Sentient public sentient;
    address public owner;
    address public user;
    address public dao;
    bytes32[2] initialData = [
            bytes32(uint256(1)),
            bytes32(uint256(2))
        ];
    bytes32[2] updatedData = [
            bytes32(uint256(3)),
            bytes32(uint256(4))
        ];
    
    // Setup test environment before each test
    function setUp() public {
        // Set up test addresses
        owner = makeAddr("owner");
        user = makeAddr("user");
        dao = makeAddr("dao");
        vm.startPrank(owner);
        sentient = new Sentient(dao, initialData);
        vm.stopPrank();
    }
    
    // Test initial contract state
    function testInitialState() public view {
        assertEq(sentient.getData(initialData[0]), initialData[1]);
        assertEq(sentient.owner(), owner);
    }
    
    // Test updating data as DAO
    function testUpdateDataAsDAO() public {
        vm.startPrank(dao);
        
        sentient.updateData(updatedData);
        assertEq(sentient.getData(updatedData[0]), updatedData[1]);
        
        vm.stopPrank();
    }
    
    // Test that non-DAO cannot update data
    function testUpdateDataAsNonDAO() public {
        vm.startPrank(user);
        
        // This should revert because user is not the DAO
        vm.expectRevert("Only DAO can call this function");
        sentient.updateData(updatedData);
        
        vm.stopPrank();
        
        // Data should remain unchanged
        assertEq(sentient.getData(initialData[0]), initialData[1]);
    }
    
    // Test getDataInfo returns correct values
    function testGetDataInfo() public view {
        bytes32 data = sentient.getData(initialData[0]);
        
        assertEq(data, initialData[1]);
    }
} 
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import ERC20 and ERC721 interfaces from OpenZeppelin
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract DigitalWill {
    struct Asset {
        address assetAddress; // Address of the token (ERC20 or ERC721 contract)
        uint256 assetId;      // Token ID for ERC721 or amount for ERC20
        address beneficiary;  // Beneficiary's address
        bool isERC721;        // true if ERC721 (NFT), false if ERC20
    }

    struct Will {
        address creator;         // Creator of the will
        string name;             // User's name
        string dateOfBirth;      // User's date of birth
        address executor;        // Executor address
        Asset[] assets;          // Array of assets in the will
        bool executed;           // Flag to check if the will has been executed
    }

    mapping(uint256 => Will) public wills;  // Mapping of will IDs to Will structs
    uint256 public willCount;               // Counter for will IDs

    // Events for logging actions
    event WillCreated(uint256 indexed willId, address indexed creator);
    event WillUpdated(uint256 indexed willId);
    event WillExecuted(uint256 indexed willId);

    // Function to create a new digital will
    function createWill(
        string memory _name,
        string memory _dateOfBirth,
        address _executor,
        Asset[] memory _assets
    ) public {
        Will storage newWill = wills[willCount++];
        newWill.creator = msg.sender;
        newWill.name = _name;
        newWill.dateOfBirth = _dateOfBirth;
        newWill.executor = _executor;
        newWill.executed = false;

        // Loop through assets and add them to the will
        for (uint256 i = 0; i < _assets.length; i++) {
            newWill.assets.push(_assets[i]);
        }

        emit WillCreated(willCount - 1, msg.sender);
    }

    // Function to update an existing will
    function updateWill(
        uint256 _willId,
        Asset[] memory _assets
    ) public {
        Will storage willToUpdate = wills[_willId];
        require(willToUpdate.creator == msg.sender, "Only the creator can update the will.");
        require(!willToUpdate.executed, "Will has already been executed.");

        // Clear previous assets
        delete willToUpdate.assets;

        // Add new assets
        for (uint256 i = 0; i < _assets.length; i++) {
            willToUpdate.assets.push(_assets[i]);
        }

        emit WillUpdated(_willId);
    }

    // Function to execute the will and transfer assets to beneficiaries
    function executeWill(uint256 _willId) public {
        Will storage willToExecute = wills[_willId];
        require(willToExecute.executor == msg.sender, "Only the executor can execute the will.");
        require(!willToExecute.executed, "Will has already been executed.");

        // Loop through assets and transfer them to beneficiaries
        for (uint256 i = 0; i < willToExecute.assets.length; i++) {
            if (willToExecute.assets[i].isERC721) {
                // Transfer ERC721 token (NFT)
                IERC721(willToExecute.assets[i].assetAddress).safeTransferFrom(
                    willToExecute.creator,
                    willToExecute.assets[i].beneficiary,
                    willToExecute.assets[i].assetId
                );
            } else {
                // Transfer ERC20 token (fungible)
                IERC20(willToExecute.assets[i].assetAddress).transferFrom(
                    willToExecute.creator,
                    willToExecute.assets[i].beneficiary,
                    willToExecute.assets[i].assetId
                );
            }
        }

        willToExecute.executed = true; // Mark will as executed
        emit WillExecuted(_willId);
    }
}

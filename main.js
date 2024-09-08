// Global variables
let contract; // We'll assign this after setting up the contract

// Connect to MetaMask
async function connectWallet() {
    if (window.ethereum) {
        try {
            // Request account access
            await ethereum.request({ method: 'eth_requestAccounts' });

            // Get the signer (user's account)
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const userAddress = await signer.getAddress();
            
            // Display connected wallet address
            document.getElementById('walletAddress').innerHTML = `Connected Wallet: ${userAddress}`;
            document.getElementById('willDetails').style.display = "block";
            document.getElementById('createWillCard').style.display = "block";
            
            // Now, set up the contract interaction
            setupContract(signer);
        } catch (error) {
            console.error("User denied account access or error occurred:", error);
        }
    } else {
        alert('MetaMask is not installed!');
    }
}

// Set up contract interaction with Ethers.js
async function setupContract(signer) {
    const contractABI = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "willId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "creator",
				"type": "address"
			}
		],
		"name": "WillCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "willId",
				"type": "uint256"
			}
		],
		"name": "WillExecuted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "willId",
				"type": "uint256"
			}
		],
		"name": "WillUpdated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_dateOfBirth",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "_executor",
				"type": "address"
			},
			{
				"components": [
					{
						"internalType": "address",
						"name": "assetAddress",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "assetId",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "beneficiary",
						"type": "address"
					},
					{
						"internalType": "bool",
						"name": "isERC721",
						"type": "bool"
					}
				],
				"internalType": "struct DigitalWill.Asset[]",
				"name": "_assets",
				"type": "tuple[]"
			}
		],
		"name": "createWill",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_willId",
				"type": "uint256"
			}
		],
		"name": "executeWill",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_willId",
				"type": "uint256"
			},
			{
				"components": [
					{
						"internalType": "address",
						"name": "assetAddress",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "assetId",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "beneficiary",
						"type": "address"
					},
					{
						"internalType": "bool",
						"name": "isERC721",
						"type": "bool"
					}
				],
				"internalType": "struct DigitalWill.Asset[]",
				"name": "_assets",
				"type": "tuple[]"
			}
		],
		"name": "updateWill",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "willCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "wills",
		"outputs": [
			{
				"internalType": "address",
				"name": "creator",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "dateOfBirth",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "executor",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "executed",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}

];
    
    const contractAddress = '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4'; 

    // Create contract instance
    contract = new ethers.Contract(contractAddress, contractABI, signer);

    // Get the total number of wills created
    try {
        const totalWills = await contract.willCount();
        document.getElementById('totalWills').innerText = totalWills.toString();
    } catch (error) {
        console.error("Error fetching total wills:", error);
    }
}

// Function to handle will creation
async function createWill(event) {
    event.preventDefault(); // Prevent form from submitting normally

    // Collect form data
    const name = document.getElementById('name').value;
    const dob = document.getElementById('dob').value;
    const executor = document.getElementById('executor').value;
    const assetAddress = document.getElementById('assetAddress').value;
    const assetId = document.getElementById('assetId').value;
    const beneficiary = document.getElementById('beneficiary').value;
    const isERC721 = document.getElementById('isERC721').value === 'true';

    // Prepare asset data
    const asset = {
        assetAddress: assetAddress,
        assetId: ethers.BigNumber.from(assetId),
        beneficiary: beneficiary,
        isERC721: isERC721
    };

    // Since the contract expects an array of assets, we'll create an array with one asset for simplicity
    const assets = [asset];

    // Call the contract's createWill function
    try {
        // Convert asset data to the correct format
        const tx = await contract.createWill(
            name,
            dob,
            executor,
            assets
        );

        document.getElementById('createWillStatus').innerText = 'Transaction sent. Waiting for confirmation...';

        // Wait for the transaction to be mined
        await tx.wait();

        document.getElementById('createWillStatus').innerText = 'Will created successfully!';
        
        // Optionally, update the total number of wills
        const totalWills = await contract.willCount();
        document.getElementById('totalWills').innerText = totalWills.toString();

    } catch (error) {
        console.error('Error creating will:', error);
        document.getElementById('createWillStatus').innerText = 'Error creating will. See console for details.';
    }
}

// Event listener to connect wallet on button click
document.getElementById('connectWallet').addEventListener('click', connectWallet);

// Event listener for will creation form submission
document.getElementById('createWillForm').addEventListener('submit', createWill);

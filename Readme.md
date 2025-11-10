
# DigitalWill — Decentralized Will dApp

DigitalWill is a decentralized application (dApp) that demonstrates the creation, updating, and execution of a "digital will" on Ethereum-compatible blockchains. The repository contains a Solidity smart contract that models wills and assets, and a simple frontend that connects to MetaMask using Ethers.js.

## Repository contents
- [DigitalWill.sol](DigitalWill.sol) — Solidity smart contract implementing wills and assets.
- [index.html](index.html) — Frontend UI for wallet connection and will creation.
- [main.js](main.js) — Frontend logic: wallet connect and contract interaction (functions: [`connectWallet`](main.js), [`setupContract`](main.js), [`createWill`](main.js)).
- [styles.css](styles.css) — Styling for the UI.
- [.gitattributes](.gitattributes) — Git attribute settings.

## Key contract symbols (see [DigitalWill.sol](DigitalWill.sol))
- Contract: [`DigitalWill`](DigitalWill.sol)
- Structs: [`DigitalWill.Asset`](DigitalWill.sol), [`DigitalWill.Will`](DigitalWill.sol)
- State & mapping: [`DigitalWill.wills`](DigitalWill.sol), [`DigitalWill.willCount`](DigitalWill.sol)
- Functions:
  - [`DigitalWill.createWill`](DigitalWill.sol)
  - [`DigitalWill.updateWill`](DigitalWill.sol)
  - [`DigitalWill.executeWill`](DigitalWill.sol)
- Events: [`DigitalWill.WillCreated`](DigitalWill.sol), [`DigitalWill.WillUpdated`](DigitalWill.sol), [`DigitalWill.WillExecuted`](DigitalWill.sol)

## Frontend entry points (see [index.html](index.html) and [main.js](main.js))
- UI actions:
  - Connect wallet: [`connectWallet`](main.js) — connects to MetaMask and initializes the contract instance.
  - Set up contract: [`setupContract`](main.js) — attaches ABI and configured contract address to a signer, reads `willCount`.
  - Create will form: [`createWill`](main.js) — collects form values and calls `DigitalWill.createWill`.
- Default contract address used in the frontend: see `contractAddress` in [main.js](main.js).

## Prerequisites
- A browser with MetaMask (or another injected Ethereum provider).
- If testing locally, run a local server to serve `index.html` (file:// may block provider injection).

Example quick server:
```bash
npx http-server . -p 8080
# or
python -m http.server 8080
```

Open http://localhost:8080 in the browser.

## How to use the dApp (quickstart)
1. Start a local HTTP server and open [index.html](index.html).
2. Make sure MetaMask is connected to the network where the `DigitalWill` contract is deployed (testnet or local Hardhat/Ganache node).
3. Click "Connect MetaMask Wallet" (calls [`connectWallet`](main.js)).
4. After connecting, the UI displays total wills (`willCount`) by calling [`setupContract`](main.js).
5. Fill the "Create New Will" form and submit — the frontend calls [`createWill`](main.js) which sends a transaction to [`DigitalWill.createWill`](DigitalWill.sol).

Notes:
- The frontend expects assets as an array of `Asset` tuples — the example UI currently sends a single asset.
- The contract transfers ERC721 tokens using `safeTransferFrom` and ERC20 tokens using `transferFrom`. The contract assumes the will creator has previously approved the contract (or the executor flow handles approvals off-chain).

## Development / Testing
- Edit the contract in [DigitalWill.sol](DigitalWill.sol).
- Deploy the contract using your preferred framework (Hardhat/Truffle/Foundry). After deployment, update `contractAddress` in [main.js](main.js) to the deployed address.
- For local unit tests, write tests that cover:
  - `createWill` correctness (asset storage, events).
  - `updateWill` access control and asset replacement.
  - `executeWill` transfers and executed flag behavior.

## Security notes & recommended improvements
- Approval: For ERC20 transfers the contract calls `transferFrom`; ensure approvals are in place before execution.
- Reentrancy & checks-effects-interactions: current `executeWill` transfers assets inside the loop — consider reentrancy guards and performing state changes before external calls.
- Input validation: validate executor, beneficiary, and asset addresses in the frontend and contract.
- Gas & array sizes: consider limits for large asset arrays; provide pagination or batching.
- Event indexing: events already index `willId` and `creator` for easy off-chain indexing.

## Deployment checklist
1. Compile and test the contract with a local framework.
2. Deploy to chosen network.
3. Update `contractAddress` in [main.js](main.js).
4. Serve the frontend and test with MetaMask on the same network.

## References
- Frontend library: Ethers.js is included in [index.html](index.html).
- Contract imports: OpenZeppelin interfaces are referenced in [DigitalWill.sol](DigitalWill.sol).

## License
MIT (same SPDX as [`DigitalWill.sol`](DigitalWill.sol))

// ...existing code...
{ changed code }
// ...existing code...

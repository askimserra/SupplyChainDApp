# Supply Chain DApp (FreshChain)

This project is a Decentralized Application (DApp) that enables transparent tracking of products throughout the supply chain. Using smart contracts running on Ethereum Virtual Machine (EVM) compatible networks, the status (produced, shipped, arrived, sold) and ownership record for each product batch is securely maintained on the blockchain.

## Key Features

* **Role-Based Access Control:** Defines roles such as Admin, Producer, Transporter, Distributor, and Retailer. Each step can only be executed by the authorized role.
* **Status Tracking:** The instantaneous status of a product batch in the chain can be monitored. 

[Image of supply chain process flow diagram]

* **Quality Assurance:** The Retailer can perform quality control upon receiving the delivery.
* **Ethereum Compatible:** Smart contracts are written in Solidity and interact with standard wallets like Metamask.

## 🛠️ Technologies Used

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Smart Contract** | Solidity (v0.8.x) | Coding the supply chain logic. |
| **Development Environment** | Remix IDE | Contract development and testing. |
| **Frontend** | React.js | Creating the User Interface (Panel). |
| **Web3 Connection** | Web3.js / Ethers.js | Interacting with the smart contracts. |
| **Network (Blockchain)** | EVM-compatible Testnet (Ropsten, Sepolia, etc.) | The network where contracts are deployed. |

## ⚙️ Setup and Running Locally

Follow these steps to run the project locally.

### 1. Prerequisites

* Node.js and npm (or yarn) must be installed.
* Metamask wallet must be installed and connected to the selected Testnet (e.g., Sepolia).

### 2. Project Installation

Navigate to the project folder (the content of this repository) and install the necessary libraries:

```bash
cd SupplyChainDApp
npm install  # or yarn install

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

DeFi Script: Swap USDC for LINK and Deposit into Aave

This script performs a decentralized finance (DeFi) operation that involves swapping USDC for LINK using Uniswap and then depositing the acquired LINK into Aave for earning interest. The script is built using ethers.js and interacts with Ethereum smart contracts.

Features
-Token Swap: Swaps USDC for LINK using Uniswap.
-Lending: Deposits the acquired LINK into Aave to earn interest.
-Ethereum Interaction: Utilizes ethers.js to interact with smart contracts on the Ethereum network.

Prerequisites
Ensure you have the following installed:
-Node.js (v16+ recommended)
-npm or yarn

Additionally, create a .env file in the project root with the following environment variables:
RPC_URL="your_infura_or_alchemy_rpc_url"
PRIVATE_KEY="your_ethereum_private_key"

Setup
Clone this repository:
git clone https://github.com/Mukhuuu/bounty.git
cd bounty/bounty

Install the dependencies:
-npm install
Update the USDC and LINK token addresses in the script with the correct contract addresses for your network.

Ensure the ABI files (factory.json, swaprouter.json, pool.json, token.json, lendingpool.json) are placed correctly in the abis folder.


To execute the script, run the following command:
node index.js


Script Workflow
-Approve USDC: The script approves the USDC amount for swapping via Uniswap.
-Get Pool Info: Fetches the Uniswap pool information for the USDC/LINK pair.
-Prepare and Execute Swap: Prepares and executes the swap transaction on Uniswap.
-Approve LINK for Aave: The script then approves the swapped LINK for deposit into Aave.
-Deposit LINK into Aave: Finally, the script deposits the acquired LINK into Aave to start earning interest.

Important Notes
-The script currently operates on the Sepolia testnet. Make sure to adjust the addresses and RPC URLs accordingly if using another network.
-The amount passed to executeSwapAndDeposit() represents the amount of USDC to swap for LINK.
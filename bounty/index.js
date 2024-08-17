// 1. Import required libraries
import { ethers } from "ethers";
import FACTORY_ABI from "./abis/factory.json" assert { type: "json" };
import SWAP_ROUTER_ABI from "./abis/swaprouter.json" assert { type: "json" };
import POOL_ABI from "./abis/pool.json" assert { type: "json" };
import TOKEN_IN_ABI from "./abis/token.json" assert { type: "json" };

import dotenv from "dotenv";
dotenv.config();

import uniswapRouterAbi from "@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json" assert { type: "json" };
import aaveLendingPoolAbi from "@aave/protocol-v2/artifacts/contracts/protocol/lendingpool/LendingPool.sol/LendingPool.json" assert { type: "json" };

// 2. Set up provider, signer, and addresses (Uniswap, Aave, etc.)
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const uniswapRouterAddress = '0xe592427a0aece92de3edee1f18e01'; // Uniswap V3 Router address
const aaveLendingPoolAddress = '0x398eC7346DcD622eDc5ae82352F02bE94C62d119'; // Aave LendingPool address
const usdcAddress = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'; 
const linkAddress = '0x779877A7B0D9E8603169DdbD7836e478b4624789';

// 3. Create contract instances
const uniswapRouterContract = new ethers.Contract(uniswapRouterAddress, uniswapRouterAbi, signer);
const aaveLendingPoolContract = new ethers.Contract(aaveLendingPoolAddress, aaveLendingPoolAbi, signer);

// 4. Define the token swap function on Uniswap
async function swapUSDCforLINK() {
    // Approve USDC
    await approveToken(usdcAddress, uniswapRouterAddress, amountIn);
    const params = {
        tokenIn: usdcAddress,
        tokenOut: linkAddress,
        fee: 3000,
        recipient: signer.address,
        deadline: Math.floor(Date.now() / 1000) + (60 * 10), // 10 minutes from now
        amountIn: ethers.utils.parseUnits('100', 6), // Example: 100 USDC
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0
    };
    const tx = await uniswapRouterContract.exactInputSingle(params);
    await tx.wait();
    console.log("Token Swap Completed!");
}

// 5. Define function to supply LINK to Aave
async function supplyLINKtoAave() {
    await approveToken(linkAddress, aaveLendingPoolAddress, amount);
    const tx = await aaveLendingPoolContract.deposit(linkAddress, amount, signer.address, 0);
    await tx.wait();
    console.log("LINK Supplied to Aave!");
}

// 6. Helper function to approve tokens
async function approveToken(tokenAddress, spenderAddress, amount) {
    const tokenContract = new ethers.Contract(tokenAddress, ['function approve(address spender, uint amount) public returns (bool)'], signer);
    const tx = await tokenContract.approve(spenderAddress, amount);
    await tx.wait();
    console.log(`Approved ${amount.toString()} of ${tokenAddress}`);
}

// 7. Main execution
async function main() {
    await swapUSDCforLINK();
    await supplyLINKtoAave();
}

main().catch(console.error);

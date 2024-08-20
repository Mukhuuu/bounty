import { ethers } from "ethers";
import FACTORY_ABI from "./abis/factory.json" assert { type: "json" };
import SWAP_ROUTER_ABI from "./abis/swaprouter.json" assert { type: "json" };
import POOL_ABI from "./abis/pool.json" assert { type: "json" };
import TOKEN_ABI from "./abis/token.json" assert { type: "json" };
import LENDING_POOL_ABI from "./abis/lendingpool.json" assert { type: "json" };

import dotenv from "dotenv";
dotenv.config();

// Contract Addresses
const POOL_FACTORY_CONTRACT_ADDRESS = "0x0227628f3F023bb0B980b67D528571c95c6DaC1c";
const SWAP_ROUTER_CONTRACT_ADDRESS = "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E";
const LENDING_POOL_ADDRESS = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951";

// Provider and Wallet setup
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Contract Instances
const factoryContract = new ethers.Contract(POOL_FACTORY_CONTRACT_ADDRESS, FACTORY_ABI, provider);
const lendingPool = new ethers.Contract(LENDING_POOL_ADDRESS, LENDING_POOL_ABI, signer);

// Token Configurations
const USDC = {
  address: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8", // USDC contract address
  decimals: 6,
  symbol: "USDC",
};

const LINK = {
  address: "0xf8Fb3713D459D7C1018BD0A49D19b4C44290EBE5", // LINK contract address
  decimals: 18,
  symbol: "LINK",
};

// Approve token function
async function approveToken(tokenAddress, amount, wallet) {
  const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, wallet);
  const approveAmount = ethers.parseUnits(amount.toString(), USDC.decimals);
  const tx = await tokenContract.approve(SWAP_ROUTER_CONTRACT_ADDRESS, approveAmount);
  await tx.wait();
  console.log("Token approved for swap.");
}

// Get pool info function
async function getPoolInfo(factoryContract, tokenIn, tokenOut) {
    const poolAddress = await factoryContract.getPool(
      tokenIn.address,
      tokenOut.address,
      3000
    );
    if (!poolAddress) {
      throw new Error("Failed to get pool address");
    }
    const poolContract = new ethers.Contract(poolAddress, POOL_ABI, provider);
    const [token0, token1, fee] = await Promise.all([
      poolContract.token0(),
      poolContract.token1(),
      poolContract.fee(),
    ]);
    return { poolContract, token0, token1, fee };
  }  

// Prepare swap parameters function
async function prepareSwapParams(poolContract, amountIn) {
  return {
    tokenIn: USDC.address,
    tokenOut: LINK.address,
    fee: await poolContract.fee(),
    recipient: signer.address,
    amountIn: amountIn,
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0,
  };
}

// Execute swap function
async function executeSwap(swapRouter, params) {
  const tx = await swapRouter.exactInputSingle(params);
  await tx.wait();
  console.log("Swap executed.");
}

// Approve LINK for Aave function
async function authorizeLendingPool(tokenAddress, amount) {
  const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, signer);
  const tx = await tokenContract.approve(LENDING_POOL_ADDRESS, amount);
  await tx.wait();
  console.log("LINK approved for Aave deposit.");
}

// Deposit LINK into Aave function
async function depositToAave(amount) {
  const tx = await lendingPool.supply(LINK.address, amount, signer.address, 0);
  await tx.wait();
  console.log("LINK deposited into Aave.");
}

// Main function to execute swap and deposit
async function executeSwapAndDeposit(amount) {
  const amountIn = ethers.parseUnits(amount.toString(), USDC.decimals);

  await approveToken(USDC.address, amount, signer);

  const { poolContract } = await getPoolInfo(factoryContract, USDC, LINK);
  const swapParams = await prepareSwapParams(poolContract, amountIn);

  const swapRouter = new ethers.Contract(SWAP_ROUTER_CONTRACT_ADDRESS, SWAP_ROUTER_ABI, signer);
  await executeSwap(swapRouter, swapParams);

  const linkBalance = await new ethers.Contract(LINK.address, TOKEN_ABI, signer).balanceOf(signer.address);
  await authorizeLendingPool(LINK.address, linkBalance);
  await depositToAave(linkBalance);
}

// Start the process
executeSwapAndDeposit(100);

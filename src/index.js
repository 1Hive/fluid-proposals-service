const ethers = require("ethers");
const logger = require("./logger");

const ONE_HOUR = 60 * 60 * 1000;

// Configuration
const {
  MNEMONIC,
  ETH_URI,
  CONTRACT_ADDRESS,
  INTERVAL = ONE_HOUR,
} = process.env;

if (!MNEMONIC) {
  logger.error("Please set `MNEMONIC`.");
  process.exit(1);
}

if (!ETH_URI) {
  logger.error("Please set `ETH_URI`.");
  process.exit(1);
}

if (!CONTRACT_ADDRESS) {
  logger.error("Please set `CONTRACT_ADDRESS`.");
  process.exit(1);
}

if (!INTERVAL) {
  logger.error("Please set `INTERVAL`.");
  process.exit(1);
}

// Set up provider and wallet
const provider = ethers.getDefaultProvider(ETH_URI);
const wallet = ethers.Wallet.fromMnemonic(MNEMONIC).connect(provider);

// Run information
logger.info(`Acting as ${wallet.address}`);
logger.info(`Connected to ${ETH_URI}`);
logger.info(
  `Calling FluidProposals on ${CONTRACT_ADDRESS} every ${INTERVAL}ms`
);

async function callSync(signer, fluidProposalsAddress) {
  const fluidProposals = new ethers.Contract(
    fluidProposalsAddress,
    ["function sync()"],
    signer
  );

  // Wait until the network has heen established
  await provider.ready;

  // Check if network supports EIP1559
  const SUPPORTS_EIP1559 = Boolean(await provider.getBlock("latest").baseFee);

  // Calculate fees
  const feeData = await provider.getFeeData();

  // Get nonce
  const nonce = await provider.getTransactionCount(wallet.address);

  let OVERRIDES;
  if (SUPPORTS_EIP1559) {
    OVERRIDES = {
      gasLimit: 1400000,
      maxFeePerGas: feeData.maxFeePerGas,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      nonce: nonce,
    };
  } else {
    OVERRIDES = {
      gasPrice: feeData.gasPrice,
      gasLimit: 1400000,
      nonce: nonce,
    };
  }

  logger.info("Calling sync...");
  try {
    const tx = await fluidProposals.sync(OVERRIDES);
    logger.info(`- Sent transaction to sync fluid proposals (${tx.hash})`);
    await tx.wait();
  } catch (err) {
    logger.fatal(`- Transaction failed to process.`);
    logger.fatal(`- ${err.message}`);
  }
  logger.info("Done calling sync.");

  const balance = await signer.provider.getBalance(signer.address);
  logger.info(`Current balance is ${balance}`);
}

async function main() {
  await callSync(wallet, CONTRACT_ADDRESS);

  setTimeout(() => {
    main();
  }, INTERVAL);
}

main();

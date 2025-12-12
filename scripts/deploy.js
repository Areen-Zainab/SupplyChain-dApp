const hre = require("hardhat");

async function main() {
  console.log("========================================");
  console.log("Deploying AreenZainab Supply Chain Contract");
  console.log("========================================\n");

  // Get the deployer account (ethers v6 syntax)
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Get account balance (ethers v6 syntax)
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC\n");

  // Get the contract factory
  const AreenZainabSupplyChain = await hre.ethers.getContractFactory("AreenZainab_supplychain");
  
  console.log("Deploying contract...");
  
  // Deploy the contract
  const contract = await AreenZainabSupplyChain.deploy();
  
  // Wait for deployment to finish (ethers v6 syntax)
  await contract.waitForDeployment();
  
  // Get contract address (ethers v6 syntax)
  const contractAddress = await contract.getAddress();
  
  console.log("\n========================================");
  console.log("✅ Deployment Successful!");
  console.log("========================================");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", hre.network.config.chainId);
  console.log("Deployer Address:", deployer.address);
  
  // Get deployment transaction (ethers v6 syntax)
  const deployTx = contract.deploymentTransaction();
  if (deployTx) {
    console.log("Transaction Hash:", deployTx.hash);
    console.log("Block Number:", deployTx.blockNumber || "Pending...");
  }
  console.log("========================================\n");

  // Wait for a few block confirmations
  console.log("Waiting for block confirmations...");
  if (deployTx) {
    await deployTx.wait(5);
    console.log("✅ Contract confirmed!\n");
  }

  // Verify contract owner
  const owner = await contract.owner();
  console.log("Contract Owner:", owner);
  console.log("Owner verified:", owner === deployer.address ? "✅ Yes" : "❌ No");
  
  console.log("\n========================================");
  console.log("Next Steps:");
  console.log("========================================");
  console.log("1. Update .env file with contract address");
  console.log("2. Update frontend config with contract address");
  console.log("3. Fund some test accounts with MATIC from faucet");
  console.log("4. Start the frontend application");
  console.log("\nPolygon Amoy Faucet: https://faucet.polygon.technology/");
  console.log("Block Explorer: https://amoy.polygonscan.com/address/" + contractAddress);
  console.log("========================================\n");

  // Save deployment info to a file
  const fs = require("fs");
  const deploymentInfo = {
    contractAddress: contractAddress,
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    transactionHash: deployTx ? deployTx.hash : "N/A",
    blockNumber: deployTx ? deployTx.blockNumber : "N/A",
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("✅ Deployment info saved to deployment-info.json\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment Error:");
    console.error(error);
    process.exit(1);
  });
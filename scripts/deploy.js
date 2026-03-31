async function main() {
  console.log("\n📚 Deploying NewsAuth Smart Contract...\n");

  // Get the contract factory
  const NewsAuth = await ethers.getContractFactory("NewsAuth");

  // Deploy the contract
  console.log("⏳ Deploying contract...");
  const newsAuth = await NewsAuth.deploy();
  
  // Wait for deployment
  await newsAuth.waitForDeployment();
  
  const contractAddress = await newsAuth.getAddress();

  console.log("✅ NewsAuth deployed successfully!");
  console.log(`📍 Contract Address: ${contractAddress}`);
  console.log(`🔗 Sepolia Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);

  // Save contract address to .env
  const fs = require("fs");
  const path = require("path");
  const envPath = path.join(__dirname, "../.env");

  let envContent = fs.readFileSync(envPath, "utf8");
  
  // Update or add CONTRACT_ADDRESS
  if (envContent.includes("CONTRACT_ADDRESS=")) {
    envContent = envContent.replace(
      /CONTRACT_ADDRESS=.*/,
      `CONTRACT_ADDRESS=${contractAddress}`
    );
  } else {
    envContent += `\nCONTRACT_ADDRESS=${contractAddress}`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log("\n📝 CONTRACT_ADDRESS updated in .env");

  // Get deployment info
  const deploymentInfo = {
    contract: "NewsAuth",
    network: "Sepolia",
    address: contractAddress,
    deployer: await (await ethers.getSigner()).getAddress(),
    deploymentTime: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber()
  };

  console.log("\n📊 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Save deployment info
  const deploymentFile = path.join(__dirname, "../deployments.json");
  let deployments = [];
  
  if (fs.existsSync(deploymentFile)) {
    deployments = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  }
  
  deployments.push(deploymentInfo);
  fs.writeFileSync(deploymentFile, JSON.stringify(deployments, null, 2));

  console.log("\n✨ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
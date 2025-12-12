const hre = require("hardhat");

async function main() {
    const contractAddress = "0x4041766B0fd784A8189c10a80106D76c86c2E5E1";
    const contract = await hre.ethers.getContractAt("AreenZainab_supplychain", contractAddress);

    console.log("Contract:", contractAddress);
    console.log("\n=== Grant Roles Script ===\n");

    // Get command line arguments
    const args = process.argv.slice(2);

    // Remove --network amoy from args if present
    const filteredArgs = args.filter(arg => arg !== '--network' && arg !== 'amoy');

    if (filteredArgs.length === 0) {
        console.log("Usage Options:");
        console.log("\n1. Grant all roles to one address:");
        console.log("   npx hardhat run scripts/grant-roles.js --network amoy <address>");
        console.log("\n2. Grant specific roles to different addresses:");
        console.log("   npx hardhat run scripts/grant-roles.js --network amoy <manufacturer_addr> <distributor_addr> <retailer_addr>");
        console.log("\nExample:");
        console.log("   npx hardhat run scripts/grant-roles.js --network amoy 0xEdc4a527F992F4D2A4a1354351138A0AE7EF4EE4");
        process.exit(1);
    }

    let manufacturerAddr, distributorAddr, retailerAddr;

    if (filteredArgs.length === 1) {
        // Grant all roles to the same address
        manufacturerAddr = distributorAddr = retailerAddr = filteredArgs[0];
        console.log("Granting ALL roles to:", manufacturerAddr);
    } else if (filteredArgs.length === 3) {
        // Grant different roles to different addresses
        manufacturerAddr = filteredArgs[0];
        distributorAddr = filteredArgs[1];
        retailerAddr = filteredArgs[2];
        console.log("Granting roles to different addresses:");
        console.log("  Manufacturer:", manufacturerAddr);
        console.log("  Distributor:", distributorAddr);
        console.log("  Retailer:", retailerAddr);
    } else {
        console.log("Error: Please provide either 1 address (for all roles) or 3 addresses (one per role)");
        process.exit(1);
    }

    console.log("\nGranting roles...\n");

    // Grant manufacturer role
    console.log("1. Granting MANUFACTURER role to:", manufacturerAddr);
    const tx1 = await contract.grantManufacturer(manufacturerAddr);
    await tx1.wait();
    console.log("   ✅ Manufacturer role granted!");

    // Grant distributor role
    console.log("\n2. Granting DISTRIBUTOR role to:", distributorAddr);
    const tx2 = await contract.grantDistributor(distributorAddr);
    await tx2.wait();
    console.log("   ✅ Distributor role granted!");

    // Grant retailer role
    console.log("\n3. Granting RETAILER role to:", retailerAddr);
    const tx3 = await contract.grantRetailer(retailerAddr);
    await tx3.wait();
    console.log("   ✅ Retailer role granted!");

    console.log("\n✅ All roles granted successfully!");
    console.log("\nYou can now test the full supply chain flow:");
    console.log("  1. Register a product (as manufacturer)");
    console.log("  2. Transfer to distributor");
    console.log("  3. Transfer to retailer");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

const hre = require("hardhat");

async function main() {
    const contractAddress = "0x4041766B0fd784A8189c10a80106D76c86c2E5E1";
    const contract = await hre.ethers.getContractAt("AreenZainab_supplychain", contractAddress);

    // The address that needs manufacturer role
    const manufacturerAddress = "0xEdc4a527F992F4D2A4a1354351138A0AE7EF4EE4";

    console.log("Contract:", contractAddress);
    console.log("Granting MANUFACTURER role to:", manufacturerAddress);

    const tx = await contract.grantManufacturer(manufacturerAddress);
    await tx.wait();

    console.log("✅ Manufacturer role granted successfully!");
    console.log("\nYou can now register products with this address.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

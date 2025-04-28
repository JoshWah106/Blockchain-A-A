const hre = require("hardhat");

async function main() {
    const Auth = await hre.ethers.getContractFactory("Auth");
    const auth = await Auth.deploy();
    await auth.deployed();

    console.log("Auth deployed to:", auth.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
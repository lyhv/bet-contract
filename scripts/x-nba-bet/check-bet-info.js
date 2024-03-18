// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const { getIbcApp } = require("../private/_vibc-helpers.js");

async function main() {
  const accounts = await hre.ethers.getSigners();
  const networkName = hre.network.name;

  const ibcApp = await getIbcApp(networkName);

  const betMatch = await ibcApp.getMatchIds(accounts[0].address);
  console.log(`${accounts[0].address} Match Bets: ${betMatch}`);
  for (let index = 0; index < betMatch.length; index++) {
    const matchId = betMatch[index];
    const data = await ibcApp.betsOf(matchId, accounts[0].address);
    console.log(`${accounts[0].address} Match ${matchId}: ${data}`);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

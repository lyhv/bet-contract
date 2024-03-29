// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const { getConfigPath } = require("../private/_helpers.js");
const { getIbcApp } = require("../private/_vibc-helpers.js");

async function main() {
  const accounts = await hre.ethers.getSigners();
  const config = require(getConfigPath());
  const sendConfig = config.sendPacket;

  const networkName = hre.network.name;
  // Get the contract type from the config and get the contract
  const ibcApp = await getIbcApp(networkName);

  // Change if your want to send a vote from a different address
  const betAccount = accounts[0];
  const matchId = Math.floor(Math.random() * 100000000);
  await ibcApp.connect(betAccount).placeBet(matchId,
                                            1,
                                            "https://lsm-static-prod.livescore.com/medium/enet/58510.png",
                                            hre.ethers.encodeBytes32String(sendConfig[`${networkName}`]["channelId"]),
                                            sendConfig[`${networkName}`]["timeout"],
                                            {
                                              value: hre.ethers.parseEther("0.001"),
                                            });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

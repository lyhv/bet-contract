const { exec } = require("child_process");
const { getConfigPath, getWhitelistedNetworks } = require("./_helpers.js");
const { setupIbcPacketEventListener } = require("./_events.js");
const { setupNBABetEventListener } = require("../x-nba-bet/_app-events.js");
// const {
//   setupUcXBetNFTEventListener,
// } = require("../x-nba-nft/_app-events-UC.js");

function runSendPacketCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        reject(error);
      } else {
        console.log(stdout);
        resolve(true);
      }
    });
  });
}

async function runSendPacket(config) {
  const source = config.createChannel.srcChain;

  // Check if the source chain from user input is whitelisted
  const allowedNetworks = getWhitelistedNetworks();
  if (!allowedNetworks.includes(source)) {
    console.error("❌ Please provide a valid source chain");
    process.exit(1);
  }

  const script = config.isUniversal
    ? "send-bet-vote-info.js"
    : "send-bet-info.js";
  const command = `npx hardhat run scripts/x-nba-bet/${script} --network ${source}`;

  try {
    await setupIbcPacketEventListener();
    if (config.isUniversal === true) {
   //   await setupUcXBetNFTEventListener();
    } else if (config.isUniversal === false) {
      await setupNBABetEventListener();
    } else {
      console.error(
        "❌ Invalid config value for isUniversal. Please check your config file."
      );
      process.exit(1);
    }
    await runSendPacketCommand(command);
  } catch (error) {
    console.error("❌ Error sending packet: ", error);
    process.exit(1);
  }
}

async function main() {
  const configPath = getConfigPath();
  const config = require(configPath);

  await runSendPacket(config);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

const hre = require("hardhat");
const { getConfigPath } = require("../private/_helpers.js");
const { getIbcApp } = require("../private/_vibc-helpers.js");

const explorerOpUrl = "https://optimism-sepolia.blockscout.com/";
const explorerBaseUrl = "https://base-sepolia.blockscout.com/";

function listenForBetEvents(network, bet) {
  const explorerUrl = network === "optimism" ? explorerOpUrl : explorerBaseUrl;
  console.log(`👂 Listening for Bet events on ${network}...`);

  bet.on(
    "BetPlaced",
    (matchId, sender, amount, predictedTeam, betRate, betTime, event) => {
      const txHash = event.log.transactionHash;
      const url = `${explorerUrl}tx/${txHash}`;
      console.log(`
          -------------------------------------------
          🗳️  Betted on NBA !!!   🗳️
          -------------------------------------------
          🔔 Event name: ${event.log.fragment.name}
          ☎️  Bet address: ${sender}
          📜 Match ID: ${matchId}
          📜 Amount: ${amount}
          📜 PredictedTeam: ${predictedTeam}
          📜 BetRate: ${betRate}
          📜 BetTime: ${betTime}
          -------------------------------------------
          🧾 TxHash: ${txHash}
          🔍 Explorer URL: ${url}
          -------------------------------------------\n`);
    }
  );

  bet.on(
    "SendBetInfo",
    (
      channelId,
      betUser,
      matchId,
      event
    ) => {
      const txHash = event.log.transactionHash;
      const url = `${explorerUrl}tx/${txHash}`;
      const channelIdString = hre.ethers.decodeBytes32String(channelId);
      console.log(`
          -------------------------------------------
          📦🗳️  Bet Info Sent !!!   🗳️📦
          -------------------------------------------
          🔔 Event name: ${event.log.fragment.name}
          ☎️  Bet address: ${betUser}
          📜 Match ID: ${matchId}
          🛣️  Source Channel ID: ${channelIdString}
          -------------------------------------------
          🧾 TxHash: ${txHash}
          🔍 Explorer URL: ${url}
          -------------------------------------------\n`);
    }
  );

  bet.on(
    "AckNFTMint",
    (channelId, sequence, voter, matchId, voteNFTid, event) => {
      const txHash = event.log.transactionHash;
      const url = `${explorerUrl}tx/${txHash}`;
      const channelIdString = hre.ethers.decodeBytes32String(channelId);
      console.log(`
          -------------------------------------------
          📦🖼️  NFT Minted Ack !!!   🖼️📦
          -------------------------------------------
          🔔 Event name: ${event.log.fragment.name}
          ☎️  Bet address: ${voter}
          📜 Match ID: ${matchId}
          🖼️  Proof-Of-Bet NFT ID: ${voteNFTid}
          🛣️  Source Channel ID: ${channelIdString}
          📈 IBC packet sequence: ${sequence}
          -------------------------------------------
          🧾 TxHash: ${txHash}
          🔍 Explorer URL: ${url}
          -------------------------------------------\n`);

      bet.removeAllListeners();
    }
  );
}

async function setupNBABetEventListener() {
  console.log("🔊 Setting up Bet and NFT event listeners...");
  const config = require(getConfigPath());

  const srcIbcApp = await getIbcApp(config.createChannel.srcChain);
  listenForBetEvents(config.createChannel.srcChain, srcIbcApp);
}

module.exports = { setupNBABetEventListener };

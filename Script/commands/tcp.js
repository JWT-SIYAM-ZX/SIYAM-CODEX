module.exports.config = {
  name: "tcp",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "SIYAM BOT TEAM",
  description: "FF SIYAM Lv Up Bot (tcp/start/stop/status)",
  commandCategory: "system",
  usages: "!tcp | !start TEAMCODE | !stop | !status",
  cooldowns: 0
};

const axios = require("axios");
const API = "https://siyam-host-2.onrender.com";

// 🔥 MAIN MESSAGE LISTENER
module.exports.handleEvent = async function ({ api, event }) {
  const { body, threadID, messageID } = event;
  if (!body) return;

  const prefix = global.config.PREFIX || "!";
  if (!body.startsWith(prefix)) return;

  const args = body.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // 🟢 !tcp = HELP
  if (command === "tcp") {
    return api.sendMessage(
      "FF SIYAM Lv Up BOT\n\n" +
      "Available Commands:\n\n" +
      "!start TEAMCODE  → Start auto bot\n" +
      "!stop            → Stop bot\n" +
      "!status          → Check bot status\n\n" +
      "━━━━━━━━━━━━━━━━━━\n" +
      "HOW TO RUN THE BOT (IMPORTANT):\n\n" +
      "Step 1:\n" +
      "• Open Free Fire\n" +
      "• Go to Lone Wolf mode\n\n" +
      "Step 2:\n" +
      "• Select the map: Lone Wolf\n" +
      "• Then select: DUEL MODE\n\n" +
      "Step 3:\n" 
      "• Copy the TEAM CODE\n\n" +
      "Step 4:\n" +
      "• Come back to Messenger\n" +
      "• Type command like this:\n\n" +
      "!start >Your LW teamcode<\n\n" +
      "Example\n" +
      "!start 1234567\n" +
      "━━━━━━━━━━━━━━━━━━\n" +
      "Note:\n" +
      "• Do NOT start the match manually\n" +
      "• Let the bot handle everything\n",
      threadID,
      messageID
    );
  }

  // 🟢 !start TEAMCODE
  if (command === "start") {
    if (!args[0]) {
      return api.sendMessage(
        "❌ TEAMCODE missing\nExample:\n!start ABC123",
        threadID,
        messageID
      );
    }

    try {
      await axios.get(`${API}/start/${args[0]}`);
      return api.sendMessage(
        "✅ BOT STARTED SUCCESSFULLY\n\nTeam Code: " + args[0],
        threadID,
        messageID
      );
    } catch (e) {
      return api.sendMessage(
        "❌ Failed to start bot\nError: " + e.message,
        threadID,
        messageID
      );
    }
  }

  // 🔴 !stop
  if (command === "stop") {
    try {
      await axios.get(`${API}/stop`);
      return api.sendMessage(
        "🛑 BOT STOPPED SUCCESSFULLY",
        threadID,
        messageID
      );
    } catch (e) {
      return api.sendMessage(
        "❌ Failed to stop bot\nError: " + e.message,
        threadID,
        messageID
      );
    }
  }

  // 🔵 !status
  if (command === "status") {
    try {
      const res = await axios.get(API);

      return api.sendMessage(
        "📊 BOT STATUS\n\n" +
        "BOT Status: ONLINE ✅\n\n" +
        "Live Response:\n" +
        res.data.toString().slice(0, 1500),
        threadID,
        messageID
      );
    } catch (e) {
      return api.sendMessage(
        "❌ BOT OFFLINE\nError: " + e.message,
        threadID,
        messageID
      );
    }
  }
};

// required empty run
module.exports.run = async function () {};

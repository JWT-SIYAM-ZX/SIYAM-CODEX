module.exports.config = {
  name: "tcp",
  version: "1.3.0",
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
`FF SIYAM Lv Up BOT

Available Commands:
!start TEAMCODE  → Start auto bot
!stop            → Stop bot
!status          → Check bot status
━━━━━━━━━━━━━━━━━━
HOW TO RUN THE BOT (IMPORTANT)

Step 1:
Open Free Fire
• Go to Lone Wolf mode

Step 2:
• Select the map: Lone Wolf
• Then select: DUEL MODE

Step 3:
• Copy the TEAM CODE

Step 4:
• Come back to Messenger
• Type command like this:
!start <Your LW teamcode>

Example:
!start 1234567
━━━━━━━━━━━━━━━━━━
Note:
• Do NOT start the match manually
• Let the bot handle everything`,
      threadID,
      messageID
    );
  }

  // 🟢 !start TEAMCODE
  if (command === "start") {
    if (!args[0]) {
      return api.sendMessage(
        "❌ TEAMCODE missing\nExample:\n!start 1234567",
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

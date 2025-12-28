module.exports.config = {
  name: "tcp",
  version: "1.5.0",
  hasPermssion: 0,
  credits: "SIYAM BOT TEAM",
  description: "FF SIYAM Lv Up Bot Controller",
  commandCategory: "system",
  usages: "!tcp | !stbot TEAMCODE | !tcpoff | !status",
  cooldowns: 0
};

const axios = require("axios");
const API = "https://siyam-host-2.onrender.com";

module.exports.handleEvent = async function ({ api, event }) {
  const { body, threadID, messageID } = event;
  if (!body) return;

  const prefix = global.config.PREFIX || "!";
  if (!body.startsWith(prefix)) return;

  const args = body.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // 🟢 HELP → !tcp
  if (command === "tcp") {
    api.sendMessage(
`FF SIYAM Lv Up BOT

Available Commands:
!stbot TEAMCODE  → Start auto bot
!tcpoff          → Stop bot
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
!stbot <Your LW teamcode>

Example:
!stbot 1234567
━━━━━━━━━━━━━━━━━━
Note:
• Do NOT start the match manually
• Let the bot handle everything`,
      threadID,
      messageID
    );
    return true;
  }

  // 🟢 START BOT → !stbot TEAMCODE
  if (command === "stbot") {
    if (!args[0]) {
      api.sendMessage(
        "❌ TEAMCODE missing\nExample:\n!stbot 1234567",
        threadID,
        messageID
      );
      return true;
    }

    try {
      await axios.get(`${API}/start/${args[0]}`);
      api.sendMessage(
        `✅ BOT STARTED SUCCESSFULLY\n\nTeam Code: ${args[0]}`,
        threadID,
        messageID
      );
    } catch (e) {
      api.sendMessage(
        "❌ Failed to start bot\nError: " + e.message,
        threadID,
        messageID
      );
    }
    return true;
  }

  // 🔴 STOP BOT → !tcpoff
  if (command === "tcpoff") {
    try {
      await axios.get(`${API}/stop`);
      api.sendMessage(
        "🛑 BOT STOPPED SUCCESSFULLY",
        threadID,
        messageID
      );
    } catch (e) {
      api.sendMessage(
        "❌ Failed to stop bot\nError: " + e.message,
        threadID,
        messageID
      );
    }
    return true;
  }

  // 🔵 STATUS → !status
  if (command === "status") {
    try {
      const res = await axios.get(API);
      api.sendMessage(
        "📊 BOT STATUS\n\nBOT Status: ONLINE ✅\n\n" +
        res.data.toString().slice(0, 1500),
        threadID,
        messageID
      );
    } catch (e) {
      api.sendMessage(
        "❌ BOT OFFLINE\nError: " + e.message,
        threadID,
        messageID
      );
    }
    return true;
  }

  return true;
};

// required empty run
module.exports.run = async function () {};

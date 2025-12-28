module.exports.config = {
  name: "tcp",
  aliases: ["start", "stop"],
  version: "1.2.0",
  hasPermssion: 0,
  credits: "SIYAM BOT TEAM",
  description: "FF SIYAM Lv Up Messenger Bot",
  commandCategory: "game",
  usages: "!tcp | !start TEAMCODE | !stop",
  cooldowns: 5
};

const axios = require("axios");
const API_BASE = "https://siyam-host-2.onrender.com";

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, body } = event;
  const prefix = global.config.PREFIX;

  const command = body.slice(prefix.length).split(" ")[0].toLowerCase();

  // 🟢 TCP = HELP
  if (command === "tcp") {
    const text =
      "FF SIYAM Lv Up BOT\n\n" +
      "Commands:\n\n" +
      "1. !start TEAMCODE\n" +
      "2. !stop\n\n" +
      "Example:\n" +
      "!start ABC123";

    return api.sendMessage(text, threadID, messageID);
  }

  // 🟢 START
  if (command === "start") {
    if (!args[0]) {
      return api.sendMessage(
        "❌ TEAMCODE missing!\nExample:\n!start ABC123",
        threadID,
        messageID
      );
    }

    const teamCode = args[0];

    try {
      await axios.get(`${API_BASE}/start/${teamCode}`);

      return api.sendMessage(
        "✅ BOT STARTED SUCCESSFULLY\n\nTeam Code: " + teamCode,
        threadID,
        messageID
      );

    } catch (err) {
      return api.sendMessage(
        "❌ Failed to start bot\nError: " + err.message,
        threadID,
        messageID
      );
    }
  }

  // 🔴 STOP
  if (command === "stop") {
    try {
      await axios.get(`${API_BASE}/stop`);

      return api.sendMessage(
        "🛑 BOT STOPPED SUCCESSFULLY",
        threadID,
        messageID
      );

    } catch (err) {
      return api.sendMessage(
        "❌ Failed to stop bot\nError: " + err.message,
        threadID,
        messageID
      );
    }
  }
};

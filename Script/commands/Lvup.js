module.exports.config = {
  name: "tcp",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "SIYAM BOT TEAM",
  description: "FF SIYAM Lv Up Bot (single file)",
  commandCategory: "system",
  usages: "!tcp | !start TEAMCODE | !stop",
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
      "Commands:\n\n" +
      "!start TEAMCODE\n" +
      "!stop\n\n" +
      "Example:\n" +
      "!start ABC123",
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
        "✅ BOT STARTED SUCCESSFULLY\nTeam Code: " + args[0],
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
};

// ⚠️ empty run (required)
module.exports.run = async function () {};

module.exports.config = {
  name: "like2",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "ONLY SIYAM BOT TEAM",
  description: "Send Free Fire Likes using API",
  commandCategory: "game",
  usages: "/like2 uid",
  cooldowns: 10
};

module.exports.run = async function ({ api, event, args }) {
  const axios = require("axios");
  const { threadID, messageID } = event;

  if (!args[0]) {
    return api.sendMessage(
      "❌ UID PLZ\nExample: /like2 2255809105",
      threadID,
      messageID
    );
  }

  const uid = args[0];
  const server = "bd";

  api.sendMessage("⏳ Sending likes, please wait...", threadID, messageID);

  try {
    const res = await axios.get(
      `https://likeziha-seam.vercel.app/like?uid=${uid}&server_name=${server}`
    );

    const data = res.data;

    // ✅ Like sent successfully
    if (data.likesGiven) {
      const msg = `✅ Likes Sent Successfully! 🎉

👤 Player Name: ${data.playerName}
🆔 UID: ${uid}

❤️ Likes Before: ${data.likesBefore}
💖 Likes Given: ${data.likesGiven}
🎯 Total Likes Now: ${data.likesAfter}`;

      return api.sendMessage(msg, threadID, messageID);
    }

    // ⚠️ Daily limit reached
    if (data.message && data.message.toLowerCase().includes("maximum")) {
      const msg = `👤 Player Name: ${data.playerName}
👍 Current Likes: ${data.currentLikes}

⚠️ This Player Already Got Maximum Likes For Today.`;

      return api.sendMessage(msg, threadID, messageID);
    }

    // fallback
    api.sendMessage("❌ Unexpected response from server.", threadID, messageID);

  } catch (err) {
    api.sendMessage("❌ API Error / Server Down", threadID, messageID);
  }
};

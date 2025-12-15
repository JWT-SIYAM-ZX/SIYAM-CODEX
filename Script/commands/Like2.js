module.exports.config = {
  name: "like2",
  version: "1.0.2",
  hasPermssion: 0,
  credits: "ONLY SIYAM BOT TEAM ☢️",
  description: "Free Fire Like Bot (Admin Only, BD Server)",
  commandCategory: "game",
  usages: "[uid]",
  cooldowns: 10
};

module.exports.languages = {
  en: {
    noArgs: "❌ Usage: %prefix%like2 7538692308",
    notAdmin: "⛔ This command is for BOT ADMINS only!",
    sending: "⏳ Sending likes to UID: %1..."
  }
};

module.exports.run = async function ({ api, event, args, getText }) {
  const axios = require("axios");
  const { threadID, messageID, senderID } = event;

  // 🔐 ADMIN CHECK
  if (!global.config.ADMINBOT.includes(senderID)) {
    return api.sendMessage(
      getText("notAdmin"),
      threadID,
      messageID
    );
  }

  if (!args[0]) {
    return api.sendMessage(
      getText("noArgs", { prefix: global.config.PREFIX }),
      threadID,
      messageID
    );
  }

  const uid = args[0];
  api.sendMessage(getText("sending", uid), threadID, messageID);

  try {
    const url = `https://likeziha-seam.vercel.app/like?uid=${uid}&server_name=bd`;
    const res = await axios.get(url);
    const d = res.data;

    // ⚠️ Daily limit hit
    if (d.status != 1) {
      const limitMsg = `
👤 Player Name: ${d.PlayerNickname || "Unknown"}
👍 Current Likes: ${d.LikesafterCommand || d.LikesbeforeCommand || "N/A"}

⚠️ This Player Already Got Maximum Likes For Today.
`;
      return api.sendMessage(limitMsg, threadID, messageID);
    }

    // ✅ Success
    const msg = `
✅ Likes Sent Successfully! 🎉

👤 Player Name: ${d.PlayerNickname}
🆔 UID: ${d.UID}

❤️ Likes Before: ${d.LikesbeforeCommand}
💖 Likes Given: ${d.LikesGivenByAPI}
🔥 Likes After: ${d.LikesafterCommand}

⚡ Powered By SIYAM BOT
`;

    api.sendMessage(msg, threadID, messageID);

  } catch (err) {
    api.sendMessage(
      "❌ Server Error! Try again later.",
      threadID,
      messageID
    );
  }
};

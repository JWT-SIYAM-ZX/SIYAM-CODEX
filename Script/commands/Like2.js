module.exports.config = {
  name: "like2",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "ONLY SIYAM BOT TEAM ☢️",
  description: "Send Free Fire Likes using API",
  commandCategory: "game",
  usages: "[region] [uid]",
  cooldowns: 10
};

module.exports.languages = {
  en: {
    noArgs: "❌ Usage: %prefix%like2 bd 2255809105",
    sending: "⏳ Sending likes to UID: %1...",
    error: "❌ Failed to send likes!"
  }
};

module.exports.run = async function ({ api, event, args, getText }) {
  const axios = require("axios");
  const { threadID, messageID } = event;

  if (!args[0] || !args[1])
    return api.sendMessage(
      getText("noArgs", { prefix: global.config.PREFIX }),
      threadID,
      messageID
    );

  const region = args[0].toLowerCase();
  const uid = args[1];

  api.sendMessage(getText("sending", uid), threadID, messageID);

  try {
    const url = `https://likeziha-seam.vercel.app/like?uid=${uid}&server_name=${region}`;
    const res = await axios.get(url);
    const d = res.data;

    if (d.status != 1)
      return api.sendMessage("❌ API Error!", threadID, messageID);

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

  } catch (e) {
    api.sendMessage(getText("error"), threadID, messageID);
  }
};

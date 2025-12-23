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
👤 𝐏𝐋𝐀𝐘𝐄𝐑 𝐍𝐀𝐌𝐄: ${d.PlayerNickname || "Unknown"}
👍 𝐂𝐔𝐑𝐑𝐄𝐍𝐓 𝐋𝐈𝐊𝐄𝐒: ${d.LikesafterCommand || d.LikesbeforeCommand || "N/A"}

⚠️ This Player Already Got Maximum Likes For Today.
`;
      return api.sendMessage(limitMsg, threadID, messageID);
    }

    // ✅ Success
    const msg = `
✅ 𝙇𝙄𝙆𝙀𝙎 𝙎𝙀𝙉𝙏 𝙎𝙐𝘾𝘾𝙀𝙎𝙎𝙁𝙐𝙇𝙇𝙔! 🎉

👤 𝙿𝙻𝙰𝚈𝙴𝚁 𝙽𝙰𝙼𝙴: ${d.PlayerNickname}
🆔 𝚄𝙸𝙳: ${d.UID}

❤️ 𝙻𝙸𝙺𝙴𝚂 𝙱𝙴𝙵𝙾𝚁𝙴: ${d.LikesbeforeCommand}
💖 𝙻𝙸𝙺𝙴𝚂 𝙶𝙸𝚅𝙴𝙽: ${d.LikesGivenByAPI}
🔥 𝙻𝙸𝙺𝙴𝚂 𝙰𝙵𝚃𝙴𝚁: ${d.LikesafterCommand}

👑 𝙊𝙬𝙣𝙚𝙧: 𝙾𝙽𝙻𝚈 𝚂𝙸𝚈𝙰𝙼
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

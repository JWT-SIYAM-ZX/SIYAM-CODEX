module.exports.config = {
  name: "like2",
  version: "1.0.4",
  hasPermssion: 2, // 🔒 ADMIN ONLY
  credits: "ONLY SIYAM BOT TEAM ☢️",
  description: "Free Fire Like Bot (Admin Only, BD Server)",
  commandCategory: "admin",
  usages: "[uid]",
  cooldowns: 10
};

module.exports.languages = {
  en: {
    noArgs: "❌ Usage: %prefix%like2 7538692308",
    sending: "⏳ Sending likes to UID: %1..."
  }
};

module.exports.run = async function ({ api, event, args, getText }) {
  const axios = require("axios");
  const request = require("request");
  const { threadID, messageID, senderID } = event;

  // 🖼️ IMGUR IMAGE LINKS (CHANGE THESE)
  const SUCCESS_IMAGE = "https://imgur.com/hPiJidn.jpg";
  const FAILED_IMAGE  = "https://imgur.com/rlbpQWu.jpg";

  // 🔐 HARD ADMIN CHECK (NO MESSAGE FOR NON-ADMIN)
  if (!global.config.ADMINBOT.includes(senderID)) return;

  // ❌ NO UID
  if (!args[0]) {
    return api.sendMessage(
      getText("noArgs", { prefix: global.config.PREFIX }),
      threadID,
      messageID
    );
  }

  const uid = args[0];

  // ⏳ LOADING
  api.sendMessage(getText("sending", uid), threadID, messageID);

  try {
    const url = `https://likeziha-seam.vercel.app/like?uid=${uid}&server_name=bd`;

    // ⏱️ TIMEOUT (NO HANG)
    const res = await axios.get(url, { timeout: 15000 });

    if (!res.data) {
      return api.sendMessage(
        {
          body: "❌ Like server did not respond.\nTry again later.",
          attachment: request(FAILED_IMAGE)
        },
        threadID,
        messageID
      );
    }

    const d = res.data;

    // ❌ LIMIT / FAILED
    if (d.status != 1) {
      const msg = `
👤 PLAYER NAME: ${d.PlayerNickname || "Unknown"}
👍 CURRENT LIKES: ${d.LikesafterCommand || d.LikesbeforeCommand || "N/A"}

⚠️ This player already got maximum likes for today.
`;
      return api.sendMessage(
        {
          body: msg,
          attachment: request(FAILED_IMAGE)
        },
        threadID,
        messageID
      );
    }

    // ✅ SUCCESS
    const msg = `
✅ LIKES SENT SUCCESSFULLY! 🎉

👤 PLAYER NAME: ${d.PlayerNickname}
🆔 UID: ${d.UID}

❤️ LIKES BEFORE: ${d.LikesbeforeCommand}
💖 LIKES GIVEN: ${d.LikesGivenByAPI}
🔥 LIKES AFTER: ${d.LikesafterCommand}

👑 OWNER: ONLY SIYAM
`;

    return api.sendMessage(
      {
        body: msg,
        attachment: request(SUCCESS_IMAGE)
      },
      threadID,
      messageID
    );

  } catch (err) {
    console.log("LIKE2 ERROR:", err.message);
    return api.sendMessage(
      {
        body: "❌ Like server timeout or down.\nPlease try again later.",
        attachment: request(FAILED_IMAGE)
      },
      threadID,
      messageID
    );
  }
};

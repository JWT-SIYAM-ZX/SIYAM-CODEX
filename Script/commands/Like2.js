module.exports.config = {
  name: "like2",
  version: "1.0.5",
  hasPermssion: 2,
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
  const https = require("https");
  const { threadID, messageID, senderID } = event;

  function getStream(url) {
    return https.get(url);
  }

  const SUCCESS_IMAGE = "https://imgur.com/hPiJidn.jpg";
  const FAILED_IMAGE  = "https://imgur.com/rlbpQWu.jpg";

  // 🔒 ADMIN ONLY (SILENT)
  if (!global.config.ADMINBOT.includes(senderID)) return;

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

    const res = await axios.get(url, { timeout: 15000 });

    if (!res.data || typeof res.data !== "object") {
      return api.sendMessage(
        {
          body: "❌ Invalid response from like server.",
          attachment: getStream(FAILED_IMAGE)
        },
        threadID,
        messageID
      );
    }

    const d = res.data;

    // ❌ LIMIT / FAIL
    if (d.status != 1) {
      const msg = `
👤 PLAYER NAME: ${d.PlayerNickname || "Unknown"}
👍 CURRENT LIKES: ${d.LikesafterCommand || d.LikesbeforeCommand || "N/A"}

⚠️ Maximum likes reached for today.
`;
      return api.sendMessage(
        {
          body: msg,
          attachment: getStream(FAILED_IMAGE)
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
        attachment: getStream(SUCCESS_IMAGE)
      },
      threadID,
      messageID
    );

  } catch (err) {
    console.log("LIKE2 ERROR FULL:", err?.code || err?.toString());

    return api.sendMessage(
      {
        body: "❌ Like server error or timeout.\nTry again later.",
        attachment: getStream(FAILED_IMAGE)
      },
      threadID,
      messageID
    );
  }
};

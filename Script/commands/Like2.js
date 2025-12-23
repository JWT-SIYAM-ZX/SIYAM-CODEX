module.exports.config = {
  name: "like2",
  version: "1.0.4",
  hasPermssion: 0,
  credits: "ONLY SIYAM BOT TEAM ☢️ (Modified)",
  description: "Free Fire Like Bot (Admin Only, BD Server) with Image + Error Handling",
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
  const fs = require("fs");
  const path = require("path");
  const { threadID, messageID, senderID } = event;

  // 🔐 ADMIN CHECK
  if (!global.config.ADMINBOT.includes(senderID)) {
    return api.sendMessage(
      getText("notAdmin"),
      threadID,
      messageID
    );
  }

  // ❌ UID missing
  if (!args[0]) {
    return api.sendMessage(
      getText("noArgs", { prefix: global.config.PREFIX }),
      threadID,
      messageID
    );
  }

  const uid = args[0];
  api.sendMessage(getText("sending", uid), threadID, messageID);

  // 🖼️ IMAGE LINKS (change your own links if needed)
  const SUCCESS_IMAGE = "https://imgur.com/hPiJidn.jpeg";
  const LIMIT_IMAGE = "https://imgur.com/rlbpQWu.jpeg";
  const SERVER_ERROR_IMAGE = "https://imgur.com/f7SujxA.jpeg"; // Server Error image

  // 📁 temp image path
  const imgPath = path.join(__dirname, `like_${uid}.jpg`);

  try {
    const url = `https://likeziha-seam.vercel.app/like?uid=${uid}&server_name=bd`;
    const res = await axios.get(url);
    const d = res.data || {};

    // ⚠️ LIMIT / FAILED
    if (d.status != 1) {
      const limitMsg = `
⚠️ 𝐃𝐀𝐈𝐋𝐘 𝐋𝐈𝐊𝐄 𝐋𝐈𝐌𝐈𝐓 𝐑𝐄𝐀𝐂𝐇𝐄𝐃

👤 𝐏𝐋𝐀𝐘𝐄𝐑 𝐍𝐀𝐌𝐄: ${d.PlayerNickname || "Unknown"}
🆔 𝐔𝐈𝐃: ${uid}
👍 𝐂𝐔𝐑𝐑𝐄𝐍𝐓 𝐋𝐈𝐊𝐄𝐒: ${d.LikesafterCommand || d.LikesbeforeCommand || "N/A"}
`;

      const imgRes = await axios.get(LIMIT_IMAGE, {
        responseType: "arraybuffer"
      });
      fs.writeFileSync(imgPath, Buffer.from(imgRes.data));

      return api.sendMessage(
        {
          body: limitMsg,
          attachment: fs.createReadStream(imgPath)
        },
        threadID,
        () => fs.unlinkSync(imgPath),
        messageID
      );
    }

    // ✅ SUCCESS
    const successMsg = `
✅ 𝙇𝙄𝙆𝙀𝙎 𝙎𝙀𝙉𝙏 𝙎𝙐𝘾𝘾𝙀𝙎𝙎𝙁𝙐𝙇𝙇𝙔 🎉

👤 𝙋𝙇𝘼𝙔𝙀𝙍: ${d.PlayerNickname || "Unknown"}
🆔 𝙐𝙄𝘿: ${d.UID || uid}

❤️ 𝘽𝙀𝙁𝙊𝙍𝙀: ${d.LikesbeforeCommand || "N/A"}
💖 𝙂𝙄𝙑𝙀𝙉: ${d.LikesGivenByAPI || "N/A"}
🔥 𝘼𝙁𝙏𝙀𝙍: ${d.LikesafterCommand || "N/A"}

👑 Owner: ONLY SIYAM
`;

    const imgRes = await axios.get(SUCCESS_IMAGE, {
      responseType: "arraybuffer"
    });
    fs.writeFileSync(imgPath, Buffer.from(imgRes.data));

    api.sendMessage(
      {
        body: successMsg,
        attachment: fs.createReadStream(imgPath)
      },
      threadID,
      () => fs.unlinkSync(imgPath),
      messageID
    );

  } catch (err) {
    console.error("LIKE2 ERROR FULL:", err);

    const imgRes = await axios.get(SERVER_ERROR_IMAGE, { responseType: "arraybuffer" });
    fs.writeFileSync(imgPath, Buffer.from(imgRes.data));

    api.sendMessage(
      {
        body: "❌ Server Error! Try again later.",
        attachment: fs.createReadStream(imgPath)
      },
      threadID,
      () => fs.unlinkSync(imgPath),
      messageID
    );
  }
};

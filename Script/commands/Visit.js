module.exports.config = {
  name: "visit",
  version: "1.1.1",
  hasPermssion: 0,
  credits: "ONLY SIYAM BOT TEAM ☢️",
  description: "Free Fire Visit Bot (Public 1000 / Admin Multi, BD Server)",
  commandCategory: "game",
  usages: "[uid] [amount]",
  cooldowns: 10
};

module.exports.languages = {
  en: {
    noArgs: "❌ Usage: %prefix%visit 2255809105 [1000/2000/3000...]",
    notAdmin: "⛔ Only BOT ADMINS can send more than 1000 visits!",
    sending: "⏳ SENDING VISIT %2 TO UID: %1..."
  }
};

module.exports.run = async function ({ api, event, args, getText }) {
  const axios = require("axios");
  const { threadID, messageID, senderID } = event;

  if (!args[0]) {
    return api.sendMessage(
      getText("noArgs", { prefix: global.config.PREFIX }),
      threadID,
      messageID
    );
  }

  const uid = args[0];
  let amount = 1000; // default for public

  // amount given
  if (args[1]) {
    // admin check
    if (!global.config.ADMINBOT.includes(senderID)) {
      return api.sendMessage(
        getText("notAdmin"),
        threadID,
        messageID
      );
    }

    amount = parseInt(args[1]);

    if (isNaN(amount) || amount < 1000 || amount % 1000 !== 0) {
      return api.sendMessage(
        "❌ Amount must be like 1000, 2000, 3000, 4000...",
        threadID,
        messageID
      );
    }
  }

  const times = amount / 1000;

  // 🔕 SINGLE CLEAN MESSAGE (no 10x / api call spam)
  api.sendMessage(
    getText("sending", uid, amount >= 1000 ? (amount >= 10000 ? (amount / 1000) + "K" : amount) : amount),
    threadID,
    messageID
  );

  let totalSuccess = 0;
  let totalFail = 0;
  let playerInfo = null;

  try {
    for (let i = 1; i <= times; i++) {
      const url = `https://z-ihad-seam-visit-api.vercel.app/BD/${uid}`;
      const res = await axios.get(url);
      const d = res.data;

      if (d.fail == 0) {
        totalSuccess += d.success || 0;
        totalFail += (1000 - (d.success || 0));
        playerInfo = d;
      } else {
        totalFail += 1000;
      }

      // safe delay (silent)
      await new Promise(r => setTimeout(r, 1200));
    }

    const msg = `
✅ 𝙑𝙄𝙎𝙄𝙏 𝙍𝙀𝙋𝙊𝙍𝙏 🎉

👤 𝙋𝙇𝘼𝙔𝙀𝙍: ${playerInfo?.nickname || "Unknown"}
🆔 𝙐𝙄𝘿: ${uid}
🌍 𝙍𝙀𝙂𝙄𝙊𝙉: BD
🎚️ 𝙇𝙀𝙑𝙀𝙇: ${playerInfo?.level || "N/A"}

👁️ 𝙍𝙀𝙌𝙐𝙀𝙎𝙏𝙀𝘿: ${amount}
✅ 𝙎𝙐𝘾𝘾𝙀𝙎𝙎: ${totalSuccess}
❌ 𝙁𝘼𝙄𝙇: ${totalFail}

❤️ 𝙇𝙄𝙆𝙀𝙎: ${playerInfo?.likes || "N/A"}

👑 𝙊𝙬𝙣𝙚𝙧: 𝙾𝙽𝙻𝚈 𝚂𝙸𝙔𝘼𝙈
`;

    api.sendMessage(msg, threadID, messageID);

  } catch (e) {
    api.sendMessage(
      "❌ Server Error! Try again later.",
      threadID,
      messageID
    );
  }
};

module.exports.config = {
  name: "visit",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "ONLY SIYAM BOT TEAM ☢️",
  description: "Free Fire Visit Bot (Public 1000 / Admin Multi, BD Server) with daily limit",
  commandCategory: "game",
  usages: "[uid] [amount]",
  cooldowns: 10
};

module.exports.languages = {
  en: {
    noArgs: "❌ Usage: Example .visit 2255809105",
    notAdmin: "⛔ Only BOT ADMINS can send more than 1000 visits!",
    sending: "⏳ SENDING VISIT %2 TO UID: %1...",
    dailyLimit: "⛔ Daily limit reached! You can only send %1 visits per day."
  }
};

module.exports.run = async function ({ api, event, args, getText }) {
  const axios = require("axios");
  const fs = require("fs");
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
  const MAX_DAILY = 10; // public daily limit

  // 📂 JSON file storage for daily visits
  const visitFile = "./dailyVisits.json";
  let dailyVisits = {};

  if (fs.existsSync(visitFile)) {
    try {
      dailyVisits = JSON.parse(fs.readFileSync(visitFile, "utf-8"));
    } catch (e) {
      dailyVisits = {};
    }
  }

  const today = new Date().toDateString();
  if (!dailyVisits[senderID] || dailyVisits[senderID].lastDate !== today) {
    dailyVisits[senderID] = { count: 0, lastDate: today };
  }

  // PUBLIC DAILY LIMIT CHECK
  if (!global.config.ADMINBOT.includes(senderID) && dailyVisits[senderID].count >= MAX_DAILY) {
    return api.sendMessage(
      getText("dailyLimit", MAX_DAILY),
      threadID,
      messageID
    );
  }

  // amount given (only admin can change)
  if (args[1]) {
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

      await new Promise(r => setTimeout(r, 1200)); // safe delay
    }

    // ✅ Increment daily count for public users
    if (!global.config.ADMINBOT.includes(senderID)) {
      dailyVisits[senderID].count += 1;
      fs.writeFileSync(visitFile, JSON.stringify(dailyVisits, null, 2));
    }

    const msg = `
🔥 𝙑𝙄𝙎𝙄𝙏𝙎 𝙎𝙀𝙉𝙏 𝙎𝙐𝘾𝘾𝙀𝙎𝙎𝙁𝙐𝙇𝙇𝙔 🎉

❗𝐑𝐄-𝐒𝐓𝐀𝐑𝐓 𝐘𝐎𝐔𝐑 𝐆𝐀𝐌𝐄 𝐓𝐎 𝐂𝐇𝐄𝐂𝐊 𝐓𝐇𝐄 𝐕𝐈𝐒𝐈𝐓 𝐂𝐎𝐔𝐍𝐓𝐒
👤 𝙋𝙇𝘼𝙔𝙀𝙍: ${playerInfo?.nickname || "Unknown"}
🆔 𝙐𝙄𝘿: ${uid}
🌍 𝙍𝙀𝙂𝙄𝙊𝙉: BD
🎚️ 𝙇𝙀𝙑𝙀𝙇: ${playerInfo?.level || "N/A"}

👁️ 𝙍𝙀𝙌𝙐𝙀𝙎𝙏𝙀𝘿: ${amount}
✅ 𝙎𝙐𝘾𝘾𝙀𝙎𝙎: ${totalSuccess}
❌ 𝙁𝘼𝙄𝙇: ${totalFail}

❤️ 𝙇𝙄𝙆𝙀𝙎: ${playerInfo?.likes || "N/A"}

👑 𝙊𝙬𝙣𝙚𝙧: 𝙾𝙽𝙻𝚈 𝚂𝙸𝚈𝙰𝙼

${global.config.ADMINBOT.includes(senderID) ? "🌍 ADMIN NO LIMITS" : `📊 Your daily visits: ${dailyVisits[senderID].count}/${MAX_DAILY}`}
`;

    api.sendMessage(msg, threadID, messageID);

  } catch (e) {
    api.sendMessage(
      "❌ Server Error! Try again later.",
      threadID,
      messageID
    );
    console.error(e);
  }
}

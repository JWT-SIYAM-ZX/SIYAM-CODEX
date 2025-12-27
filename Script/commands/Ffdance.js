module.exports.config = {
  name: "dance",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "ONLY SIYAM BOT TEAM ☢️",
  description: "Free Fire Dance / Emote Bot (Show Only User UID)",
  commandCategory: "game",
  usages: "dance <team_code> <uid1> [uid2] [uid3] <emote_id>",
  cooldowns: 10
};

module.exports.languages = {
  en: {
    noArgs: "❌ Usage:\n%dance <team_code> <uid1> [uid2] [uid3] <emote_id>",
    sending: "⏳ Performing emote...\n🎭 Emote ID: %1"
  }
};

module.exports.run = async function ({ api, event, args, getText }) {
  const axios = require("axios");
  const { threadID, messageID } = event;

  if (args.length < 3) {
    return api.sendMessage(
      getText("noArgs").replace("%dance", global.config.PREFIX + "dance"),
      threadID,
      messageID
    );
  }

  const teamCode = args[0];
  const emoteId = args[args.length - 1];

  // user provided UIDs
  let userUIDs = args.slice(1, args.length - 1);

  // Auto-fill baki UID
  const defaultUIDs = ["13562227135", "13595681767"];
  while (userUIDs.length < 3) {
    userUIDs.push(defaultUIDs[userUIDs.length - 1]);
  }

  api.sendMessage(
    getText("sending", emoteId),
    threadID,
    messageID
  );

  try {
    const url = `https://jnl-dance-pro.onrender.com/join?tc=${teamCode}&uid1=${userUIDs[0]}&uid2=${userUIDs[1]}&uid3=${userUIDs[2]}&emote_id=${emoteId}`;
    const res = await axios.get(url);
    const d = res.data;

    if (d.status !== "success") {
      return api.sendMessage(
        "❌ Emote failed! Please check team code / UID / Emote ID.",
        threadID,
        messageID
      );
    }

    // Show only user provided UIDs
    const shownUIDs = args.slice(1, args.length - 1);

    const msg = `
✅ 𝘿𝘼𝙉𝘾𝙀 / 𝙀𝙈𝙊𝙏𝙀 𝙎𝙐𝘾𝘾𝙀𝙎 🎉

🎭 𝙀𝙈𝙊𝙏𝙀 𝙄𝘿: ${d.emote_id}
👥 𝙏𝙀𝘼𝙈 𝘾𝙊𝘿𝙀: ${d.team_code}

👤 𝙐𝙎𝙀𝙍 𝙋𝙍𝙊𝙑𝙄𝘿𝙀𝘿 𝙐𝙄𝘿𝙎:
${shownUIDs.map((u, i) => `• UID ${i + 1}: ${u}`).join("\n")}

📩 𝙈𝙀𝙎𝙎𝘼𝙂𝙀:
${d.message}

👑 𝙊𝙒𝙉𝙀𝙍: ONLY SIYAM
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

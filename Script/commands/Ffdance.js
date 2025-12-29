module.exports.config = {
  name: "play",
  version: "1.0.3",
  hasPermssion: 0,
  credits: "ONLY SIYAM BOT TEAM ☢️",
  description: "Free Fire Emote Bot (Teamcode + 1–6 UID + Emote)",
  commandCategory: "game",
  usages: "/play <teamcode> <uid1..uid6> <emote_id>",
  cooldowns: 10
};

module.exports.languages = {
  en: {
    noArgs: "❌ Usage: %prefix%play <teamcode> <uid1..uid6> <emote_id>",
    maxUid: "⚠️ Maximum 6 UID allowed!",
    sending: "🎮 Sending emote...\n\nTeam: %1\nUID Count: %2\nEmote: %3"
  }
};

module.exports.run = async function ({ api, event, args, getText }) {
  const axios = require("axios");
  const { threadID, messageID } = event;

  // ❌ Minimum check
  if (args.length < 3) {
    return api.sendMessage(
      getText("noArgs", { prefix: global.config.PREFIX }),
      threadID,
      messageID
    );
  }

  const teamcode = args[0];
  const emote_id = args[args.length - 1];

  // UID list (middle args)
  const uidList = args.slice(1, args.length - 1);

  // ❌ More than 6 UID
  if (uidList.length > 6) {
    return api.sendMessage(
      getText("maxUid"),
      threadID,
      messageID
    );
  }

  // Fill uid1–uid6
  const uid = ["", "", "", "", "", ""];
  for (let i = 0; i < uidList.length; i++) {
    uid[i] = uidList[i];
  }

  api.sendMessage(
    getText("sending", teamcode, uidList.length, emote_id),
    threadID,
    messageID
  );

  try {
    const url =
      `https://emote-bot-1-cyug.onrender.com/join` +
      `?tc=${teamcode}` +
      `&uid1=${uid[0]}` +
      `&uid2=${uid[1]}` +
      `&uid3=${uid[2]}` +
      `&uid4=${uid[3]}` +
      `&uid5=${uid[4]}` +
      `&uid6=${uid[5]}` +
      `&emote_id=${emote_id}`;

    const res = await axios.get(url);
    const d = res.data;

    if (!d || d.status === false) {
      return api.sendMessage(
        "❌ Emote failed! Try again later.",
        threadID,
        messageID
      );
    }

    // ✅ SUCCESS
    const msg = `
✅ 𝙀𝙈𝙊𝙏𝙀 𝙎𝙀𝙉𝙏 𝙎𝙐𝘾𝘾𝙀𝙎𝙎𝙁𝙐𝙇𝙇𝙔 🎉

🎮 Team Code: ${teamcode}
👥 Total UID: ${uidList.length}
💃 Emote ID: ${emote_id}

🤖 Bot joined → emoted → left
👑 Owner: ONLY SIYAM
`;
    api.sendMessage(msg, threadID, messageID);

  } catch (err) {
    api.sendMessage(
      "❌ Server Error! API not responding.",
      threadID,
      messageID
    );
  }
};

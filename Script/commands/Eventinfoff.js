module.exports.config = {
  name: "eventinfo",
  version: "1.2.1",
  hasPermssion: 0,
  credits: "ONLY SIYAM BOT TEAM ☢️",
  description: "Free Fire Event Info (Safe Version)",
  commandCategory: "game",
  usages: "/eventinfo <region>",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const axios = require("axios");
  const fs = require("fs");
  const path = require("path");

  const { threadID, messageID } = event;
  const region = (args[0] || "BD").toUpperCase();
  const today = new Date().toISOString().split("T")[0];

  try {
    // 🔹 Fetch event info
    const infoUrl = `https://danger-event-info.vercel.app/event?region=${region}&key=DANGERxEVENT`;
    const res = await axios.get(infoUrl);

    const raw = res.data;
    const events = raw.events || raw.data || [];
    const totalEvents = Array.isArray(events) ? events.length : 0;

    // 📝 Text
    const text =
`🎉 Free Fire Events (${region})

📅 Date: ${today}
📊 Total Events: ${totalEvents}`;

    // 🖼️ Try banner
    const imgUrl = `https://danger-event-info.vercel.app/banner?region=${region}`;
    const imgPath = path.join(__dirname, "cache", `event_${region}.jpg`);

    try {
      const img = await axios.get(imgUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, img.data);

      // ✅ Send text + image
      return api.sendMessage(
        {
          body: text,
          attachment: fs.createReadStream(imgPath)
        },
        threadID,
        () => fs.unlinkSync(imgPath),
        messageID
      );

    } catch (imgErr) {
      // ⚠️ Banner নাই → text only
      return api.sendMessage(
        text + "\n\n⚠️ Event banner not available for this region.",
        threadID,
        messageID
      );
    }

  } catch (err) {
    return api.sendMessage(
      `❌ Event info পাওয়া যায়নি!\nRegion: ${region}\nReason: API not responding`,
      threadID,
      messageID
    );
  }
};

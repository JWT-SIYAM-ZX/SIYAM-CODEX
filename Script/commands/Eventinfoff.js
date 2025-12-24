module.exports.config = {
  name: "eventinfo",
  version: "1.3.0",
  hasPermssion: 0,
  credits: "ONLY SIYAM BOT TEAM ☢️",
  description: "Free Fire Event Info (Text + Image from API)",
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
    // 🔹 Fetch event API
    const infoUrl = `https://danger-event-info.vercel.app/event?region=${region}&key=DANGERxEVENT`;
    const res = await axios.get(infoUrl);
    const data = res.data;

    if (!data || !Array.isArray(data.events) || data.events.length === 0) {
      return api.sendMessage(
        `❌ No events found for region: ${region}`,
        threadID,
        messageID
      );
    }

    const totalEvents = data.events.length;

    // ✅ First event image (main banner)
    const imageUrl = data.events[0].image_url;

    // 📝 Text (UPPER)
    const text =
`🎉 Free Fire Events (${region})

📅 Date: ${data.date || today}
📊 Total Events: ${totalEvents}`;

    // 🖼️ Download image
    const imgPath = path.join(__dirname, "cache", `event_${region}.jpg`);
    const img = await axios.get(imageUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(imgPath, img.data);

    // 📤 Send text + image together
    api.sendMessage(
      {
        body: text,
        attachment: fs.createReadStream(imgPath)
      },
      threadID,
      () => fs.unlinkSync(imgPath),
      messageID
    );

  } catch (err) {
    api.sendMessage(
      `❌ Event info load করা যায়নি!\nError: ${err.message}`,
      threadID,
      messageID
    );
  }
};

module.exports.config = {
  name: "eventinfo",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "ONLY SIYAM BOT TEAM ☢️",
  description: "Free Fire Event Info (Text + Image Together)",
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
    // 🔹 Event info
    const infoUrl = `https://danger-event-info.vercel.app/event?region=${region}&key=DANGERxEVENT`;
    const res = await axios.get(infoUrl);
    const data = res.data;

    const events = data.events || [];
    const totalEvents = events.length;

    // 📝 Text (UPPER PART)
    const text =
`🎉 Free Fire Events (${region})

📅 Date: ${today}
📊 Total Events: ${totalEvents}

📸 Event Banner ↓`;

    // 🖼️ Image
    const imgUrl = `https://danger-event-info.vercel.app/banner?region=${region}`;
    const imgPath = path.join(__dirname, "cache", `event_${region}.jpg`);

    const img = await axios.get(imgUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(imgPath, img.data);

    // 📤 Send TEXT + IMAGE together
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

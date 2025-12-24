module.exports.config = {
  name: "eventinfo",
  version: "1.4.0",
  hasPermssion: 0,
  credits: "ONLY SIYAM BOT TEAM ☢️",
  description: "Free Fire Event Info (All Images + Names)",
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

  try {
    // 🔹 Fetch API
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

    const events = data.events;

    // 📝 First summary message
    await api.sendMessage(
`🎉 Free Fire Events (${region})

📅 Date: ${data.date || "N/A"}
📊 Total Events: ${events.length}

⬇️ Event details below`,
      threadID
    );

    // 📁 cache dir
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    // 🔁 Send events one by one
    for (let i = 0; i < events.length; i++) {
      const ev = events[i];
      if (!ev.image_url) continue;

      const imgPath = path.join(cacheDir, `event_${region}_${i}.jpg`);

      try {
        const img = await axios.get(ev.image_url, {
          responseType: "arraybuffer",
          timeout: 15000
        });
        fs.writeFileSync(imgPath, img.data);

        // 📨 Text + Image together (NAME first)
        await api.sendMessage(
          {
            body: `🎯 Event ${i + 1}\n📝 ${ev.title || "Unknown Event"}`,
            attachment: fs.createReadStream(imgPath)
          },
          threadID
        );

        fs.unlinkSync(imgPath);

        // ⏳ small delay (important for Messenger)
        await new Promise(r => setTimeout(r, 1500));

      } catch (imgErr) {
        await api.sendMessage(
          `⚠️ ${ev.title || "Event"}\nImage load করা যায়নি`,
          threadID
        );
      }
    }

  } catch (err) {
    api.sendMessage(
      `❌ Event info load করা যায়নি!\nError: ${err.message}`,
      threadID,
      messageID
    );
  }
};

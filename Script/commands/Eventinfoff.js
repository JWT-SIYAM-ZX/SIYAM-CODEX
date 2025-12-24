module.exports.config = {
  name: "eventinfo",
  version: "1.7.0",
  hasPermssion: 0,
  credits: "ONLY SIYAM BOT TEAM ☢️",
  description: "Free Fire Event Info (Owner line added)",
  commandCategory: "game",
  usages: "/eventinfo <region>",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const axios = require("axios");
  const fs = require("fs");
  const path = require("path");

  const { threadID, messageID } = event;

  // 🔹 Default region = BD
  const region = (args[0] || "BD").toUpperCase();

  // 🔹 Function to clean event title
  function cleanTitle(title) {
    if (!title) return "Unknown Event";
    let t = title;

    // Remove resolution prefix (digits + x + digits + _)
    t = t.replace(/^\d+x\d+_/, "");

    // Replace underscores with spaces
    t = t.replace(/_/g, " ");

    // Optional: add space before capital letters (camelcase)
    t = t.replace(/([a-z])([A-Z])/g, "$1 $2");

    return t.trim();
  }

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

    const events = data.events;

    // 📝 First summary message
    await api.sendMessage(
      `🎉 Free Fire Events (${region})\n\n📅 Date: ${data.date || "N/A"}\n📊 Total Events: ${events.length}\n\n⬇️ Event details below`,
      threadID
    );

    // 📁 cache dir
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    // 🔁 Send events one by one
    for (let i = 0; i < events.length; i++) {
      const ev = events[i];
      if (!ev.image_url) continue;

      const cleanName = cleanTitle(ev.title);
      const imgPath = path.join(cacheDir, `event_${region}_${i}.jpg`);

      try {
        const img = await axios.get(ev.image_url, {
          responseType: "arraybuffer",
          timeout: 15000
        });
        fs.writeFileSync(imgPath, img.data);

        // 📨 Send Text + Image together + Owner line
        await api.sendMessage(
          {
            body: `🎯 Event ${i + 1}\n📝 ${cleanName}\n\n👑 Owner: ONLY SIYAM`,
            attachment: fs.createReadStream(imgPath)
          },
          threadID
        );

        fs.unlinkSync(imgPath);

        // ⏳ Small delay for Messenger stability
        await new Promise(r => setTimeout(r, 1500));

      } catch (imgErr) {
        await api.sendMessage(
          `⚠️ ${cleanName}\nImage load করা যায়নি\n\n👑 Owner: ONLY SIYAM`,
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

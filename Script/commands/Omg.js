module.exports = {
  config: {
    name: "art",
    version: "1.2",
    author: "SIYAM CHAT BOT",
    hasPermission: 0,
    commandCategory: "fun",
    cooldowns: 5,
    description: "Generate AI art from your prompt",
    usage: "[prompt]",
    dependencies: {
      "axios": "",
      "fs-extra": ""
    }
  },

  run: async function({ api, event, args }) {
    const axios = require("axios");
    const fs = require("fs-extra");
    const path = require("path");

    try {
      if (!args[0]) {
        return api.sendMessage("⚠️ Please provide a prompt to generate art.\nExample: !art sunset over mountains", event.threadID);
      }

      const prompt = args.join(" ");
      const avatarPath = path.join(__dirname, "cache", `${event.senderID}.jpg`);

      // ✅ Correct API call with 'p' query
      const response = await axios.get("https://dev.oculux.xyz/api/artv1", {
        params: { p: prompt }
      });

      // API response
      const imageUrl = response.data.url || response.data.image;

      if (!imageUrl) {
        return api.sendMessage("❌ Failed to generate image. Check API response.", event.threadID);
      }

      // Download image
      const imgResp = await axios.get(imageUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(avatarPath);
      imgResp.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      // Send image
      await api.sendMessage({
        body: `🎨 Here’s your art for: "${prompt}"`,
        attachment: fs.createReadStream(avatarPath)
      }, event.threadID);

      fs.unlinkSync(avatarPath);

    } catch (error) {
      console.error("Error in art command:", error.response ? error.response.data : error);
      api.sendMessage("❌ An error occurred while generating art. Check console for details.", event.threadID);
    }
  }
};

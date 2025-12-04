// ফাইলের নাম: fullgapcha.js  (commands ফোল্ডারে রাখো)
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "fullgapcha",
    version: "1.0",
    hasPermssion: 0,
    credits: "Siyam Pro",
    description: "ছবি পুরা হোয়াইট/গ্রে গ্যাপচা করে দিবে (যেন কিছুই বোঝা না যায়)",
    commandCategory: "fun",
    usages: "রিপ্লাই করে .fullgapcha লিখো",
    cooldowns: 3
  },

  run: async function({ api, event }) {
    if (!event.messageReply || !event.messageReply.attachments?.[0]?.url) {
      return api.sendMessage("কোনো ছবিতে রিপ্লাই করে .fullgapcha লিখো!", event.threadID);
    }

    const url = event.messageReply.attachments[0].url;
    const load = await api.sendMessage("গ্যাপচা মোড চালু হচ্ছে... (হোয়াইট ভার্সন)", event.threadID);

    try {
      const { data } = await axios.get(url, { responseType: "arraybuffer" });
      const img = await loadImage(data);

      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext("2d");

      // ১. ছবি আঁকো
      ctx.drawImage(img, 0, 0);

      // ২. সুপার হেভি ব্লার (১০০px+)
      ctx.filter = "blur(100px)";
      ctx.drawImage(img, 0, 0);

      // ৩. হোয়াইট/গ্রে ওভারলে (যেন পুরা মিলিয়ে যায়)
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";  // হালকা সাদা
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "rgba(200, 200, 200, 0.7)";   // গ্রে লেয়ার
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // ৪. আরেকটা ব্লার লেয়ার
      ctx.filter = "blur(50px)";
      ctx.globalAlpha = 0.8;
      ctx.drawImage(canvas, 0, 0);

      // সেভ করো
      const outPath = path.join(__dirname, "cache", `fullgapcha_${Date.now()}.jpg`);
      fs.ensureDirSync(path.dirname(outPath));
      fs.writeFileSync(outPath, canvas.toBuffer("image/jpeg", { quality: 80 }));

      api.unsendMessage(load.messageID);
      api.sendMessage({
        body: "ফুল গ্যাপচা সাকসেসফুল! 🔥\nএখন তোর ছবি দেখে কেউ বলবে: \"এটা কি মশা নাকি মানুষ?\"",
        attachment: fs.createReadStream(outPath)
      }, event.threadID, () => fs.unlinkSync(outPath));

    } catch (e) {
      console.log(e);
      api.unsendMessage(load.messageID);
      api.sendMessage("কিছু গড়বড়! আবার ট্রাই কর।", event.threadID);
    }
  }
};

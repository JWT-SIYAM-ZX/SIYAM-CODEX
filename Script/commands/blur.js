// ফাইলের নাম: gapcha.js  (commands ফোল্ডারে রাখো)
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "gapcha",
    version: "2.0",
    hasPermssion: 0,
    credits: "Siyam Pro",
    description: "ছবি পুরা ঝাপসা + পিক্সেল করে দিবে 😂",
    commandCategory: "fun",
    usages: "রিপ্লাই করে .gapcha লিখো",
    cooldowns: 3
  },

  run: async function({ api, event }) {
    if (!event.messageReply || !event.messageReply.attachments?.[0]?.url) {
      return api.sendMessage("❌ কোনো ছবিতে রিপ্লাই করে .gapcha লিখো!", event.threadID);
    }

    const url = event.messageReply.attachments[0].url;
    const load = await api.sendMessage("🔥 গ্যাপচা মোড অন... 😂", event.threadID);

    try {
      const { data } = await axios.get(url, { responseType: "arraybuffer" });
      const img = await loadImage(data);

      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext("2d");

      // ১. প্রথমে ছোট করে পিক্সেল বানাই (মূল ট্রিক)
      const smallCanvas = createCanvas(20, 20); // খুব ছোট!
      const smallCtx = smallCanvas.getContext("2d");
      smallCtx.drawImage(img, 0, 0, 20, 20);

      // ২. এখন আবার বড় করে টানি → পুরা পিক্সেল + ঝাপসা
      ctx.imageSmoothingEnabled = false;     // এটা না থাকলে গ্যাপচা হয় না
      ctx.drawImage(smallCanvas, 0, 0, img.width, img.height);

      // ৩. অতিরিক্ত ব্লার (যদি আরো ঝাপসা চাও)
      ctx.filter = "blur(15px)";
      ctx.drawImage(canvas, 0, 0);

      // সেভ করো
      const outPath = path.join(__dirname, "cache", `gapcha_${Date.now()}.jpg`);
      fs.ensureDirSync(path.dirname(outPath));
      fs.writeFileSync(outPath, canvas.toBuffer("image/jpeg", { quality: 70 }));

      api.unsendMessage(load.messageID);
      api.sendMessage({
        body: "গ্যাপচা সাকসেসফুল! 😂🔥\nএখন কেউ চিনবি না তোকে!",
        attachment: fs.createReadStream(outPath)
      }, event.threadID, () => fs.unlinkSync(outPath));

    } catch (e) {
      console.log(e);
      api.unsendMessage(load.messageID);
      api.sendMessage("❌ কিছু গড়বড়! আবার ট্রাই কর।", event.threadID);
    }
  }
};

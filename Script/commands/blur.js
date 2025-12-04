// ফাইলের নাম: fullblur.js  (commands ফোল্ডারে রাখো)
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "fullblur",
    version: "1.0",
    hasPermssion: 0,
    credits: "Siyam Pro",
    description: "একদম পুরা ঝাপসা করে দিবে - কিছুই বোঝা যাবে না",
    commandCategory: "fun",
    usages: "রিপ্লাই করে .fullblur লিখো",
    cooldowns: 3
  },

  run: async function({ api, event }) {
    if (!event.messageReply || !event.messageReply.attachments?.[0]?.url) {
      return api.sendMessage("কোনো ছবিতে রিপ্লাই করে .fullblur লিখো!", event.threadID);
    }

    const url = event.messageReply.attachments[0].url;
    const load = await api.sendMessage("ফুল ব্লার লাগাচ্ছি... কিচ্ছু দেখবি না এবার", event.threadID);

    try {
      const { data } = await axios.get(url, { responseType: "arraybuffer" });
      const img = await loadImage(data);

      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext("2d");

      // আসল ছবি আঁকো
      ctx.drawImage(img, 0, 0);

      // এই লাইনটা ম্যাজিক → ১৫ বার ব্লার লাগানো (যত বেশি, তত ঝাপসা)
      for (let i = 0; i < 15; i++) {
        ctx.filter = "blur(30px)";
        ctx.drawImage(canvas, 0, 0);
      }

      // সেভ করো
      const outPath = path.join(__dirname, "cache", `fullblur_${Date.now()}.jpg`);
      fs.ensureDirSync(path.dirname(outPath));
      fs.writeFileSync(outPath, canvas.toBuffer("image/jpeg", { quality: 60 }));

      api.unsendMessage(load.messageID);
      api.sendMessage({
        body: "ফুল ব্লার সাকসেসফুল!\nএখন তোর ছবি দেখে কেউ বলবে: \"এটা কি ধোঁয়া নাকি মানুষ?\"",
        attachment: fs.createReadStream(outPath)
      }, event.threadID, () => fs.unlinkSync(outPath));

    } catch (e) {
      console.log(e);
      api.unsendMessage(load.messageID);
      api.sendMessage("কিছু গড়বড়! আবার ট্রাই কর।", event.threadID);
    }
  }
};

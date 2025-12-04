// ফাইলের নাম: blur.js  (একদম সিম্পল + গ্যারান্টি কাজ করবে)
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "blur",           // শুধু .blur কমান্ড
    version: "1.0",
    hasPermssion: 0,
    credits: "Siyam",
    description: "ছবিতে সুন্দর ব্লার ইফেক্ট",
    commandCategory: "image",
    usages: "রিপ্লাই দিয়ে .blur লিখো",
    cooldowns: 5
  },

  run: async function({ api, event }) {
    if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
      return api.sendMessage("❌ কোনো ছবিতে রিপ্লাই করে .blur লিখো!", event.threadID);
    }

    const att = event.messageReply.attachments[0];
    if (att.type !== "photo") return api.sendMessage("❌ শুধু ছবিতেই কাজ করে!", event.threadID);

    const loading = await api.sendMessage("🔮 ব্লার করতেছি... ৫-১০ সেকেন্ড", event.threadID);

    try {
      const { data } = await axios.get(att.url, { responseType: "arraybuffer" });
      const img = await loadImage(data);

      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, img.width, img.height);

      // সুন্দর ব্লার
      ctx.filter = "blur(18px)";
      ctx.drawImage(img, 0, 0);

      // ড্রিমি লুক (অপশনাল)
      ctx.globalAlpha = 0.65;
      ctx.filter = "none";
      ctx.drawImage(img, 0, 0);

      const outPath = path.join(__dirname, "cache", `blur_${Date.now()}.jpg`);
      fs.ensureDirSync(path.dirname(outPath));
      fs.writeFileSync(outPath, canvas.toBuffer("image/jpeg"));

      api.unsendMessage(loading.messageID);
      api.sendMessage({
        body: "✨ ব্লার + ড্রিমি ইফেক্ট দেওয়া হয়ে গেছে! 🔥",
        attachment: fs.createReadStream(outPath)
      }, event.threadID, () => fs.unlinkSync(outPath));

    } catch (e) {
      console.log(e);
      api.unsendMessage(loading.messageID);
      api.sendMessage("❌ কিছু গড়বড় হয়েছে! আবার ট্রাই করো।", event.threadID);
    }
  }
};

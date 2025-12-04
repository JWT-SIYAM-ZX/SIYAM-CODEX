// ফাইলের নাম: blur.js  (commands ফোল্ডারে রাখো)
const { loadImage, createCanvas } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "blur",
    version: "2.0",
    hasPermssion: 0,
    credits: "Siyam Pro",
    description: "রিপ্লাই করে ছবিতে সুন্দর ব্লার ইফেক্ট দিবে",
    usages: "কোনো ছবিতে রিপ্লাই দিয়ে .blur লিখো",
    commandCategory: "IMAGE EDIT",
    cooldowns: 3
  },

  run: async function({ api, event }) {
    // চেক করো রিপ্লাই আছে কি না
    if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
      return api.sendMessage("❌ কোনো ছবিতে রিপ্লাই করে .blur লিখো!", event.threadID);
    }

    const attachment = event.messageReply.attachments[0];
    if (attachment.type !== "photo") {
      return api.sendMessage("❌ শুধু ছবিতেই কাজ করে!", event.threadID);
    }

    const waitMsg = await api.sendMessage("🌀 ব্লার করতেছি... ৫-১০ সেকেন্ড লাগবে!", event.threadID);

    try {
      // ছবি ডাউনলোড
      const response = await axios.get(attachment.url, { responseType: "arraybuffer" });
      const image = await loadImage(response.data);

      // Canvas তৈরি
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext("2d");

      // আসল ছবি আঁকো
      ctx.drawImage(image, 0, 0);

      // ব্লার ইফেক্ট (১৫px খুব সুন্দর লাগে)
      ctx.filter = "blur(15px)";
      ctx.drawImage(image, 0, 0);

      // একটু ড্রিমি লুকের জন্য (অপশনাল)
      ctx.globalAlpha = 0.7;
      ctx.filter = "none";
      ctx.drawImage(image, 0, 0);

      // JPEG হিসেবে সেভ করো
      const outputPath = path.join(__dirname, "cache", `blur_${event.senderID}_${Date.now()}.jpg`);
      await fs.ensureDir(path.dirname(outputPath));
      fs.writeFileSync(outputPath, canvas.toBuffer("image/jpeg", { quality: 95 }));

      // পাঠাও
      api.unsendMessage(waitMsg.messageID);
      api.sendMessage({
        body: "✨ ব্লার ইফেক্ট দেওয়া হয়ে গেছে! 🔥",
        attachment: fs.createReadStream(outputPath)
      }, event.threadID, () => fs.unlinkSync(outputPath));

    } catch (e) {
      console.log(e);
      api.unsendMessage(waitMsg.messageID);
      api.sendMessage("❌ কিছু একটা গড়বড় হয়েছে! আবার ট্রাই করো।", event.threadID);
    }
  }
};

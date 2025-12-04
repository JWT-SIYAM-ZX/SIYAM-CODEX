// ফাইলের নাম: blur.js  (commands ফোল্ডারে রাখো)
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "blur",
    version: "1.0",
    hasPermssion: 0,
    credits: "Siyam Pro",
    description: "রিপ্লাই করে ছবিতে ব্লার ইফেক্ট দিবে",
    usages: "কোনো ছবিতে রিপ্লাই দিয়ে .blur লিখো",
    commandCategory: "IMAGE EDIT",
    cooldowns: 3
  },

  run: async function ({ api, event }) {
    if (event.type !== "message_reply" || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
      return api.sendMessage("❌ কোনো ছবিতে রিপ্লাই করে .blur লিখো!", event.threadID);
    }

    const attachment = event.messageReply.attachments[0];
    if (!attachment || attachment.type !== "photo") {
      return api.sendMessage("❌ শুধু ছবিতেই কাজ করে!", event.threadID);
    }

    let msg = await api.sendMessage("🌀 ব্লার করতেছি... একটু অপেক্ষা করো!", event.threadID);

    try {
      const imageUrl = attachment.url;
      const imgBuffer = (await axios.get(imageUrl, { responseType: "arraybuffer" })).data;

      // Canvas দিয়ে ব্লার ইফেক্ট
      const image = await loadImage(imgBuffer);
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(image, 0, 0);

      // ব্লার ইফেক্ট (তুমি চাইলে blurRadius বাড়াতে/কমাতে পারো)
      ctx.filter = "blur(15px)";   // ← এখানে 10px, 20px, 30px করে দেখো
      ctx.drawImage(image, 0, 0);

      // একটু গ্লো/ড্রিমি লুকের জন্য (অপশনাল)
      ctx.globalAlpha = 0.7;
      ctx.drawImage(image, 0, 0);

      const outputBuffer = canvas.toBuffer("image/jpeg", { quality: 95 });

      api.unsendMessage(msg.messageID);
      api.sendMessage({
        body: "✨ ব্লার ইফেক্ট দেওয়া হয়ে গেছে! 🔥",
        attachment: fs.createReadStream().on("end", async () => {
          if (fs.existsSync(__dirname + "/cache/blur_output.jpg")) {
            fs.unlinkSync(__dirname + "/cache/blur_output.jpg");
          }
        })
      }, event.threadID, () => {}, event.messageID);

      // ফাইল সেভ করে পাঠানো
      const filePath = path.join(__dirname, "cache", "blur_output.jpg");
      fs.ensureDirSync(path.join(__dirname, "cache"));
      fs.writeFileSync(filePath, outputBuffer);
      api.sendMessage({ attachment: fs.createReadStream(filePath) }, event.threadID, () => fs.unlinkSync(filePath));

    } catch (e) {
      console.log(e);
      api.unsendMessage(msg.messageID);
      api.sendMessage("❌ ব্লার করতে সমস্যা হয়েছে! আবার ট্রাই করো।", event.threadID);
    }
  }
};

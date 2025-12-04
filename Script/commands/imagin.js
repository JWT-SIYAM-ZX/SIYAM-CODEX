const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

const API_ENDPOINT = "https://metakexbyneokex.fly.dev/images/generate";

async function downloadImage(url, folder, filename) {
  const filePath = path.join(folder, filename);
  const res = await axios.get(url, { responseType: "arraybuffer", timeout: 60000 });
  await fs.writeFile(filePath, res.data);
  return filePath;
}

async function createGridImage(imagePaths, outputPath) {
  const images = await Promise.all(imagePaths.map(p => loadImage(p)));
  const w = images[0].width;
  const h = images[0].height;
  const pad = 12;

  const canvas = createCanvas(w*2 + pad*3, h*2 + pad*3);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const positions = [
    [pad, pad],
    [w + pad*2, pad],
    [pad, h + pad*2],
    [w + pad*2, h + pad*2]
  ];

  images.forEach((img, i) => {
    ctx.drawImage(img, positions[i][0], positions[i][1], w, h);

    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.beginPath();
    ctx.arc(positions[i][0] + 30, positions[i][1] + 30, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 22px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(i+1), positions[i][0] + 30, positions[i][1] + 30);
  });

  await fs.writeFile(outputPath, canvas.toBuffer("image/png"));
}

module.exports = {
  config: {
    name: "meta",
    version: "FINAL",
    author: "SIYAM BOT",
    role: 0,
    countDown: 15,
    category: "ai-image",
    guide: {
      en: ".meta <describe your image>\nExample: .meta cyberpunk city"
    }
  },

  onStart: async function ({ message, event, args, commandName }) {

    const prompt = args.join(" ");
    if (!prompt) {
      return message.reply("❌ Prompt দাও!\nExample: .meta a tiger with fire eyes");
    }

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) await fs.mkdirp(cacheDir);

    message.reaction("⏳", event.messageID);

    let temp = [];
    let gridPath = "";

    try {
      const res = await axios.post(API_ENDPOINT, { prompt });

      if (!res.data.success || !res.data.images) {
        throw new Error("API failed");
      }

      const urls = res.data.images.slice(0, 4).map(i => i.url);

      for (let i = 0; i < urls.length; i++) {
        const p = await downloadImage(urls[i], cacheDir, `meta_${Date.now()}_${i}.png`);
        temp.push(p);
      }

      gridPath = path.join(cacheDir, `meta_grid_${Date.now()}.png`);
      await createGridImage(temp, gridPath);

      message.reply({
        body: "🖼 4 টি ছবি তৈরি হয়েছে\n👉 Reply করো: 1 / 2 / 3 / 4",
        attachment: fs.createReadStream(gridPath)
      }, (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            author: event.senderID,
            imageUrls: urls,
            tempPaths: temp,
            gridPath
          });
        }
      });

      message.reaction("✅", event.messageID);

    } catch (e) {
      console.error(e);
      message.reaction("❌", event.messageID);
      message.reply("❌ Image তৈরি হয়নি (API Error)");
    }
  },

  onReply: async function ({ message, event, Reply }) {

    if (event.senderID !== Reply.author) return;

    const choice = parseInt(event.body);
    if (![1, 2, 3, 4].includes(choice)) return;

    const cacheDir = path.join(__dirname, "cache");
    const file = path.join(cacheDir, `selected_${Date.now()}.png`);

    try {
      await downloadImage(Reply.imageUrls[choice - 1], cacheDir, path.basename(file));

      message.reply({
        body: "✅ এইটা তোমার ছবি",
        attachment: fs.createReadStream(file)
      });

    } catch {
      message.reply("❌ ছবি আনা যায়নি");
    }

    if (fs.existsSync(file)) fs.unlinkSync(file);
    Reply.tempPaths.forEach(p => fs.existsSync(p) && fs.unlinkSync(p));
    if (fs.existsSync(Reply.gridPath)) fs.unlinkSync(Reply.gridPath);

    global.GoatBot.onReply.delete(Reply.messageID);
  }
};

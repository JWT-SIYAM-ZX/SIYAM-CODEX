const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const API_ENDPOINT = "https://dev.oculux.xyz/api/artv1";

module.exports = {
  config: {
    name: "art",
    aliases: ["artv1","draw"],
    version: "2.0",
    author: "NeoKEX",
    countDown: 15,
    role: 0,
    description: "Generate AI images (grid + reply select)",
    category: "ai-image",
    usages: ".art <prompt>"
  },

  onStart: async function({ message, args, event, api }) {
    const prompt = args.join(" ");
    if (!prompt) return message.reply("❌ Please provide a prompt.\nExample: .art a cat in space");

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    let tempPaths = [];
    let urls = [];

    const wait = await api.sendMessage("⏳ Generating 4 images...", event.threadID);

    try {
      // Generate 4 images
      for (let i = 0; i < 4; i++) {
        const res = await axios.get(`${API_ENDPOINT}?p=${encodeURIComponent(prompt.trim())}`, { responseType: "arraybuffer", timeout: 60000 });
        const filePath = path.join(cacheDir, `artv1_${Date.now()}_${i}.png`);
        fs.writeFileSync(filePath, res.data);
        tempPaths.push(filePath);
        urls.push(`file://${filePath}`);
      }

      // Create 2x2 grid
      const gridPath = path.join(cacheDir, `grid_${Date.now()}.png`);
      await createGrid(tempPaths, gridPath);

      // Send grid and track reply
      await api.sendMessage({
        body: "🖼 Reply with 1-4 to select your preferred image",
        attachment: fs.createReadStream(gridPath)
      }, event.threadID, (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, {
            author: event.senderID,
            urls: urls,
            tempPaths: tempPaths,
            gridPath: gridPath,
            commandName: "art"
          });
        } else {
          // Cleanup if send failed
          tempPaths.forEach(p => fs.existsSync(p) ? fs.unlinkSync(p) : null);
          if (fs.existsSync(gridPath)) fs.unlinkSync(gridPath);
        }
      });

      await api.unsendMessage(wait.messageID);

    } catch (err) {
      tempPaths.forEach(p => fs.existsSync(p) ? fs.unlinkSync(p) : null);
      message.reply("❌ ArtV1 generation failed.");
      console.error(err);
    }
  },

  onReply: async function({ event, api, Reply }) {
    const { urls, tempPaths, gridPath, author } = Reply;
    if (event.senderID !== author) return; // Only allow original user

    const selection = parseInt(event.body.trim());
    if (![1,2,3,4].includes(selection)) return;

    const selectedURL = urls[selection - 1];
    if (!selectedURL) return api.sendMessage("❌ Image not found", event.threadID);

    const filePath = path.join(__dirname, "cache", `art_selected_${Date.now()}.png`);
    try {
      const buffer = (await axios.get(selectedURL, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(filePath, buffer);

      await api.sendMessage({
        body: "✅ Here is your selected image:",
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => fs.unlinkSync(filePath));

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Failed to send selected image", event.threadID);
    } finally {
      // Cleanup
      tempPaths.forEach(p => fs.existsSync(p) ? fs.unlinkSync(p) : null);
      if (gridPath && fs.existsSync(gridPath)) fs.unlinkSync(gridPath);
      global.GoatBot.onReply.delete(Reply.messageID);
    }
  }
};

// ===== GRID CREATION =====
async function createGrid(imagePaths, outputPath) {
  const images = await Promise.all(imagePaths.map(p => loadImage(p)));

  const imgWidth = images[0].width;
  const imgHeight = images[0].height;
  const padding = 10;
  const canvasWidth = imgWidth * 2 + padding * 3;
  const canvasHeight = imgHeight * 2 + padding * 3;

  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#111";
  ctx.fillRect(0,0,canvasWidth,canvasHeight);

  const positions = [
    { x: padding, y: padding },
    { x: imgWidth + padding*2, y: padding },
    { x: padding, y: imgHeight + padding*2 },
    { x: imgWidth + padding*2, y: imgHeight + padding*2 }
  ];

  images.forEach((img, i) => {
    const pos = positions[i];
    ctx.drawImage(img, pos.x, pos.y, imgWidth, imgHeight);

    // Add number bubble
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.beginPath();
    ctx.arc(pos.x + 35, pos.y + 35, 25, 0, Math.PI*2);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 26px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(i+1, pos.x + 35, pos.y + 35);
  });

  fs.writeFileSync(outputPath, canvas.toBuffer());
}

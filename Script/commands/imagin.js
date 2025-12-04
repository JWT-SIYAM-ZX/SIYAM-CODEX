const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

module.exports.config = {
    name: "aiart",
    aliases: ["flux", "img", "photo"],
    version: "2.0",
    author: "তোমার নাম / Modified by Grok",
    countDown: 20,
    role: 0,
    longDescription: "Generate 4 images using FLUX.1 (2025 Working). Reply 1-4 to get full image.",
    category: "ai-image",
    guide: { en: "{pn} <prompt>\nExample: {pn} a beautiful girl in cyberpunk city" }
};

const API_URL = "https://api.puter.com/v2/ai/txt2img"; // 2025-এর সবচেয়ে স্টেবল ফ্রি API (আনলিমিটেড)

async function downloadImage(url, filepath) {
    const writer = fs.createWriteStream(filepath);
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
        timeout: 60000
    });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

async function createGrid(imagePaths, outputPath) {
    const images = await Promise.all(imagePaths.map(p => loadImage(p)));
    const size = images[0].width;
    const canvas = createCanvas(size * 2 + 30, size * 2 + 30);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const positions = [
        { x: 10, y: 10 },
        { x: size + 20, y: 10 },
        { x: 10, y: size + 20 },
        { x: size + 20, y: size + 20 }
    ];

    for (let i = 0; i < 4; i++) {
        const { x, y } = positions[i];
        ctx.drawImage(images[i], x, y, size, size);

        // নম্বর সার্কেল
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.beginPath();
        ctx.arc(x + 50, y + 50, 35, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#00ffcc';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((i + 1).toString(), x + 50, y + 50);
    }

    await fs.writeFile(outputPath, canvas.toBuffer('image/png'));
}

module.exports.onStart = async function({ message, args, event }) {
    const prompt = args.join(" ").trim();
    if (!prompt) return message.reply("অসাধারণ ছবি বানাতে একটা প্রম্পট দাও 😘\n\nExample: aiart a cute anime girl with blue hair");

    message.reaction("⏳", event.messageID);

    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);

    try {
        const res = await axios.post(API_URL, {
            prompt: prompt,
            model: "black-forest-labs/FLUX.1-schnell",
            width: 1024,
            height: 1024,
            num_outputs: 4
        });

        const imageUrls = res.data.images.map(img => img.url);
        if (!imageUrls || imageUrls.length < 4) throw new Error("API থেকে কম ইমেজ এসেছে!");

        const tempPaths = [];
        for (let i = 0; i < 4; i++) {
            const imgPath = path.join(cacheDir, `flux_${Date.now()}_${i + 1}.png`);
            await downloadImage(imageUrls[i], imgPath);
            tempPaths.push(imgPath);
        }

        const gridPath = path.join(cacheDir, `grid_${Date.now()}.png`);
        await createGrid(tempPaths, gridPath);

        message.reply({
            body: `✨ FLUX.1 দিয়ে ৪টা ছবি তৈরি হয়েছে!\n\nরিপ্লাই করো: ১ / ২ / ৩ / ৪\nতোমার পছন্দের ছবিটা পাঠিয়ে দেবো`,
            attachment: fs.createReadStream(gridPath)
        }, (err, info) => {
            if (!err) {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: "aiart",
                    messageID: info.messageID,
                    author: event.senderID,
                    imageUrls: imageUrls,
                    tempPaths: tempPaths,
                    gridPath: gridPath
                });
            }
        });

        message.reaction("✅", event.messageID);

    } catch (e) {
        message.reaction("❌", event.messageID);
        message.reply(`❌ Error: ${e.message || "ইমেজ জেনারেট করতে সমস্যা হয়েছে, আবার চেষ্টা করো।"}`);
        console.error(e);
    }
};

module.exports.onReply = async function({ message, event, Reply }) {
    const { author, imageUrls, tempPaths, gridPath } = Reply;
    if (event.senderID !== author) return;

    const choice = parseInt(event.body.trim());
    if (isNaN(choice) || choice < 1 || choice > 4) {
        return message.reply("শুধু ১, ২, ৩ বা ৪ লিখো 😅");
    }

    message.reaction("⏳", event.messageID);

    try {
        const selectedUrl = imageUrls[choice - 1];
        const savePath = path.join(__dirname, "cache", `selected_${Date.now()}.png`);
        await downloadImage(selectedUrl, savePath);

        await message.reply({
            body: "✨ তোমার পছন্দের ছবি এটাই ❤️",
            attachment: fs.createReadStream(savePath)
        });

        message.reaction("✅", event.messageID);

        // ক্লিনআপ
        [savePath, gridPath, ...tempPaths].forEach(p => {
            if (fs.existsSync(p)) fs.unlinkSync(p);
        });
        global.GoatBot.onReply.delete(Reply.messageID);

    } catch (e) {
        message.reaction("❌", event.messageID);
        message.reply("ছবি পাঠাতে সমস্যা হয়েছে 😭");
    }
};
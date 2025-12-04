const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "meta",
    version: "FINAL",
    hasPermssion: 0,
    credits: "SIYAM CHAT BOT",
    description: "AI image generator (like 4k system)",
    commandCategory: "AI Image",
    usages: ".meta <prompt>",
    cooldowns: 8
  },

  // reply system (if user writes meta as reply)
  handleEvent: async ({ api, event }) => {
    const { body, threadID, messageID } = event;

    if (body?.toLowerCase().startsWith("meta ")) {
      const prompt = body.slice(5).trim();
      if (!prompt) return api.sendMessage("❌ meta এর পরে prompt দাও", threadID, messageID);
      await generate(api, threadID, messageID, prompt);
    }
  },

  // direct command system: .meta prompt
  run: async ({ api, event, args }) => {
    const prompt = args.join(" ");
    if (!prompt) return api.sendMessage("❌ Example:\n.meta a cyberpunk boy", event.threadID, event.messageID);
    await generate(api, event.threadID, event.messageID, prompt);
  }
};

async function generate(api, threadID, messageID, prompt) {
  let wait;
  try {
    wait = await api.sendMessage("⏳ AI Image তৈরি হচ্ছে...", threadID);

    const res = await axios.post(
      "https://metakexbyneokex.fly.dev/images/generate",
      { prompt },
      { timeout: 120000 }
    );

    if (!res.data || !res.data.images || !res.data.images.length) {
      throw new Error("No image");
    }

    let reply = "🖼️ AI Generated Images\n\n";
    res.data.images.slice(0, 4).forEach((img, i) => reply += `${i + 1}. ${img.url}\n`);

    api.sendMessage(reply, threadID, messageID);
    api.unsendMessage(wait.messageID);

  } catch (e) {
    console.error(e);
    api.sendMessage("❌ Image Generate Fail (API Down)", threadID, messageID);
  }
}

/**
 * topup.js
 * FUN / DEMO ONLY — NOT REAL TOPUP
 */

module.exports.config = {
  name: "topup",
  version: "2.3.0",
  hasPermssion: 0,
  credits: "SIYAM",
  description: "Free Fire Top Up",
  commandCategory: "utility",
  usages: "/topup",
  cooldowns: 3
};

const fs = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");
const axios = require("axios");

// ✅ Free Fire Diamond List
const DIAMOND_LIST = [
  100, 115, 200, 240, 310,
  355, 400, 450, 520,
  610, 720, 810,
  910, 1060, 1180,
  1380, 1560, 1780,
  2000, 2180, 2500,
  3000, 3560, 4000,
  5000, 7000, 10000,
  Weekly membership,
  Mountly membership
];

module.exports.run = async function({ api, event }) {
  const { threadID, messageID, senderID } = event;

  const intro =
`💎 FREE FIRE TOP UP

👉 Send Free Fire UID
or type "cancel" to stop`;

  return api.sendMessage(intro, threadID, (err, info) => {
    global.client.handleReply.push({
      type: "TOPUP_GET_UID",
      name: this.config.name,
      author: senderID,
      messageID: info.messageID
    });
  }, messageID);
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { threadID, messageID, body, senderID } = event;
  const text = (body || "").trim();

  // Cancel
  if (text.toLowerCase() === "cancel") {
    return api.sendMessage("✅ Cancelled.", threadID, messageID);
  }

  // ===== STEP 1: GET UID =====
  if (handleReply.type === "TOPUP_GET_UID") {
    const uid = text;

    if (!/^\d{5,20}$/.test(uid)) {
      return api.sendMessage("❌ Invalid UID. Please send correct UID or 'cancel'.", threadID, messageID);
    }

    // ✅ FINDING PLAYER ANIMATION
    const loading = await api.sendMessage("🔍 Finding player.", threadID);

    const animate =
      "📡 Connecting to server...",
      "✅ Player data found!"
    ];
    for (let i = 0; i < animate.length; i++) {
      await delay(700);
      await api.editMessage(animate[i], loading.messageID);
    }

    // Fetch player name from API
    let playerName = "Unknown";
    try {
      const res = await axios.get(`https://danger-info-alpha.vercel.app/accinfo?uid=${uid}&key=DANGERxINFO`);
      const data = res.data;
      if (data && data.basicInfo && data.basicInfo.nickname) {
        playerName = data.basicInfo.nickname;
      }
    } catch (e) {
      console.log("API error:", e.message);
    }

    const askAmount =
`🎮 PLAYER FOUND

👤 Name: ${playerName}
🆔 UID: ${uid}

💎 Select Diamond Pack:

${DIAMOND_LIST.join(" , ")}

✍ Type any one amount from the list
or type "cancel"`;

    return api.sendMessage(askAmount, threadID, (err, info) => {
      global.client.handleReply.push({
        type: "TOPUP_GET_AMOUNT",
        name: this.config.name,
        author: senderID,
        uid,
        playerName,
        messageID: info.messageID
      });
    }, messageID);
  }

  // ===== STEP 2: GET AMOUNT =====
  if (handleReply.type === "TOPUP_GET_AMOUNT") {
    const amount = parseInt(text.replace(/\D/g, ""), 10);
    const uid = handleReply.uid;
    const playerName = handleReply.playerName || "Unknown";

    // ✅ Check if amount is in official list
    if (!DIAMOND_LIST.includes(amount)) {
      return api.sendMessage(
        `❌ Invalid Pack Selected!

✅ Available Packs:
${DIAMOND_LIST.join(" , ")}

Please select one from the list.`,
        threadID,
        messageID
      );
    }

    const progressMessage = await api.sendMessage("🔄 Initializing top up...", threadID);

    // ✅ PROGRESS BAR ANIMATION
    for (let i = 10; i <= 100; i += 10) {
      const bar = "■".repeat(i / 10) + "□".repeat(10 - i / 10);
      await delay(600);
      await api.editMessage(`[${bar}] ${i}%`, progressMessage.messageID);
    }

    await api.editMessage("✅ Processing completed!", progressMessage.messageID);

    const now = moment().tz("Asia/Dhaka").format("YYYY-MM-DD HH:mm:ss");

    // ✅ Garena-style Transaction ID
    const trxId =
      "GRN" +
      Math.random().toString(36).substr(2, 4).toUpperCase() +
      "-" +
      Math.random().toString(36).substr(2, 4).toUpperCase() +
      "-" +
      Date.now().toString().slice(-4);

    const receipt =
`🎫 TOP UP RECEIPT

👤 Player : ${playerName}
🆔 UID     : ${uid}
💎 Pack    : ${amount} Diamonds
🕒 Time    : ${now}
🧾 Trx ID  : ${trxId}
✅ Status  : SUCCESS

CREADIT: ONLY SIYAM.`;

    // Save log
    try {
      const cacheDir = path.resolve(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const logFile = path.join(cacheDir, "topup_sim_log.json");

      let logs = [];
      if (await fs.pathExists(logFile)) {
        logs = await fs.readJson(logFile).catch(() => []);
      }
      logs.push({ uid, playerName, amount, time: now, trxId, simulated: true });
      await fs.writeJson(logFile, logs, { spaces: 2 });
    } catch (e) {
      console.log("Log error:", e.message);
    }

    return api.sendMessage(receipt, threadID, messageID);
  }
};

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

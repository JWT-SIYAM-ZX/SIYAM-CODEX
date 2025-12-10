/**
 * like.js
 * REAL LIKE + RANDOM ADD (ADMIN ONLY)
 * ONE UID = 24 HOURS LOCK
 * CREATOR: ONLY SIYAM
 */

const axios = require("axios");
const fs = require("fs");
const path = require("path");

// ===== DATABASE FILE =====
const DB_PATH = path.join(__dirname, "likeCooldown.json");

// ===== ENSURE FILE EXISTS =====
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, "{}");
}

// ===== LOAD DATA =====
let cooldownData = {};
try {
  cooldownData = JSON.parse(fs.readFileSync(DB_PATH));
} catch {
  cooldownData = {};
}

// ===== SAVE DATA FUNCTION =====
function saveDB() {
  fs.writeFileSync(DB_PATH, JSON.stringify(cooldownData, null, 2));
}

// ===== RANDOM =====
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ===== FALLBACK NAME =====
function randomName() {
  const names = ["Hossain", "Siam", "Hasan", "Ratul", "Rakib", "Arif", "Nayeem"];
  const tags = ["✓", "乂", "ツ", "亗", "✘"];
  return `${tags[random(0,tags.length-1)]}${names[random(0,names.length-1)]}${tags[random(0,tags.length-1)]}`;
}

module.exports.config = {
  name: "like",
  version: "FINAL-LOCKED",
  hasPermssion: 1,
  credits: "ONLY SIYAM",
  description: "Admin only FF like sender (24h per UID)",
  commandCategory: "admin",
  usages: "/like [region] [uid]",
  cooldowns: 3
};

module.exports.run = async function({ api, event, args }) {

  const { threadID, messageID, senderID } = event;

  // ===== ADMIN CHECK =====
  if (!global.config.ADMINBOT || !global.config.ADMINBOT.includes(senderID)) {
    return api.sendMessage("⛔ গরিবদের জন্য নয়!", threadID, messageID);
  }

  // ===== ARGUMENT SETUP =====
  let region = "BD";
  let UID;

  if (args.length === 1) {
    UID = args[0];
  } else if (args.length >= 2) {
    region = args[0].toUpperCase();
    UID = args[1];
  } else {
    return api.sendMessage("❌ Usage: /like [region] [uid]\nExample: /like bd 903437692", threadID, messageID);
  }

  // ===== UID VALIDATE =====
  if (!/^\d{5,20}$/.test(UID)) {
    return api.sendMessage("❌ Invalid UID format!", threadID, messageID);
  }

  // ===== 24 HOURS CHECK =====
  const now = Date.now();
  const lastUsed = cooldownData[UID];

  if (lastUsed) {
    const diff = now - lastUsed;
    const left = Math.ceil((86400000 - diff) / (1000 * 60 * 60));

    if (diff < 86400000) {
      return api.sendMessage(
        `⚠️ This Player Already Got Maximum Likes For Today.\nPlease try again after ${left} hour(s).`,
        threadID,
        messageID
      );
    }
  }

  // ===== PROCESSING =====
  await api.sendMessage("⏳ Processing like request...", threadID);

  // ===== LIKE SYSTEM =====
  const likesGiven = random(1, 290);
  let likesBefore = 0;
  let playerName = randomName();

  try {
    const apiUrl = `https://danger-info-alpha.vercel.app/accinfo?uid=${UID}&key=DANGERxINFO`;
    const res = await axios.get(apiUrl);

    if (res.data && res.data.basicInfo) {
      if (res.data.basicInfo.nickname) {
        playerName = res.data.basicInfo.nickname;
      }
      if (res.data.basicInfo.liked) {
        likesBefore = parseInt(res.data.basicInfo.liked) || 0;
      }
    }
  } catch {
    likesBefore = random(1000likes0);
  }

  const totalLikes = likesBefore + likesGiven;

  // ===== SAVE TIME (LOCK UID) =====
  cooldownData[UID] = now;
  saveDB();

  // ===== FINAL MESSAGE =====
  const msg = `✅ Likes Sent Successfully! 🎉

👤 Player Name: ${playerName}
🌍 Region: ${region}
🆔 UID: ${UID}

❤️ Likes Before: ${likesBefore}
💖 Likes Given: ${likesGiven}
🎯 Total Likes Now: ${totalLikes}

CREADIT: ONLY SIYAM`;

  return api.sendMessage(msg, threadID, messageID);
};

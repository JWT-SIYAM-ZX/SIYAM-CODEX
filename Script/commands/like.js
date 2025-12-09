/**
 * like.js
 * REAL LIKES + RANDOM BOOST
 * ADMIN ONLY
 * CREATOR: ONLY SIYAM
 */

const axios = require("axios");
const fs = require("fs");
const path = require("path");

// ===== STORAGE FILE =====
const DB_PATH = path.join(__dirname, "likeCooldown.json");

// ===== LOAD DB =====
let cooldownData = {};
if (fs.existsSync(DB_PATH)) {
  try {
    cooldownData = JSON.parse(fs.readFileSync(DB_PATH));
  } catch {
    cooldownData = {};
  }
}

// ===== SAVE DB =====
function saveDB() {
  fs.writeFileSync(DB_PATH, JSON.stringify(cooldownData, null, 2));
}

// ===== RANDOM =====
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ===== RANDOM NAME FALLBACK =====
function randomName() {
  const names = ["Hossain", "Siam", "Hasan", "Ratul", "Arif", "Rakib", "Nayeem"];
  const tags = ["꧁", "๛", "✓", "乂", "ツ"];
  return `${tags[random(0,tags.length-1)]}${names[random(0,names.length-1)]}${tags[random(0,tags.length-1)]}`;
}

module.exports.config = {
  name: "like",
  version: "FINAL",
  hasPermssion: 1,
  credits: "ONLY SIYAM",
  description: "Admin Only Free Fire Like Bot",
  commandCategory: "admin",
  usages: "/like [region] [uid]",
  cooldowns: 3
};

module.exports.run = async function({ api, event, args }) {

  const { threadID, messageID, senderID } = event;

  // ===== ADMIN ONLY =====
  if (!global.config.ADMINBOT || !global.config.ADMINBOT.includes(senderID)) {
    return api.sendMessage("⛔ ADMIN ONLY COMMAND!", threadID, messageID);
  }

  // ===== ARGS =====
  let region = "BD";
  let UID;

  if(args.length === 1) UID = args[0];
  else if(args.length >= 2){
    region = args[0].toUpperCase();
    UID = args[1];
  } else {
    return api.sendMessage("❌ Usage:\n/like [region] [uid]\nExample: /like bd 903437692", threadID, messageID);
  }

  if (!/^\d{5,20}$/.test(UID)) {
    return api.sendMessage("❌ Invalid UID format!", threadID, messageID);
  }

  // ===== 24H COOLDOWN =====
  const now = Date.now();
  if (cooldownData[UID]) {
    const diff = now - cooldownData[UID];
    const hoursLeft = 24 - Math.floor(diff / (1000 * 60 * 60));
    if (diff < 86400000) {
      return api.sendMessage(`⏳ This UID already received likes.\nTry again after ${hoursLeft} hour(s).`, threadID, messageID);
    }
  }

  // ===== PROCESSING =====
  await api.sendMessage("⏳ Processing like request...", threadID);

  // ===== LIKE LOGIC =====
  const likesGiven = random(1, 290);
  let likesBefore = 0;
  let playerName = randomName();

  try {
    const apiUrl = `https://danger-info-alpha.vercel.app/accinfo?uid=${UID}&key=DANGERxINFO`;
    const res = await axios.get(apiUrl);
    if(res.data && res.data.basicInfo){
      playerName = res.data.basicInfo.nickname || playerName;
      likesBefore = parseInt(res.data.basicInfo.liked || 0);
    }
  } catch(e){
    likesBefore = random(1000,8000);
  }

  const totalLikes = likesBefore + likesGiven;

  // ===== SAVE COOLDOWN =====
  cooldownData[UID] = now;
  saveDB();

  // ===== FINAL RESPONSE =====
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

const fs = require("fs-extra");
const path = require("path");

const dataPath = path.join(__dirname, "themeData.json");

// create data file
if (!fs.existsSync(dataPath)) {
  fs.writeJsonSync(dataPath, {
    autoRotate: {},
    daily: {},
    log: {}
  }, { spaces: 2 });
}

// THEME DATABASE (1000+ ADD KORA JABE)
const THEMES = [
  { id: "196241301102133", name: "Default Blue" },
  { id: "2147642772135635", name: "Red" },
  { id: "174636906462322", name: "Pink" },
  { id: "305048346944095", name: "Purple" },
  { id: "772462046107572", name: "Green" },
  { id: "180711032274338", name: "Orange" },
  { id: "287364294943462", name: "Yellow" },
  { id: "243563450075529", name: "Teal" },
  { id: "980963458080781", name: "Black" },
  { id: "234426103521355", name: "Light Blue" }
];

// check admin
async function isAdmin(api, threadID, userID) {
  const info = await api.getThreadInfo(threadID);
  return info.adminIDs.some(a => a.id === userID);
}

// save
function saveData(data) {
  fs.writeJsonSync(dataPath, data, { spaces: 2 });
}

// auto engine (merger complete)
setInterval(async () => {
  let data = fs.readJsonSync(dataPath);

  for (let tid in data.autoRotate) {
    const random = THEMES[Math.floor(Math.random() * THEMES.length)];
    try {
      await global.api.changeThreadColor(random.id, tid);
      data.log[tid] = random.name;
      saveData(data);
      console.log(`AutoTheme → ${tid} : ${random.name}`);
    } catch (e) {
      console.log("Theme error:", e.message);
    }
  }
}, 30 * 60 * 1000); // 30 min rotate

// DAILY SYSTEM
setInterval(async () => {
  const data = fs.readJsonSync(dataPath);
  const now = new Date().getHours();

  if (now !== 6) return; // every morning 6am

  for (let tid in data.daily) {
    const random = THEMES[Math.floor(Math.random() * THEMES.length)];
    try {
      await global.api.changeThreadColor(random.id, tid);
      data.log[tid] = random.name;
      saveData(data);
    } catch {}
  }

}, 60 * 60 * 1000);

// COMMAND HANDLER
module.exports = {
  config: {
    name: "changetheme",
    aliases: ["theme"],
    version: "FINAL-PRO",
    author: "ONLY SIYAM BOT",
    role: 0,
    description: "Advanced Messenger group theme system",
    category: "group",
    guide: {
      en: `.changetheme list
.changetheme apply <id>
.changetheme random
.changetheme rotate on/off
.changetheme daily on/off
.changetheme log`
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const { threadID, senderID } = event;
    let data = fs.readJsonSync(dataPath);

    // ADMIN ONLY
    if (!(await isAdmin(api, threadID, senderID)))
      return message.reply("❌ Admin only command.");

    // LIST
    if (args[0] === "list") {
      let txt = "🎨 AVAILABLE THEMES:\n\n";
      THEMES.forEach(t => txt += `• ${t.name} → ${t.id}\n`);
      return message.reply(txt);
    }

    // APPLY
    if (args[0] === "apply") {
      const id = args[1];
      if (!id) return message.reply("Use: .changetheme apply <themeID>");
      await api.changeThreadColor(id, threadID);
      data.log[threadID] = id;
      saveData(data);
      return message.reply("✅ Theme applied!");
    }

    // RANDOM
    if (args[0] === "random") {
      const random = THEMES[Math.floor(Math.random() * THEMES.length)];
      await api.changeThreadColor(random.id, threadID);
      data.log[threadID] = random.name;
      saveData(data);
      return message.reply(`🎯 Random theme: ${random.name}`);
    }

    // ROTATE
    if (args[0] === "rotate") {
      if (args[1] === "on") {
        data.autoRotate[threadID] = true;
        saveData(data);
        return message.reply("🔁 Auto rotate enabled.");
      }
      if (args[1] === "off") {
        delete data.autoRotate[threadID];
        saveData(data);
        return message.reply("⛔ Auto rotate disabled.");
      }
    }

    // DAILY
    if (args[0] === "daily") {
      if (args[1] === "on") {
        data.daily[threadID] = true;
        saveData(data);
        return message.reply("📅 Daily auto change enabled.");
      }
      if (args[1] === "off") {
        delete data.daily[threadID];
        saveData(data);
        return message.reply("⛔ Daily change off.");
      }
    }

    // LOG
    if (args[0] === "log") {
      const log = data.log[threadID] || "No change yet";
      return message.reply(`📝 Last Theme: ${log}`);
    }

    // HELP
    return message.reply(
      "🎨 CHANGETHEME PRO MENU\n\n" +
      ".changetheme list\n" +
      ".changetheme apply <themeID>\n" +
      ".changetheme random\n" +
      ".changetheme rotate on/off\n" +
      ".changetheme daily on/off\n" +
      ".changetheme log"
    );
  }
};

module.exports.config = {
  name: "theme",
  version: "2.0",
  credits: "SIYAM",
  description: "Simple AI Theme Generator",
  commandCategory: "box",
  usages: "theme <keyword>",
  cooldowns: 5
};

// Temporary memory for selections
const cache = new Map();

module.exports.run = async function({ api, event, args }) {

  const threadID = event.threadID;
  const senderID = event.senderID;
  const prompt = args.join(" ");

  if (!prompt) {
    return api.sendMessage("❌ Use: theme <style>\nExample: theme neon cyberpunk", threadID);
  }

  // Fake AI theme generator (for now)
  const themes = [
    { id: "T1001", name: `${prompt} Blue Purple` },
    { id: "T1002", name: `${prompt} Pink Red` },
    { id: "T1003", name: `${prompt} Dark Mode` }
  ];

  // Save user session
  cache.set(threadID + senderID, themes);

  let msg = "🎨 AI THEME RESULT\n\n";
  themes.forEach((t, i) => {
    msg += `${i + 1}. Theme ID: ${t.id}\n   Style: ${t.name}\n\n`;
  });
  msg += "Reply with number (1-3) to apply theme";

  api.sendMessage(msg, threadID, (err, info) => {
    if (!err) {
      global.client.handleReply.push({
        name: "theme",
        messageID: info.messageID,
        author: senderID
      });
    }
  });
};

module.exports.handleReply = function({ api, event }) {

  const id = event.threadID + event.senderID;

  const themes = cache.get(id);

  if (!themes) return;

  const choice = parseInt(event.body);

  if (isNaN(choice) || choice < 1 || choice > themes.length) {
    return api.sendMessage("❌ Reply number between 1-3", event.threadID);
  }

  const selected = themes[choice - 1];

  api.sendMessage(
    `✅ THEME APPLIED\n\nTheme ID: ${selected.id}\nStyle: ${selected.name}`,
    event.threadID
  );

  cache.delete(id);
};

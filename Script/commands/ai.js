const axios = require("axios");
const API_ENDPOINT = "https://metakexbyneokex.fly.dev/chat";

module.exports.config = {
  name: "ai",
  version: "2.1",
  hasPermssion: 0,
  credits: "ONLY SIYAM BOT TEAM ☢️",
  description: "Chat with Meta AI in structured format",
  commandCategory: "AI",
  usages: "[your question]",
  cooldowns: 3
};

// Escape markdown for safe display
function escape_md(text) {
  if (!text) return "None";
  return text.toString().replace(/([_*[\]()~`>#+-=|{}.!])/g, "\\$1");
}

// Command run
module.exports.run = async ({ api, event, args }) => {
  const userMsg = args.join(" ").trim();
  const { threadID, messageID, senderID } = event;

  if (!userMsg)
    return api.sendMessage(
      "❌ Please type a message.\nExample: /ai Who are you?",
      threadID,
      messageID
    );

  // Initial thinking message
  const waitMsg = await api.sendMessage(
    `🤖 AI Thinking...\n\n💬 Question: ${escape_md(userMsg)}`,
    threadID,
    messageID
  );

  try {
    const res = await axios.post(
      API_ENDPOINT,
      { message: userMsg, new_conversation: true, cookies: {} },
      { headers: { "Content-Type": "application/json" }, timeout: 20000 }
    );

    const aiReply = res.data.message || "AI replied empty message.";

    // Send AI response
    const sentMsg = await api.sendMessage(aiReply, threadID, messageID);

    // Setup onReply session for conversation
    if (!global.GoatBot.onReply) global.GoatBot.onReply = new Map();
    global.GoatBot.onReply.set(sentMsg.messageID, {
      commandName: module.exports.config.name,
      author: senderID,
      session: true
    });

    // Delete the "Thinking..." message
    api.unsendMessage(waitMsg.messageID);

  } catch (err) {
    api.sendMessage(
      `❌ AI ERROR\n➤ ${err?.response?.status ? "Server Error " + err.response.status : err.message}`,
      threadID,
      messageID
    );
  }
};

// Handle replies
module.exports.onReply = async ({ api, event, Reply }) => {
  const { senderID, threadID, messageID, body } = event;

  if (!Reply || senderID !== Reply.author) return;

  const ask = body.trim();
  global.GoatBot.onReply.delete(messageID);

  try {
    const res = await axios.post(
      API_ENDPOINT,
      { message: ask, new_conversation: false, cookies: {} },
      { headers: { "Content-Type": "application/json" }, timeout: 20000 }
    );

    const answer = res.data.message || "AI replied empty message.";

    const sentMsg = await api.sendMessage(answer, threadID, messageID);

    // Keep session for continuous conversation
    global.GoatBot.onReply.set(sentMsg.messageID, {
      commandName: "ai",
      author: senderID
    });

  } catch (err) {
    api.sendMessage(
      `❌ AI ERROR\n➤ ${err?.response?.status ? "Server Error " + err.response.status : err.message}`,
      threadID,
      messageID
    );
  }
};

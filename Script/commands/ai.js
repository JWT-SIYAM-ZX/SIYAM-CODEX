const axios = require("axios");
const API_ENDPOINT = "https://metakexbyneokex.fly.dev/chat");

module.exports.config = {
    name: "ai",
    version: "2.2",
    hasPermssion: 0,
    credits: "ONLY SIYAM BOT TEAM ☢️",
    description: "Multi-turn AI chat with proper reply",
    commandCategory: "AI",
    usages: "[your question]",
    cooldowns: 3
};

// Markdown escape
function escape_md(text) {
    if (!text) return "None";
    return text.toString().replace(/([_*[\]()~`>#+-=|{}.!])/g, "\\$1");
}

// এই map এ আমরা threadID+userID অনুযায়ী session রাখব
if (!global.GoatBot.aiSessions) global.GoatBot.aiSessions = new Map();

module.exports.run = async ({ api, event, args }) => {
    const userMsg = args.join(" ").trim();
    const { threadID, messageID, senderID } = event;

    if (!userMsg)
        return api.sendMessage("❌ মেসেজ টাইপ করো।\nউদাহরণ: /ai তুমি কে?", threadID, messageID);

    api.sendMessage(`🤖 AI ভাবছে...\n\n💬 প্রশ্ন: ${escape_md(userMsg)}`, threadID, messageID);

    try {
        const res = await axios.post(
            API_ENDPOINT,
            { message: userMsg, new_conversation: true, cookies: {} },
            { headers: { "Content-Type": "application/json" }, timeout: 20000 }
        );

        const aiReply = res.data.message || "AI কোনো উত্তর দেয়নি।";

        api.sendMessage(aiReply, threadID, (err, info) => {
            if (!err) {
                // threadID+userID দিয়ে session store করলাম
                global.GoatBot.aiSessions.set(`${threadID}_${senderID}`, true);

                // reply handle করার জন্য messageID store
                if (!global.GoatBot.onReply) global.GoatBot.onReply = new Map();
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: "ai",
                    author: senderID
                });
            }
        });
    } catch (e) {
        api.sendMessage(
            `❌ AI ERROR\n➤ ${e?.response?.status ? "Server Error " + e.response.status : e.message}`,
            threadID,
            messageID
        );
    }
};

// reply handle
module.exports.onReply = async ({ api, event, Reply }) => {
    const { senderID, threadID, messageID, body } = event;

    // শুধুমাত্র যিনি মূল মেসেজ পাঠিয়েছেন তার reply handle হবে
    if (!Reply || senderID !== Reply.author) return;

    const userMsg = body.trim();
    if (!userMsg) return;

    try {
        const res = await axios.post(
            API_ENDPOINT,
            { message: userMsg, new_conversation: false, cookies: {} },
            { headers: { "Content-Type": "application/json" }, timeout: 20000 }
        );

        const aiReply = res.data.message || "AI কোনো উত্তর দেয়নি।";

        api.sendMessage(aiReply, threadID, (err, info) => {
            if (!err) {
                // session সবসময় active রাখব
                global.GoatBot.aiSessions.set(`${threadID}_${senderID}`, true);

                // নতুন messageID store
                if (!global.GoatBot.onReply) global.GoatBot.onReply = new Map();
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: "ai",
                    author: senderID
                });
            }
        });
    } catch (e) {
        api.sendMessage(
            `❌ AI ERROR\n➤ ${e?.response?.status ? "Server Error " + e.response.status : e.message}`,
            threadID,
            messageID
        );
    }
};

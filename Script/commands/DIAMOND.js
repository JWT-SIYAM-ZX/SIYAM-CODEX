module.exports.config = {
    name: "diamond",
    version: "2.1.0",
    hasPermssion: 0,
    credits: "SIYAM BOT TEAM + ChatGPT",
    description: "Fake Diamond Sender with animation + player info + weekly + monthly",
    commandCategory: "game",
    usages: "[uid] [amount]",
    cooldowns: 5
};

const axios = require("axios");

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;

    if (!args[0] || !args[1])
        return api.sendMessage("❌ Example: .diamond 903437692 1000", threadID, messageID);

    const UID = args[0];
    const amount = args[1];

    // FIRST ANIMATION
    api.sendMessage("🔍 *SEARCHING PLAYER...*", threadID, async () => {

        setTimeout(async () => {

            try {
                const url = `https://danger-info-alpha.vercel.app/accinfo?uid=${UID}&key=DANGERxINFO`;
                const res = await axios.get(url);
                const data = res.data;

                if (!data.basicInfo)
                    return api.sendMessage("❌ PLAYER NOT FOUND!", threadID);

                const name = data.basicInfo.nickname || "Unknown";

                // SECOND MSG
                api.sendMessage(
                    `✅ *PLAYER FOUND!*\n👤 Name: ${name}\n🆔 UID: ${UID}`,
                    threadID,
                    () => setTimeout(() => {

                        // THIRD MSG
                        api.sendMessage(
                            "🔗 CONNECTING GARENA TOP-UP CENTER...\n⏳ Please wait...",
                            threadID,
                            () => setTimeout(() => {

                                // UPDATED LIST with WEEKLY & MONTHLY
                                const msg =
`💎 *DIAMOND TOP-UP PANEL*

👤 Player: ${name}
🆔 UID: ${UID}

📦 *Available Diamond Packages*
--------------------------------
1️⃣ 100 💎  
2️⃣ 310 💎 — Popular  
3️⃣ 520 💎  
4️⃣ 1080 💎  
5️⃣ 2200 💎  
6️⃣ 5600 💎 — Mega Pack

🗓 *Special Membership Packs*
--------------------------------
7️⃣ WEEKLY MEMBERSHIP — 450💎 + Daily  
8️⃣ MONTHLY MEMBERSHIP — 2500💎 + Daily

⚙ Processing Request: *${amount} Diamonds*

⏳ Sending Diamonds...
Please wait...`;

                                api.sendMessage(msg, threadID, () => {

                                    // FAKE SEND COMPLETE
                                    setTimeout(() => {
                                        const fakeID = Math.floor(Math.random() * 99999999);

                                        api.sendMessage(
`✅ *DIAMOND SENT SUCCESSFULLY!*

👤 Player: ${name}
🆔 UID: ${UID}

💎 Amount: ${amount} Diamonds  
🕒 Time: ${new Date().toLocaleTimeString()}
📄 Transaction ID: TXN${fakeID}

                                            threadID
                                        );

                                    }, 2000);

                                });

                            }, 2000)
                        );

                    }, 1500)
                );

            } catch (e) {
                return api.sendMessage("❌ PLAYER NOT FOUND!", threadID);
            }

        }, 1500);

    });
};

module.exports.config = {
    name: "get",
    version: "1.0.6",
    hasPermssion: 0,
    credits: "𝐎𝐍𝐋𝐘 𝐒𝐈𝐘𝐀𝐌 𝐁𝐎𝐓 𝑻𝑬𝑨𝑴 ☢️",
    description: "Get Free Fire user info + banner (default BD)",
    commandCategory: "game",
    usages: "/get <uid>  OR  /get <region> <uid>",
    cooldowns: 5
};

module.exports.languages = {
    "en": {
        "noArgs": "❌ Please enter UID\nExample: %prefix%get 903437692",
        "fetching": "⏳ Fetching info for UID: %1...",
        "error": "❌ Error fetching info: %1"
    }
};

function escape_md(text) {
    if (!text) return "None";
    return text.toString()
        .replace(/([_*[\]()~`>#+-=|{}.!])/g, "\\$1");
}

module.exports.run = async function ({ api, event, args, getText }) {
    const axios = require("axios");
    const fs = require("fs");
    const path = require("path");

    const { threadID, messageID } = event;

    if (!args[0])
        return api.sendMessage(
            getText("noArgs", { prefix: global.config.PREFIX }),
            threadID,
            messageID
        );

    // 🔥 Default region BD
    let region = "BD";
    let UID;

    if (args.length === 1) {
        UID = args[0];
    } else {
        region = args[0].toUpperCase();
        UID = args[1];
    }

    api.sendMessage(getText("fetching", UID), threadID, messageID);

    try {
        const infoUrl = `https://danger-info-alpha.vercel.app/accinfo?uid=${UID}&key=DANGERxINFO`;
        const res = await axios.get(infoUrl);
        const data = res.data;

        const b = data.basicInfo || {};
        const c = data.clanBasicInfo || {};
        const cap = c.clanCaptain || {};
        const pet = data.petInfo || {};
        const cr = data.creditScoreInfo || {};
        const s = data.socialInfo || {};

        let msg = `
🧑‍💻 *Basic Info*
├─ Name: ${escape_md(b.nickname)}
├─ UID: ${b.accountId || UID}
├─ Region: ${b.region || region}
├─ Level: ${b.level || "0"}
├─ Likes: ${b.liked || "0"}
├─ EXP: ${b.exp || "0"}
├─ BR Rank: ${b.brRank || "0"}
├─ CS Rank: ${b.csRank || "0"}
├─ Max BR Rank: ${b.brMaxRank || "0"}
├─ Max CS Rank: ${b.csMaxRank || "0"}
├─ Title ID: ${b.title || "N/A"}
├─ Banner ID: ${b.bannerId || "N/A"}
├─ HeadPic ID: ${b.headPic || "N/A"}
└─ Version: ${escape_md(b.releaseVersion)}

🛡️ *Guild Info*
├─ Name: ${escape_md(c.clanName || "None")}
├─ ID: ${c.clanId || "N/A"}
├─ Level: ${c.clanLevel || "0"}
├─ Members: ${c.memberNum || "0"}/${c.capacity || "0"}
└─ Captain UID: ${c.captainId || "N/A"}

👑 *Guild Captain*
├─ Name: ${escape_md(cap.nickname || "N/A")}
├─ UID: ${cap.accountId || "N/A"}
├─ Region: ${cap.region || "N/A"}
├─ Level: ${cap.level || "0"}
├─ Likes: ${cap.liked || "0"}
├─ BR Rank: ${cap.brRank || "0"}
├─ CS Rank: ${cap.csRank || "0"}
├─ BR Points: ${cap.brRankingPoints || "0"}
└─ CS Points: ${cap.csRankingPoints || "0"}

🐾 *Pet Info*
├─ Pet ID: ${pet.id || "N/A"}
├─ Level: ${pet.level || "0"}
├─ EXP: ${pet.exp || "0"}
├─ Skin ID: ${pet.skinId || "N/A"}
└─ Skill ID: ${pet.selectedSkillId || "N/A"}

💯 *Credit Score*
├─ Score: ${cr.creditScore || "0"}
├─ Summary Period: ${cr.periodicSummaryStartTime || "N/A"} → ${cr.periodicSummaryEndTime || "N/A"}
└─ Reward State: ${cr.rewardState || "N/A"}

📜 *Social*
├─ BR Rank Public: ${s.brRankShow || "False"}
├─ CS Rank Public: ${s.csRankShow || "False"}
└─ Bio: ${escape_md(s.signature || "None")}
`;

        api.sendMessage(msg, threadID, async (err, info) => {
            if (err) return;

            try {
                const bannerUrl = `https://danger-banner.vercel.app/banner?uid=${UID}`;
                const imgPath = path.join(__dirname, "cache", `banner_${UID}.jpg`);

                const img = await axios.get(bannerUrl, { responseType: "arraybuffer" });
                fs.writeFileSync(imgPath, Buffer.from(img.data));

                api.sendMessage(
                    {
                        body: `🎮 Free Fire Banner\n🆔 UID: ${UID}`,
                        attachment: fs.createReadStream(imgPath)
                    },
                    threadID,
                    () => fs.unlinkSync(imgPath),
                    info.messageID
                );

            } catch (e) {
                api.sendMessage("❌ Banner load করা যায়নি!", threadID, null, info.messageID);
            }
        }, messageID);

    } catch (err) {
        api.sendMessage(getText("error", err.message), threadID, messageID);
    }
};

const axios = require("axios");

module.exports = {
  config: {
    name: "numlookup",
    version: "2.0",
    author: "SiAM",
    countDown: 10,
    role: 0,
    category: "utility",
    shortDescription: {
      en: "Search phone number info + FB profile"
    },
    longDescription: {
      en: "Get name, carrier, location & Facebook profile picture from phone number"
    },
    guide: {
      en: "{pn} <number> — Example: {pn}numlookup 8801838456789"
    }
  },

  onStart: async function ({ message, args, event }) {
    const { getPrefix } = global.utils;
    const p = getPrefix(event.threadID);

    if (args.length === 0) {
      return message.reply(
        `Please provide a phone number with country code!\n\nExample:\n${p}numlookup 8801838456789`
      );
    }

    let phone = args.join("").trim();
    
    // + থাকলে সরাও
    if (phone.startsWith("+")) phone = phone.slice(1);
    
    // শুধু নাম্বার রাখো
    phone = phone.replace(/\D/g, "");
    
    if (!/^\d+$/.test(phone) || phone.length < 10) {
      return message.reply("Invalid number! Use country code without + sign.\nExample: 8801838456789");
    }

    message.reaction("Searching", event.messageID);

    try {
      const res = await axios.get(
        `https://connect-foxapi.onrender.com/tools/numlookup?apikey=gaysex&number=${phone}`
      );

      const data = res.data;

      if (!data || (!data.name && !data.img && !data.fb_id)) {
        return message.reply("No information found for this number!");
      }

      let msg = "Number Lookup Result\n\n";
      msg += `Number: +${phone}\n`;
      msg += `Name: ${data.name || "Not found"}\n`;
      msg += `Facebook ID: ${data.fb_id ? `https://facebook.com/${data.fb_id}` : "Not found"}\n`;
      msg += `Status: ${data.valid ? "Valid" : "Invalid"}`;

      const attachment = data.img ? await global.utils.getStreamFromURL(data.img) : null;

      await message.reply({
        body: msg,
        ,
        attachment
      });

      message.reaction("Success", event.messageID);

    } catch (error) {
      console.log("Numlookup Error:", error.message);
      message.reaction("Failed", event.messageID);
      message.reply(
        `API Error or Number Not Found!\n\nTry again after few minutes or check the number.\n\nExample: ${p}numlookup 8801838456789`
      );
    }
  }
};

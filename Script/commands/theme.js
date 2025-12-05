const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "theme",
    aliases: ["aitheme", "changetheme"],
    version: "3.0 STABLE",
    author: "SIYAM MOD",
    countDown: 5,
    role: 1,
    description: {
      en: "Create and apply AI themes with safe fallback system"
    },
    category: "box chat"
  },

  langs: {
    en: {
      missingPrompt: "❌ Enter description or theme ID.\nExample: theme ocean blue",
      generating: "🎨 Generating AI themes...",
      preview: "✨ Generated %1 theme(s)\n\nPrompt: %2\n\n%3\n\nReply with number to apply",
      themeInfo: "%1) ID: %2\n   🎨 %3",
      applying: "🎨 Applying theme...",
      applied: "✅ Theme applied successfully!",
      error: "🚫 Error:\n%1",
      noThemes: "❌ No themes generated.",
      invalidSelection: "❌ Enter number between 1-%1",
      notAuthor: "❌ Only request author can apply theme",
      missingThemeId: "❌ Usage: theme apply <ID>",
      applyingById: "🎨 Applying theme ID: %1",
      appliedById: "✅ Theme applied by ID!",
      currentTheme: "🎨 Current Theme\n\nID: %1\n🎨 Color: %2",
      fetchingCurrent: "🔍 Getting current theme...",
      noCurrentTheme: "ℹ️ Default theme active",
      showingPreviews: "🖼 Showing previews",
      previousTheme: "⬅ Previous Theme:\nID: %1\n🎨 Color: %2"
    }
  },

  onStart: async function ({ args, message, event, api, getLang, commandName }) {

    const command = args[0];

    /* ---------------------- CURRENT THEME ---------------------- */
    if (!command) {
      try {
        message.reply(getLang("fetchingCurrent"));

        const info = await api.getThreadInfo(event.threadID);
        const theme = info.threadTheme;

        if (!theme) return message.reply(getLang("noCurrentTheme"));

        const themeId = theme.id || "Unknown";
        const color = info.color || theme.accessibility_label || "Unknown";

        return message.reply(getLang("currentTheme", themeId, color));

      } catch (e) {
        return message.reply(getLang("error", e.message));
      }
    }

    /* ---------------------- APPLY BY ID ---------------------- */
    if (command === "apply") {
      const themeId = args[1];
      if (!themeId) return message.reply(getLang("missingThemeId"));

      try {
        message.reply(getLang("applyingById", themeId));
        await api.changeThreadColor(themeId, event.threadID);
        return message.reply(getLang("appliedById", themeId));
      } catch (e) {
        return message.reply(getLang("error", e.message));
      }
    }

    /* ---------------------- GENERATE AI THEMES ---------------------- */
    const prompt = args.join(" ");

    try {
      message.reply(getLang("generating"));

      const themes = await api.createAITheme(prompt, 5);

      if (!themes || !themes.length) {
        return message.reply(getLang("noThemes"));
      }

      let list = "";
      const attachments = [];

      for (let i = 0; i < themes.length; i++) {
        const t = themes[i];
        const color = t.accessibility_label || t.primary_color || "AI Generated";

        list += getLang("themeInfo", i + 1, t.id, color) + "\n\n";

        const url = t.preview_image_urls?.light_mode || t.background_asset?.image?.url;

        if (url) {
          try {
            const stream = await getStreamFromURL(url, `theme${i + 1}.png`);
            if (stream) attachments.push(stream);
          } catch {}
        }
      }

      const msg = getLang("preview", themes.length, prompt, list.trim());

      message.reply({
        body: msg,
        attachment: attachments.length ? attachments : undefined
      }, (err, info) => {

        if (err) return message.reply(msg);

        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          author: event.senderID,
          themes
        });
      });

    } catch (e) {
      return message.reply(getLang("error", e.message || "Theme generation failed"));
    }
  },

  /* ---------------------- APPLY FROM REPLY ---------------------- */
  onReply: async function ({ message, Reply, event, api, getLang }) {

    const choice = parseInt(event.body);

    if (event.senderID !== Reply.author) return message.reply(getLang("notAuthor"));
    if (isNaN(choice) || choice < 1 || choice > Reply.themes.length) {
      return message.reply(getLang("invalidSelection", Reply.themes.length));
    }

    try {
      const oldInfo = await api.getThreadInfo(event.threadID);
      const oldTheme = oldInfo.threadTheme?.id || "Default";
      const oldColor = oldInfo.color || "Default";

      message.reply(getLang("applying"));

      await api.changeThreadColor(Reply.themes[choice - 1].id, event.threadID);

      const msg = getLang("applied") + "\n\n" + getLang("previousTheme", oldTheme, oldColor);

      message.reply(msg);
      api.unsendMessage(Reply.messageID);

    } catch (e) {
      return message.reply(getLang("error", e.message));
    }
  }
};

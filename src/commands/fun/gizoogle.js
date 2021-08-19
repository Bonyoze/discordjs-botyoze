const bot = require("../../bot.js"),
Command = require("../../../structures/Command"),
fetch = require("node-fetch"),
cheerio = require("cheerio"),
qs = require("qs");

module.exports = new Command(bot,
  {
    name: "gizoogle",
    description: "Gizoogles some text",
    options: [
      {
        type: 3, // STRING
        name: "text",
        description: "Any english text (works best with long sentences)",
        required: true
      }
    ],
    category: "fun",
    cooldown: 5
  },
  async interaction => {
    const textInput = interaction.options.getString("text"),
    payload = qs.stringify({ translatetext: textInput }),
    body = await fetch("http://gizoogle.net/textilizer.php", {
      method: "post",
      body: payload,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(payload, "utf8")
      }
    }).then(res => res.text()).then(body => { return body; });

    const html = cheerio.load(body),
    textOutput = html('textarea[name="translatetext"]').val();

    return await interaction.reply({ content: textOutput != textInput ? textOutput : "⚠ **`Text was unable to be modified (try adding more words)`**", ephemeral: textOutput === textInput });
  }
);
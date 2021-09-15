const { SlashCommandBuilder } = require("@discordjs/builders"),
fetch = require("node-fetch"),
cheerio = require("cheerio"),
qs = require("qs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gizoogle")
    .setDescription("Gizoogles some text")
    .addStringOption(option =>
      option
        .setName("text")
        .setDescription("Any english text (works best with long sentences)")
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply();
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

    return await interaction.editReply({ content: textOutput != textInput ? textOutput : "⚠ **`Text was unable to be modified (try adding more words)`**", ephemeral: textOutput === textInput });
  }
};
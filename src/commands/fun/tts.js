const { SlashCommandBuilder } = require("@discordjs/builders"),
{ MessageEmbed, MessageAttachment } = require("discord.js"),
{ buildUrl, voices } = require("oddcast-tts-demo"),
client = require("../../bot.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tts")
    .setDescription("Generate a text-to-speech audio file (courtesy of Oddcast TTS Demo)")
    .addSubcommand(subcommand =>
      subcommand
        .setName("create")
        .setDescription("Generate a text-to-speech audio file (courtesy of Oddcast TTS Demo)")
        .addStringOption(option =>
          option
            .setName("text")
            .setDescription("Text to make into text-to-speech")
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName("voice")
            .setDescription("Name of voice to use (view the list to see what's supported)")
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("list")
        .setDescription("Show the list of supported voices")
    ),
  async execute(interaction) {
    const command = interaction.options.getSubcommand();

    switch (command) {
      case "create":
        const text = interaction.options.getString("text"),
        voice = interaction.options.getString("voice") ? interaction.options.getString("voice").toLowerCase() : "daniel";

        interaction.editReply(voices[voice] ? { files: [ new MessageAttachment(buildUrl(text, voices[voice]), `tts_${voice}.mp3`) ] } : `⚠ **\`${voice}\` is not a valid voice (view the list to see what's supported)**`);

        break;
      case "list":
        const embed = new MessageEmbed()
          .setColor("#000000")
          .setAuthor("TTS Voices", client.user.displayAvatarURL({ format: "png", dynamic: true }))
        
        let list = Object.keys(voices).map(x => `\`${x}\``);

        while (list.length)
          embed.addField("** **", `>>> ${list.splice(0, 56).join("\n")}`, true);

        interaction.editReply({ embeds: [ embed ] });

        break;
    }
  }
}
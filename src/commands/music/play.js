const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play songs in a voice channel")
    .addStringOption(option =>
      option
        .setName("input")
        .setDescription("A YouTube link or search for a song")
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.editReply("command not finished.", { ephemeral: true });
  }
}
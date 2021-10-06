const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip the current playing song"),
  async execute(interaction) {
    await interaction.editReply("command not finished.", { ephemeral: true });
  }
}
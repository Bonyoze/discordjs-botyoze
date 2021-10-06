const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("disconnect")
    .setDescription("Make the bot leave the voice channel"),
  async execute(interaction) {
    await interaction.editReply("command not finished.", { ephemeral: true });
  }
}
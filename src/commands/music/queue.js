const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Show the queue of songs"),
  async execute(interaction) {
    await interaction.editReply("command not finished.", { ephemeral: true });
  }
}
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Simple ping command"),
  async execute(interaction) {
    await interaction.editReply({ content: "Pong!", fetchReply: true }).then(async sent => {
      await interaction.editReply("Pong! Took `"
        + (sent.createdTimestamp - interaction.createdTimestamp)
        + " milliseconds` to respond."
      );
    });
  }
};
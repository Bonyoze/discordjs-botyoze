const { SlashCommandBuilder } = require("@discordjs/builders"),
{ MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");

const buildRow = (a, b, c) => {
  return new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setCustomId(a)
        .setLabel(" ")
        .setStyle("SECONDARY"),
      new MessageButton()
        .setCustomId(b)
        .setLabel(" ")
        .setStyle("SECONDARY"),
      new MessageButton()
        .setCustomId(c)
        .setLabel(" ")
        .setStyle("SECONDARY")
    );
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tictactoe")
    .setDescription("Play tic tac toe with another user")
    .addUserOption(option =>
      option
        .setName("opponent")
        .setDescription("The user you want to play against")
    ),
  async execute(interaction) {
    return await interaction.reply(
      {
        content: "test",
        components: [
          buildRow("1", "2", "3"),
          buildRow("4", "5", "6"),
          buildRow("7", "8", "9")
        ]
      }
    );
  }
};
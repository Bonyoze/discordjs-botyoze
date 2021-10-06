const { SlashCommandBuilder } = require("@discordjs/builders"),
{ MessageEmbed } = require("discord.js"),
client = require("../../bot.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show some bot and command info")
    .addStringOption(option =>
      option
        .setName("command")
        .setDescription("Name of a command")
    ),
  async execute(interaction) {
    const cmdInput = interaction.options.getString("command");
    
    if (cmdInput) {
      const command = client.commands.get(cmdInput.toLowerCase());
      if (command) {

        const embed = new MessageEmbed()
          .setColor("#000000")
          .setAuthor("Bot Help", client.user.displayAvatarURL({ format: "png", dynamic: true }))
          .setTitle(`\`${command.data.category.charAt(0).toUpperCase() + command.data.category.slice(1)} > ${command.data.name.charAt(0).toUpperCase() + command.data.name.slice(1)}\``)
          .setDescription(command.data.description);

        return await interaction.editReply({ embeds: [embed] });
      } else return interaction.editReply({ content: `⚠ **\`'${cmdInput}' is not a valid command\`**`, ephemeral: true });
    }

    const embed = new MessageEmbed()
      .setColor("#000000")
      .setAuthor("Command Info", client.user.displayAvatarURL({ format: "png", dynamic: true }))
      .setTitle("Use *`/help <command>`* to get info on a command.");

    for (const category of client.categories) {
      const commands = Array.from(client.commands.filter(c => c.data.category == category).keys(), x => `\`${x}\``);
      embed.addField(`**[ ${category.charAt(0).toUpperCase() + category.slice(1)} ]**`, commands.length > 0 ? commands.join("\n") : "n/a", true);
    }
    
    embed.setFooter(`${client.commands.size} total commands`);

    return interaction.editReply({ embeds: [embed] });
  }
};
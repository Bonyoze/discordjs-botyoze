const { client } = require("../../bot.js"),
{ getCommand } = require("../../globals.js"),
{ SlashCommandBuilder } = require("@discordjs/builders"),
{ MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Shows some bot and command info")
    .addStringOption(option =>
      option
        .setName("command")
        .setDescription("Name of a command")
    ),
  async execute(interaction) {
    const cmdInput = interaction.options.getString("command");
    
    if (cmdInput) {
      const command = getCommand(cmdInput.toLowerCase());
      if (command) {

        const embed = new MessageEmbed()
          .setColor("#000000")
          .setAuthor("Bot Help", client.user.displayAvatarURL({ format: "png", dynamic: true }))
          .setTitle(`\`${command.data.category.charAt(0).toUpperCase() + command.data.category.slice(1)} > ${command.data.name.charAt(0).toUpperCase() + command.data.name.slice(1)}\``)
          .setDescription(command.data.description);

        return await interaction.editReply({ embeds: [embed] });
      } else return await interaction.editReply({ content: `⚠ **\`'${cmdInput}' is not a valid command\`**`, ephemeral: true });
    }

    let totalCmds = 0;

    const embed = new MessageEmbed()
      .setColor("#000000")
      .setAuthor("Command Info", client.user.displayAvatarURL({ format: "png", dynamic: true }))
      .setTitle("Use *`/help <command>`* to get info on a command.");

    for await (const [category, commands] of Array.from(client.commands)) {
      const cmds = Array.from(commands.keys()).map(str => `\`${str}\``);
      totalCmds += cmds.length;
      embed.addField(`**[ ${category.charAt(0).toUpperCase() + category.slice(1)} ]**`, cmds.length > 0 ? cmds.join("\n") : "N/A", true);
    }
    
    embed.setFooter(`${totalCmds} total commands`);

    return await interaction.editReply({ embeds: [embed] });
  }
};
const { SlashCommandBuilder } = require("@discordjs/builders"),
bot = require("../../bot.js"),
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
      const command = bot.getCommand(cmdInput.toLowerCase());
      if (command) {

        const embed = new MessageEmbed()
          .setColor("#000000")
          .setAuthor("Bot Help", bot.client.user.displayAvatarURL({ format: "png", dynamic: true }))
          .setTitle(`\`${command.data.category.charAt(0).toUpperCase() + command.data.category.slice(1)} > ${command.data.name.charAt(0).toUpperCase() + command.data.name.slice(1)}\``)
          .setDescription(command.data.description);

        return await interaction.reply({ embeds: [embed] });
      } else return await interaction.reply({ content: `⚠ **\`'${cmdInput}' is not a valid command\`**`, ephemeral: true });
    }

    let totalCmds = 0;

    const embed = new MessageEmbed()
      .setColor("#000000")
      .setAuthor("Command Info", bot.client.user.displayAvatarURL({ format: "png", dynamic: true }))
      .setTitle("Use *`/help <command>`* to get info on a command.");

    for await (const [category, commands] of Array.from(bot.commands)) {
      const cmds = Array.from(commands.keys()).map(str => `\`${str}\``);
      totalCmds += cmds.length;
      embed.addField(`**[ ${category.charAt(0).toUpperCase() + category.slice(1)} ]**`, cmds.length > 0 ? cmds.join("\n") : "N/A", true);
    }
    
    embed.setFooter(`${totalCmds} total commands`);

    return await interaction.reply({ embeds: [embed] });
  }
};
const bot = require("../../bot.js"),
Command = require("../../../structures/Command"),
{ MessageEmbed } = require("discord.js");

module.exports = new Command(bot,
  {
    name: "help",
    description: "Shows commands and command info",
    options: [
      {
        type: 3, // STRING
        name: "command",
        description: "A command name"
      }
    ],
    category: "utility",
    cooldown: 1
  },
  async interaction => {
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
      embed.addField(`**[ ${category.charAt(0).toUpperCase() + category.slice(1)} ]**`, cmds.join("\n"), true);
    }
    
    embed.setFooter(`${totalCmds} total commands`);

    return await interaction.reply({ embeds: [embed] });
  }
);
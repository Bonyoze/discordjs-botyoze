const Command = require("../../../structures/Command"),
{ MessageEmbed } = require("discord.js");

module.exports = class Help extends Command {
  constructor() {
    super({
      name: "help",
      description: "Shows commands and command info",
      cooldown: 4
    });
  }

  async run(message) {
    await message.channel.send("placeholder response");
  }
}
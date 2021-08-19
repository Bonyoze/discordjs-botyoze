const bot = require("../../bot.js"),
Command = require("../../../structures/Command");

module.exports = new Command(bot,
  {
    name: "ping",
    description: "Simple ping command",
    category: "utility",
    cooldown: 1
  },
  async interaction => {
    return await interaction.reply({ content: "Pong!", fetchReply: true }).then(async sent => {
      await interaction.editReply("Pong! `Took ["
        + (sent.createdTimestamp - interaction.createdTimestamp)
        + " milliseconds] to respond`"
      );
    });
  }
);
const Command = require("../../../structures/Command");

module.exports = class Ping extends Command {
  constructor() {
    super({
      name: "ping",
      description: "Simple ping command",
      category: "utility",
      cooldown: 1
    });
  }

  async run(message) {
    await message.channel.send("**`Pong!`**").then(async sent => {
      await sent.edit("**`Pong! Took ["
        + (sent.createdTimestamp - message.createdTimestamp)
        + " milliseconds] to respond`**"
      );
    });
  }
}
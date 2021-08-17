const { client } = require("../src/bot.js");

module.exports = class Command {
  constructor() {
    this.metadata = Object.assign({
      category: "other", // command category folder (default: other)
      cooldown: 4, // command cooldown length (default: 4 seconds)
      nsfw: false, // command can only be used in NSFW channels
      adminOnly: false, // command can only be used by members with guild 'ADMINISTRATOR' permission
      ownerOnly: false, // command can only be used by bot owner
      client: client
    }, arguments[0]);
  }
}
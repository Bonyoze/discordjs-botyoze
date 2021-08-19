module.exports = class Command {
  constructor(bot, data, run) {
    this.bot = bot;
    
    // apply our data
    this.data = Object.assign({
      description: "No description", // command info description
      category: "other", // command category folder (default: other)
      cooldown: 4, // command cooldown length (default: 4 seconds)
      nsfw: false, // command can only be used in NSFW channels
      adminOnly: false, // command can only be used by members with guild 'ADMINISTRATOR' permission
      ownerOnly: false // command can only be used by bot owner
    }, data);

    this.run = run;
  }
}
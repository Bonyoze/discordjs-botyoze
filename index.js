require("dotenv").config();
const { ShardingManager } = require("discord.js");

// handle errors
process.on("unhandledRejection", err => console.log(`An error ocurred: ${err.stack}`));

const manager = new ShardingManager("./src/bot.js", { token: process.env.BOT_TOKEN });
manager.on("shardCreate", shard => console.log(`Launched shard ${shard.id}`));
manager.spawn();
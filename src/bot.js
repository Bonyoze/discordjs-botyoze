const Bot = require("../structures/Bot");

// handle errors
process.on("unhandledRejection", err => console.log(`An error ocurred: ${err.stack}`));

// create bot
const bot = module.exports = new Bot();
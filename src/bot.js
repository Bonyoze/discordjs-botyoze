const Discord = require("discord.js"),
{ Client } = require("discord-slash-commands-client"),
fs = require("fs-extra"),
PREFIX = require("../config.json").prefix;

process.on("unhandledRejection", err => console.log(`An error ocurred: ${err.stack}`));

const client = module.exports.client = new Discord.Client();
const commandClient = new Client(
  process.env.BOT_TOKEN,
  process.env.BOT_ID
);

client.on("ready", async () => {
  //load commands
  //const slashCommands = (await client.application.commands.fetch()).map(cmd => cmd.name);
  //console.log(slashCommands);

  client.commands = new Discord.Collection();

  const categories = fs.readdirSync("./src/commands");
  for (const category of categories) {
    const commands = fs.readdirSync(`./src/commands/${category}`)
    for (const command of commands) {
      try {
        const cmd = new (require(`../src/commands/${category}/${command}`))();

        /*if (!slashCommands.includes(cmd.metadata.name)) { // create slash command
          console.log(cmd.metadata.name);
          await client.application.commands.create(command.metadata);
        }*/
        client.commands.set(cmd.metadata.name, cmd);
      } catch (err) {
        console.log(`Unable to load command ${command}: ${err}`);
      }
    }
  }

  /*client.api.applications(client.user.id).commands.get().then(async list => {
    for (const command of list) {
      console.log(command.name);
      await client.api.applications(client.user.id).commands().post({data: command.metadata});
    }
  });*/

  console.log("Client is ready");
});

client.ws.on("INTERACTION_CREATE", async interaction => {
  const command = interaction.data.name.toLowerCase(),
  args = interaction.data.options;

  
});

client.on("message", message => {
  evalCommand(message);
});

client.on("messageUpdate", (oldMessage, newMessage) => {
  evalCommand(newMessage);
});

// login client
client.login(process.env.BOT_TOKEN);

// command executor
const evalCommand = async message => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;

  const cmdName = message.content.substring(PREFIX.length).split(" ")[0].toLowerCase();
  
  if (!client.commands.has(cmdName)) return;

  const command = client.commands.get(cmdName);

  if (command.adminOnly && !message.member.hasPermission("ADMINISTRATOR")) return message.channel.send("**`This command may only be used by administrators in this server`**");
  if (command.ownerOnly && message.member.id != process.env.BOT_OWNER_ID) return message.channel.send("**`This command may only be used by the owner of the bot`**");

  message.channel.startTyping();
  await command.run(message).catch(err => {
    return message.channel.send(
      "⚠ **`An error occurred while the command was executing:`**```js\n"
      + err
      + "\n```"
    );
  });
  message.channel.stopTyping();
}
const { Client, Collection, MessageEmbed } = require("discord.js"),
{ getErrInfo } = require("./globals.js"),
{ REST } = require("@discordjs/rest"),
rest = new REST({ version: "9" }).setToken(process.env.BOT_TOKEN),
{ Routes } = require("discord-api-types/v9"),
fs = require("fs-extra"),
{ intents, tempDir } = require("../config.json");

// setup temp files folder
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
fs.emptyDirSync(tempDir);

const client = new Client({ intents: intents, ws: { properties: { $browser: "Discord iOS" } } });
client.commands = new Collection();

// login client
client.login(process.env.BOT_TOKEN);

client.on("ready", async () => {
  await client.loadCommands();

  console.log("Client is ready!");
});

// interaction handling
client.on("interactionCreate", async interaction => {
  const func = (() => {
    switch (true) {
      case interaction.isCommand():
        return client.handleCommandInteraction;
      case interaction.isContextMenu():
        return;
      case interaction.isSelectMenu():
        return;
    }
  })();

  if (func) func(interaction);
});

client.loadCommands = async () => {
  console.log("Started loading commands.");
  let slashComms = [];

  const categories = fs.readdirSync("./src/commands");
  for (const category of categories) {
    if (!client.commands.get(category)) client.commands.set(category, new Collection());
    const commands = fs.readdirSync(`./src/commands/${category}`);
    for (const command of commands) {
      try {
        const cmd = require(`../src/commands/${category}/${command}`);
        slashComms.push(cmd.data.toJSON());

        // add some data
        cmd.data.category = category;

        // add to collection
        client.commands.get(category).set(cmd.data.name, cmd);
      } catch (err) {
        console.error(`Failed to load command ${command}: ${err.stack}`);
      }
    }
  }
  

  // reload slash commands
  try {
    console.log("Refreshing application (/) commands.");

    await rest.put(
      Routes.applicationCommands(process.env.BOT_ID),
      { body: slashComms }
    ).then(console.log("Successfully reloaded application (/) commands."));
  } catch (err) {
    console.error(`Encountered an error while refreshing application (/) commands: ${err.stack}`)
  }

  console.log("Finished loading commands.");
}

client.handleCommandInteraction = async interaction => {
  const command = await client.getCommand(interaction.commandName);

  if (command.data.adminOnly && !interaction.user.hasPermission("ADMINISTRATOR")) return interaction.reply("**`This command may only be used by administrators in this server`**");
  if (command.data.ownerOnly && interaction.user.id != process.env.BOT_OWNER_ID) return interaction.reply("**`This command may only be used by the owner of the bot`**");

  await interaction.deferReply();

  await command.execute(interaction).catch(async err => {
    const errInfo = getErrInfo(err),
    errEmbed = new MessageEmbed()
      .setColor("#000000")
      .setAuthor("An error occurred while the command was executing", client.user.displayAvatarURL({ format: "png", dynamic: true }))
      .setTitle(`\`${command.data.category.charAt(0).toUpperCase() + command.data.category.slice(1)} > ${command.data.name.charAt(0).toUpperCase() + command.data.name.slice(1)}\``)
      .setDescription(`**File: **${errInfo.file}\n**Line: **${errInfo.line}\n**Column: **${errInfo.column}\n` + "```js\n" + err + "\n```");

    await interaction.followUp({ embeds: [errEmbed], ephemeral: true });
  });
}

client.getCommand = async name => {
  const categories = Array.from(client.commands.values());
  for (let i = 0; i < categories.length; i++) {
    const commands = Array.from(categories[i].values());
    for (let ii = 0; ii < commands.length; ii++) {
      const cmd = commands[ii];
      if (cmd.data.name.toLowerCase() === name.toLowerCase()) {
        return cmd;
      }
    }
  }
}

module.exports = client;
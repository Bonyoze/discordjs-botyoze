const { Client, Intents, Collection, MessageEmbed } = require("discord.js"),
{ getCommand, getErrInfo } = require("./globals.js"),
{ REST } = require("@discordjs/rest"),
rest = new REST({ version: "9" }).setToken(process.env.BOT_TOKEN),
{ Routes } = require("discord-api-types/v9"),
fs = require("fs-extra"),
PREFIX = require("../config.json").prefix;

const botIntents = [
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MEMBERS,
  Intents.FLAGS.GUILD_BANS,
  Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
  Intents.FLAGS.GUILD_INTEGRATIONS,
  Intents.FLAGS.GUILD_WEBHOOKS,
  Intents.FLAGS.GUILD_INVITES,
  Intents.FLAGS.GUILD_VOICE_STATES,
  //Intents.FLAGS.GUILD_PRESENCES, // commented out because this is a privileged intent
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  Intents.FLAGS.GUILD_MESSAGE_TYPING,
  Intents.FLAGS.DIRECT_MESSAGES,
  Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
  Intents.FLAGS.DIRECT_MESSAGE_TYPING
];

const client = new Client({ intents: botIntents, ws: { properties: { $browser: "Discord iOS" } } });
client.commands = new Collection();

client.on("ready", async () => {
  await loadCommands();

  console.log("Client is ready!");
});

// interaction handling
client.on("interactionCreate", async interaction => {
  switch (true) {
    case interaction.isCommand():
      return await handleCommandInteraction(interaction);
    case interaction.isContextMenu():
      return;
    case interaction.isSelectMenu():
      return;
  }
});

// login client
client.login(process.env.BOT_TOKEN);

// create temp files folder
if (!fs.existsSync("./tmp")) fs.mkdirSync("./tmp");

const loadCommands = async () => {
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
  /*try {
    console.log("Refreshing application (/) commands.");

    await rest.put(
      Routes.applicationCommands(process.env.BOT_ID),
      { body: slashComms }
    ).then(console.log("Successfully reloaded application (/) commands."));
  } catch (err) {
    console.error(`Encountered an error while refreshing application (/) commands: ${err.stack}`)
  }*/

  console.log("Finished loading commands.");
}

const handleCommandInteraction = async interaction => {
  const command = await getCommand(interaction.commandName);

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
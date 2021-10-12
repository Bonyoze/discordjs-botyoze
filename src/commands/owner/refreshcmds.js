const { SlashCommandBuilder } = require("@discordjs/builders"),
{ REST } = require("@discordjs/rest"),
rest = new REST({ version: "9" }).setToken(process.env.BOT_TOKEN),
{ Routes } = require("discord-api-types/v9"),
client = require("../../bot.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("refreshcmds")
    .setDescription("Refresh the bot's slash commands")
    .setDefaultPermission(false),
  permissions: [
    {
      id: process.env.BOT_OWNER_ID,
      type: "USER",
      permission: true
    }
  ],
  async execute(interaction) {
    await rest.put(
      Routes.applicationCommands(process.env.BOT_ID),
      { body: Array.from(client.commands).map(([_, cmd]) => cmd.data.toJSON()) }
    )
      .then(async () => {
        // apply permissions
        const globalCmds = await client.application.commands.fetch(),
        guilds = client.guilds.cache;
  
        let fullPermissions = [];
  
        // get all the permissions
        for (const [_, cmd] of globalCmds) {
          const permissions = client.commands.get(cmd.name).permissions;
          if (permissions) fullPermissions.push({ id: cmd.id, permissions });
        }
  
        // apply the permissions in the guilds
        for (const [_, guild] of guilds) {
          await guild.commands.permissions.set({ fullPermissions });
        }
  
        interaction.editReply("Successfully reloaded application (/) commands.");
      });
  }
}
const bot = require("../../bot.js"),
{ SlashCommandBuilder } = require("@discordjs/builders"),
{ MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");

const buildRow = (a, b, c) => {
  return new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setCustomId(a)
        .setLabel(" ")
        .setStyle("SECONDARY"),
      new MessageButton()
        .setCustomId(b)
        .setLabel(" ")
        .setStyle("SECONDARY"),
      new MessageButton()
        .setCustomId(c)
        .setLabel(" ")
        .setStyle("SECONDARY")
    );
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tictactoe")
    .setDescription("Tic-Tac-Toe game")
    .addSubcommand(subcommand =>
      subcommand
        .setName("play")
        .setDescription("Start a Tic-Tac-Toe game")
        .addUserOption(option =>
          option
            .setName("opponent")
            .setDescription("User to be played against (select Botyoze to play against an AI)")
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("cancel")
        .setDescription("Cancel a Tic-Tac-Toe game")
        .addMentionableOption(option =>
          option
            .setName("mention")
            .setDescription("mention")
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("forfeit")
        .setDescription("Forfeit a Tic-Tac-Toe game")
    )
    .addSubcommandGroup(group =>
      group
        .setName("stats")
        .setDescription("View stats for Tic-Tac-Toe")
        .addSubcommand(subcommand =>
          subcommand
            .setName("global")
            .setDescription("View global stats for Tic-Tac-Toe")
        )
        .addSubcommand(subcommand =>
          subcommand
            .setName("guild")
            .setDescription("View guild stats for Tic-Tac-Toe")
        )
        .addSubcommand(subcommand =>
          subcommand
            .setName("user")
            .setDescription("View a user's stats for Tic-Tac-Toe")
            .addUserOption(option =>
              option
                .setName("user")
                .setDescription("User whose stats should be viewed")
                .setRequired(true)
            )
        )
    ),
  async execute(interaction) {
    const group = interaction.options.getSubcommandGroup(false),
    command = interaction.options.getSubcommand();

    switch (group) {
      case "stats":
        switch (command) {
          case "global":

            break;
          case "guild":

            break;
          case "user":

            break;
        }
        break;
      default:
        switch (command) {
          case "play":
            const user = interaction.user,
            opponent = interaction.options.getUser("opponent");

            const joinId = `tictactoe_join_${user.id}`,
            joinFilter = i => {
              console.log("filter: ", i);
              i.customId === joinId && i.user.id === opponent.id
            },
            joinCollector = interaction.channel.createMessageComponentCollector({ joinFilter, max: 1 });

            joinCollector.on("collect", async i => {
              console.log("collect: ", i);
            });

            await interaction.reply(
              {
                embeds: [
                  new MessageEmbed()
                    .setColor("#000000")
                    .setAuthor("Tic-Tac-Toe", bot.client.user.displayAvatarURL({ format: "png", dynamic: true }))
                    .setTitle("`Waiting for opponent to join...`")
                    .setDescription(`<@${user.id}> vs. <@${opponent.id}>`)
                ],
                components: [
                  new MessageActionRow()
                    .addComponents(
                      new MessageButton()
                        .setCustomId(joinId)
                        .setLabel("Join")
                        .setStyle("PRIMARY")
                    )
                ]
              }
            );

            break;
          case "cancel":

            break;
          case "forfeit":

            break;
        }
        break;
    }
  }
};
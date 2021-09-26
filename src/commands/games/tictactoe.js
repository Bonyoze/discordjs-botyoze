const { client } = require("../../bot.js"),
{ SlashCommandBuilder } = require("@discordjs/builders"),
{ MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");

const buildBoard = (data, disabled) => {
  let rows = [],
  index = 0;

  for (let x = 0; x < 3; x++) {
    const row = new MessageActionRow();

    for (let y = 0; y < 3; y++) {
      index++;

      const val = data[index];

      row.addComponents(
        new MessageButton()
          .setCustomId(`${index}`)
          .setLabel(val === undefined ? " " : val === false ? "X" : val === true && "O")
          .setStyle(val === undefined ? "SECONDARY" : val === false ? "PRIMARY" : val === true && "DANGER")
          .setDisabled(val !== undefined || disabled === true)
      );
    }

    rows.push(row);
  }

  return rows;
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
        interaction.editReply("this command is a work in progress!");
        /*switch (command) {
          case "global":
            
            break;
          case "guild":

            break;
          case "user":

            break;
        }*/
        break;
      default:
        switch (command) {
          case "play":
            let user = interaction.user,
            opponent = interaction.options.getUser("opponent");

            const embed = new MessageEmbed()
              .setColor("#000000")
              .setAuthor("Tic-Tac-Toe", client.user.displayAvatarURL({ format: "png", dynamic: true }))
              .setDescription(`*Waiting For ${opponent ? `<@${opponent.id}>` : "An Opponent"} To Join...*`)
              .addField("**Players**", `\`🔵\`<@${user.id}>\n${opponent ? `\`🔴\`<@${opponent.id}>` : "`🔴`\\❔\\❔\\❔"}`)

            await interaction.editReply(
              {
                embeds: [ embed ],
                components: [
                  new MessageActionRow()
                    .addComponents(
                      new MessageButton()
                        .setCustomId("join")
                        .setLabel("Join")
                        .setStyle("SUCCESS")
                    )
                ]
              }
            );
            
            // join btn collector
            const joinCollector = interaction.channel.createMessageComponentCollector({
              filter: i => i.message.interaction.id === interaction.id && i.customId === "join",
              time: 900000
            })
              .on("collect", async i => {
                if (!opponent) {
                  opponent = i.user;
                } else if (i.user.id !== opponent.id) return await i.deferUpdate();

                joinCollector.stop();

                const players = [
                  user,
                  opponent
                ],
                winStates = [
                  // horizontal
                  [ 1, 2, 3 ],
                  [ 4, 5, 6 ],
                  [ 7, 8, 9 ],
                  // vertical
                  [ 1, 4, 7 ],
                  [ 2, 5, 8 ],
                  [ 3, 6, 9 ],
                  // diagonal
                  [ 1, 5, 9 ],
                  [ 3, 5, 7]
                ];

                let board = [],
                turn = false,
                gameNum = 1;

                embed
                  .setDescription(`**Current Game: **\`${gameNum}\`\n\n**Turn: **\`🔵\`<@${user.id}>`)
                  .fields[0].value = `\`🔵\`<@${user.id}>\n\`🔴\`<@${opponent.id}>`;

                await i.update(
                  {
                    embeds: [ embed ],
                    components: buildBoard(board)
                  }
                );

                // playing btn collector
                const btnCollector = interaction.channel.createMessageComponentCollector({
                  filter: i => i.message.interaction.id === interaction.id
                })
                  .on("collect", async i => {
                    const ply = players[+ turn];

                    if (i.user.id === ply.id) {
                      board[Number(i.customId)] = turn;

                      // check if won
                      const win = (
                        () => {
                          for (const state of winStates) {
                            let valid = true;

                            for (let i = 0; i < 3; i++) {
                              if (board[state[i]] !== turn) {
                                valid = false;
                                break;
                              }
                            }

                            if (valid) return true;
                          }
                          return false;
                        }
                      )();

                      if (win) {
                        embed.setDescription(`\`${turn ? "🔴" : "🔵"}\`<@${ply.id}> Wins!\n\n**Games Played: **\`${gameNum}\``);

                        btnCollector.stop();
                      } else {
                        if (Object.keys(board).length === 9) { // restart board
                          gameNum++;
                          board = [];
                        }

                        turn = !turn;
                        embed.setDescription(`**Current Game: **\`${gameNum}\`\n\n**Turn: **\`${turn ? "🔴" : "🔵"}\`<@${players[+ turn].id}>`);
                      }

                      await i.update(
                        {
                          embeds: [ embed ],
                          components: buildBoard(board, win)
                        }
                      );
                    } else await i.deferUpdate();
                  });
              })
              .on("end", async (i, reason) => {
                if (reason === "time") {
                  embed.setFooter("⚠️ Game cancelled due to inactivity");

                  await interaction.editReply(
                    {
                      embeds: [ embed ],
                      components: [
                        new MessageActionRow()
                          .addComponents(
                            new MessageButton()
                              .setCustomId("join")
                              .setLabel("Join")
                              .setStyle("SUCCESS")
                              .setDisabled(true)
                          )
                      ]
                    }
                  );
                }
              })

            break;
          case "cancel":
            interaction.editReply("this command is a work in progress!");
            break;
          case "forfeit":
            interaction.editReply("this command is a work in progress!");
            break;
        }
        break;
    }
  }
};
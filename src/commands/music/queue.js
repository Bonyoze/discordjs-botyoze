const { SlashCommandBuilder } = require("@discordjs/builders"),
{ MessageEmbed } = require("discord.js"),
{ getVoiceConnection } = require("@discordjs/voice"),
client = require("../../bot.js");

const maxVisible = 3,
indexPad = "000";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Show the queue of songs"),
  async execute(interaction) {
    const voiceConnect = getVoiceConnection(interaction.guildId),
    musicPlayer = client.musicPlayers.get(interaction.guildId);

    if (voiceConnect && musicPlayer && musicPlayer.queue.length > 0) {
      const playing = musicPlayer.queue[0],
      items = musicPlayer.queue.filter((_, index) => index > 0 && index < maxVisible + 1),
      listStr = items
        .map((elem, index) => `**${indexPad.substring(0, indexPad.length - (index + 1).toString().length)}${(index + 1).toString()})** [*\`${elem.name}\`*](${elem.url}) - <@${elem.user.id}>${musicPlayer.queue.length - 1 > maxVisible && index === items.length - 1 ? `\n\tand **${musicPlayer.queue.length - items.length - 1}** more . . .` : ""}`)
        .join("\n");
      embed = new MessageEmbed()
        .setColor("#000000")
        .setAuthor("Music Queue", client.user.displayAvatarURL({ format: "png", dynamic: true }))
        .setDescription(`<#${voiceConnect.joinConfig.channelId}> **Currently Playing:** [*\`${playing.name}\`*](${playing.url}) - <@${playing.user.id}>\n\n${listStr}`);

      await interaction.editReply({ embeds: [ embed ] });
    } else await interaction.editReply("Queue is empty");
  }
}
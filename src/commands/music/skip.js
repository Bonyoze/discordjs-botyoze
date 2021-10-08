const { SlashCommandBuilder } = require("@discordjs/builders"),
{ getVoiceConnection } = require("@discordjs/voice"),
client = require("../../bot.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip the current playing song"),
  async execute(interaction) {
    const guildId = interaction.guildId,
    voiceId = interaction.member.voice.channel !== null && interaction.member.voice.channel.id,
    voiceConnect = getVoiceConnection(guildId);
    
    if (!voiceConnect || voiceId !== voiceConnect.joinConfig.channelId) return await interaction.editReply("⚠ **`You must be in the same voice channel with the bot to use this command`**");
    
    const musicPlayer = client.musicPlayers.get(interaction.guildId);

    if (musicPlayer && musicPlayer.queue.length > 0) {
      const item = musicPlayer.queue[0];

      musicPlayer.player.stop();

      await interaction.editReply(`Skipped \`${item.name}\``);
    } else await interaction.editReply("Nothing is currently playing");
  }
}
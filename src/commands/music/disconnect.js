const { SlashCommandBuilder } = require("@discordjs/builders"),
{ getVoiceConnection } = require("@discordjs/voice"),
client = require("../../bot.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("disconnect")
    .setDescription("Make the bot leave the voice channel"),
  async execute(interaction) {
    const guildId = interaction.guildId,
    voiceId = interaction.member.voice.channel !== null && interaction.member.voice.channel.id,
    voiceConnect = getVoiceConnection(guildId);
    
    if (!voiceConnect || voiceId !== voiceConnect.joinConfig.channelId) return await interaction.editReply("⚠ **`You must be in the same voice channel with the bot to use this command`**");

    if (getVoiceConnection(guildId)) {
      getVoiceConnection(guildId).destroy();
      client.musicPlayers.delete(guildId);
      await interaction.editReply(`Disconnected the bot from <#${voiceId}> (queue was also cleared)`);
    } else await interaction.editReply("Bot is currently not playing audio in a voice channel");
  }
}
const { SlashCommandBuilder } = require("@discordjs/builders"),
{ Collection } = require("discord.js"),
{ getVoiceConnection, joinVoiceChannel, entersState, createAudioPlayer, createAudioResource, VoiceConnectionStatus, AudioPlayerStatus } = require("@discordjs/voice"),
ytdl = require("ytdl-core"),
client = require("../../bot.js");

client.musicPlayers = new Collection();

const evalInput = async (input, user) => {
  let name, media;

  if (ytdl.validateURL(input)) {
    const info = await ytdl.getInfo(input);
    name = info.videoDetails.title;
    media = ytdl(input, { filter: "audioonly" });
  } else {
    const split = input.split("/");
    name = split[split.length - 1];
    media = input;
  }

  return { name: name, media: media, url: input, user: user };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play audio in a voice channel")
    .addStringOption(option =>
      option
        .setName("input")
        .setDescription("YouTube link, Youtube search, audio file or video file")
        .setRequired(true)
    ),
  async execute(interaction) {
    const inputStr = interaction.options.getString("input"),
    guildId = interaction.guildId,
    voiceId = interaction.member.voice.channel !== null && interaction.member.voice.channel.id,
    voiceConnect = getVoiceConnection(guildId);

    if (voiceConnect) { // connection already exists
      if (voiceId !== voiceConnect.joinConfig.channelId) return await interaction.editReply("⚠ **`You must be in the same voice channel with the bot to use this command`**");

      let eval = await evalInput(inputStr, interaction.user);
      eval.interaction = interaction;

      const musicPlayer = client.musicPlayers.get(guildId);
      musicPlayer.queue.push(eval);

      if (musicPlayer.queue.length === 1) { // play first in queue
        musicPlayer.channel = eval.interaction.channel;
        musicPlayer.player.play(createAudioResource(eval.media));
        await interaction.editReply(`Now playing \`${eval.name}\` in <#${voiceId}>`);
      } else await interaction.editReply(`Added \`${eval.name}\` to the queue`);
      return;
    }

    if (!voiceId) return await interaction.editReply("⚠ **`You must be in a voice channel to use this command`**");

    client.musicPlayers.set(guildId, { queue: [] });

    const musicPlayer = client.musicPlayers.get(guildId),
    connection = getVoiceConnection(guildId) ?? joinVoiceChannel({
      channelId: voiceId,
      guildId: guildId,
      adapterCreator: interaction.member.guild.voiceAdapterCreator,
    }),
    player = createAudioPlayer();

    musicPlayer.player = player;
    musicPlayer.queue.push(await evalInput(inputStr, interaction.user));

    player.on(AudioPlayerStatus.Idle, async () => {
      // triggers after done playing a song
      const musicPlayer = client.musicPlayers.get(guildId);
      musicPlayer.queue.shift();
      if (musicPlayer.queue.length > 0) { // try to play the next in queue if it exists
        const item = musicPlayer.queue[0];
        musicPlayer.channel = item.interaction.channel;
        musicPlayer.player.play(createAudioResource(item.media));
        await musicPlayer.channel.send(`Now playing \`${item.name}\` in <#${voiceId}>`);
      }
    });
    
    player.on("error", err => {
      console.error(`[${interaction.id}] Audio Player errored: `, err);
    });

    // play first in queue
    const item = musicPlayer.queue[0];
    musicPlayer.channel = interaction.channel;
    player.play(createAudioResource(item.media));
    await interaction.editReply(`Now playing \`${item.name}\` in <#${voiceId}>`);

    connection.subscribe(player); // have connection use the audio player

    // if bot is truly disconnected, destroy it
    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5000),
        ]);
        // seems to be reconnecting, ignore this disconnect then
      } catch {
        client.musicPlayers.delete(guildId);
        connection.destroy();
        await musicPlayer.channel.send(`Bot lost connection to <#${voiceId}> (queue was also cleared)`);
      }
    });
  }
}
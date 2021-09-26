const { SlashCommandBuilder } = require("@discordjs/builders"),
{ getRedditPosts } = require("../../globals");
fetch = require("node-fetch");

const postFetchSize = 50; // number of video posts to get

let lastPostId;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("inspire")
    .setDescription("View questionable inspirational posters"),
  async execute(interaction) {
    const posts =  await getRedditPosts(
      "inspirobot",
      "hot",
      lastPostId,
      post => !post.data.is_video && post.data.post_hint === "image",
      postFetchSize
    );

    lastPostId = posts[posts.length - 1].data.id;

    await interaction.editReply({ files: [ posts[Math.floor(Math.random() * posts.length)].data.url ] });
  }
}
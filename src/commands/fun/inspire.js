const { SlashCommandBuilder } = require("@discordjs/builders"),
{ getRedditPosts } = require("../../globals");
fetch = require("node-fetch");

const totalPosts = 10; // number of video posts to get

let lastPostId;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("inspire")
    .setDescription("Load a questionable inspirational poster (courtesy of r/inspirobot)"),
  async execute(interaction) {
    const posts = await getRedditPosts(
      "inspirobot",
      "top",
      "all",
      lastPostId,
      post => post.data.post_hint === "image",
      totalPosts
    );

    lastPostId = posts[posts.length - 1].data.id;

    await interaction.editReply({ files: [ posts[Math.floor(Math.random() * posts.length)].data.url ] });
  }
}
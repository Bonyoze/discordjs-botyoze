const { SlashCommandBuilder } = require("@discordjs/builders"),
{ getRedditPosts } = require("../../globals");
fetch = require("node-fetch");

let posts = [];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("inspire")
    .setDescription("Load a questionable inspirational poster (courtesy of r/inspirobot)"),
  async execute(interaction) {
    if (posts.length === 0)
      posts = await getRedditPosts(
        "inspirobot",
        "top",
        "all",
        null,
        post => post.data.post_hint === "image"
      );
    
    const rand = Math.floor(Math.random() * posts.length),
    post = posts[rand];

    posts.splice(rand, 1);

    await interaction.editReply({ files: [ post.data.url ] });
  }
}
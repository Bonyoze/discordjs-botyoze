const { SlashCommandBuilder } = require("@discordjs/builders"),
fetch = require("node-fetch"),
cheerio = require("cheerio");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("garfield")
    .setDescription("Load a random Garfield comic by Jim Davis (courtesy of www.gocomics.com)"),
  async execute(interaction) {
    const url = await fetch("https://www.gocomics.com/random/garfield")
      .then(resp => resp.text())
      .then(body => {
        const html = cheerio.load(body);
        return `${html('meta[property="og:image"]').attr("content")}.jpg`;
      });

    await interaction.editReply({ files: [ url ] });
  }
}
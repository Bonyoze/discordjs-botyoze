const { SlashCommandBuilder } = require("@discordjs/builders"),
fetch = require("node-fetch");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("inspire")
    .setDescription("View questionable inspirational posters"),
  async execute(interaction) {
    await interaction.deferReply();

    try {
      let body = await fetch(
        "https://api.pushshift.io/reddit/search/submission/?subreddit=inspirobot&sort=desc&fields=url&over_18=false&is_video=false&size=100"
      )
        .then(res => res.json())
        .then(body => { return body.data });
      
      while (body.length > 0) {
        let type;

        const index = Math.floor(Math.random() * body.length),
        img = await fetch(
          body[index].url
        )
          .then(res => {
            type = res.headers.get("content-type");
            return res.buffer();
          });
        
        body.splice(index, 1);

        if (type == "image/jpeg" || type == "image/png")
          return await interaction.editReply({
            files: [
              {
                attachment: img,
                name: `inspire.${type == "image/jpeg" ? "jpg" : type == "image/png" && "png"}`
              }
            ]
          });
      }

      return await interaction.editReply("⚠ **`Failed to find image in fetched batch`**");
    } catch (err) {
      console.log(err);
    }
  }
}
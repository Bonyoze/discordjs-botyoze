const { SlashCommandBuilder } = require("@discordjs/builders"),
{ getRedditPosts } = require("../../globals");
fetch = require("node-fetch"),
ffmpeg = require("fluent-ffmpeg"),
fs = require("fs-extra");

const resolutions = [360, 240, 140, 120, "2_4_M", "1_2_M", "600_K"],
totalPosts = 20, // number of video posts to get
vidMaxSize = 8; // megabytes

let lastPostId;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("retardio")
    .setDescription("Load an OKBR video (courtesy of r/okbuddyretard)"),
  async execute(interaction) {
    let posts = await getRedditPosts(
      "okbuddyretard",
      "hot",
      null,
      lastPostId,
      post => post.data.is_video,
      totalPosts
    );

    lastPostId = posts[posts.length - 1].data.id;

    await fs.mkdir(`./tmp/${interaction.id}`);

    let postUseable, post, resolution;
    
    // find a useable post
    while (!postUseable) {
      if (posts.length == 0) return;

      // choose random post
      const rand = Math.floor(Math.random() * posts.length);
      post = posts[rand];
      posts.splice(rand, 1);

      await (async () => {
        for (const res of resolutions) {
          const videoValid = await fetch(`${post.data.url}/DASH_${res}.mp4`)
            .then(async resp => {
              const data = await resp.text();
              if (resp.status != 200 || data.length / 1024 / 1024 >= vidMaxSize) {
                await fetch(`${post.data.url}/DASH_${res}`) // check for old video path
                  .then(async resp => {
                    const data = await resp.text();
                    return resp.status == 200 && data.length / 1024 / 1024 < vidMaxSize;
                  });
              } else return true;
            });
              
          if (videoValid) {
            resolution = res;
            postUseable = true;
            return;
          }
        }
      })();
    }

    // create the file
    const fileDir = `./tmp/${interaction.id}/${post.data.id}.mp4`,
    proc = new ffmpeg()
      .addInput(`${post.data.url}/DASH_${resolution}.mp4`)
      .withVideoCodec("libx264")
      .withVideoBitrate(1000)
      .addOptions(["-crf 24", "-preset veryfast"])
      .output(fileDir)
      .on("end", () => {
        // send file
        interaction.editReply({ files: [ fileDir ] })
          .then(() => {
            fs.rm(`./tmp/${interaction.id}`, { recursive: true });
          });
      });
          
    const audioValid = await fetch(`${post.data.url}/DASH_audio.mp4`)
      .then(async resp => {
        if (resp.status != 200) {
          await fetch(`${post.data.url}/audio`) // check for old audio path
            .then(resp => {
              return resp.status == 200;
            });
        } else return true;
      });

    if (audioValid)
      proc
        .addInput(`${post.data.url}/DASH_audio.mp4`)
        .withAudioCodec("aac");

    proc.run();
  }
}
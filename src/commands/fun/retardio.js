const { SlashCommandBuilder } = require("@discordjs/builders"),
{ MessageAttachment } = require("discord.js"),
{ getRedditPosts } = require("../../globals"),
fetch = require("node-fetch"),
ffmpeg = require("fluent-ffmpeg");

const resolutions = [360, 240, 140, 120, "2_4_M", "1_2_M", "600_K"],
totalPosts = 20, // number of video posts to get
vidMaxSize = 8; // megabytes (will not try to get videos higher than this)

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
    
    // find a post
    const post = await (async () => {
      for (let i = 0; i < posts.length; i++) {
        // choose random post
        const rand = Math.floor(Math.random() * posts.length),
        post = posts[rand];
        posts.splice(rand, 1);

        // check resolutions
        for (const res of resolutions) {
          const videoValid = await fetch(`${post.data.url}/DASH_${res}.mp4`)
            .then(async resp => {
              const data = await resp.text();
              if (resp.status !== 200 || data.length / 1024 / 1024 > vidMaxSize) {
                await fetch(`${post.data.url}/DASH_${res}`) // check for old video path
                  .then(async resp => {
                    const data = await resp.text();
                    return resp.status === 200 && data.length / 1024 / 1024 <= vidMaxSize;
                  });
              } else return true;
            });
                
          if (videoValid)
            return {
              id: post.data.id,
              url: post.data.url,
              resolution: res
            };
        }
      }
    })();

    if (!post) return interaction.editReply({ content: `⚠ **\`Failed to find a post\`**`, ephemeral: true });

    // find audio
    const audioValid = await fetch(`${post.url}/DASH_audio.mp4`)
      .then(async resp => {
        if (resp.status !== 200) {
          await fetch(`${post.url}/audio`) // check for old audio path
            .then(resp => {
              return resp.status === 200;
            });
        } else return true;
      });
    
    // create attachment
    const attachment = await new Promise(resolve => {
      const vidURL = `${post.url}/DASH_${post.resolution}.mp4`,
      fileName = `${post.id}.mp4`;

      if (audioValid) {
        let buffer = new Buffer.alloc(0);

        // combine video with audio
        new ffmpeg()
          .addInput(vidURL)
          .videoCodec("libx264")
          .videoBitrate(1000)
          .addOptions([ "-crf 24", "-preset veryfast" ])
          .addInput(`${post.url}/DASH_audio.mp4`)
          .audioCodec("aac")
          .outputFormat("mp4")
          .outputOption("-movflags frag_keyframe+empty_moov")
          .pipe()
          .on("data", chunk => {
            buffer = Buffer.concat([ buffer, chunk ]);
          })
          .on("end", () => {
            resolve(new MessageAttachment(buffer, fileName));
          });
      } else
        resolve(new MessageAttachment(vidURL, fileName));
    });

    interaction.editReply({ files: [ attachment ] });
  }
}
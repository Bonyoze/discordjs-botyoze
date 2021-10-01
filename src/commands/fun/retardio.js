const { SlashCommandBuilder } = require("@discordjs/builders"),
{ MessageAttachment } = require("discord.js"),
{ getRedditPosts } = require("../../globals"),
fetch = require("node-fetch"),
ffmpeg = require("fluent-ffmpeg");

const resolutions = [ 360, 240, 140, 120 ],
vidMaxSize = 8; // megabytes (will not try to get videos higher than this)

let posts = [];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("retardio")
    .setDescription("Load an OKBR video (courtesy of r/okbuddyretard)"),
  async execute(interaction) {
    if (posts.length === 0)
      posts = await getRedditPosts(
        "okbuddyretard",
        "hot",
        null,
        null,
        post => post.data.is_video && !(post.data.media.reddit_video.is_gif || post.data.secure_media.reddit_video.is_gif)
      );
    
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
              return resp.status === 200 && data.length / 1000 / 1000 <= vidMaxSize;
            });
                
          if (videoValid) {
            // video's good, now check if it has some audio
            const audioValid = await fetch(`${post.data.url}/DASH_audio.mp4`)
              .then(resp => {
                return resp.status === 200;
              });
            
            if (audioValid) {
              // create the buffer
              const buff = await new Promise(resolve => {
                let buff = new Buffer.alloc(0);
                
                // combine video with audio
                new ffmpeg()
                  .addInput(`${post.data.url}/DASH_${res}.mp4`)
                  .videoCodec("libx264")
                  .videoBitrate(1024)
                  .addOptions(["-crf 24", "-preset veryfast" ])
                  .addInput(`${post.data.url}/DASH_audio.mp4`)
                  .audioCodec("aac")
                  .outputFormat("mp4")
                  .outputOption("-movflags frag_keyframe+empty_moov")
                  .pipe()
                  .on("data", chunk => {
                    buff = Buffer.concat([ buff, chunk ]);
                  })
                  .on("end", () => {
                    resolve(buff);
                  });
              });

              // test if it's still under the size limit
              if (Buffer.byteLength(buff) / 1000 / 1000 <= vidMaxSize)
                return {
                  data: buff,
                  title: post.data.title,
                  id: post.data.id
                }
            }
          }
        }
      }
    })();

    if (!post) return interaction.editReply({ content: `⚠ **\`Failed to find a post\`**`, ephemeral: true });

    const fileName = post.title.replace(/[^a-z0-9_\-]/gi, "_");

    interaction.editReply({
      files: [ new MessageAttachment(post.data, `${fileName.length > 0 ? fileName : post.id}.mp4`) ],
      allowedMentions: { parse: [] }
    });
  }
}
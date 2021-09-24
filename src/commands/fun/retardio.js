const { SlashCommandBuilder } = require("@discordjs/builders"),
fetch = require("node-fetch"),
ffmpeg = require("fluent-ffmpeg"),
fs = require("fs-extra");

const resolutions = [360, 240, 140, 120, "2_4_M", "1_2_M", "600_K"],
postBatchSize = 10, // number of video posts to get
vidMaxSize = 8; // megabytes

let lastPostId;

const getVideoPosts = async (sub, sort, limit) => {
  let posts = [],
  after;

  while (posts.length != limit) {
    await fetch(
      `https://www.reddit.com/r/${sub}/${sort}.json?limit=100${after ? `&after=t3_${after}` : lastPostId ? `&after=t3_${lastPostId}` : ""}`
    )
      .then(resp => resp.json())
      .then(async body => {
        for (const post of body.data.children) {
          if (post.data.is_video && !post.data.over_18) {
            posts.push(post);
            if (posts.length == limit) break;
          }
        }
        after = body.data.children[body.data.children.length - 1].data.id;
      });
  }

  lastPostId = after;

  return posts;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("retardio")
    .setDescription("Load a random video from r/okbuddyretard")
    .addNumberOption(option =>
      option
        .setName("amount")
        .setDescription("Amount of videos to fetch")
    ),
  async execute(interaction) {
    await interaction.deferReply();

    const amount = interaction.options.getNumber("amount"),
    total = amount ? Math.min(Math.max(amount, 1), 10) : 1,
    dir = `./tmp/${interaction.id}`;

    let posts = await getVideoPosts("okbuddyretard", "hot", postBatchSize);

    await fs.mkdir(dir);

    for (let i = 0; i < total; i++) {
      await new Promise(async resolve => {
        let postUseable, post, resolution;

        while (!postUseable) {
          if (posts.length == 0) return;

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

        const fileDir = `${dir}/${post.data.id}.mp4`,
        proc = new ffmpeg()
          .addInput(`${post.data.url}/DASH_${resolution}.mp4`)
          .withVideoCodec("libx264")
          .withVideoBitrate(1000)
          .addOptions(["-crf 24", "-preset veryfast"])
          .output(fileDir)
          .on("error", err => {
            console.log("Retardio Ffmpeg Error: " + err);
          })
          .on("end", async () => {
            resolve(fileDir);
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
      })
        .then(async file => {
          await interaction.followUp({ content: total > 1 ? `\`${i + 1}/${total}\`` : undefined, files: [ file ] });
        });
    }
  }
}
const { client } = require("../../bot.js"),
fetch = require("node-fetch");

module.exports = {
  getCommand: async name => {
    const categories = Array.from(client.commands.values());
    for (let i = 0; i < categories.length; i++) {
      const commands = Array.from(categories[i].values());
      for (let ii = 0; ii < commands.length; ii++) {
        const cmd = commands[ii];
        if (cmd.data.name.toLowerCase() === name.toLowerCase()) {
          return cmd;
        }
      }
    }
  },
  getErrInfo: err => {
    const e = err.stack.split("\n"),
    s = e[1].split(/\/|:/);
    return {
      name: e[0],
      file: s[s.length-3].split("src\\").slice(-1)[0],
      line: s[s.length-2],
      column: s[s.length-1].slice(0,-1)
    }
  },
  getRedditPosts: (sub, sort, start, filter, total) => {
    return new Promise(async resolve => {
      let posts = [],
      after;
  
      while (posts.length != total) {
        await fetch(
          `https://www.reddit.com/r/${sub}/${sort}.json?limit=100${after ? `&after=t3_${after}` : start ? `&after=t3_${start}` : ""}`
        )
          .then(resp => resp.json())
          .then(async body => {
            for (const post of body.data.children) {
              if (filter(post) || !filter) {
                posts.push(post);
                if (posts.length == total) break;
              }
            }
            after = body.data.children[body.data.children.length - 1].data.id;
          });
      }
  
      resolve(posts);
    });
  }
}
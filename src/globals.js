const fetch = require("node-fetch");

module.exports = {
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
  getRedditPosts: (sub, sort, time, start, filter, total) => {
    return new Promise(async (resolve, reject) => {
      try {
        let posts = [],
        after;
    
        while (!total || posts.length < total) {
          const batch = await fetch(`https://www.reddit.com/r/${sub}/${sort}.json?limit=100${time ? `&t=${time}` : ""}${after ? `&after=t3_${after}` : start ? `&after=t3_${start}` : ""}`)
            .then(resp => resp.json())
            .then(async body => {
              const children = body.data.children;
              if (children.length > 0) after = children[children.length - 1].data.id;
              return children;
            })

          if (batch.length > 0) {
            for (const post of batch) {
              if (filter(post) || !filter) {
                posts.push(post);
                if (posts.length === total) break;
              }
            }
          }
          
          if (batch.length === 0 || posts.length === total) return resolve(posts);
        }
      } catch(err) {
        reject(err);
      }
    });
  }
}
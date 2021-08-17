const Command = require("../../../structures/Command"),
fetch = require("node-fetch"),
cheerio = require("cheerio"),
qs = require("qs");

module.exports = class Gizoogle extends Command {
  constructor() {
    super({
      name: "gizoogle",
      description: "Gizoogles some text",
      options: [
        {
          type: 3,
          name: "text",
          description: "A sentence",
          required: true
        }
      ],
      category: "fun",
      cooldown: 4
    });
  }

  async run(message) {
    const textInput = message.content.split(" ").slice(1).join(" ");
    
    const payload = qs.stringify({ translatetext: textInput });
    const body = await fetch("http://gizoogle.net/textilizer.php", {
      method: "post",
      body: payload,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(payload, "utf8")
      }
    }).then(res => res.text()).then(body => { return body; });

    const html = cheerio.load(body);

    const textOutput = html('textarea[name="translatetext"]').val();
    
    return await message.channel.send(textOutput != textInput ? textOutput : "⚠ **`Text was unable to be modified (try adding more words)`**");
  }
}
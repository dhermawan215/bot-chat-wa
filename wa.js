import { Client } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
// const { Client } = require("whatsapp-web.js");
// const qrcode = require("qrcode-terminal");

const client = new Client();

client.on("qr", (qr) => {
  // Generate and scan this code with your phone
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message", async (msg) => {
  if (msg.body == "yayacantik") {
    msg.reply(
      "Halo yayaa cantikkk… ttp smgtt truss yaa jalaninn hidupp, lovee youuuuu"
    );
  }
  if (msg.body.startsWith("!echo ")) {
    // Replies with the same message
    msg.reply(msg.body.slice(6));
  }
  if (msg.body === "!mediainfo" && msg.hasMedia) {
    const attachmentData = await msg.downloadMedia();
    msg.reply(`
            *Media info*
            MimeType: ${attachmentData.mimetype}
            Filename: ${attachmentData.filename}
            Data (length): ${attachmentData.data.length}
        `);
  }
});

client.initialize();

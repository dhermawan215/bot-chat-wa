import dotenv from "dotenv";
dotenv.config();
import readline from "readline";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Client } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

// Google Generative AI configuration
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Function to generate response using Gemini
async function getResponse(prompt) {
  try {
    if (!prompt || typeof prompt !== "string") {
      console.error("Invalid prompt:", prompt);
      return "Maaf, permintaan tidak valid.";
    }
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [
            {
              text: "You are a traveller",
            },
          ],
        },
        {
          role: "model",
          parts: [
            {
              text: "Hi my name is Presunive Agent. I will give you some information about travel",
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 200,
      },
    });

    const result = await chat.sendMessage("");
    if (result && result.response) {
      return result.response;
    } else {
      console.error("Unexpected response format:", result);
      return "Maaf, saya tidak dapat memberikan jawaban saat ini.";
    }
  } catch (error) {
    console.error("Error in getResponse:", error);
    return "Maaf, terjadi kesalahan dalam memproses permintaan Anda.";
  }
}

// WhatsApp chatbot initialization
const client = new Client();

client.on("qr", (qr) => {
  // Generate and scan this code with your phone
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message", async (msg) => {
  // Handle pre-defined commands
  if (msg.body === "hallo") {
    msg.reply(
      "Halo, selamat datang, saya adalah asisten virtual untuk rumah makan grombyang pemalang"
    );
  } else if (msg.body.startsWith("!echo ")) {
    // Replies with the same message
    msg.reply(msg.body.slice(6));
  } else if (msg.body === "!mediainfo" && msg.hasMedia) {
    // Handle media info (optional)
    const attachmentData = await msg.downloadMedia();
    msg.reply(`
             *Media info*
             MimeType: ${attachmentData.mimetype}
             Filename: ${attachmentData.filename}
             Data (length): ${attachmentData.data.length}
             `);
  } else {
    try {
      const response = await getResponse(msg.body);

      // Balasan hanya jika response berupa string
      if (typeof response === "string") {
        msg.reply(response);
      } else {
        console.error("Unexpected response format:", response);
        msg.reply("Terjadi kesalahan dalam memproses permintaan Anda.");
      }
    } catch (error) {
      console.error("Error:", error);
      msg.reply(
        "Maaf, saya sedang mengalami gangguan. Silakan coba lagi nanti."
      );
    }
  }
});

client.initialize();

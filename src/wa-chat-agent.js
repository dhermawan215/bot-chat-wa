import dotenv from "dotenv";
dotenv.config();
import readline from "readline";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Client } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

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
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 300,
      },
    });

    const result = await chat.sendMessage("");

    if (
      result &&
      result.response &&
      typeof result.response.text === "function"
    ) {
      const responseText = await result.response.text();
      const finalResponse = `Berikut hasil pencarian dari kami kak:\n\n${responseText}`;
      return finalResponse;
    } else {
      console.error("Unexpected response format:", result);
      return "Maaf, saya tidak dapat memberikan jawaban saat ini.";
    }
  } catch (error) {
    console.error("Error in get response:", error);
    return "Maaf, terjadi kesalahan dalam memproses permintaan Anda.";
  }
}

const client = new Client();

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message", async (msg) => {
  try {
    if (msg.body.toLowerCase() === "hallo") {
      msg.reply("Halo Kak, Selamat datang di Agen Pariwisata Jawa Tengah");
    } else {
      const response = await getResponse(msg.body);

      if (response) {
        msg.reply(response);
      } else {
        msg.reply("Maaf, saya tidak dapat memproses permintaan Anda.");
      }
    }
  } catch (error) {
    console.error("Error processing message:", error);
    msg.reply("Maaf, terjadi kesalahan. Silakan coba lagi.");
  }
});

client.initialize();

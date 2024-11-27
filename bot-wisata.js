import dotenv from "dotenv";
dotenv.config();
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Client } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const wisata = [
  {
    name: "Pantai Widuri",
    location: "Pemalang",
    type: "Pantai",
  },
  { name: "Gunung Slamet", location: "Pemalang", type: "Gunung" },
  { name: "WIsata Guci", location: "Tegal", type: "Alam" },
  { name: "Taman Batik", location: "Pekalongan", type: "Hiburan" },
  {
    name: "Candi Borobudur",
    location: "Magelang",
    type: "Budaya",
  },
  {
    name: "Dataran Tinggi Dieng",
    location: "Wonosobo",
    type: "Alam",
  },
  {
    name: "Kota Lama Semarang",
    location: "Semarang",
    type: "Sejarah",
  },
  { name: "Pantai Kartini", location: "Jepara", type: "Pantai" },
  { name: "Keraton Surakarta", location: "Solo", type: "Budaya" },
];

function recommendWisata(type, maxRecommendations) {
  const recommendations = wisata.filter((w) =>
    w.type.toLowerCase().includes(type.toLowerCase())
  );
  return recommendations
    .slice(0, maxRecommendations)
    .map((w) => `- ${w.name} (${w.location})`)
    .join("\n");
}

async function getResponse(prompt) {
  try {
    if (!prompt || typeof prompt !== "string") {
      return "Maaf, permintaan tidak valid.";
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const chat = model.startChat({
      history: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 300,
      },
    });

    const result = await chat.sendMessage("");
    if (result?.response?.text) {
      const responseText = await result.response.text();
      return `Berikut hasil pencarian dari kami kak:\n\n${responseText}`;
    } else {
      return "Maaf, saya tidak dapat memberikan jawaban saat ini.";
    }
  } catch (error) {
    console.error("Error in getResponse:", error);
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
    const userMessage = msg.body.trim();
    const greetings = [
      "hallo",
      "halo",
      "hai",
      "selamat siang",
      "selamat pagi",
      "halo kak",
      "halo pak",
      "halo bu",
      "assalamualaikum",
    ];

    if (greetings.includes(userMessage.toLowerCase())) {
      msg.reply(
        "Halo Kak, Selamat datang di Agent Wisata Jawa Tengah.\n" +
          "ketik kendala untuk laporan kendala\n" +
          "ketik rekomendasi untuk mendapatkan rekomendasi wisata\n" +
          "atau silahkan ketik informasi yang akan anda cari terkait wisata, hiburan, alam, dsb yang berada di Jawa Tengah"
      );
    } else if (userMessage.toLowerCase().includes("kendala")) {
      msg.reply("Jika terdapat kendala, silakan hubungi team@wisata-jateng.id");
    } else if (userMessage.toLowerCase().includes("rekomendasi")) {
      msg.reply(
        "Untuk memberikan rekomendasi wisata di Jawa Tengah, mohon beritahu saya:\n" +
          "1. Tipe wisata yang Anda inginkan (contoh: Budaya, Pantai, Gunung, Alam), ketik tipe: {pilihan wisata}.\n" +
          "2. Jumlah maksimal rekomendasi (opsional, default: 5)."
      );
    } else if (userMessage.startsWith("tipe:")) {
      const [_, type, maxText] = userMessage.split(":").map((s) => s.trim());
      const maxRecommendations = parseInt(maxText, 10) || 5;
      const recommendations = recommendWisata(type, maxRecommendations);

      if (recommendations) {
        msg.reply(
          `Berikut rekomendasi wisata untuk kategori "${type}":\n\n${recommendations}`
        );
      } else {
        msg.reply("Maaf, saya tidak memiliki data untuk kategori tersebut.");
      }
    } else {
      const response = await getResponse(msg.body);
      msg.reply(response);
    }
  } catch (error) {
    console.error("Error processing message:", error);
    msg.reply("Maaf, terjadi kesalahan. Silakan coba lagi.");
  }
});

client.initialize();

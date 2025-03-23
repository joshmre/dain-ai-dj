import { z } from "zod";
import axios from "axios";
import express from "express";
import { defineDAINService, ToolConfig } from "@dainprotocol/service-sdk";
import { CardUIBuilder, ImageCardUIBuilder } from "@dainprotocol/utils";

const DAIN_PORT = 2022;
const WEBHOOK_PORT = 3001;
let audioUrl: string | null = null; // Declare a variable to hold the audioUrl
let imageUrl: string | null = null; // Declare a variable to hold the imageUrl
let songTitle: string | null = null; // Declare a variable to hold the song title

// 🔧 Express Webhook Listener on port 3001
const webhookApp = express();
webhookApp.use(express.json());

webhookApp.post("/webhook", (req, res) => {
  console.log('Received webhook payload:', req.body); // Log the incoming payload

  const { msg, data } = req.body;

  // Log the data to inspect the structure
  console.log("Data received:", data);

  // Ensure that the necessary data exists
  if (!data || !data.data[0] || !data.data[0].audio_url || !msg) {
    return res.status(400).json({ message: "Invalid webhook payload" });
  }

  // Store the audioUrl and imageUrl in the variables when the music generation is complete
  audioUrl = data.data[0]?.audio_url || null;
  imageUrl = data.data[0]?.image_url || null;
  songTitle = data.data[0]?.title || "Untitled"; // Store the song title
  console.log(`✅ Webhook received - Audio URL: ${audioUrl}`);
  console.log(`✅ Webhook received - Image URL: ${imageUrl}`);
  console.log(`✅ Webhook received - Song Title: ${songTitle}`);

  // Respond back to acknowledge the webhook
  res.json({ message: "Received" });
});

webhookApp.listen(WEBHOOK_PORT, () => {
  console.log(`📡 Webhook server listening on http://localhost:${WEBHOOK_PORT}`);
});

// 🎵 Tool: Generate Music
const generateMusicConfig: ToolConfig = {
  id: "generate-music",
  name: "Generate Music",
  description: "Generates music using Suno API",
  input: z.object({
    prompt: z.string().describe("Lyrics here..."),
    style: z.string().optional(),
    title: z.string().optional(),
    instrumental: z.boolean(),
  }),
  output: z.object({
    taskId: z.string(),
    status: z.string(),
  }),
  pricing: { pricePerUse: 0, currency: "USD" },
  handler: async ({ prompt, style, title, instrumental }, agentInfo) => {
    console.log(`🎤 Agent ${agentInfo.id} requested: ${prompt}`);

    try {
      const response = await axios.post(
        "https://apibox.erweima.ai/api/v1/generate",
        {
          prompt,
          style,
          title,
          customMode: true,
          instrumental,
          model: "V3_5",
          callBackUrl: "https://2109-134-139-201-7.ngrok-free.app/webhook", // CALLBACK_URL
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.SUNO_API_KEY}`,
          },
        }
      );

      const { code, msg, data } = response.data;

      if (code !== 200 || !data?.taskId) {
        throw new Error(msg || "Unknown error from Suno API");
      }

      return {
        text: `🎶 Music generation started!\nUse 'Get Music Result' to check status.`,
        data: {
          taskId: data.taskId,
          status: "pending",
        },
        ui: new CardUIBuilder()
          .setRenderMode("page")
          .title(`Music Generation: ${title || "Untitled"}`)
          .content(
            `Prompt: ${prompt}\nStyle: ${style || "Default"}\n\n⏳ Status: Pending\n🆔 Task ID: ${data.taskId}`
          )
          .build(),
      };
    } catch (error: any) {
      console.error("❌ Music generation failed:", error.message);
      return {
        text: `❌ Music generation failed: ${error.message || "Unknown error"}`,
        data: {
          taskId: "error",
          status: "failed",
        },
        ui: new CardUIBuilder()
          .setRenderMode("page")
          .title("Music Generation Failed")
          .content(`Reason: ${error.message || "Unknown error"}`)
          .build(),
      };
    }
  },
};

// 📥 Tool: Check Music Result
const getMusicResultConfig: ToolConfig = {
  id: "get-music-result",
  name: "Get Music Result",
  description: "Checks the music generation status and audio link",
  input: z.object({}),
  output: z.object({
    audioUrl: z.string().optional(),
    imageUrl: z.string().optional(),
    songTitle: z.string().optional(),
  }),
  handler: async () => {
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
    const maxAttempts = 15; // Increase attempts
    const waitTime = 20000; // Increase waiting time between attempts

    for (let i = 0; i < maxAttempts; i++) {
      // Check if the audioUrl and imageUrl have been set from the webhook
      if (audioUrl && imageUrl && songTitle) {
        return {
          text: `✅ Music complete!\n\n[🎧 Listen here](${audioUrl})`,
          data: { audioUrl, imageUrl, songTitle },
          ui: new CardUIBuilder()
            .setRenderMode("page")
            .title(`Song "${songTitle}" Created`)
            .addChild(
              new ImageCardUIBuilder(imageUrl)
                .build()
            )
            .content(`🎧 [Click here to listen](${audioUrl})`)
            .build(),
        };
      }

      await delay(waitTime); // wait longer before retrying
    }

    throw new Error("Still generating music. Try again in a few minutes!");
  },
};

// 🧠 DAIN Service setup
const dainService = defineDAINService({
  metadata: {
    title: "DJ Butterfly DAIN Service",
    description: "Uses Suno to generate music",
    version: "1.0.0",
    author: "Your Name",
    tags: ["music", "generation", "ai"],
  },
  identity: {
    apiKey: process.env.DAIN_API_KEY,
  },
  tools: [generateMusicConfig, getMusicResultConfig],
});

// 🚀 Start DAIN service on port 2022
dainService.startNode({ port: DAIN_PORT }).then(({ address }) => {
  console.log(`🧠 DAIN service running on http://localhost:${address().port}`);
});

import express from "express"
import cors from "cors"
import { GoogleGenAI } from "@google/genai"
import dotenv from "dotenv"
import multer from "multer"
import { fileURLToPath } from "url"
import path from "path"
import fs from "fs"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const publicDir = fs.existsSync(path.join(__dirname, "public"))
  ? path.join(__dirname, "public")
  : __dirname
app.use(express.static(publicDir))

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    file.mimetype.startsWith("image/") ? cb(null, true) : cb(new Error("Only image files allowed"))
  }
})

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
const GEMINI_MODEL = "gemini-2.5-flash"

app.post("/api/chat", async (req, res) => {
  const { message, history = [], lang = "id" } = req.body
  if (!message?.trim()) return res.status(400).json({ error: "Message required" })

  const systemInstruction = lang === "en"
    ? `You are a helpful chef assistant. When given ingredients or a food topic, give a clear structured cooking recipe.
Format with: **Dish Name** as title, **Ingredients** as bullet list, **Steps** as numbered list with time estimates per step (e.g. "Boil water — 5 minutes"), **Tips** if any.
Remember the conversation context and refer back to previous messages when relevant.`
    : `Kamu adalah asisten chef yang ramah. Ketika diberi bahan atau topik makanan, berikan resep masakan yang jelas.
Format dengan: **Nama Masakan** sebagai judul, **Bahan-bahan** sebagai daftar bullet, **Langkah** sebagai nomor dengan estimasi waktu per langkah (contoh: "Rebus air — 5 menit"), **Tips** jika ada.
Ingat konteks percakapan sebelumnya dan rujuk kembali jika relevan.`

  const contents = [
    ...history.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    })),
    { role: "user", parts: [{ text: message }] }
  ]

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: { systemInstruction }
    })
    res.json({ reply: response.text })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error generating recipe" })
  }
})

app.post("/api/image-recipe", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Image required" })
  const { lang = "id", prompt: customPrompt } = req.body

  const defaultPrompt = lang === "en"
    ? "Identify the food or ingredients in this image. Provide a structured recipe with: **Dish Name**, **Ingredients** bullet list, **Steps** numbered with time per step (e.g. 'Fry chicken — 10 minutes'), **Tips**."
    : "Identifikasi makanan atau bahan dalam gambar ini. Berikan resep terstruktur dengan: **Nama Masakan**, daftar **Bahan-bahan**, **Langkah** bernomor dengan waktu per langkah (contoh: 'Goreng ayam — 10 menit'), **Tips**."

  try {
    const base64Image = req.file.buffer.toString("base64")
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        { text: customPrompt || defaultPrompt },
        { inlineData: { mimeType: req.file.mimetype, data: base64Image } }
      ]
    })
    res.json({ result: response.text })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error processing image" })
  }
})


app.post("/api/parse-recipe", async (req, res) => {
  const { recipeText, lang = "id" } = req.body
  if (!recipeText?.trim()) return res.status(400).json({ error: "Recipe text required" })

  const prompt = `Parse this recipe text into a JSON object. Return ONLY valid JSON, no markdown, no extra text.

Recipe:
${recipeText}

JSON structure:
{
  "title": "Recipe title",
  "subtitle": "Short one-line description",
  "total_time": "e.g. 30 menit",
  "servings": "e.g. 4 porsi",
  "difficulty": "Mudah / Sedang / Sulit",
  "ingredients": ["ingredient 1", "ingredient 2"],
  "steps": [
    { "text": "Step description", "time": "5 menit" },
    { "text": "Step with no time", "time": null }
  ],
  "tips": ["tip 1"]
}

For steps: extract any time mentioned in each step. If no time, set null.`

  try {
    const response = await ai.models.generateContent({ model: GEMINI_MODEL, contents: prompt })
    const raw = response.text.replace(/```json|```/g, "").trim()
    const data = JSON.parse(raw)
    res.json(data)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error parsing recipe" })
  }
})

app.use((err, req, res, next) => res.status(400).json({ error: err.message }))

app.listen(3000, () => {
  console.log(`Find Your Recipe → http://localhost:3000`)
  console.log(`Serving static files from: ${publicDir}`)
})
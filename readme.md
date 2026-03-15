# 🍳 Find Your Recipe

> AI-powered cooking assistant — type your ingredients or upload a photo, get a recipe instantly, export to PDF. Powered by Gemini.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat&logo=express&logoColor=white)
![Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=flat&logo=google&logoColor=white)

---

## ✨ Features

- **Text → Recipe** — Ketik bahan yang kamu punya, AI langsung buatkan resep lengkap
- **Photo → Recipe** — Upload foto makanan atau bahan, AI identifikasi dan buat resepnya
- **Export PDF** — Download resep sebagai PDF dengan cooking timeline per langkah
- **Bilingual** — Support Bahasa Indonesia & English
- **Dark / Light Theme** — Toggle tema sesuai selera

---

## 📁 Project Structure

```
find-your-recipe/
├── server.js        # Express server + Gemini API endpoints
├── index.html       # HTML markup
├── style.css        # Styling + dark/light theme
├── app.js           # Frontend logic + PDF generation (jsPDF)
├── .env             # API key (jangan di-commit!)
├── .env.example     # Template environment variables
├── readme.md
└── package.json
```

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/BronyaVollerei7/find-your-recipe-ai-assistant.git
cd find-your-recipe
npm install
```

### 2. Setup Environment

Copy file `.env.example` dan isi API key kamu:

```bash
cp .env.example .env
```

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Dapatkan API key gratis di [Google AI Studio](https://aistudio.google.com/app/apikey).

### 3. Jalankan Server

```bash
node server.js
```

Buka browser di **`http://localhost:3000`**

> ⚠️ Jangan buka `index.html` langsung — harus lewat `http://localhost:3000` agar API bisa berjalan.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Generate resep dari teks bahan |
| `POST` | `/api/image-recipe` | Generate resep dari foto |
| `POST` | `/api/parse-recipe` | Parse resep ke JSON untuk PDF |

### `/api/chat`
```json
// Request
{ "message": "ayam, bawang putih, tomat", "lang": "id" }

// Response
{ "reply": "## Ayam Tumis Tomat\n..." }
```

### `/api/image-recipe`
```
// Request: multipart/form-data
image: <file>
lang: "id" | "en"
prompt: "optional custom prompt"

// Response
{ "result": "## Ayam Geprek\n..." }
```

### `/api/parse-recipe`
```json
// Request
{ "recipeText": "...", "lang": "id" }

// Response
{
  "title": "Ayam Goreng Crispy",
  "subtitle": "Resep ayam goreng renyah",
  "total_time": "45 menit",
  "servings": "4 porsi",
  "difficulty": "Mudah",
  "ingredients": ["500g ayam", "..."],
  "steps": [
    { "text": "Cuci ayam hingga bersih", "time": null },
    { "text": "Rebus air hingga mendidih", "time": "5 menit" }
  ],
  "tips": ["Gunakan minyak panas agar hasil lebih crispy"]
}
```

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Node.js, Express |
| AI | Google Gemini 2.5 Flash |
| File Upload | Multer |
| Frontend | Vanilla JS, HTML, CSS |
| PDF | jsPDF (client-side) |
| Font | Cormorant Garamond, Syne (Google Fonts) |

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "express": "^4.x",
    "cors": "^2.x",
    "@google/genai": "latest",
    "dotenv": "^16.x",
    "multer": "^1.x"
  }
}
```

---

## 🔒 Environment Variables

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key |

---

*Created with stress & coffee ☕*
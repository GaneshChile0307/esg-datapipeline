# ESG Reporting Dashboard

Full-stack ESG reporting application with AI-powered strategy generation.

## 🚀 Features

- **Data Entry** - Form with validation and server-side persistence
- **Visualization** - Interactive emissions chart with Recharts
- **AI Strategy Generation** - Google Gemini integration with mock fallback
- **PDF Export** - Professional report download (bonus task)

## 🛠️ Tech Stack

Next.js 16 • TypeScript • Tailwind CSS • Recharts • Google Gemini API • jsPDF

## 📦 Quick Start

```bash
# Install
npm install

# Run
npm run dev

# Open http://localhost:3000
```

## 🔑 AI Setup (Optional)

1. Get free API key: https://aistudio.google.com/apikey
2. Add to `.env`:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
3. Restart server

**Note:** Works without API key using intelligent mock strategies.

## 📖 Usage

1. **Enter Data** → Fill form → Save
2. **View Chart** → Auto-updates with saved data
3. **Generate Strategy** → AI creates 3 variants → Select one
4. **Download PDF** → Professional report with chart and strategy

## 📁 Project Structure

```
app/
├── api/              # Backend endpoints
├── components/       # React components
└── page.tsx         # Main dashboard
types/               # TypeScript types
data/                # JSON storage (auto-generated)
```


## 🌟 Key Features

- Real AI integration (Google Gemini)
- Smart fallback to mock mode
- Type-safe with TypeScript
- Server-side data persistence
- Professional UI with Tailwind
- Zero linting errors

## 📝 Environment Variables

```bash
GEMINI_API_KEY=your_key_here  # Optional - uses mock if not provided
NODE_ENV=development
```

## 🔒 Security

- API keys stored in `.env` (gitignored)
- User data in `/data` (gitignored)
- Server-side validation

## 📄 License

Created for ESG Reporting Interview Task - February 2026

---

**Built with Next.js, TypeScript, and Google Gemini AI** 🚀

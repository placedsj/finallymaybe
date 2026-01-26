# FDSJ-739 Evidence Platform

A comprehensive evidence management system for legal case documentation, featuring AI-powered forensic analysis, exhibit organization, and legal brief generation.

## 📋 Quick Start

### Prerequisites
- **Node.js** 16+ ([Download](https://nodejs.org/))
- **Python** 3.8+ ([Download](https://www.python.org/))
- **Gemini API Key** (Free - [Get here](https://aistudio.google.com/app/apikey))

### Setup (First Time Only)

```powershell
# Run the setup script
.\setup.ps1
```

The setup script will:
- ✓ Check Node.js and Python installation
- ✓ Install npm dependencies
- ✓ Install Python packages
- ✓ Create `.env.local` configuration file
- ✓ Optimize the database

### Launch

```powershell
.\launch.ps1
```

Opens both servers and launches the app in your browser at `http://localhost:3000`

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FDSJ-739 Evidence Platform                │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐                ┌────────────────────┐
│   Frontend (React)   │  ◄────HTTP───► │  Backend (Flask)   │
│                      │                 │                    │
│ Port 3000           │                 │ Port 5000          │
│ - Dashboard         │                 │ - Exhibit API      │
│ - Exhibits List     │                 │ - Search API       │
│ - Timeline          │                 │ - Statistics       │
│ - AI Analysis       │                 │ - Export           │
└──────────────────────┘                └────────────────────┘
         │                                       │
         │ Cache (IndexedDB)                    │ SQLite Database
         │                                       │
         └───────────────────────┬───────────────┘
                                 │
                        ┌────────▼────────┐
                        │  FDSJ739_      │
                        │  EVIDENCE.db   │
                        │                │
                        │ - Exhibits     │
                        │ - OCR Content  │
                        │ - Metadata     │
                        └────────────────┘
```

### Frontend Stack
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite (lightning fast)
- **UI Components**: Lucide React icons
- **Charts**: Recharts (timeline, statistics)
- **Local Database**: Dexie (IndexedDB wrapper)
- **AI**: Google Gemini 2.0 Flash

### Backend Stack
- **Server**: Flask (Python)
- **Database**: SQLite3
- **Database Size**: ~500MB+ (optimized with indexes)
- **API**: RESTful JSON endpoints

---

## 🚀 Running the Application

### Development Mode

```powershell
# Terminal 1: Start Backend
python api_server.py

# Terminal 2: Start Frontend
npm run dev
```

Then open: `http://localhost:3000`

### Production Build

```powershell
# Build optimized frontend bundle
npm run build

# Built files in: dist/
# Serve with: npm run preview
```

---

## 📚 API Documentation

### Backend Endpoints

**Get Exhibits**
```
GET /api/exhibits?page=0&limit=50&category=ASSAULT
```

**Get Critical Exhibits** (Priority 10 only)
```
GET /api/exhibits/critical
```

**Search Specific Exhibit**
```
GET /api/exhibits/<exhibit_number>
```

**Get Statistics**
```
GET /api/stats
```

**Export Index**
```
GET /api/export/index
```

Full API documentation: [API_DOCS.md](API_DOCS.md)

---

## ⚙️ Configuration

### Environment Variables (.env.local)

```env
# Your Gemini API key (free from https://aistudio.google.com/app/apikey)
VITE_GEMINI_API_KEY=your_key_here

# Backend server URL
VITE_API_URL=http://localhost:5000

# Environment
VITE_ENV=development
```

### Database Optimization

The database is automatically optimized on setup, but you can manually optimize:

```powershell
npm run optimize-db
```

Or directly:
```powershell
python scripts/optimize_db.py
```

---

## 📂 Project Structure

```
finallymaybe/
├── src/
│   ├── App.tsx                 # Main React component
│   ├── index.tsx              # Entry point
│   ├── types.ts               # TypeScript interfaces
│   ├── constants.ts           # Constants & colors
│   ├── exhibitData.ts         # CSV exhibit data
│   ├── components/            # React components
│   │   ├── Dashboard.tsx
│   │   ├── ExhibitList.tsx
│   │   ├── CaseTimeline.tsx
│   │   └── ...
│   └── services/              # API & utility services
│       ├── apiClient.ts       # Backend API client
│       ├── geminiService.ts   # Gemini AI integration
│       └── db.ts              # IndexedDB setup
│
├── api_server.py              # Flask backend
├── integrate_ocr.py           # OCR data processing
├── evidence_database.py       # Database utilities
│
├── scripts/
│   └── optimize_db.py         # Database optimization
│
├── FDSJ739_EVIDENCE.db        # SQLite database
├── package.json               # Node dependencies
├── requirements.txt           # Python dependencies
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
│
├── setup.ps1                  # Setup script (Windows)
└── launch.ps1                 # Launch script (Windows)
```

---

## 🔍 Key Features

### 📊 Dashboard
- Evidence summary statistics
- Priority breakdown
- Category analysis
- Timeline visualization

### 🗂️ Exhibit Management
- Search and filter exhibits by category/priority
- View detailed exhibit information
- OCR text extraction and search
- Forensic metadata analysis

### 📈 Case Timeline
- Chronological display of incidents
- Document relationships
- Evidence correlation
- Legal timeline construction

### 🤖 AI Forensics
- Gemini-powered evidence analysis
- Perjury detection
- Best interest factor mapping
- Legal relevance scoring

### 💬 Legal Chatbot
- Evidence Q&A
- Case strategy discussion
- Brief generation assistance
- Legal research support

### 📄 Document Generation
- Affidavit drafting
- Exhibit books
- Evidence summaries
- Legal briefs

---

## 🐛 Troubleshooting

### Port Already in Use
```powershell
# Find and kill process on port 3000
Get-Process | Where-Object {$_.Port -eq 3000}
```

### API Key Issues
- Get free Gemini API key: https://aistudio.google.com/app/apikey
- Add to `.env.local` file
- Restart frontend (npm run dev)

### Database Errors
```powershell
# Rebuild indexes
python scripts/optimize_db.py

# Backup current database
Copy-Item FDSJ739_EVIDENCE.db FDSJ739_EVIDENCE.backup.db
```

### Slow Performance
- Run database optimization: `npm run optimize-db`
- Clear browser cache
- Check Task Manager for resource usage
- Reduce visible exhibits (use pagination)

---

## 📈 Performance Metrics

| Operation | Target | Status |
|-----------|--------|--------|
| Initial Load | <2s | ✅ |
| Load 50 Exhibits | <100ms | ✅ |
| Search 10K Records | <200ms | ⏳ (In Progress) |
| Export Index | <5s | ✅ |
| FTS Search | <100ms | ⏳ (In Progress) |

---

## 🔐 Security Notes

- Local development only (no authentication required)
- API keys stored in `.env.local` (not committed to git)
- Database file is local (no cloud sync)
- For production: Add authentication, HTTPS, and proper security measures

---

## 📄 License

Case Management System - FDSJ-739-2024

---

## 📞 Support

For issues or questions:
1. Check [API_DOCS.md](API_DOCS.md) for API details
2. Review browser console for error messages
3. Check Flask console for backend errors
4. Verify `.env.local` configuration

---

**Last Updated**: January 18, 2026

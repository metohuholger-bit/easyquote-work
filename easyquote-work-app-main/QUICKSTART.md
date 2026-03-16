# Quick Start Guide - EasyQuote Work

Get EasyQuote Work running locally in 10 minutes!

## 🚀 Quick Setup

### Prerequisites
- Node.js 16+ installed
- Python 3.10+ installed
- MongoDB installed and running

### 1️⃣ Clone Repository

```bash
git clone <your-repository-url>
cd easyquote-work
```

### 2️⃣ Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Edit .env and set MongoDB URL
# MONGO_URL=mongodb://localhost:27017
# DB_NAME=easyquote_work

# Start backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

Backend running at: **http://localhost:8001** ✅

### 3️⃣ Setup Frontend (New Terminal)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
yarn install

# Create environment file
cp .env.example .env

# Edit .env
# REACT_APP_BACKEND_URL=http://localhost:8001

# Start frontend
yarn start
```

Frontend running at: **http://localhost:3000** ✅

### 4️⃣ Open Browser

Visit **http://localhost:3000**

You should see the EasyQuote Work dashboard! 🎉

---

## 📝 First Steps in the App

1. **Add a Customer**
   - Click "Clienti" in bottom nav
   - Click "Nuovo" button
   - Fill in customer details
   - Click "Salva"

2. **Create Price List**
   - Click "Listino" in bottom nav
   - Add your services with prices
   - Example: "Taglio erba" - 0.50 €/mq

3. **Create a Quote**
   - Click "Preventivo" in bottom nav
   - Select customer
   - Add job items with quantities
   - See automatic total calculation
   - Click "Salva Preventivo"

4. **Download PDF**
   - Go to "Storico"
   - Click download icon on a quote
   - Professional PDF will download

5. **Configure Your Company**
   - Click ⚙️ settings icon in header
   - Fill in your business details
   - Upload logo (optional)
   - Save settings
   - Your data will appear in PDFs!

---

## 🔧 Troubleshooting

### MongoDB Connection Error
```bash
# Start MongoDB
sudo systemctl start mongodb  # Linux
brew services start mongodb-community  # macOS
```

### Port Already in Use
```bash
# Kill process on port 8001
lsof -i :8001
kill -9 <PID>
```

### Frontend Not Loading
```bash
# Clear cache and reinstall
rm -rf node_modules
yarn install
yarn start
```

---

## 🚢 Deploy to Production

See **VERCEL_DEPLOYMENT.md** for detailed deployment instructions.

Quick deploy:
- **Frontend**: Push to GitHub → Import to Vercel
- **Backend**: Deploy on Railway or Heroku
- **Database**: Use MongoDB Atlas (free tier)

---

## 📚 Full Documentation

- **README.md** - Complete documentation
- **DEPLOYMENT.md** - All deployment options
- **VERCEL_DEPLOYMENT.md** - Vercel-specific guide

---

## 🆘 Need Help?

1. Check the full README.md
2. Check DEPLOYMENT.md for deployment issues
3. Open an issue on GitHub

---

**Happy building!** 🎉

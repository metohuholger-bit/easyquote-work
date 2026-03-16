# Deploy EasyQuote Work on Vercel

This guide shows you how to deploy **EasyQuote Work** on Vercel (Frontend) with Railway (Backend) or your own backend server.

## 🎯 Deployment Architecture

- **Frontend**: Vercel (React app)
- **Backend**: Railway, Heroku, or your own server (FastAPI)
- **Database**: MongoDB Atlas (recommended)

---

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas**: Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas)
3. **Backend hosting**: Railway, Heroku, or custom server
4. **GitHub Account**: To connect your repository

---

## Part 1: Setup MongoDB Atlas

### Step 1: Create Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new project: "EasyQuote Work"
3. Build a cluster (Free tier is sufficient)
4. Wait for cluster creation (~3-5 minutes)

### Step 2: Configure Database Access

1. **Database Access** → **Add New Database User**
   - Username: `easyquote_admin`
   - Password: Generate secure password (save it!)
   - Database User Privileges: "Read and write to any database"

2. **Network Access** → **Add IP Address**
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add specific IPs for better security

### Step 3: Get Connection String

1. Click **Connect** on your cluster
2. Choose **Connect your application**
3. Copy the connection string:
   ```
   mongodb+srv://easyquote_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password

---

## Part 2: Deploy Backend

### Option A: Deploy on Railway (Recommended)

#### Step 1: Sign up and Create Project

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **New Project** → **Deploy from GitHub repo**
4. Select your repository
5. Select the `/backend` folder as root

#### Step 2: Add MongoDB Plugin

1. In your Railway project, click **New** → **Database** → **Add MongoDB**
2. Railway will automatically create a MongoDB instance
3. Copy the `MONGO_URL` from the MongoDB service

#### Step 3: Configure Backend

1. Go to your backend service **Variables** tab
2. Add these environment variables:
   ```
   MONGO_URL=<your-mongodb-atlas-url>
   DB_NAME=easyquote_work
   CORS_ORIGINS=https://your-vercel-app.vercel.app
   PORT=8001
   ```

3. Add a **start command**:
   - Go to **Settings** → **Start Command**
   - Enter: `uvicorn server:app --host 0.0.0.0 --port $PORT`

4. **Deploy**! Railway will automatically build and deploy

5. Copy your backend URL: `https://your-app-name.railway.app`

### Option B: Deploy on Heroku

#### Step 1: Install Heroku CLI

```bash
curl https://cli-assets.heroku.com/install.sh | sh
heroku login
```

#### Step 2: Create Heroku App

```bash
cd backend
heroku create easyquote-backend
```

#### Step 3: Configure Environment

```bash
heroku config:set MONGO_URL="mongodb+srv://user:pass@cluster.mongodb.net"
heroku config:set DB_NAME="easyquote_work"
heroku config:set CORS_ORIGINS="https://your-vercel-app.vercel.app"
```

#### Step 4: Create Procfile

Create `backend/Procfile`:
```
web: uvicorn server:app --host 0.0.0.0 --port $PORT
```

#### Step 5: Deploy

```bash
git add .
git commit -m "Add Procfile"
git push heroku main
```

Your backend URL: `https://easyquote-backend.herokuapp.com`

---

## Part 3: Deploy Frontend on Vercel

### Step 1: Prepare Frontend

1. Make sure your code is pushed to GitHub
2. Update `frontend/.env` with your backend URL:
   ```env
   REACT_APP_BACKEND_URL=https://your-backend.railway.app
   ```

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `yarn build`
   - **Output Directory**: `build`

### Step 3: Configure Environment Variables

In Vercel project settings → **Environment Variables**, add:

| Name | Value |
|------|-------|
| `REACT_APP_BACKEND_URL` | `https://your-backend.railway.app` |

### Step 4: Deploy

1. Click **Deploy**
2. Wait for build to complete (~2-3 minutes)
3. Your app will be live at: `https://your-app.vercel.app`

### Step 5: Update Backend CORS

Go back to your backend (Railway/Heroku) and update CORS_ORIGINS:
```
CORS_ORIGINS=https://your-app.vercel.app
```

---

## Part 4: Test Your Deployment

### Backend Health Check

Test your backend API:
```bash
curl https://your-backend.railway.app/api/customers
```

Expected response: `[]` (empty array)

### Frontend Check

1. Visit `https://your-app.vercel.app`
2. You should see the EasyQuote Work dashboard
3. Try creating a customer
4. Try creating a quote
5. Test PDF generation

---

## Part 5: Configure Company Settings

1. Go to your deployed app
2. Click the settings icon (⚙️) in the header
3. Fill in your company details:
   - Company name
   - Owner name
   - VAT number
   - Tax code
   - Address
   - Phone
   - Email
   - Upload logo (optional)
4. Click **Save**

Your company details will now appear in all generated PDFs!

---

## 🔧 Troubleshooting

### CORS Errors

If you see CORS errors in the browser console:

1. Check that `CORS_ORIGINS` in backend matches your Vercel URL
2. Include the protocol: `https://your-app.vercel.app`
3. No trailing slash

### API Connection Failed

1. Verify `REACT_APP_BACKEND_URL` in Vercel environment variables
2. Make sure backend is running (check Railway/Heroku logs)
3. Test backend URL directly in browser

### MongoDB Connection Error

1. Check MongoDB Atlas is running
2. Verify connection string is correct
3. Ensure IP whitelist includes 0.0.0.0/0
4. Check database user credentials

### Build Failed on Vercel

1. Check build logs in Vercel dashboard
2. Verify all dependencies are in `package.json`
3. Make sure `REACT_APP_BACKEND_URL` is set

### PDF Generation Not Working

1. Check backend logs for WeasyPrint errors
2. Verify company settings are configured
3. Test PDF endpoint directly:
   ```bash
   curl https://your-backend.railway.app/api/quotes/<quote-id>/pdf
   ```

---

## 📱 Custom Domain (Optional)

### Add Custom Domain to Vercel

1. Go to Vercel project → **Settings** → **Domains**
2. Add your domain: `app.yourdomain.com`
3. Configure DNS:
   - Type: CNAME
   - Name: app
   - Value: cname.vercel-dns.com

### Update Backend CORS

Update `CORS_ORIGINS` to include your custom domain:
```
CORS_ORIGINS=https://app.yourdomain.com,https://your-app.vercel.app
```

---

## 🔒 Security Best Practices

1. **Use Environment Variables**: Never hardcode credentials
2. **Enable HTTPS**: Vercel and Railway provide this automatically
3. **Restrict CORS**: Only allow your frontend domain
4. **MongoDB Security**:
   - Use strong passwords
   - Limit IP access if possible
   - Enable MongoDB authentication
5. **Regular Backups**: Setup automated MongoDB backups

---

## 📈 Monitoring & Maintenance

### Vercel Analytics

Enable analytics in Vercel dashboard for:
- Page views
- Performance metrics
- Error tracking

### Railway/Heroku Monitoring

- Check logs regularly
- Set up alerts for errors
- Monitor resource usage

### Database Monitoring

MongoDB Atlas provides:
- Real-time performance metrics
- Query analytics
- Alert configuration

---

## 🚀 Scaling Tips

1. **Database**: Upgrade MongoDB cluster as data grows
2. **Backend**: Railway/Heroku auto-scale with paid plans
3. **Frontend**: Vercel CDN handles scaling automatically
4. **Caching**: Implement Redis for frequently accessed data
5. **CDN**: Use for static assets and images

---

## 💰 Cost Estimate

### Free Tier (Sufficient for testing)
- **Vercel**: Free (hobby plan)
- **Railway**: $5/month credit free
- **MongoDB Atlas**: Free (512MB storage)
- **Total**: $0-5/month

### Production (Small business)
- **Vercel Pro**: $20/month
- **Railway**: $10-20/month
- **MongoDB Atlas**: $9/month (2GB storage)
- **Total**: ~$40-50/month

---

## 🎉 You're Done!

Your EasyQuote Work app is now:
- ✅ Deployed on Vercel (frontend)
- ✅ Backend hosted on Railway/Heroku
- ✅ Database on MongoDB Atlas
- ✅ Accessible worldwide
- ✅ Production-ready

For updates:
1. Push changes to GitHub
2. Vercel auto-deploys frontend
3. Railway/Heroku auto-deploys backend

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [React Documentation](https://react.dev)

---

**Need Help?** Open an issue on GitHub or check the main README.md

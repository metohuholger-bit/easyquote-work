# Vercel Deployment Instructions - Updated

## ✅ Build Issues Fixed

The frontend has been updated with compatible dependency versions:
- `ajv@^8.12.0`
- `ajv-keywords@^5.1.0`
- `schema-utils@^4.2.0`

The app now builds successfully with `npm install --legacy-peer-deps` and `npm run build`.

---

## 🚀 Deploy Frontend to Vercel

### Method 1: Vercel Dashboard (Recommended)

1. **Push to GitHub** (if not already done)

2. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click **"Add New..."** → **"Project"**

3. **Import Repository**
   - Select your GitHub repository
   - Click **"Import"**

4. **Configure Build Settings**
   ```
   Framework Preset: Create React App
   Root Directory: frontend
   Build Command: npm install --legacy-peer-deps && npm run build
   Output Directory: build
   Install Command: npm install --legacy-peer-deps
   ```

5. **Add Environment Variable**
   - Click **"Environment Variables"**
   - Add variable:
     - Name: `REACT_APP_BACKEND_URL`
     - Value: `https://your-backend.railway.app` (or your backend URL)
   - Select all environments (Production, Preview, Development)

6. **Deploy**
   - Click **"Deploy"**
   - Wait 2-3 minutes for build to complete
   - Your app will be live at: `https://your-app.vercel.app`

---

### Method 2: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy from frontend directory**
   ```bash
   cd frontend
   vercel
   ```

4. **Set environment variable**
   ```bash
   vercel env add REACT_APP_BACKEND_URL production
   # Enter your backend URL when prompted
   ```

5. **Deploy to production**
   ```bash
   vercel --prod
   ```

---

## 🔧 Troubleshooting

### Build Still Fails on Vercel?

If you still see ajv errors:

1. **Override build command in Vercel**:
   ```bash
   npm install --legacy-peer-deps && npm run build
   ```

2. **Or use custom build script**:
   - Build Command: `./build-vercel.sh`

3. **Check Node version**:
   - Add `.nvmrc` file with Node version:
     ```
     16
     ```

### CORS Errors After Deployment

Update backend CORS settings to include your Vercel URL:
```env
CORS_ORIGINS=https://your-app.vercel.app
```

### Environment Variable Not Working

1. Go to Vercel project settings
2. Navigate to **"Environment Variables"**
3. Ensure `REACT_APP_BACKEND_URL` is set
4. Redeploy by clicking **"Redeploy"** button

---

## 📦 What's Included

The updated `package.json` now includes:
- ✅ `ajv@^8.12.0` - JSON schema validator
- ✅ `ajv-keywords@^5.1.0` - Additional keywords for ajv
- ✅ `schema-utils@^4.2.0` - Schema validation utilities
- ✅ Resolutions to force compatible versions

---

## ✨ Verify Build Locally

Before deploying to Vercel, test locally:

```bash
cd frontend

# Clean install
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Build
npm run build

# Should see:
# "Compiled successfully."
# File sizes after gzip shown
```

---

## 🎯 Complete Deployment Checklist

- [ ] Push code to GitHub
- [ ] Backend deployed (Railway/Heroku)
- [ ] MongoDB Atlas configured
- [ ] Backend URL noted
- [ ] Import project to Vercel
- [ ] Set `REACT_APP_BACKEND_URL` in Vercel
- [ ] Configure build command with `--legacy-peer-deps`
- [ ] Deploy and verify
- [ ] Update backend CORS with Vercel URL
- [ ] Test all features (customers, quotes, PDF, Excel)

---

## 🔗 Related Files

- `package.json` - Updated with compatible dependencies
- `vercel.json` - Vercel configuration
- `build-vercel.sh` - Custom build script
- `.env.example` - Environment variables template

---

## 📝 Build Command Reference

**For Vercel Dashboard:**
```bash
npm install --legacy-peer-deps && npm run build
```

**For package.json scripts:**
```json
{
  "scripts": {
    "vercel-build": "npm install --legacy-peer-deps && npm run build"
  }
}
```

---

## 🎉 Success!

Once deployed, your EasyQuote Work app will be:
- ✅ Live on Vercel with global CDN
- ✅ Automatic HTTPS
- ✅ Auto-deploy on git push
- ✅ Preview deployments for branches
- ✅ Built successfully without errors

Visit your deployed app and test all features!

---

**Need help?** Check the main VERCEL_DEPLOYMENT.md or open an issue.

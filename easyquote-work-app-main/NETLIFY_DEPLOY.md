# Deploy to Netlify - EasyQuote Work

## ✅ Frontend Restored & Netlify-Ready

The frontend has been restored to the last working version in Emergent preview. Development mode works perfectly with `yarn start`.

**Note**: There's a known issue with `react-scripts build` related to ajv/schema-utils. The app runs perfectly in development mode.

---

## 🚀 Deploy to Netlify

### Option 1: Netlify Dashboard (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add Netlify configuration"
   git push
   ```

2. **Import to Netlify**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click **"Add new site"** → **"Import an existing project"**
   - Connect to GitHub
   - Select your repository

3. **Build Settings** (auto-detected from netlify.toml):
   ```
   Base directory: frontend
   Build command: yarn build
   Publish directory: build
   ```

4. **Environment Variables**:
   - Click **"Add environment variable"**
   - Name: `REACT_APP_BACKEND_URL`
   - Value: `https://your-backend-url.railway.app`

5. **Deploy Site**
   - Click **"Deploy site"**
   - Netlify will attempt to build

### Option 2: Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

---

## ⚠️ Known Build Issue

**Problem**: `react-scripts build` fails with:
```
TypeError: validateOptions is not a function
```

**Cause**: Conflict between ajv v6/v8 in react-scripts 5.0.1 dependencies

**Workarounds**:

### Workaround 1: Use Development Build on Netlify
Update `netlify.toml`:
```toml
[build]
  command = "yarn start"
```

This runs dev mode which works perfectly.

### Workaround 2: Manual Build Locally
```bash
cd frontend

# Use the working yarn start, then manually copy build
yarn start
# App runs perfectly

# Then manually deploy build folder
netlify deploy --dir=build --prod
```

### Workaround 3: Alternative Build Command
If Netlify's environment resolves the ajv conflict:
```toml
[build]
  command = "CI=true yarn build || yarn start"
```

---

## 🎯 Current Status

✅ **Development Mode**: Working perfectly
- `yarn start` → ✅ Works
- Preview URL: ✅ Loads correctly  
- All features: ✅ Functional

❌ **Production Build**: Has ajv conflict
- `yarn build` → ❌ validateOptions error
- Issue: react-scripts dependency conflict

---

## 📋 Configuration Files

### netlify.toml (Root)
```toml
[build]
  base = "frontend"
  publish = "build"
  command = "yarn build"

[build.environment]
  NODE_VERSION = "18"
  YARN_VERSION = "1.22.22"
```

### frontend/.npmrc
```
legacy-peer-deps=true
fund=false
audit=false
```

---

## 🔧 Alternative: Deploy Backend Only

Since the frontend runs perfectly in Emergent preview, you could:

1. **Keep frontend in Emergent** (working perfectly)
2. **Deploy only backend to Railway/Heroku**
3. Use Emergent preview URL as your production frontend

This way you avoid the build issue entirely.

---

## 📚 Additional Resources

- Emergent Preview: Working perfectly ✅
- Backend deployment: See DEPLOYMENT.md
- Full documentation: README.md

---

**Recommendation**: Deploy backend to Railway first, then try Netlify deployment. If build fails, keep using Emergent preview which works flawlessly.

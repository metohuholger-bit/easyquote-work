# Deployment Guide - EasyQuote Work

This guide provides detailed instructions for deploying EasyQuote Work to various platforms.

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Configuration](#environment-configuration)
- [Docker Deployment](#docker-deployment)
- [Heroku Deployment](#heroku-deployment)
- [Vercel + Railway Deployment](#vercel--railway-deployment)
- [AWS Deployment](#aws-deployment)
- [DigitalOcean Deployment](#digitalocean-deployment)
- [Custom Server Deployment](#custom-server-deployment)
- [Post-Deployment](#post-deployment)

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All environment variables are configured
- [ ] MongoDB database is accessible
- [ ] Backend and frontend build successfully
- [ ] API endpoints are tested and working
- [ ] Company settings are configured
- [ ] PDF generation is working
- [ ] Excel export is functional
- [ ] All dependencies are in requirements.txt and package.json

## Environment Configuration

### Production Environment Variables

#### Backend (.env)
```env
MONGO_URL=mongodb+srv://user:password@cluster.mongodb.net
DB_NAME=easyquote_work_prod
CORS_ORIGINS=https://your-frontend-domain.com
HOST=0.0.0.0
PORT=8001
```

#### Frontend (.env)
```env
REACT_APP_BACKEND_URL=https://your-backend-domain.com
```

## Docker Deployment

### Step 1: Create Dockerfiles

**Backend Dockerfile** (`/app/backend/Dockerfile`):
```dockerfile
FROM python:3.10-slim

# Install system dependencies for WeasyPrint
RUN apt-get update && apt-get install -y \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    shared-mime-info \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8001

# Run with uvicorn
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

**Frontend Dockerfile** (`/app/frontend/Dockerfile`):
```dockerfile
# Build stage
FROM node:16-alpine as build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Nginx Configuration** (`/app/frontend/nginx.conf`):
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Step 2: Docker Compose

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:5.0
    container_name: easyquote_mongodb
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=easyquote_work
    networks:
      - easyquote_network
    restart: unless-stopped

  backend:
    build: ./backend
    container_name: easyquote_backend
    environment:
      - MONGO_URL=mongodb://mongodb:27017
      - DB_NAME=easyquote_work
      - CORS_ORIGINS=*
    depends_on:
      - mongodb
    networks:
      - easyquote_network
    restart: unless-stopped

  frontend:
    build: ./frontend
    container_name: easyquote_frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - easyquote_network
    restart: unless-stopped

volumes:
  mongo_data:

networks:
  easyquote_network:
    driver: bridge
```

### Step 3: Deploy

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

## Heroku Deployment

### Backend Deployment

1. **Install Heroku CLI**:
```bash
curl https://cli-assets.heroku.com/install.sh | sh
heroku login
```

2. **Create Heroku app**:
```bash
cd backend
heroku create easyquote-backend
```

3. **Add MongoDB Atlas**:
   - Sign up at mongodb.com/atlas
   - Create cluster and get connection string
   - Add to Heroku config:
```bash
heroku config:set MONGO_URL="mongodb+srv://user:pass@cluster.mongodb.net"
heroku config:set DB_NAME="easyquote_work"
```

4. **Create Procfile** (`/app/backend/Procfile`):
```
web: uvicorn server:app --host 0.0.0.0 --port $PORT
```

5. **Deploy**:
```bash
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a easyquote-backend
git push heroku main
```

### Frontend Deployment (Vercel/Netlify)

**Vercel**:
```bash
cd frontend
npm install -g vercel
vercel login
vercel

# Set environment variable
vercel env add REACT_APP_BACKEND_URL production
```

**Netlify**:
```bash
cd frontend
npm install -g netlify-cli
netlify login
netlify init

# Set environment variable in netlify.toml
```

## Vercel + Railway Deployment

### Backend on Railway

1. **Sign up at railway.app**
2. **New Project** → **Deploy from GitHub repo**
3. **Add MongoDB plugin**
4. **Set environment variables**:
   - `MONGO_URL` (from Railway MongoDB plugin)
   - `DB_NAME=easyquote_work`
   - `CORS_ORIGINS=https://your-vercel-app.vercel.app`
5. **Add start command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`

### Frontend on Vercel

1. **Push code to GitHub**
2. **Import on Vercel**
3. **Set environment variable**:
   - `REACT_APP_BACKEND_URL=https://your-railway-app.railway.app`
4. **Deploy**

## AWS Deployment

### Using Elastic Beanstalk

1. **Backend**:
```bash
eb init -p python-3.10 easyquote-backend
eb create easyquote-backend-env
eb setenv MONGO_URL="<your-mongodb-url>"
eb deploy
```

2. **Frontend on S3 + CloudFront**:
```bash
cd frontend
yarn build
aws s3 sync build/ s3://your-bucket-name
```

### Using ECS (Docker)

1. Push Docker images to ECR
2. Create ECS cluster
3. Define task definitions
4. Create services
5. Set up load balancer

## DigitalOcean Deployment

### Using App Platform

1. **Connect GitHub repo**
2. **Configure backend**:
   - Type: Web Service
   - Build Command: `pip install -r requirements.txt`
   - Run Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
   
3. **Configure frontend**:
   - Type: Static Site
   - Build Command: `yarn build`
   - Output Directory: `build`

4. **Add MongoDB**:
   - Add managed database
   - Copy connection string
   - Add to backend environment variables

## Custom Server Deployment

### Using VPS (Ubuntu)

1. **Install dependencies**:
```bash
sudo apt update
sudo apt install python3.10 python3-pip nodejs npm mongodb nginx
```

2. **Clone and setup**:
```bash
git clone <your-repo>
cd easyquote-work

# Backend
cd backend
pip3 install -r requirements.txt

# Frontend
cd ../frontend
npm install
npm run build
```

3. **Setup systemd services**:

**Backend service** (`/etc/systemd/system/easyquote-backend.service`):
```ini
[Unit]
Description=EasyQuote Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/backend
Environment="MONGO_URL=mongodb://localhost:27017"
Environment="DB_NAME=easyquote_work"
ExecStart=/usr/bin/uvicorn server:app --host 0.0.0.0 --port 8001
Restart=always

[Install]
WantedBy=multi-user.target
```

4. **Configure Nginx**:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /path/to/frontend/build;
        try_files $uri /index.html;
    }

    location /api {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

5. **Enable and start**:
```bash
sudo systemctl enable easyquote-backend
sudo systemctl start easyquote-backend
sudo systemctl restart nginx
```

## Post-Deployment

### Health Checks

1. **Verify backend**:
```bash
curl https://your-backend-url.com/api/customers
```

2. **Verify frontend**:
   - Visit your frontend URL
   - Check all pages load
   - Test creating a customer
   - Test generating a PDF

### Monitoring

- Set up monitoring (Sentry, DataDog, etc.)
- Configure error alerts
- Monitor database performance
- Set up logging aggregation

### Backup Strategy

1. **Database backups**:
```bash
# MongoDB backup
mongodump --uri="<your-mongo-url>" --out=/backups/$(date +%Y%m%d)

# Automated daily backups
0 2 * * * mongodump --uri="<your-mongo-url>" --out=/backups/$(date +\%Y\%m\%d)
```

2. **Code backups**: Ensure GitHub has latest code

### SSL Certificate

Using Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Performance Optimization

1. Enable Nginx gzip compression
2. Set up CDN for static assets
3. Configure database indexes
4. Enable HTTP/2
5. Implement caching strategy

## Rollback Strategy

If issues occur:

1. **Heroku**:
```bash
heroku releases
heroku rollback v123
```

2. **Docker**:
```bash
docker-compose down
git checkout <previous-commit>
docker-compose up -d --build
```

3. **Custom server**:
```bash
git checkout <previous-commit>
sudo systemctl restart easyquote-backend
```

## Troubleshooting

### Common Issues

**CORS errors**:
- Update `CORS_ORIGINS` in backend .env
- Include protocol (https://)

**Database connection fails**:
- Check MongoDB is running
- Verify connection string
- Check firewall rules
- Whitelist IP in MongoDB Atlas

**PDF generation fails**:
- Ensure WeasyPrint dependencies installed
- Check font availability
- Verify template path

**Build errors**:
- Clear cache: `yarn cache clean`
- Delete node_modules and reinstall
- Check Node version compatibility

---

For additional help, refer to the main README.md or open an issue on GitHub.

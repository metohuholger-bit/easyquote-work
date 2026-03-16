# EasyQuote Work

**Gestione preventivi e report ore** - A complete quote and work report management system for professionals.

![Status](https://img.shields.io/badge/status-production--ready-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Building for Production](#building-for-production)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

EasyQuote Work is a mobile-first web application designed for professionals (gardeners, contractors, freelancers) to manage customers, create quotes, track work hours, and generate professional PDF documents.

## ✨ Features

### Core Features
- **Customer Management**: Complete CRUD operations for customer data
- **Job Price List**: Editable catalog of services with pricing
- **Quote Builder**: Create multi-line quotes with automatic calculations
- **Quote History**: Search and manage all quotes by customer
- **Work Reports**: Track hours worked, earnings, and calculate hourly rates
- **Company Settings**: Personalize business details for PDF documents
- **Excel Export**: Export monthly work reports to Excel
- **PDF Generation**: Professional branded quotes with company details

### Technical Features
- Mobile-first responsive design
- Italian language interface
- Real-time calculations (VAT, totals, hourly rates)
- RESTful API architecture
- MongoDB for data persistence
- Hot reload in development

## 🛠 Tech Stack

### Frontend
- **React** 18.x
- **React Router** for navigation
- **Axios** for API calls
- **Tailwind CSS** for styling
- **Shadcn/UI** components
- **Lucide React** icons
- **Sonner** for toast notifications

### Backend
- **FastAPI** (Python 3.10+)
- **Motor** (async MongoDB driver)
- **Pydantic** for data validation
- **WeasyPrint** for PDF generation
- **OpenPyXL** for Excel export
- **Jinja2** for PDF templates

### Database
- **MongoDB** 5.0+

### Development Tools
- **Supervisor** for process management
- **Nginx** as reverse proxy
- **Hot reload** for both frontend and backend

## 📁 Project Structure

```
/app
├── backend/
│   ├── server.py              # Main FastAPI application
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Backend environment variables
│   └── templates/
│       └── quote.html         # PDF quote template
│
├── frontend/
│   ├── public/
│   │   └── index.html         # HTML template
│   ├── src/
│   │   ├── App.js             # Main React component
│   │   ├── App.css            # Global styles
│   │   ├── index.js           # Entry point
│   │   ├── index.css          # Tailwind imports
│   │   ├── components/
│   │   │   ├── Layout.js      # Main layout with navigation
│   │   │   └── ui/            # Shadcn UI components
│   │   └── pages/
│   │       ├── Dashboard.js
│   │       ├── Customers.js
│   │       ├── JobTypes.js
│   │       ├── QuoteBuilder.js
│   │       ├── QuoteHistory.js
│   │       ├── WorkReports.js
│   │       └── CompanySettings.js
│   ├── package.json           # Node dependencies
│   ├── tailwind.config.js     # Tailwind configuration
│   ├── postcss.config.js      # PostCSS configuration
│   └── .env                   # Frontend environment variables
│
└── README.md                  # This file
```

## 📋 Prerequisites

- **Node.js** 16.x or higher
- **Python** 3.10 or higher
- **MongoDB** 5.0 or higher
- **pip** (Python package manager)
- **yarn** (Node package manager)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd easyquote-work
```

### 2. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
yarn install
```

## ⚙️ Configuration

### Backend Environment Variables

Create or edit `/app/backend/.env`:

```env
# MongoDB Connection
MONGO_URL=mongodb://localhost:27017
DB_NAME=easyquote_work

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,https://your-domain.com

# Server Configuration
HOST=0.0.0.0
PORT=8001
```

### Frontend Environment Variables

Create or edit `/app/frontend/.env`:

```env
# Backend API URL
REACT_APP_BACKEND_URL=http://localhost:8001

# For production, use your deployed backend URL:
# REACT_APP_BACKEND_URL=https://api.your-domain.com
```

### MongoDB Setup

1. **Install MongoDB** (if not already installed):
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mongodb

   # macOS
   brew install mongodb-community
   ```

2. **Start MongoDB**:
   ```bash
   # Ubuntu/Debian
   sudo systemctl start mongodb

   # macOS
   brew services start mongodb-community
   ```

3. **Create Database** (optional - will be created automatically):
   ```bash
   mongo
   > use easyquote_work
   ```

## 🏃 Running the Application

### Development Mode

#### Start Backend
```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

Backend will be available at: `http://localhost:8001`

#### Start Frontend
```bash
cd frontend
yarn start
```

Frontend will be available at: `http://localhost:3000`

### Using Supervisor (Production-like)

If using Supervisor for process management:

```bash
# Start all services
sudo supervisorctl start all

# Check status
sudo supervisorctl status

# Restart individual services
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
```

## 🏗 Building for Production

### Frontend Build

```bash
cd frontend
yarn build
```

This creates an optimized production build in the `build/` directory.

### Backend Preparation

For production deployment:

1. Set environment variables in production
2. Use a production-grade WSGI server (e.g., Gunicorn):
   ```bash
   pip install gunicorn
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker server:app --bind 0.0.0.0:8001
   ```

## 📚 API Documentation

### Base URL
- Development: `http://localhost:8001/api`
- Production: `https://your-domain.com/api`

### Main Endpoints

#### Customers
- `GET /api/customers` - List all customers
- `POST /api/customers` - Create customer
- `GET /api/customers/{id}` - Get customer
- `PUT /api/customers/{id}` - Update customer
- `DELETE /api/customers/{id}` - Delete customer

#### Job Types
- `GET /api/job-types` - List all job types
- `POST /api/job-types` - Create job type
- `PUT /api/job-types/{id}` - Update job type
- `DELETE /api/job-types/{id}` - Delete job type

#### Quotes
- `GET /api/quotes` - List all quotes
- `POST /api/quotes` - Create quote
- `GET /api/quotes/{id}` - Get quote
- `GET /api/quotes/{id}/pdf` - Download quote PDF
- `DELETE /api/quotes/{id}` - Delete quote

#### Work Reports
- `GET /api/work-reports` - List all work reports
- `POST /api/work-reports` - Create work report
- `PUT /api/work-reports/{id}` - Update work report
- `DELETE /api/work-reports/{id}` - Delete work report
- `GET /api/work-reports/summary/monthly` - Get monthly summary
- `GET /api/work-reports/export/excel` - Export to Excel

#### Company Settings
- `GET /api/company-settings` - Get company settings
- `PUT /api/company-settings` - Update company settings

## 🗄 Database Schema

### Collections

#### customers
```javascript
{
  id: String,
  name: String,
  phone: String,
  address: String,
  notes: String (optional),
  created_at: DateTime
}
```

#### job_types
```javascript
{
  id: String,
  name: String,
  unit: String,
  price_per_unit: Float,
  created_at: DateTime
}
```

#### quotes
```javascript
{
  id: String,
  quote_number: String,
  customer_id: String,
  customer_name: String,
  customer_phone: String,
  customer_address: String,
  line_items: [
    {
      job_type_id: String,
      job_name: String,
      unit: String,
      quantity: Float,
      price_per_unit: Float,
      total: Float
    }
  ],
  subtotal: Float,
  iva: Float,
  total: Float,
  created_at: DateTime
}
```

#### work_reports
```javascript
{
  id: String,
  work_date: Date,
  customer_id: String,
  customer_name: String,
  job_site: String,
  job_description: String,
  hours_worked: Float,
  earned_amount: Float,
  hourly_rate: Float,
  notes: String (optional),
  created_at: DateTime
}
```

#### company_settings
```javascript
{
  id: "company_settings",
  company_name: String,
  owner_name: String,
  vat_number: String,
  tax_code: String,
  address: String,
  phone: String,
  email: String,
  logo_base64: String (optional),
  updated_at: DateTime
}
```

## 🚢 Deployment

### Docker Deployment (Recommended)

1. **Create Dockerfile for Backend**:
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

2. **Create Dockerfile for Frontend**:
```dockerfile
FROM node:16-alpine as build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

3. **Docker Compose**:
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:5.0
    volumes:
      - mongo_data:/data/db
    
  backend:
    build: ./backend
    environment:
      - MONGO_URL=mongodb://mongodb:27017
      - DB_NAME=easyquote_work
    depends_on:
      - mongodb
    
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongo_data:
```

### Cloud Deployment Options

- **Heroku**: Use Procfile with gunicorn for backend
- **Vercel/Netlify**: Deploy frontend as static site
- **AWS/GCP/Azure**: Use managed services for MongoDB, containers for app
- **DigitalOcean App Platform**: Deploy with auto-scaling

## 🔧 Troubleshooting

### Backend Issues

**MongoDB Connection Error**:
```bash
# Check MongoDB is running
sudo systemctl status mongodb

# Verify connection string in .env
MONGO_URL=mongodb://localhost:27017
```

**Port Already in Use**:
```bash
# Find process using port 8001
lsof -i :8001

# Kill process
kill -9 <PID>
```

### Frontend Issues

**API Connection Error**:
- Verify `REACT_APP_BACKEND_URL` in `.env`
- Check CORS settings in backend
- Ensure backend is running

**Build Errors**:
```bash
# Clear cache and reinstall
rm -rf node_modules yarn.lock
yarn install
```

### Database Issues

**Reset Database**:
```javascript
// Connect to MongoDB
mongo

// Switch to database
use easyquote_work

// Drop all collections
db.dropDatabase()
```

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub or contact support.

---

**Built with ❤️ using Emergent.sh**

# Railway Deployment Guide

## Quick Deploy to Railway

### Prerequisites
1. [Railway Account](https://railway.app) (sign up with GitHub)
2. Project pushed to GitHub

---

## 🚀 Step 1: Create Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Connect your `artandcraft-platform` repository

---

## 🗄️ Step 2: Add MySQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"MySQL"**
3. Railway auto-generates credentials
4. Copy the connection variables for the backend

---

## ⚙️ Step 3: Deploy Backend API

1. Click **"+ New"** → **"GitHub Repo"**
2. Select your repo and set **Root Directory**: `backend-api`
3. Add Environment Variables (Settings → Variables):

```env
NODE_ENV=production
PORT=3000

# Copy from MySQL service
DATABASE_URL=${{MySQL.DATABASE_URL}}
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}

# Security
JWT_SECRET=your-secure-random-string-here

# Razorpay (get from dashboard.razorpay.com)
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx

# CORS - add your admin app URL after deployment
CORS_ORIGIN=https://your-admin-app.up.railway.app
```

4. Railway auto-detects Node.js and deploys

---

## 🌐 Step 4: Deploy Admin Web App

1. Click **"+ New"** → **"GitHub Repo"**  
2. Select your repo and set **Root Directory**: `admin-web-app`
3. Add Environment Variables:

```env
VITE_API_BASE_URL=https://your-backend-api.up.railway.app/api
```

4. Railway builds and deploys automatically

---

## 🔗 Step 5: Connect Services

After both deploy:

1. **Get Backend URL**: Click backend service → copy URL (e.g., `https://backend-api-xxx.up.railway.app`)

2. **Update Admin App**: Add backend URL to admin app's environment variables:
   ```
   VITE_API_BASE_URL=https://backend-api-xxx.up.railway.app/api
   ```

3. **Update Backend CORS**: Add admin app URL to backend's CORS_ORIGIN:
   ```
   CORS_ORIGIN=https://admin-web-app-xxx.up.railway.app
   ```

4. **Redeploy** both services to pick up new env vars

---

## 🔧 Environment Variables Reference

### Backend API
| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | `production` | ✅ |
| `PORT` | `3000` (Railway sets automatically) | ✅ |
| `DATABASE_URL` | MySQL connection string | ✅ |
| `JWT_SECRET` | Random secure string | ✅ |
| `RAZORPAY_KEY_ID` | Razorpay API Key | ✅ |
| `RAZORPAY_KEY_SECRET` | Razorpay Secret | ✅ |
| `CORS_ORIGIN` | Allowed origins (comma-separated) | ✅ |

### Admin Web App
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_BASE_URL` | Backend API URL | ✅ |

---

## 📊 Monitor & Logs

- **Logs**: Click service → "Logs" tab
- **Metrics**: Click service → "Metrics" tab
- **Deployments**: Click service → "Deployments" tab

---

## 💰 Railway Pricing

- **Free Tier**: $5 credit/month (~500 hours for hobby project)
- **Hobby Plan**: $5/month with more resources
- **Pro Plan**: Pay for usage

---

## 🔄 Auto-Deploy

Railway automatically redeploys when you push to GitHub. To disable:
1. Service Settings → Triggers → Turn off "Auto-deploy"

---

## 🛠️ Troubleshooting

### Build Fails
- Check build logs for errors
- Ensure `package.json` has correct scripts
- Verify `railway.json` is in the right directory

### Database Connection Issues
- Verify DATABASE_URL is correctly linked
- Check if MySQL service is running
- Ensure backend waits for DB to be ready

### CORS Errors
- Add admin app URL to `CORS_ORIGIN`
- Ensure no trailing slash in URLs
- Redeploy backend after changing env vars

---

## 🎉 Done!

Your apps should be live at:
- **Backend**: `https://backend-api-xxx.up.railway.app`
- **Admin**: `https://admin-web-app-xxx.up.railway.app`
- **Health Check**: `https://backend-api-xxx.up.railway.app/api/health`

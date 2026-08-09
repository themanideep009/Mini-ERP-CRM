# 🚀 Production Deployment Guide

This guide details step-by-step instructions to deploy:
- **Frontend**: [Vercel](https://vercel.com)
- **Backend**: [Render](https://render.com)
- **SQL Database**: Managed PostgreSQL on [Neon.tech](https://neon.tech) or [Render Postgres](https://render.com)

---

## 1. 🐙 Push Project to GitHub

The Git repository has already been initialized and committed locally. Run these commands to push it to your GitHub account:

```bash
# 1. Create a new empty repository on GitHub (e.g. named "FundsRoom" or "mini-erp-crm")

# 2. Link your local repo to GitHub (replace YOUR_USERNAME with your GitHub handle)
git remote add origin https://github.com/YOUR_USERNAME/FundsRoom.git

# 3. Rename branch to main & push
git branch -M main
git push -u origin main
```

---

## 2. 🗄️ Set Up SQL Database (PostgreSQL)

We recommend **Neon.tech** (free managed serverless PostgreSQL) or **Render PostgreSQL**.

### Option A: Neon.tech (Recommended)
1. Go to [Neon.tech](https://neon.tech) and sign up for a free account.
2. Click **Create Project** -> Name it `fundsroom-db`.
3. Copy the **Pooled Connection String**. It will look like:
   `postgresql://alex:password123@ep-cool-cloud-123456.us-east-2.aws.neon.tech/neondb?sslmode=require`

---

## 3. ⚙️ Deploy Backend to Render

1. Log into [Render.com](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository (`FundsRoom`).
4. Fill in the service configuration:
   - **Name**: `mini-erp-crm-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**:
     ```bash
     npm install && npx prisma generate && npm run build
     ```
   - **Start Command**:
     ```bash
     npx prisma db push && npx tsx prisma/seed.ts && npm start
     ```
5. Add **Environment Variables** under the **Environment** tab:
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `DATABASE_URL` = *(Your Neon/Render PostgreSQL Connection String from Step 2)*
   - `JWT_SECRET` = *(Any long random string, e.g., `supersecretkey998877665544332211`)*
   - `JWT_EXPIRES_IN` = `7d`
   - `FRONTEND_URL` = *(Your Vercel URL from Step 4, e.g. `https://fundsroom.vercel.app`)*

6. Click **Create Web Service**. Render will build the backend, sync the PostgreSQL schema, seed sample data, and start the API server!

---

## 4. 🎨 Deploy Frontend to Vercel

1. Log into [Vercel.com](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository (`FundsRoom`).
4. Configure Project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` *(Click Edit and select the `frontend` folder)*
5. Expand **Environment Variables** and add:
   - `VITE_API_BASE_URL` = `https://YOUR-BACKEND-NAME.onrender.com/api`
6. Click **Deploy**. Vercel will build the frontend and generate your live production URL!

---

## 🔒 Post-Deployment Checklist

- [ ] Open your Vercel URL in your browser.
- [ ] Test logging in with `admin@example.com` / `password123` or click **"Sign in with Google"**.
- [ ] Create a Sales Challan, add a product, and update customer status to test full-stack end-to-end functionality!

# AyurGuide — Clinical Administration Portal (React + Vite)

A modern desktop Web Administration Portal for **AyurGuide** (Ayurvedic Medicine Catalogue & Clinical Dispensary Management System) built with **React**, **TypeScript**, **Tailwind CSS**, **Lucide Icons**, and **Supabase PostgreSQL**.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables (optional, defaults to offline local storage)
cp .env.example .env

# 3. Start development server on port 3000
npm run dev
```

The portal will open at `http://localhost:3000`.

---

## 🌐 Deploying to Vercel (Step-by-Step)

The repository includes a ready-to-deploy `vercel.json` optimized for Vite SPAs:

1. Push your repository to **GitHub**.
2. Go to [Vercel Dashboard](https://vercel.com/new) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Vercel will automatically detect:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - **`VITE_SUPABASE_URL`**: `https://ksnsfilauqzxsegpjpdt.supabase.co`
   - **`VITE_SUPABASE_ANON_KEY`**: *(Your Supabase anon public key)*
6. Click **Deploy**. Vercel will build and publish your admin website with single-page routing preconfigured.

---

## 🔐 Setting Environment Variables

### 1. In Vercel
- Navigate to **Project Settings** &gt; **Environment Variables**.
- Key: `VITE_SUPABASE_URL` | Value: `https://ksnsfilauqzxsegpjpdt.supabase.co`
- Key: `VITE_SUPABASE_ANON_KEY` | Value: `your-anon-key`
- Scope: *Production, Preview, Development*.

### 2. In GitHub Actions & Secrets
- Navigate to your repository on GitHub.
- Go to **Settings** &gt; **Secrets and variables** &gt; **Actions**.
- Click **"New repository secret"**:
  - Name: `VITE_SUPABASE_URL` | Secret: `https://ksnsfilauqzxsegpjpdt.supabase.co`
  - Name: `VITE_SUPABASE_ANON_KEY` | Secret: `your-anon-key`

### 3. In Google AI Studio
- Click the **Secrets (Key icon)** in the AI Studio left sidebar.
- Add secret `VITE_SUPABASE_ANON_KEY` (or `GEMINI_API_KEY`).
- AI Studio automatically injects this secret into `.env` at container boot.

---

## 🛠️ Features Included

- **Medicine Catalogue**: Interactive high-density table and 3D flippable card grid.
- **Dravyaguna Energetics**: Rasa, Virya, Vipaka, Guna, and dynamic botanical ingredient builder.
- **Dispensary Inventory**: Real-time batch numbers, low-stock threshold alerts, and instant bulk restock (+25, +50 units).
- **Printable Clinical Monograph**: Formatted according to Ayurvedic Pharmacopoeia of India (API) standards with batch certification and QR code.
- **Practitioner Directory**: User access control with role elevation (`ADMIN`, `PRACTITIONER`, `PATIENT`) and audit logging.
- **Audit Ledger**: Chronological audit trail of all stock and clinical modifications with CSV export.
- **Supabase Cloud Integration**: Direct connection to cloud PostgreSQL with live sync and JSON disaster-recovery snapshot backups.

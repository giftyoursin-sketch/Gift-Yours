# 🎁 Gift Yours — Gift Shop Management System

A **premium SaaS-style business management application** for gift shops. Built with **React + Vite** and powered by **Supabase**.

![Gift Yours Dashboard](./public/favicon.svg)

## ✨ Features

| Module | What it does |
|---|---|
| 🏠 Dashboard | Live metrics, revenue charts, stock alerts, quick actions |
| 📦 Products | Catalog management with pricing, stock, categories |
| 🗃️ Inventory | Stock tracking, inline adjustments, history timeline |
| 💰 Sales | Create sales, auto stock deduction, sale history |
| 🧾 Invoices | Professional PDF invoices with live preview, WhatsApp share |
| 👥 Customers | CRM with lifetime value, purchase history |
| 💸 Expenses | Category tracking, monthly charts, trend analysis |
| 📊 Reports | Revenue/profit charts, CSV export |
| ⚙️ Settings | Business info, theme toggle, data backup |

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/giftyoursin-sketch/Gift-Yours.git
cd Gift-Yours
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
```
Edit `.env` with your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Set up Supabase database
- Go to your **Supabase Dashboard → SQL Editor**
- Run the contents of `supabase/schema.sql`

### 4. Start the development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Backend/Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **PDF**: jsPDF + html2canvas
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Fonts**: Inter (Google Fonts)

## 📁 Project Structure

```
src/
├── lib/supabase.js           ← Supabase client
├── context/AppContext.jsx    ← Global state + CRUD operations
├── components/
│   └── layout/              ← AppLayout, Sidebar, Topbar, BottomNav
└── pages/
    ├── Dashboard/
    ├── Products/
    ├── Inventory/
    ├── Sales/
    ├── Invoices/             ← Builder + PDF Template
    ├── Customers/
    ├── Expenses/
    ├── Reports/
    └── Settings/
```

## 🌐 Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

## 📄 License

MIT © Gift Yours

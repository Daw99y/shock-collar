# ⚡ Shock Collar

**Remote License Management for Freelancers & Agencies**

Shock Collar is an open-source SaaS application that allows freelancers and agencies to remotely lock client websites until payment is received. Install a simple React component on your client's site, and control access from a beautiful dashboard.

---

## ✨ Features

- 🔐 **Remote Lock/Unlock** — Instantly restrict access to client sites with one click
- 🔑 **Unique API Keys** — Each project gets a unique license key
- 📊 **Activity Logging** — Real-time activity feed with event history
- 🔄 **Key Rotation** — Regenerate API keys for security
- 👤 **Multi-User Auth** — Google OAuth & Magic Link authentication
- 🛡️ **Row Level Security** — Complete data isolation between users
- ⚡ **Real-time Updates** — Powered by Supabase Realtime
- 🎨 **Modern UI** — Clean, professional "Fintech" aesthetic

---

## 🛠️ Tech Stack

| Layer              | Technology                               |
| ------------------ | ---------------------------------------- |
| **Framework**      | Next.js 15 (App Router)                  |
| **Language**       | TypeScript                               |
| **Styling**        | Tailwind CSS + shadcn/ui                 |
| **Database**       | Supabase (PostgreSQL)                    |
| **Authentication** | Supabase Auth (Google OAuth, Magic Link) |
| **Real-time**      | Supabase Realtime (WebSockets)           |
| **Deployment**     | Vercel (recommended)                     |

---

## 📁 Project Structure

```
shock-collar/
├── dashboard/                 # Next.js SaaS Dashboard
│   ├── src/
│   │   ├── app/              # App Router pages & API routes
│   │   │   ├── api/          # API endpoints
│   │   │   ├── auth/         # OAuth callback handler
│   │   │   ├── login/        # Login page
│   │   │   └── page.tsx      # Main dashboard
│   │   ├── components/       # React components
│   │   │   ├── ui/           # shadcn/ui primitives
│   │   │   ├── dashboard-shell.tsx
│   │   │   ├── install-modal.tsx
│   │   │   ├── settings-modal.tsx
│   │   │   └── ...
│   │   ├── utils/            # Supabase clients
│   │   └── types/            # TypeScript definitions
│   └── ...
├── packages/
│   └── component/            # Embeddable React component
│       └── src/
│           └── ShockCollar.tsx
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account ([supabase.com](https://supabase.com))

### 1. Clone the Repository

```bash
git clone https://github.com/Daw99y/shock-collar.git
cd shock-collar
```

### 2. Install Dependencies

```bash
cd dashboard
npm install
```

### 3. Configure Supabase

Create a new Supabase project at [supabase.com](https://supabase.com) and run the following SQL in the SQL Editor:

```sql
-- Create API Keys table
create table api_keys (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  key_value text not null unique,
  project_name text not null,
  is_locked boolean default false,
  user_id uuid references auth.users(id) on delete cascade not null
);

-- Create Activity Logs table
create table activity_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  key_id uuid references api_keys(id) on delete cascade not null,
  event_type text not null,
  description text
);

-- Enable Row Level Security
alter table api_keys enable row level security;
alter table activity_logs enable row level security;

-- RLS Policies for api_keys
create policy "Users can view their own keys"
on api_keys for select using (auth.uid() = user_id);

create policy "Users can insert their own keys"
on api_keys for insert with check (auth.uid() = user_id);

create policy "Users can update their own keys"
on api_keys for update using (auth.uid() = user_id);

create policy "Users can delete their own keys"
on api_keys for delete using (auth.uid() = user_id);

create policy "Public can read lock status"
on api_keys for select using (true);

-- RLS Policies for activity_logs
create policy "Users can view their own activity logs"
on activity_logs for select using (auth.uid() = user_id);

create policy "Users can insert their own activity logs"
on activity_logs for insert with check (auth.uid() = user_id);

-- Enable Realtime
alter publication supabase_realtime add table activity_logs;
```

### 4. Configure Environment Variables

Create a `.env.local` file in the `dashboard` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Configure Authentication

In your Supabase dashboard:

1. Go to **Authentication → Providers**
2. Enable **Google** (add your OAuth credentials)
3. Go to **Authentication → URL Configuration**
4. Set **Site URL** to `http://localhost:3000` (dev) or your production URL
5. Add `http://localhost:3000/auth/callback` to **Redirect URLs**

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Set the root directory to `dashboard`
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

### Post-Deployment

Update your Supabase settings:

- **Site URL**: Your production domain
- **Redirect URLs**: Add `https://yourdomain.com/auth/callback`

---

## 📦 Client Component Installation

Users of your SaaS will receive installation instructions via the dashboard. The component is embedded directly (no npm package required).

### How It Works

1. User creates a project in the dashboard
2. User copies the `ShockCollar` component code
3. User adds the component to their client's Next.js layout
4. When the license is locked, the client site shows an "Access Restricted" overlay

---

## 🔒 Security

- **Row Level Security (RLS)**: Supabase enforces data isolation at the database level
- **API Key Rotation**: Users can regenerate keys if compromised
- **No Server-Side Secrets in Client**: Only the anon key is exposed (safe by design)

---

## 🗺️ Roadmap

- [ ] Public landing page
- [ ] Stripe billing integration
- [ ] Custom lock screen messages
- [ ] Email notifications
- [ ] Team accounts
- [ ] Webhook integrations
- [ ] Usage analytics

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---

**Built with ❤️ for freelancers who deserve to get paid.**

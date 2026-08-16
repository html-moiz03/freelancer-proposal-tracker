# 🗂️ Freelancer Proposal Tracker

A professional CRM web application built for freelancers to manage clients, track proposals, monitor deal statuses, and never miss a follow-up — all in one place.

🌐 **Live Demo:** [freelancer-proposal-tracker.netlify.app](https://freelancer-proposal-tracker.netlify.app)

---

## 📸 Screenshots

> Dashboard · Proposals · Kanban Board · Landing Page

---

## ✨ Features

### 🏠 Landing Page & Authentication
- Professional landing page with animated hero, doodle background, and SVG avatar
- Animated arched stat cards with counting animation
- Signup & Login with form validation
- **Real multi-account support** — every email keeps its own separate, isolated data set in localStorage; signing up with an existing email is blocked instead of overwriting it
- Footer links: Privacy Policy / Terms of Service open in-page, and Report an Issue / Trouble Signing In / Contact Support open a pre-filled support email

### 📊 Dashboard
- Real-time stat cards (Revenue, Win Rate, Active Proposals, Overdue Follow-ups, Total Clients, Won Proposals, Forecast, In Review Value)
- Period filter (This Month / Last Month / This Quarter / This Year) that actually filters the stats and the period-comparison card, not just decorative state
- Monthly revenue goal tracker with animated progress bar
- Proposal Activity line chart with 7D / 30D / 3M / 12M range toggle (Recharts)
- Proposal Pipeline funnel, Revenue Trend area chart, Conversion Funnel (Recharts)
- "Needs your attention" panel (overdue follow-ups, proposals waiting longest, inactive clients)
- Recent proposals, upcoming follow-ups, and top clients feeds
- Activity log with clearable history

### 👤 Clients
- Add, edit, delete clients with form validation
- Duplicate email prevention
- Real-time search and filter
- Client detail page with per-client stats and proposal history
- CSV export (currency-aware — labels the amount column with your actual selected currency)

### 📄 Proposals
- Full CRUD with status tracking (Draft → Sent → In Review → Negotiation → Won/Lost)
- Status filter pills
- Proposal expiry warning badges (yellow = expiring soon, red = deadline passed)
- PDF export with branded layout (jsPDF)
- Invoice generation for won proposals
- CSV export (currency-aware)

### 📁 Proposal Detail
- Overview, Files, Messages, Follow-ups, and Notes tabs per proposal
- Real inline **Edit** form (title, amount, deadline, status, category, project type, timeline, payment terms) that saves in place — it no longer just navigates back to the list
- Progress stepper matching the proposal's current status
- Per-proposal activity feed

### 🔔 Follow-ups
- Link follow-ups to proposals with date and notes
- Overdue detection with red highlight
- Upcoming reminder badge based on reminder days setting
- Edit and delete support
- Optional browser push notifications for overdue follow-ups and expiring proposals (with a proper `Notification` API availability check)

### 🗂️ Kanban Board
- Drag and drop proposals across status columns (`@hello-pangea/dnd`)
- Real-time status update on drop, with a confetti celebration on "Won"
- Color coded column headers
- "Customize" toolbar button opens a working panel with a Compact Cards toggle

### 📅 Calendar
- Monthly calendar view of proposal deadlines and follow-ups
- Respects your configured date & time format

### 📊 Reports
- Monthly report generation and export

### ⚙️ Settings
- Currency selector (PKR, USD, EUR, GBP, AED) — reflected everywhere amounts are shown, including exports
- Date format (YYYY-MM-DD, DD MMM YYYY, DD/MM/YYYY, MM/DD/YYYY) — wired into every date shown across the app
- Time format (12h / 24h) — wired into every time shown across the app
- Language selector (English available now; other languages clearly marked "coming soon" rather than silently doing nothing)
- Follow-up reminder days
- Dark mode toggle, Compact Mode, and Animations toggle
- Accent color picker
- "Upgrade to Pro" opens a real waitlist modal (joins you and persists that state) instead of just showing a toast
- Export all data as JSON backup
- Import data from JSON
- Change password
- Reset all data / Delete account

### 🧭 Onboarding Tour
- Guided first-run product tour (`driver.js`) highlighting the sidebar, quick add, and key navigation

### ⌨️ Command Palette & Global Search
- Keyboard-driven command palette for fast navigation and actions
- Global search across clients, proposals, and follow-ups
- Quick Add shortcut for creating clients/proposals/follow-ups from anywhere

### 🌙 Dark Mode
- Full dark mode across all pages, including correctly visible native date/time picker icons
- Persists across sessions via localStorage

### 📱 Mobile Responsive
- Hamburger menu sidebar on mobile
- Slide-in sidebar with overlay close
- Responsive dashboard, header, and search bar

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool |
| React Router DOM v6 | Client-side routing |
| Context API | Global state management |
| localStorage | Per-account, namespaced data persistence |
| Recharts | Analytics charts |
| jsPDF | PDF export |
| @hello-pangea/dnd | Drag and drop Kanban |
| driver.js | Onboarding product tour |
| canvas-confetti | Win celebration effect |
| Netlify | Deployment |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Sidebar.jsx
│   ├── Header.jsx
│   ├── CommandPalette.jsx
│   ├── GlobalSearch.jsx
│   ├── QuickAdd.jsx
│   ├── DailySummary.jsx
│   ├── OnboardingTour.jsx
│   ├── FancyButton.jsx
│   ├── Toast.jsx
│   └── EmptyState.jsx
├── context/
│   ├── AppContext.jsx
│   ├── ThemeContext.jsx
│   └── ToastContext.jsx
├── pages/
│   ├── Landing.jsx
│   ├── Dashboard.jsx
│   ├── Clients.jsx
│   ├── ClientDetail.jsx
│   ├── Proposals.jsx
│   ├── ProposalDetail.jsx
│   ├── Followups.jsx
│   ├── Kanban.jsx
│   ├── Calendar.jsx
│   ├── Reports.jsx
│   ├── Profile.jsx
│   └── Settings.jsx
├── utils/
│   ├── accountStorage.js   (multi-account data isolation)
│   ├── activityLog.js
│   ├── exportPDF.js
│   ├── exportCSV.js
│   ├── formatDate.js       (date & time formatting)
│   ├── generateInvoice.js
│   ├── generateMonthlyReport.js
│   └── pushNotifications.js
├── App.jsx
└── main.jsx
public/
└── _redirects
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v16+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/html-moiz03/freelancer-proposal-tracker.git

# Navigate to project
cd freelancer-proposal-tracker

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

---

## 💾 Data & Privacy

All data — clients, proposals, follow-ups, and preferences — is stored locally in your browser via `localStorage`, scoped per account email. Nothing is sent to or stored on a remote server. Clearing your browser data or switching browsers/devices will not carry your data over, so use Settings → Data & Export to back up or restore a full JSON export.

---

## 🐛 Support

Use the footer links on the landing page — **Report an Issue**, **Trouble Signing In**, or **Contact Support** — to email the maintainer directly, or reach out at adc221002@myu.edu.pk.

---

## 👤 Author

**Malik Abdul Moiz Awan**
- GitHub: [@html-moiz03](https://github.com/html-moiz03)
- LinkedIn: [malik-abdulmoiz](https://www.linkedin.com/in/malik-abdul-moiz-zaheer-awan-6a9997259)

---

## 🏢 Built During

**Zynvex Solutions — Frontend Development Internship 2026**
Intern ID: ZYNVEX-CERT-0449

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
